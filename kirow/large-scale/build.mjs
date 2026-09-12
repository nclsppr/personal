import {build} from 'esbuild';
import {readFile,writeFile,readdir,mkdir,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
await mkdir(join(root,'assets'),{recursive:true});
const data=await build({entryPoints:[join(root,'src/blueprint.ts')],bundle:true,format:'esm',platform:'node',write:false});
const m=await import('data:text/javascript;base64,'+Buffer.from(data.outputFiles[0].text).toString('base64'));
const used=new Set(m.inventory().map(r=>r.key));
const evidence={...m.PARTS_EVIDENCE,variants:m.PARTS_EVIDENCE.variants.filter(v=>used.has(v.key))};
const output={pieces:m.PIECES,groups:m.GROUPS,catalog:m.ALL_CATALOG,colors:m.COLORS,steps:m.STEPS,inventory:m.inventory(),dimensions:m.DIMENSIONS,evidence,note:m.PHYSICAL_NOTE,noteEn:m.PHYSICAL_NOTE_EN,cranePieceCount:m.CRANE_PIECE_COUNT,transportPieceCount:m.TRANSPORT_PIECE_COUNT,totalPieceCount:m.PIECES.length,transportFirstStep:m.TRANSPORT_FIRST_STEP};
await writeFile(join(root,'src/model-data.json'),JSON.stringify(output));
await writeFile(join(root,'src/ui-data.json'),JSON.stringify({steps:m.STEPS,transportFirstStep:m.TRANSPORT_FIRST_STEP}));
console.log(`${m.PIECES.length} pieces, ${m.STEPS.length} stages, ${used.size} variants`);
if(!process.argv.includes('--data-only')){
 for(const name of await readdir(join(root,'assets')))if(/^engine-.*\.js(?:\.LEGAL\.txt)?$/.test(name))await unlink(join(root,'assets',name));
 await build({entryPoints:[join(root,'src/app.ts')],outdir:join(root,'assets'),bundle:true,splitting:true,format:'esm',platform:'browser',target:['safari16.4','chrome113','firefox115'],minify:true,charset:'ascii',legalComments:'external',chunkNames:'engine-[hash]'});
 for(const name of await readdir(join(root,'assets')))if(/^engine-.*\.js$/.test(name)){const p=join(root,'assets',name),s=await readFile(p,'utf8');await writeFile(p,s.replace(/[ \t]+$/gm,'').replace(/^[ \t]+/gm,i=>i.replace(/\t/g,'  ')));}
}
