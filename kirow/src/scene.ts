import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BRICKS,CATALOG,COLORS,STEPS,inventory,PHYSICAL_NOTE, type Brick } from './blueprint';

export type SceneSettings={elevation:number;slew:number;hook:number;explode:number;night:boolean;auto:boolean;step:number;mode:'realtime'|'pathtrace'};
export const INITIAL:SceneSettings={elevation:24,slew:0,hook:9,explode:0,night:true,auto:false,step:32,mode:'realtime'};
export type SceneAPI={update:(s:SceneSettings)=>void;view:(v:string)=>void;capture:()=>void;booklet:()=>Promise<void>;dispose:()=>void;ldraw:()=>void};
function saveBlob(blob:Blob,name:string){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
export function downloadText(text:string,name:string,type='text/plain'){saveBlob(new Blob([text],{type}),name);}

export function createScene(host:HTMLElement,onStatus:(s:string)=>void):SceneAPI{
 const english=document.documentElement.lang.startsWith('en');
 const say=(fr:string,en:string)=>{if(!disposed)onStatus(english?en:fr);};
 const studioStatus=()=>say('Studio · rendu temps réel','Studio · real-time rendering');
 let makingBook=false;let disposed=false,contextLost=false,renderFailed=false,settings={...INITIAL},frame=0,dirty=true,needsBuild=true,pathBusy=false,lastChange=0,prevSamples=-1;
 let pt:any=null,ptRequested=false,pathFailed=false,renderingPath=false,lastView='hero',manualCamera=false;
 const scene=new T.Scene();scene.background=new T.Color('#171c22');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 const isMobile=host.clientWidth<600;
 const initialWidth=Math.max(1,host.clientWidth),initialHeight=Math.max(1,host.clientHeight);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isMobile?1.5:1.8));renderer.setSize(initialWidth,initialHeight);
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-label',english?'3D brick model of the Kirow crane. Drag to orbit, pinch or use the scroll wheel to zoom.':'Maquette 3D de la grue Kirow en briques. Faites glisser pour tourner, pincez ou utilisez la molette pour zoomer.');
 renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
 renderer.domElement.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight + -');
 renderer.domElement.title=english?'Arrows: pan. Shift + arrows: orbit. + / -: zoom.':'Flèches : déplacer. Maj + flèches : tourner. + / - : zoomer.';
 renderer.domElement.style.touchAction='none';renderer.domElement.style.display='block';host.appendChild(renderer.domElement);
 const camera=new T.PerspectiveCamera(34,initialWidth/initialHeight,.1,700);camera.position.set(78,54,86);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(1,10,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=18;controls.maxDistance=190;controls.maxPolarAngle=Math.PI*.48;controls.autoRotateSpeed=.5;
 controls.listenToKeyEvents(renderer.domElement);
 const onZoomKey=(event:KeyboardEvent)=>{if(!['+','=','-','_'].includes(event.key))return;event.preventDefault();manualCamera=true;const offset=camera.position.clone().sub(controls.target);const distance=T.MathUtils.clamp(offset.length()*(['+','='].includes(event.key)?.9:1.1),controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();dirty=true;};
 renderer.domElement.addEventListener('keydown',onZoomKey);
 controls.addEventListener('start',()=>{manualCamera=true;});
 controls.addEventListener('change',()=>{dirty=true;lastChange=performance.now();if(pt&&!contextLost&&!pathFailed)try{pt.updateCamera();}catch{fallbackPath();}});
 function fallbackPath(){
  const report=!pathFailed||settings.mode!=='realtime';
  pathFailed=true;pathBusy=false;settings.mode='realtime';dirty=true;
  if(!report)return;
  say('Ray tracing indisponible sur cet appareil · studio actif','Ray tracing unavailable on this device · studio active');
  host.dispatchEvent(new CustomEvent('kirow-mode-fallback',{detail:{mode:'realtime'}}));
 }
 function rendererUnavailable(){
  if(renderFailed||disposed)return;renderFailed=true;
  say('Le rendu 3D est indisponible · aperçu du modèle affiché','3D rendering is unavailable · model preview displayed');
  host.dispatchEvent(new CustomEvent('kirow-renderer-unavailable'));
 }
 const onContextLost=(event:Event)=>{event.preventDefault();contextLost=true;rendererUnavailable();};
 const onContextRestored=()=>{
  if(disposed)return;contextLost=false;renderFailed=false;dirty=true;needsBuild=true;settings.mode='realtime';
  if(pt){try{pt.dispose();}catch{/* Context resources may already be gone. */}pt=null;}
  ptRequested=false;pathFailed=false;studioStatus();host.dispatchEvent(new CustomEvent('kirow-renderer-restored'));
 };
 renderer.domElement.addEventListener('webglcontextlost',onContextLost);
 renderer.domElement.addEventListener('webglcontextrestored',onContextRestored);
 renderer.debug.onShaderError=()=>{if(settings.mode==='pathtrace'||renderingPath)fallbackPath();else rendererUnavailable();};
 // Procedural HDR studio: softboxes stored as linear radiance in an equirectangular texture.
 const w=512,h=256,hdr=new Float32Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/w,v=y/h;const soft=(a:number,b:number,c:number,d:number)=>T.MathUtils.smoothstep(u,a,a+.018)*(1-T.MathUtils.smoothstep(u,b-.018,b))*T.MathUtils.smoothstep(v,c,c+.02)*(1-T.MathUtils.smoothstep(v,d-.02,d));
  const base=.12+.24*Math.max(0,1-v*2),warm=soft(.09,.28,.2,.46)*6.4,cool=soft(.57,.68,.17,.51)*5.7,top=soft(.75,.93,.23,.34)*3.1;
  const i=(y*w+x)*4;hdr[i]=base+warm+cool*.77+top;hdr[i+1]=base+warm*.97+cool*.87+top;hdr[i+2]=base+warm*.89+cool+top;hdr[i+3]=1;
 }
 const environment=new T.DataTexture(hdr,w,h,T.RGBAFormat,T.FloatType);environment.mapping=T.EquirectangularReflectionMapping;environment.needsUpdate=true;scene.environment=environment;scene.environmentIntensity=.70;
 const key=new T.DirectionalLight('#fff4dc',3.8);key.position.set(-25,70,35);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-65;key.shadow.camera.right=65;key.shadow.camera.top=65;key.shadow.camera.bottom=-65;key.shadow.camera.far=190;key.shadow.normalBias=.05;key.shadow.bias=-.00012;scene.add(key);
 const fill=new T.DirectionalLight('#d7e6ff',1.35);fill.position.set(35,35,-45);scene.add(fill);
 const rim=new T.DirectionalLight('#e0ecff',2.1);rim.position.set(-35,18,-40);scene.add(rim);
 const ambient=new T.HemisphereLight('#ffffff','#4b4940',.6);scene.add(ambient);
 const groundMat=new T.MeshPhysicalMaterial({color:'#202630',roughness:.24,metalness:.15,clearcoat:.4,clearcoatRoughness:.26});
 const floor=new T.Mesh(new T.PlaneGeometry(3000,3000),groundMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.44;floor.receiveShadow=true;scene.add(floor);
 const mats:Record<string,T.MeshPhysicalMaterial>={};for(const [name,c] of Object.entries(COLORS))mats[name]=new T.MeshPhysicalMaterial({color:c.hex,roughness:name==='black'?.28:.235,metalness:0,clearcoat:.42,clearcoatRoughness:.19,ior:1.46,envMapIntensity:1});
 const chrome=new T.MeshPhysicalMaterial({color:'#b9bebc',metalness:.93,roughness:.16});
 const glass=new T.MeshPhysicalMaterial({color:'#354e51',roughness:.12,metalness:.18,transmission:.2,thickness:.22,ior:1.49,clearcoat:1,side:T.DoubleSide});
 const rubber=new T.MeshPhysicalMaterial({color:'#242623',roughness:.65});
 const detailMeshes:T.Mesh[]=[];
 const groups:Record<string,T.Group>={};
 for(const name of ['track','rearBogie','frontBogie','chassis','turret','counter','cab','boom','jib','hook',...[-15,15].flatMap(x=>[-1,1].map(z=>`leg${x}${z}`))]){groups[name]=new T.Group();groups[name].name=name;}
 scene.add(groups.track,groups.chassis,groups.rearBogie,groups.frontBogie);
 scene.add(groups.turret);groups.turret.add(groups.counter,groups.cab,groups.boom,groups.hook);groups.boom.add(groups.jib);
 for(const x of [-15,15])for(const z of [-1,1])groups.chassis.add(groups[`leg${x}${z}`]);
 groups.rearBogie.position.x=-13;groups.frontBogie.position.x=13;
 const cache=new Map<string,T.BufferGeometry>();
 const box=(x:number,y:number,z:number)=>new RoundedBoxGeometry(x,y,z,1,.045);
 function geom(part:string){if(cache.has(part))return cache.get(part)!;const p=CATALOG[part];const bits:T.BufferGeometry[]=[];
  if(p.kind==='round'){const b=new T.CylinderGeometry(.485,.485,p.h-.025,20);b.translate(0,p.h/2,0);bits.push(b);}
  else{
   const top=box(p.l-.045,.19,p.w-.045);top.translate(0,p.h-.095,0);bits.push(top);
   for(const z of [-1,1]){const g=box(p.l-.045,p.h-.16,.13);g.translate(0,(p.h-.16)/2,z*(p.w/2-.085));bits.push(g);}
   for(const x of [-1,1]){const g=box(.13,p.h-.16,p.w-.20);g.translate(x*(p.l/2-.085),(p.h-.16)/2,0);bits.push(g);}
   if(p.w>=2&&p.h>1)for(let x=-p.l/2+1;x<p.l/2;x++){
    const tube=new T.CylinderGeometry(.31,.31,p.h-.18,12,1,true);tube.translate(x,(p.h-.18)/2,0);bits.push(tube);
   }
  }
  if(p.kind!=='tile')for(let x=0;x<p.l;x++)for(let z=0;z<p.w;z++){
   const stud=new T.CylinderGeometry(.293,.303,.18,16);stud.translate(x-(p.l-1)/2,p.h+.09,z-(p.w-1)/2);bits.push(stud);
   const lip=new T.TorusGeometry(.272,.012,3,16);lip.rotateX(Math.PI/2);lip.translate(x-(p.l-1)/2,p.h+.185,z-(p.w-1)/2);bits.push(lip);
  }
  const result=mergeGeometries(bits.map(g=>g.index?g.toNonIndexed():g),false);for(const g of bits)g.dispose();cache.set(part,result);return result;
 }
 const batches=new Map<string,{bricks:Brick[];group:string;step:number;color:string}>();
 for(const b of BRICKS){const k=[b.group,b.step,b.color].join(':');if(!batches.has(k))batches.set(k,{bricks:[],group:b.group,step:b.step,color:b.color});batches.get(k)!.bricks.push(b);}
 const brickMeshes:T.Mesh[]=[];
 for(const batch of batches.values()){
  const geos=batch.bricks.map(b=>{const g=geom(b.part).clone();g.rotateY(b.ry);g.translate(b.x,b.y,b.z);return g;});
  const g=mergeGeometries(geos,false);for(const b of geos)b.dispose();const mesh=new T.Mesh(g,mats[batch.color]);mesh.userData.step=batch.step;mesh.castShadow=true;mesh.receiveShadow=true;groups[batch.group].add(mesh);brickMeshes.push(mesh);
 }
 function special(g:T.Group,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number,step=32,rot?:[number,number,number]){
  const m=new T.Mesh(geometry,material);m.position.set(x,y,z);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;m.userData.step=step;g.add(m);detailMeshes.push(m);return m;
 }
 function bar(g:T.Group,a:T.Vector3,b:T.Vector3,r:number,material:T.Material,step=32){const delta=b.clone().sub(a);const m=special(g,new T.CylinderGeometry(r,r,delta.length(),12),material,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number],step);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 // Railroad wheels are modelled reference volumes, separate from catalogue inventory.
 for(const g of [groups.rearBogie,groups.frontBogie])for(const x of [-4.5,-1.5,1.5,4.5]){
  bar(g,new T.Vector3(x,2.38,-3.4),new T.Vector3(x,2.38,3.4),.17,chrome,2);
  for(const z of [-3.2,3.2]){
   special(g,new T.CylinderGeometry(1.13,1.13,.42,32),mats.black,x,2.38,z,2,[Math.PI/2,0,0]);
   special(g,new T.CylinderGeometry(1.24,1.24,.10,32),mats.dark,x,2.38,z-Math.sign(z)*.22,2,[Math.PI/2,0,0]);
   special(g,new T.CylinderGeometry(.45,.45,.50,20),mats.dark,x,2.38,z,2,[Math.PI/2,0,0]);
   special(g,new T.CylinderGeometry(.17,.17,.53,12),chrome,x,2.38,z,2,[Math.PI/2,0,0]);
  }
 }
 for(const z of [-3.2,3.2]){
  special(groups.track,box(80,.18,.65),chrome,0,.64,z,1);
  special(groups.track,box(80,.45,.20),mats.dark,0,.87,z,1);
  special(groups.track,box(80,.18,.30),chrome,0,1.16,z,1);
 }
 for(const x of [-23,23])for(const z of [-2.5,2.5]){
  special(groups.chassis,new T.CylinderGeometry(.38,.38,.9,16),mats.black,x,5.6,z,8,[0,0,Math.PI/2]);
  special(groups.chassis,box(.3,1.1,1.2),rubber,x+Math.sign(x)*.5,5.6,z,8);
 }
 for(const y of [7.6,8.0])special(groups.chassis,new T.CylinderGeometry(3.4,3.4,.35,48),mats.black,-4,y,0,10);
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;special(groups.chassis,box(.3,.25,.4),mats.dark,-4+Math.cos(a)*3.45,7.9,Math.sin(a)*3.45,10,[0,-a,0]);}
 // Cab panes, interior, seat and controls.
 special(groups.cab,box(6.7,4.65,.16),glass,3,4.35,6.57,20);
 special(groups.cab,box(.16,4.65,2.55),glass,6.57,4.35,5,20);
 special(groups.cab,box(.16,4.65,2.55),glass,-.57,4.35,5,20);
 special(groups.cab,box(1.6,.8,1.6),mats.black,2.3,1.9,5,20);
 special(groups.cab,box(.5,2.2,1.6),mats.black,1.5,2.7,5,20);
 special(groups.cab,box(1.0,.5,2.2),mats.dark,5.5,2.8,5,20);
 bar(groups.cab,new T.Vector3(5.8,2.4,6.7),new T.Vector3(3.6,5.4,6.7),.038,mats.black,20);
 for(const z of [3.5,6.5])special(groups.cab,new T.CylinderGeometry(.22,.22,.34,16),mats.white,6.8,7.9,z,31);
 const amber=new T.MeshPhysicalMaterial({color:'#ff920f',emissive:'#fa7e00',emissiveIntensity:.3,roughness:.17,transmission:.1});
 special(groups.cab,new T.CylinderGeometry(.29,.35,.55,20),amber,1,8.1,5,31);
 // Handrails and compartment grille.
 for(const z of [-4.45,4.45]){bar(groups.turret,new T.Vector3(-14,2.5,z),new T.Vector3(-2,2.5,z),.075,mats.yellow,31);for(const x of [-14,-10,-6,-2])bar(groups.turret,new T.Vector3(x,0,z),new T.Vector3(x,2.5,z),.075,mats.yellow,31);}
 for(let x=-10.5;x<-5;x+=.5)for(const z of [-4.08,4.08])special(groups.turret,box(.16,1.9,.12),mats.dark,x,4.5,z,14);
 // Distinctive printed tiles. Decals are identified as custom graphics in the booklet.
 function label(g:T.Group,text:string,bg:string,fg:string,width:number,height:number,pos:[number,number,number],rot:[number,number,number],step:number){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.font='italic 700 170px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,137);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshPhysicalMaterial({map:tex,roughness:.29,clearcoat:.3});return special(g,new T.PlaneGeometry(width,height),mat,...pos,step,rot);
 }
 const sncfDecals:T.Mesh[]=[];
 for(const side of [-1,1]){
  sncfDecals.push(label(groups.boom,'SNCF','#c71844','#ffffff',4,2.1,[11,1.6,side*2.025],[0,side<0?Math.PI:0,0],26));
  label(groups.turret,'KIROW','#f4c428','#242824',5.4,1.4,[-8,2,side*4.025],[0,side<0?Math.PI:0,0],15);
 }
 const logoTexture=new T.TextureLoader().load('/kirow/assets/sncf.svg',tex=>{
  if(disposed){tex.dispose();return;}tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  for(const mesh of sncfDecals){const material=(mesh.userData.baseMaterial||mesh.material) as T.MeshPhysicalMaterial;material.map?.dispose();material.map=tex;material.transparent=true;material.alphaTest=.02;material.needsUpdate=true;}
  dirty=true;needsBuild=true;lastChange=performance.now();
 },undefined,()=>{/* The custom printed fallback remains visible if the local asset fails. */});
 label(groups.counter,'150 t','#f4c428','#242824',4,1.1,[-21.025,3.8,0],[0,-Math.PI/2,0],17);
 const hookCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(0,-1.2,0),new T.Vector3(.7,-2.2,0),new T.Vector3(1.55,-1.9,0),new T.Vector3(1.5,-1.2,0)]);
 special(groups.hook,new T.TubeGeometry(hookCurve,24,.23,10,false),mats.black,0,0,0,30);
 for(const z of [-1.05,1.05])special(groups.hook,new T.CylinderGeometry(.65,.65,.24,24),mats.dark,0,2.75,z,30,[Math.PI/2,0,0]);
 for(const z of [-.7,.7])special(groups.boom,new T.CylinderGeometry(.60,.60,.4,24),mats.black,42,1.0,z,29,[Math.PI/2,0,0]);
 const cables=[-1,1].map(z=>bar(groups.turret,new T.Vector3(),new T.Vector3(0,1,0),.045,mats.black,30));
 const piston=bar(groups.turret,new T.Vector3(),new T.Vector3(0,1,0),.30,chrome,22);
 const sleeve=bar(groups.turret,new T.Vector3(),new T.Vector3(0,1,0),.48,mats.yellow,22);
 function setRod(m:T.Mesh,a:T.Vector3,b:T.Vector3){const d=b.clone().sub(a);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=d.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const composerTarget=new T.WebGLRenderTarget(initialWidth,initialHeight,{type:T.HalfFloatType,samples:isMobile?2:4});
 const composer=new EffectComposer(renderer,composerTarget);const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
 const ao=new SSAOPass(scene,camera,initialWidth,initialHeight);ao.kernelRadius=1.25;ao.minDistance=.002;ao.maxDistance=.095;composer.addPass(ao);const outputPass=new OutputPass();composer.addPass(outputPass);
 // Path tracing receives regular merged meshes (never unsupported instanced meshes).
 const ghost=new T.MeshPhysicalMaterial({color:'#bbc5b1',roughness:.4,metalness:0});
 for(const m of [...brickMeshes,...detailMeshes])m.userData.baseMaterial=m.material;
 const allMeshes=[...brickMeshes,...detailMeshes];
 const viewDirections:Record<string,T.Vector3>={hero:new T.Vector3(77,44,86),side:new T.Vector3(6,19,112),front:new T.Vector3(110,26,18),top:new T.Vector3(10,105,.2),detail:new T.Vector3(24,11,27)};
 function frameModel(name=lastView){
  lastView=name;const direction=(viewDirections[name]||viewDirections.hero).clone().normalize();
  if(name==='detail'){controls.target.set(-2,13,2);camera.position.copy(controls.target).addScaledVector(direction,40);controls.update();return;}
  scene.updateMatrixWorld(true);const bounds=new T.Box3();
  for(const mesh of allMeshes)if(mesh.visible){if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld));}
  if(bounds.isEmpty())return;const target=bounds.getCenter(new T.Vector3());
  const right=new T.Vector3().crossVectors(camera.up,direction).normalize(),up=new T.Vector3().crossVectors(direction,right).normalize();
  const tanY=Math.tan(T.MathUtils.degToRad(camera.fov)*.5),tanX=tanY*camera.aspect;
  let distance=18;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const offset=new T.Vector3(x,y,z).sub(target),depth=offset.dot(direction);
   distance=Math.max(distance,depth+Math.abs(offset.dot(right))/tanX,depth+Math.abs(offset.dot(up))/tanY);
  }
  controls.maxDistance=Math.max(190,distance*2.4);controls.target.copy(target);camera.position.copy(target).addScaledVector(direction,distance*1.10);controls.update();dirty=true;
 }
 function pose(){
  const e=settings.explode/100,a=T.MathUtils.degToRad(settings.elevation);
  groups.turret.position.set(-4,8.3+e*9,0);groups.turret.rotation.y=T.MathUtils.degToRad(settings.slew);
  groups.counter.position.set(-1-e*9,e*5,0);groups.cab.position.set(0,e*8,1+e*8);
  groups.boom.position.set(0,5.5+e*12,0);groups.boom.rotation.z=a;groups.jib.position.set(e*9,e*3,0);
  groups.rearBogie.position.y=-e*.7;groups.frontBogie.position.y=-e*.7;
  for(const x of [-15,15])for(const z of [-1,1])groups[`leg${x}${z}`].position.set(x,4.6,z*(2+e*6));
  const tip=new T.Vector3(42+e*9,1,0).applyAxisAngle(new T.Vector3(0,0,1),a).add(groups.boom.position);
  groups.hook.position.copy(tip).add(new T.Vector3(0,-settings.hook-3.8,0));
  cables.forEach((m,i)=>{const z=i===0?-.6:.6;setRod(m,tip.clone().add(new T.Vector3(0,0,z)),groups.hook.position.clone().add(new T.Vector3(0,3.5,z)));});
  const end=new T.Vector3(11,0,0).applyAxisAngle(new T.Vector3(0,0,1),a).add(groups.boom.position);const base=new T.Vector3(7,1.2,0);const mid=base.clone().lerp(end,.53);setRod(sleeve,base,mid);setRod(piston,mid,end);
  for(const mesh of [...brickMeshes,...detailMeshes]){mesh.visible=mesh.userData.step<=settings.step;mesh.material=settings.step<32&&mesh.userData.step<settings.step?ghost:mesh.userData.baseMaterial;}
  floor.visible=true;scene.updateMatrixWorld(true);dirty=true;needsBuild=true;lastChange=performance.now();
 }
 pose();
 function lighting(){
  scene.background=new T.Color(settings.night?'#171c22':'#e8e9e6');groundMat.color.set(settings.night?'#202630':'#dadcd6');groundMat.roughness=settings.night?.24:.31;
  scene.environmentIntensity=settings.night?.62:.85;key.intensity=settings.night?4.3:3.8;key.color.set(settings.night?'#ffedcd':'#fff4dc');fill.intensity=settings.night?1.9:1.35;rim.intensity=settings.night?2.4:1.3;ambient.intensity=settings.night?.18:.6;renderer.toneMappingExposure=settings.night?1.05:1.12;
 }
 lighting();frameModel();
 async function enablePath(){if(pathFailed){fallbackPath();return;}if(pt||ptRequested)return;ptRequested=true;pathBusy=true;say('Préparation du ray tracing…','Preparing ray tracing…');try{
   const {WebGLPathTracer}=await import('three-gpu-pathtracer');if(disposed)return;
   if(contextLost)return;renderingPath=true;pt=new WebGLPathTracer(renderer);pt.bounces=5;pt.transmissiveBounces=4;pt.tiles.set(isMobile?3:2,isMobile?3:2);pt.renderScale=isMobile?.65:.85;pt.minSamples=1;pt.fadeDuration=300;pt.renderDelay=250;pt.textureSize.set(512,512);needsBuild=true;
  }catch{fallbackPath();}finally{pathBusy=false;renderingPath=false;}
 }
 const resize=new ResizeObserver(()=>{if(disposed||contextLost)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);if(!manualCamera)frameModel();dirty=true;if(pt&&!pathFailed)try{pt.updateCamera();}catch{fallbackPath();}});resize.observe(host);
 function renderStudio(){if(contextLost||renderFailed)return;try{composer.render();dirty=false;}catch{rendererUnavailable();}}
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 function animate(){if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden||makingBook||contextLost||renderFailed)return;controls.autoRotate=settings.auto&&settings.mode!=='pathtrace'&&!reducedMotion.matches;controls.update();
  if(settings.mode==='pathtrace'&&pt&&!pathBusy){
   try{
    renderingPath=true;
    if(needsBuild&&performance.now()-lastChange>180){pt.setScene(scene,camera);needsBuild=false;}
    if(!needsBuild&&!pathFailed){const limit=isMobile?128:256;if(pt.samples<limit)pt.renderSample();const n=Math.floor(pt.samples);if(n!==prevSamples){prevSamples=n;if(pt.isCompiling)say('Préparation du ray tracing…','Preparing ray tracing…');else say(`Ray tracing · ${n} échantillon${n>1?'s':''}`,`Ray tracing · ${n} sample${n!==1?'s':''}`);}}
    else if(dirty)renderStudio();
   }catch{fallbackPath();}finally{renderingPath=false;}
   if(pathFailed&&dirty)renderStudio();
  }else if(dirty||controls.autoRotate)renderStudio();
 }
 controls.update();studioStatus();animate();
 function update(s:SceneSettings){if(disposed)return;const changedLight=s.night!==settings.night;const changedPose=['elevation','slew','hook','explode','step'].some(k=>s[k as keyof SceneSettings]!==settings[k as keyof SceneSettings]);const changedMode=s.mode!==settings.mode;settings={...s};if(changedLight){lighting();needsBuild=true;dirty=true;}if(changedPose){pose();if(!manualCamera)frameModel();}if(changedMode){if(settings.mode==='pathtrace'){enablePath();needsBuild=true;prevSamples=-1;}else{studioStatus();dirty=true;}}}
 function view(v:string){if(disposed)return;manualCamera=false;frameModel(v);dirty=true;}
 function capture(){if(disposed||contextLost||renderFailed){rendererUnavailable();return;}if(settings.mode!=='pathtrace')renderStudio();renderer.domElement.toBlob(b=>{if(b)saveBlob(b,'kirow-studio.png');});}
 async function booklet(){
  if(disposed||makingBook||contextLost||renderFailed)return;makingBook=true;const saved={...settings},pos=camera.position.clone(),target=controls.target.clone();const pages:string[]=[];
  try{
  say('Préparation du fascicule · 1 / 32','Preparing the booklet · 1 / 32');settings={...INITIAL,night:false,mode:'realtime',step:1};lighting();view('hero');
  for(const step of STEPS){if(disposed)return;settings.step=step.number;pose();composer.render();const thumb=document.createElement('canvas');thumb.width=1100;thumb.height=650;const ctx=thumb.getContext('2d')!;ctx.fillStyle='#e8e9e6';ctx.fillRect(0,0,1100,650);const c=renderer.domElement;const scale=Math.min(1100/c.width,650/c.height);ctx.drawImage(c,(1100-c.width*scale)/2,(650-c.height*scale)/2,c.width*scale,c.height*scale);const src=thumb.toDataURL('image/jpeg',.82);const rows=inventory(BRICKS.filter(b=>b.step===step.number));pages.push(`<section class="page"><header>KIROW / ATELIER EN BRIQUES <span>${step.number.toString().padStart(2,'0')} / 32</span></header><h2>${step.title}</h2><p>${step.description}</p><img src="${src}" alt="Assemblage à l’étape ${step.number}"/><table><tr><th>Référence</th><th>Pièce</th><th>Couleur</th><th>Qté</th></tr>${rows.map(r=>`<tr><td>${r.part.id}</td><td>${r.part.name}</td><td>${COLORS[r.color].name}</td><td>${r.count}</td></tr>`).join('')}</table><footer>Étude numérique · Interfaces mécaniques non validées physiquement</footer></section>`);say(`Préparation du fascicule · ${step.number} / 32`,`Preparing the booklet · ${step.number} / 32`);await new Promise(r=>setTimeout(r,0));}
  const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Kirow · Fascicule de construction</title><style>*{box-sizing:border-box}body{margin:0;background:#ddd;font:15px Arial;color:#252824}.page{max-width:1000px;min-height:1100px;background:#fff;padding:45px;margin:25px auto;break-after:page}header{font:13px monospace;border-bottom:2px solid #edc333;padding-bottom:16px}header span{float:right}h1{font-size:80px}h2{font-size:34px}p{line-height:1.6}img{width:100%;margin:14px 0}table{border-collapse:collapse;width:100%;font-size:13px}td,th{text-align:left;padding:7px;border-bottom:1px solid #ddd}footer{margin-top:20px;font-size:12px;color:#666}.print{display:block;margin:20px auto;padding:14px 25px;border:0;background:#edc333;cursor:pointer}@media print{@page{size:A4;margin:10mm}body{background:#fff}.page{margin:0;padding:10mm;min-height:0;max-width:none}.print{display:none}img{max-height:135mm;object-fit:contain}}</style><button class="print" onclick="window.print()">Imprimer / Enregistrer en PDF</button><section class="page"><header>CAHIER DE CONSTRUCTION · VERSION 01</header><h1>KIROW<br>en briques.</h1><h2>32 étapes · ${BRICKS.length} briques standard</h2><p>Interprétation de la grue SNCF de Dijon-Perrigny, inspirée de la famille KRC 1200.</p><p>${PHYSICAL_NOTE}</p><p>Les illustrations montrent l’assemblage cumulatif. Les coordonnées et l’orientation des briques sont exportables au format LDraw depuis l’atelier.</p><p>Échelle du module : tenon 8 mm, brique 9,6 mm, plaque 3,2 mm. Marquages personnalisés, non fournis par LEGO.</p><p>Sources : <a href="https://www.sncf-reseau.com/fr/cp/bourgogne-franche-comte/grue-kirow-unique-en-france-en-action-dijon">SNCF Réseau</a> · <a href="https://www.ldraw.org/article/218.html">LDraw</a> · <a href="https://www.bricklink.com/v2/catalog/catalogitem.page?P=3001">Catalogue BrickLink</a>.</p></section>${pages.join('')}<section class="page"><header>INVENTAIRE DES BRIQUES STANDARD</header><h2>${BRICKS.length} pièces</h2><table><tr><th>Référence</th><th>Pièce</th><th>Couleur</th><th>Qté</th></tr>${inventory().map(r=>`<tr><td>${r.part.id}</td><td>${r.part.name}</td><td>${COLORS[r.color].name}</td><td>${r.count}</td></tr>`).join('')}</table><p>${PHYSICAL_NOTE}</p></section></html>`;
  downloadText(html,'kirow-fascicule.html','text/html');say('Fascicule téléchargé · prêt à imprimer','Booklet downloaded · ready to print');
  }finally{makingBook=false;if(!disposed){settings=saved;lighting();pose();camera.position.copy(pos);controls.target.copy(target);controls.update();}}
 }
 function ldraw(){if(disposed)return;const saved={...settings};settings={...INITIAL,elevation:0,slew:0,hook:9,step:32};pose();scene.updateMatrixWorld(true);const lines=['0 Kirow SNCF - Etude de construction','0 Name: kirow.ldr','0 Author: Atelier Kirow','0 !LICENSE Redistributable under CC BY 4.0 : see CAreadme.txt','0 // Standard bricks only; mechanisms require physical design.'];
  const reflection=new T.Matrix4().makeScale(1,-1,1);
  for(const step of STEPS){for(const b of BRICKS.filter(p=>p.step===step.number)){const p=CATALOG[b.part];const local=new T.Matrix4().makeRotationY(b.ry);local.setPosition(b.x,b.y+p.h,b.z);const world=groups[b.group].matrixWorld.clone().multiply(local);const converted=reflection.clone().multiply(world).multiply(reflection);const m=converted.elements;const n=(v:number)=>Number(v.toFixed(4));lines.push(`1 ${COLORS[b.color].ldraw} ${n(m[12]*20)} ${n(m[13]*20)} ${n(m[14]*20)} ${[m[0],m[4],m[8],m[1],m[5],m[9],m[2],m[6],m[10]].map(n).join(' ')} ${p.id}.dat`);}lines.push('0 STEP');}
  downloadText(lines.join('\n'),'kirow-etude.ldr');settings=saved;pose();}
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(frame);resize.disconnect();renderer.domElement.removeEventListener('keydown',onZoomKey);controls.dispose();
  renderer.domElement.removeEventListener('webglcontextlost',onContextLost);renderer.domElement.removeEventListener('webglcontextrestored',onContextRestored);
  composer.dispose();ao.dispose();outputPass.dispose();try{pt?.dispose();}catch{/* Lost contexts already release GPU resources. */}
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>([environment,logoTexture]);
  scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const material of [o.material,o.userData.baseMaterial])if(material)(Array.isArray(material)?material:[material]).forEach(m=>materials.add(m));}});
  Object.values(mats).forEach(m=>materials.add(m));materials.add(ghost);
  for(const g of geometries)g.dispose();for(const g of cache.values())g.dispose();
  for(const m of materials){for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();
  renderer.dispose();renderer.domElement.remove();
 }
 return {update,view,capture,booklet,dispose,ldraw};
}
