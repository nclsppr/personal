// Render publication assets from the same scene as the interactive page.
// Requires a local Chromium executable; no production service is contacted.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, mkdir, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const kirow = join(root, 'kirow');
const temp = await mkdtemp(join(tmpdir(), 'kirow-render-'));
const token = randomBytes(24).toString('hex');
const chrome = process.env.KIROW_CHROME || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const expected = new Set(['preview.jpg', 'manual/preview.jpg', 'kirow-etude.ldr',
  ...Array.from({length:32}, (_,i) => `manual/step-${String(i+1).padStart(2,'0')}.jpg`)]);
const renderedNames=[...expected];
let finish, fail, child, timer;
const done = new Promise((yes, no) => {finish=yes; fail=no;});
// Attach immediately so an early renderer failure cannot become an unhandled rejection.
done.catch(() => {});
const harness = `import {createScene,INITIAL} from ${JSON.stringify(join(kirow,'src/scene.ts'))};
const host=document.getElementById('render');
async function send(name,data){const r=await fetch('/__render/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:${JSON.stringify(token)},name,data})});if(!r.ok)throw Error(await r.text());}
const tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
async function run(){
 await document.fonts.ready;
 const logo=new Image();logo.src='/kirow/assets/sncf.svg';await logo.decode();
 const api=createScene(host,()=>{});
 const state={...INITIAL,night:false,auto:false,step:32};
 api.update(state);await tick();api.view('hero');await tick();
 await send('preview.jpg',api.snapshot());
 host.style.width='1200px';host.style.height='900px';await tick();api.view('hero');await tick();
 await send('manual/preview.jpg',api.snapshot());
 for(let step=1;step<=32;step++){api.update({...state,step});api.view('hero');await tick();await send('manual/step-'+String(step).padStart(2,'0')+'.jpg',api.snapshot());}
 await send('kirow-etude.ldr',api.ldrawText());api.dispose();
}
run().catch(error=>fetch('/__render/error',{method:'POST',body:JSON.stringify({token:${JSON.stringify(token)},error:String(error.stack||error)})}));`;

try {
  const dataFiles=(await readdir(join(kirow,'data'),{recursive:true})).filter(name=>/\.(json|bin)$/.test(name)).map(name=>'data/'+name);
  const inputNames=['src/scene.ts','src/blueprint.ts','src/parts-evidence.json','src/blueprint-data.json','render-assets.mjs',...dataFiles];
  const hashes=async names=>Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update(await readFile(join(kirow,name))).digest('hex')])));
  const sourceHashes=await hashes(inputNames);
  await build({stdin:{contents:harness,resolveDir:kirow,loader:'ts'},bundle:true,
    splitting:true,format:'esm',outdir:temp,platform:'browser',target:'chrome113',minify:true});
  await mkdir(join(kirow,'assets/manual'), {recursive:true});
  const server=createServer(async(req,res)=>{
    try {
      const path=new URL(req.url,'http://localhost').pathname;
      if(req.method==='POST' && ['/__render/result','/__render/error'].includes(path)){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>12_000_000)throw Error('Oversized render');}
        const data=JSON.parse(body);if(data.token!==token){res.writeHead(403).end();return;}
        if(path.endsWith('/error')){res.end();fail(Error(data.error));return;}
        if(!expected.has(data.name))throw Error('Unexpected render asset');
        const bytes=data.name.endsWith('.jpg')?Buffer.from(data.data.replace(/^data:image\/jpeg;base64,/,''),'base64'):data.data;
        await writeFile(join(kirow,'assets',data.name),bytes);expected.delete(data.name);
        res.end('ok');console.log('Rendered '+data.name);if(!expected.size)finish();return;
      }
      if(path==='/__render/'){
        res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr"><meta charset="utf-8"><link rel="icon" href="data:,"><style>body{margin:0}#render{width:1600px;height:1100px}</style><div id="render"></div><script type="module" src="/__render/stdin.js"></script></html>');return;
      }
      const fromBundle=path.startsWith('/__render/');
      const base=fromBundle?temp:root;
      const file=resolve(base,'.'+(fromBundle?path.slice('/__render'.length):path));
      if(!file.startsWith(base+'/')){res.writeHead(403).end();return;}
      const types={'.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
      res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));
    } catch(error){res.writeHead(500).end(String(error));fail(error);}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
    child=spawn(chrome,['--headless','--no-first-run','--no-default-browser-check',
      '--disable-background-timer-throttling','--disable-renderer-backgrounding',
      '--hide-scrollbars','--force-device-scale-factor=1','--window-size=1600,1100',
      '--user-data-dir='+join(temp,'profile'),`http://127.0.0.1:${server.address().port}/__render/`],{stdio:'ignore'});
    child.on('error',fail);child.on('exit',code=>{if(expected.size)fail(Error('Renderer exited '+code));});
    timer=setTimeout(()=>fail(Error('Rendering timed out; missing '+[...expected].join(', '))),240000);
    await done;
    if(JSON.stringify(sourceHashes)!==JSON.stringify(await hashes(inputNames)))throw Error('Scene sources changed during rendering; regenerate assets.');
    await writeFile(join(kirow,'assets/render-manifest.json'),JSON.stringify({sources:sourceHashes,outputs:await hashes(renderedNames.map(name=>'assets/'+name))},null,2)+'\n');
  } finally {clearTimeout(timer);child?.kill();await new Promise(r=>server.close(r));}
} finally {await rm(temp,{recursive:true,force:true});}
