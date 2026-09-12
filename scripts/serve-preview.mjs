// Dependency-free local preview. GitHub Pages continues to serve the files directly.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=process.cwd(),args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const port=Number(option('--port','4173')),host=option('--host','127.0.0.1');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf','.ico':'image/x-icon','.csv':'text/csv; charset=utf-8','.ldr':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.split('/').some(x=>x.startsWith('.'))){res.writeHead(404);return res.end();}let file=resolve(root,'.'+path);if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);return res.end();}const info=await stat(file);if(info.isDirectory()){if(!path.endsWith('/')){res.writeHead(302,{Location:path+'/'});return res.end();}file=resolve(file,'index.html');}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,host,()=>console.log(`Static preview ready on port ${port}`));
