// Run after build and render-assets. Checks real rendered LDraw transforms as well as the source grid.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import * as T from 'three';

const root=fileURLToPath(new URL('..',import.meta.url));
const compiled=await build({entryPoints:[root+'/src/blueprint.ts'],bundle:true,format:'esm',platform:'node',write:false});
const blueprint=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const official=JSON.parse(await readFile(root+'/data/ldraw-geometry.json','utf8'));
let checks=0;
const equal=(actual,expected,message,tolerance=1e-5)=>{assert.ok(Math.abs(actual-expected)<tolerance,`${message}: ${actual} vs ${expected}`);checks++;};
const require=(condition,message)=>{assert.ok(condition,message);checks++;};

const exported=[];
let step=1;
for(const line of (await readFile(root+'/assets/kirow-etude.ldr','utf8')).split('\n')){
 if(line==='0 STEP')step++;
 if(line.startsWith('0 FILE kirow-actuator.ldr'))break;
 if(!line.startsWith('1 '))continue;
 const fields=line.trim().split(/\s+/),numbers=fields.slice(2,14).map(Number);
 const [x,y,z,a,b,c,d,e,f,g,h,i]=numbers;
 exported.push({step,file:fields[14],color:Number(fields[1]),origin:new T.Vector3(x,y,z),matrix:new T.Matrix4().set(a,b,c,x,d,e,f,y,g,h,i,z,0,0,0,1)});
}
const transformed=(part,point=[0,0,0])=>new T.Vector3(...point).applyMatrix4(part.matrix);

for(const x of [-15,15])for(const side of [-1,1]){
 const group=`leg${x}${side}`,pieces=blueprint.BRICKS.filter(part=>part.group===group);
 const stack=pieces.filter(part=>part.part==='p44'||part.part==='b22').sort((a,b)=>a.y-b.y);
 require(stack.length===7,group+' has two real footing plates and five bricks');
 for(let index=1;index<stack.length;index++)equal(stack[index-1].y+blueprint.CATALOG[stack[index-1].part].h,stack[index].y,group+' adjoining support layers');
 const top=stack.at(-1),arm=pieces.find(part=>part.part==='b24'&&part.color==='yellow');
 equal(top.y+blueprint.CATALOG[top.part].h,arm.y,group+' column touches arm');
 const cap=pieces.find(part=>part.part==='p28');
 equal(arm.y+blueprint.CATALOG[arm.part].h,cap.y,group+' cap touches arm');
 const ground=-.44,footing=stack[0].y+blueprint.ASSEMBLY.outriggerOriginY;
 require(footing<=ground&&footing+blueprint.CATALOG.p44.h>=ground,group+' footing meets the terrain');

 const hinges=blueprint.SPECIALS.filter(part=>part.group===group);
 const pivots=hinges.map(part=>{
  require(part.ldrawOrigin,group+' hinge uses its native assembly origin');
  const offset=new T.Vector3(...official[blueprint.ALL_CATALOG[part.part].ldrawId].offset);
  const rotation=new T.Euler(part.rx||0,part.ry,part.rz||0);
  const position=new T.Vector3(part.x,part.y,part.z).add(offset.clone().applyEuler(rotation));
  return offset.negate().applyEuler(rotation).add(position);
 });
 equal(pivots[0].distanceTo(pivots[1]),0,group+' source hinge pivots coincide');

 // The export comes from the scene's actual world matrices, including group transforms.
 const rendered=exported.filter(part=>part.step===9&&Math.abs(part.origin.x-x*20)<1e-5&&Math.sign(part.origin.z)===side);
 const column=rendered.filter(part=>['3003.dat','3031.dat'].includes(part.file)).sort((a,b)=>b.origin.y-a.origin.y);
 require(column.length===7,group+' rendered support is complete');
 for(let index=1;index<column.length;index++){
  const upperHeight=column[index].file==='3003.dat'?24:8;
  equal(column[index-1].origin.y,column[index].origin.y+upperHeight,group+' rendered support layers touch');
 }
 const renderedArm=rendered.find(part=>part.file==='3001.dat'&&part.color===14);
 equal(column.at(-1).origin.y,renderedArm.origin.y+24,group+' rendered column touches arm');
 const renderedHinges=rendered.filter(part=>['2429.dat','2430.dat'].includes(part.file));
 require(renderedHinges.length===2,group+' rendered hinge pair exists');
 equal(renderedHinges[0].origin.distanceTo(renderedHinges[1].origin),0,group+' rendered hinge pivots coincide');
}

const axle=exported.find(part=>part.file==='3707.dat');
require(axle,'main pivot axle exists');
const axleAxis=transformed(axle,[1,0,0]).sub(axle.origin).normalize();
equal(Math.abs(axleAxis.z),1,'rendered main axle crosses the support holes');
const distanceToAxle=point=>new T.Vector3().crossVectors(point.clone().sub(axle.origin),axleAxis).length();
for(const support of exported.filter(part=>part.file==='3701.dat'))equal(distanceToAxle(transformed(support,[0,10,0])),0,'rendered axle intersects actual LDraw support hole');
for(const bush of exported.filter(part=>part.file==='3713.dat'))equal(distanceToAxle(bush.origin),0,'rendered bush and axle are concentric');
const boomBase=exported.find(part=>part.step===23&&part.file==='3031.dat');
// Exported matrix coefficients are rounded to five decimals, so allow 0.001 LDU here.
equal(transformed(boomBase,[-40,0,0]).distanceTo(axle.origin),0,'rendered boom rotates at the axle',.001);

const evidence=new Set(blueprint.PARTS_EVIDENCE.variants.map(variant=>variant.key));
require(blueprint.ALL_PARTS.every(part=>evidence.has(part.part+'-'+part.color)),'every added part and colour retains its catalogue evidence');
console.log(`Assembly checks passed: ${checks}; ${blueprint.ALL_PARTS.length} catalogued pieces. No support gaps or detached hinge pivots in the rendered assembly.`);
