// Native Node 22+ and local Chrome only; no package or service dependency.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const kirow = dirname(fileURLToPath(import.meta.url));
const root = dirname(dirname(kirow));
const temporary = await mkdtemp(join(tmpdir(), 'kirow-social-'));
const chrome = process.env.KIROW_CHROME || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
let child, socket, failure, sequence = 0;
const pending = new Map();
const listeners = new Set();
const types = { '.html':'text/html; charset=utf-8', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.woff2':'font/woff2' };
const sources = ['social-template.html', 'assets/preview.jpg', '../assets/brick-atelier-mark.svg', '../../assets/fonts/inter-var-latin.woff2'];
const sourceHashes = () => Promise.all(sources.map(async path => createHash('sha256').update(await readFile(join(kirow, path))).digest('hex')));
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});

function rejectAll(error) {
  failure ||= error;
  for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); }
  pending.clear();
  for (const listener of listeners) { clearTimeout(listener.timer); listener.reject(error); }
  listeners.clear();
}

function send(method, params = {}, sessionId) {
  if (failure) return Promise.reject(failure);
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

function waitFor(method, sessionId) {
  return new Promise((resolve, reject) => {
    const listener = { method, sessionId, resolve, reject };
    listener.timer = setTimeout(() => { listeners.delete(listener); reject(Error(`Event timeout: ${method}`)); }, 20000);
    listeners.add(listener);
  });
}

async function stopChrome() {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise(resolve => child.once('exit', resolve));
  child.kill('SIGTERM');
  await Promise.race([exited, delay(2000)]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
    await Promise.race([exited, delay(2000)]);
  }
}

const interrupt = () => rejectAll(Error('Social rendering interrupted'));
process.once('SIGINT', interrupt);
process.once('SIGTERM', interrupt);
const deadline = setTimeout(() => { rejectAll(Error('Social rendering timed out after 90 seconds')); child?.kill('SIGTERM'); }, 90000);
try {
  if (typeof WebSocket !== 'function') throw Error('Node 22 or newer is required for native WebSocket support.');
  const inputs = await sourceHashes();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const profile = join(temporary, 'profile');
  child = spawn(chrome, ['--headless=new', '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--hide-scrollbars', '--force-device-scale-factor=1', '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio:'ignore' });
  child.once('error', rejectAll);
  child.once('exit', code => rejectAll(Error(`Chrome exited before cleanup: ${code}`)));
  let connection;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (failure) throw failure;
    try {
      const [port, path] = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split('\n');
      if (/^\d+$/.test(port) && path.startsWith('/devtools/browser/')) { connection = `ws://127.0.0.1:${port}${path}`; break; }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await delay(100);
  }
  if (!connection) throw Error('Chrome did not expose its debugging endpoint within 15 seconds.');
  socket = new WebSocket(connection);
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id);
      pending.delete(message.id); clearTimeout(request.timer);
      if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
    }
    for (const listener of listeners) {
      if (message.method === listener.method && message.sessionId === listener.sessionId) {
        listeners.delete(listener); clearTimeout(listener.timer); listener.resolve(message.params);
      }
    }
  });
  socket.addEventListener('close', () => rejectAll(Error('Chrome debugging connection closed')));
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Chrome WebSocket connection timed out')), 10000);
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once:true });
    socket.addEventListener('error', () => { clearTimeout(timer); reject(Error('Chrome WebSocket connection failed')); }, { once:true });
  });
  const { targetId } = await send('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten:true });
  await send('Page.enable', {}, sessionId);
  const outputs = [];
  for (const lang of ['fr', 'en']) {
    for (const format of ['landscape']) {
      const square = format === 'square';
      const width = square ? 1080 : 1200, height = square ? 1080 : 630;
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor:1, mobile:false }, sessionId);
      const loaded = waitFor('Page.loadEventFired', sessionId);
      const url = `http://127.0.0.1:${server.address().port}/kirow/large-scale/social-template.html?lang=${lang}&format=${format}`;
      await Promise.all([loaded, send('Page.navigate', { url }, sessionId)]);
      const ready = await send('Runtime.evaluate', { awaitPromise:true, returnByValue:true,
        expression:`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const rect=document.querySelector('.card').getBoundingClientRect();return {width:rect.width,height:rect.height,fonts:[...document.fonts].every(font=>font.status==='loaded')}})()`
      }, sessionId);
      if (ready.exceptionDetails) throw Error(`Template failed: ${JSON.stringify(ready.exceptionDetails)}`);
      if (ready.result.value.width !== width || ready.result.value.height !== height || !ready.result.value.fonts) throw Error(`Unexpected template dimensions or fonts: ${lang}/${format}`);
      const { data } = await send('Page.captureScreenshot', { format:'jpeg', quality:91, fromSurface:true,
        captureBeyondViewport:false, clip:{ x:0, y:0, width, height, scale:1 } }, sessionId);
      const name = `social-${lang}.jpg`;
      outputs.push({ name, bytes:Buffer.from(data, 'base64') });
      console.log(`Rendered ${name} (${width}x${height})`);
    }
  }
  if (JSON.stringify(inputs) !== JSON.stringify(await sourceHashes())) throw Error('Social artwork sources changed during rendering; rerun once the model preview is ready.');
  for (const { name, bytes } of outputs) await writeFile(join(kirow, 'assets', name), bytes);
} finally {
  clearTimeout(deadline);
  process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt);
  rejectAll(Error('Social renderer cleanup'));
  socket?.close();
  await stopChrome();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive:true, force:true });
}
