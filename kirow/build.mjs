import { build } from 'esbuild';
import { readdir, unlink, writeFile, readFile } from 'node:fs/promises';
// Regenerate only compiler-owned files, preserving the manual and other assets.
for(const name of await readdir('assets'))if(/^engine-.*\.js(?:\.LEGAL\.txt)?$/.test(name))await unlink(`assets/${name}`);
await build({entryPoints:['src/app.ts'],outdir:'assets',bundle:true,splitting:true,format:'esm',platform:'browser',target:['safari16.4','chrome113','firefox115'],minify:true,charset:'ascii',legalComments:'external',chunkNames:'engine-[hash]'});
const data=await build({entryPoints:['src/blueprint.ts'],bundle:true,format:'esm',platform:'node',write:false});
const blueprint=await import('data:text/javascript;base64,'+Buffer.from(data.outputFiles[0].text).toString('base64'));
await writeFile('src/blueprint-data.json',JSON.stringify({bricks:blueprint.BRICKS,specials:blueprint.SPECIALS,catalog:blueprint.ALL_CATALOG,evidence:blueprint.PARTS_EVIDENCE,steps:blueprint.STEPS,inventory:blueprint.inventory(),colors:blueprint.COLORS,note:blueprint.PHYSICAL_NOTE}));

// Preserve GLSL line breaks while normalizing insignificant source indentation.
for(const name of await readdir('assets'))if(/^engine-.*\.js$/.test(name)){const path=`assets/${name}`;const code=await readFile(path,'utf8');await writeFile(path,code.replace(/[ \t]+$/gm,'').replace(/^[ \t]+/gm,indent=>indent.replace(/\t/g,'  ')));}
