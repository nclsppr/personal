// Dependency-free local preview. GitHub Pages continues to serve the files directly.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=process.cwd(),args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const port=Number(option('--port','4173')),host=option('--host','127.0.0.1');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.woff2':'font/woff2','.pdf':'application/pdf','.ico':'image/x-icon','.csv':'text/csv; charset=utf-8','.ldr':'text/plain; charset=utf-8'};

function videoRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  return start <= end ? { start, end } : null;
}

createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path.split('/').some(part => part.startsWith('.'))) {
      res.writeHead(404);
      return res.end();
    }
    let file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep) && file !== root) {
      res.writeHead(403);
      return res.end();
    }
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) {
        res.writeHead(302, { Location: path + '/' });
        return res.end();
      }
      file = resolve(file, 'index.html');
    }
    const body = await readFile(file);
    const type = types[extname(file)] || 'application/octet-stream';
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store', 'Content-Length': body.length };
    if (type === 'video/mp4') {
      headers['Accept-Ranges'] = 'bytes';
      if (req.headers.range) {
        const range = videoRange(req.headers.range, body.length);
        if (!range) {
          res.writeHead(416, { 'Content-Range': 'bytes */' + body.length });
          return res.end();
        }
        const { start, end } = range;
        headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + body.length;
        headers['Content-Length'] = end - start + 1;
        res.writeHead(206, headers);
        return res.end(req.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
      }
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, host, () => console.log('Static preview ready on port ' + port));
