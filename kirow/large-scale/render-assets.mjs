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
import { once } from 'node:events';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const kirow = join(root, 'kirow/large-scale');
const temp = await mkdtemp(join(tmpdir(), 'kirow-render-'));
const token = randomBytes(24).toString('hex');
const chrome = process.env.KIROW_CHROME || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const model=JSON.parse(await readFile(join(kirow,'src/model-data.json'),'utf8'));
const quick=process.argv.includes('--preview-only');
const expected = new Set(['preview.jpg','detail-cab.jpg','detail-bogies.jpg','detail-boom.jpg','transport.jpg','golden-hour.jpg', ...(!quick?['manual/preview.jpg','kirow-large-scale.ldr',...model.steps.map(s=>`manual/step-${String(s.number).padStart(2,'0')}.jpg`)]:[])]);
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
 const api=createScene(host,{});
 const state={...INITIAL,night:false,auto:false,step:${model.steps.length}};
 api.apply(state);await tick();api.setView('hero');await tick();
 await send('preview.jpg',api.capture('image/jpeg',.92));
 api.apply({...state,night:true});await tick();await send('golden-hour.jpg',api.capture('image/jpeg',.92));
 host.style.height='900px';await tick();api.apply({...state,mode:'transport',elevation:0,extension:0,outriggers:0,hook:6});api.setView('side');await tick();await send('transport.jpg',api.capture('image/jpeg',.92));
 api.apply(state);
 host.style.width='1200px';host.style.height='900px';await tick();
 for(const [name,view] of [['detail-cab.jpg','detail'],['detail-bogies.jpg','bogies'],['detail-boom.jpg','boom']]){api.setView(view);await tick();await send(name,api.capture('image/jpeg',.92));}
 if(${!quick}){
  api.setView('hero');await tick();await send('manual/preview.jpg',api.capture('image/jpeg',.92));
  for(let step=1;step<=${model.steps.length};step++){api.apply({...state,step,mode:step>=${model.transportFirstStep}?'transport':'working'});api.setView('hero');await tick();await send('manual/step-'+String(step).padStart(2,'0')+'.jpg',api.capture('image/jpeg',.92));}
  api.apply(state);await send('kirow-large-scale.ldr',api.exportLDraw());
 }
 console.log(JSON.stringify(api.getStats()));api.dispose();
}
run().catch(error=>fetch('/__render/error',{method:'POST',body:JSON.stringify({token:${JSON.stringify(token)},error:String(error.stack||error)})}));`;

try {
  const dataFiles=(await readdir(join(kirow,'data'),{recursive:true})).filter(name=>/\.(json|bin)$/.test(name)).map(name=>'data/'+name);
  const inputNames=['src/scene.ts','src/geometry.ts','src/environment.ts','src/transport.ts','src/blueprint.ts','catalog.ts','src/model-data.json','render-assets.mjs',...dataFiles];
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
    timer=setTimeout(()=>fail(Error('Rendering timed out; missing '+[...expected].join(', '))),600000);
    await done;
    if(JSON.stringify(sourceHashes)!==JSON.stringify(await hashes(inputNames)))throw Error('Scene sources changed during rendering; regenerate assets.');
    await writeFile(join(kirow,quick?'assets/preview-manifest.json':'assets/render-manifest.json'),JSON.stringify({sources:sourceHashes,outputs:await hashes(renderedNames.map(name=>'assets/'+name))},null,2)+'\n');
  } finally {
    clearTimeout(timer);
    if(child?.pid && child.exitCode===null && child.signalCode===null){
      const stopped=once(child,'exit'),forceStop=setTimeout(()=>child.kill('SIGKILL'),3000);
      child.kill();
      try{await stopped;}finally{clearTimeout(forceStop);}
    }
    await new Promise(r=>server.close(r));
  }
} finally {await rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
