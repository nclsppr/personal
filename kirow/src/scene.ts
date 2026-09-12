import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BRICKS,CATALOG,SPECIALS,ALL_CATALOG,COLORS,STEPS, type Brick } from './blueprint';
import officialGeometry from '../data/ldraw-geometry.json';
type OfficialPart={id:string;offset:number[];size:number[];groups:Record<string,number[]>};
const LDRAW_GEOMETRY=officialGeometry as Record<string,OfficialPart>;

export type SceneSettings={elevation:number;slew:number;hook:number;explode:number;night:boolean;auto:boolean;step:number};
export const INITIAL:SceneSettings={elevation:24,slew:0,hook:9,explode:0,night:false,auto:false,step:32};
export type SceneAPI={update:(s:SceneSettings)=>void;view:(v:string)=>void;capture:()=>void;snapshot:()=>string;dispose:()=>void;ldraw:()=>void;ldrawText:()=>string};
function saveBlob(blob:Blob,name:string){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
export function downloadText(text:string,name:string,type='text/plain'){saveBlob(new Blob([text],{type}),name);}

export function createScene(host:HTMLElement,onStatus:(s:string)=>void):SceneAPI{
 const english=document.documentElement.lang.startsWith('en');
 const say=(fr:string,en:string)=>{if(!disposed)onStatus(english?en:fr);};
 const studioStatus=()=>say('Vue extérieure · rendu temps réel','Outdoor view · real-time rendering');
 let disposed=false,contextLost=false,renderFailed=false,settings={...INITIAL},frame=0,dirty=true;
 let lastView='hero',manualCamera=false;
 const scene=new T.Scene();scene.background=new T.Color('#c7dfeb');
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
 const camera=new T.PerspectiveCamera(34,initialWidth/initialHeight,.1,4000);camera.position.set(78,54,86);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(1,10,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=18;controls.maxDistance=190;controls.maxPolarAngle=Math.PI*.48;controls.autoRotateSpeed=.5;
 controls.listenToKeyEvents(renderer.domElement);
 const onZoomKey=(event:KeyboardEvent)=>{if(!['+','=','-','_'].includes(event.key))return;event.preventDefault();manualCamera=true;const offset=camera.position.clone().sub(controls.target);const distance=T.MathUtils.clamp(offset.length()*(['+','='].includes(event.key)?.9:1.1),controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();dirty=true;};
 renderer.domElement.addEventListener('keydown',onZoomKey);
 controls.addEventListener('start',()=>{manualCamera=true;});
 controls.addEventListener('change',()=>{dirty=true;});
 function rendererUnavailable(){
  if(renderFailed||disposed)return;renderFailed=true;
  say('Le rendu 3D est indisponible · aperçu du modèle affiché','3D rendering is unavailable · model preview displayed');
  host.dispatchEvent(new CustomEvent('kirow-renderer-unavailable'));
 }
 const onContextLost=(event:Event)=>{event.preventDefault();contextLost=true;rendererUnavailable();};
 const onContextRestored=()=>{
  if(disposed)return;contextLost=false;renderFailed=false;dirty=true;studioStatus();host.dispatchEvent(new CustomEvent('kirow-renderer-restored'));
 };
 renderer.domElement.addEventListener('webglcontextlost',onContextLost);
 renderer.domElement.addEventListener('webglcontextrestored',onContextRestored);
 renderer.debug.onShaderError=rendererUnavailable;
 // The sky is scenery, not a building part. The panorama also supplies the model reflections.
 function sky(evening:boolean){
  const w=768,h=384,pixels=new Float32Array(w*h*4);
  const zenith=new T.Color(evening?'#416a91':'#6bb0dc'),horizon=new T.Color(evening?'#d4bfba':'#b8d9e9');
  const cloudColor=new T.Color(evening?'#efd9bd':'#ffffff');
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const u=x/w,v=1-y/h,altitude=Math.cos(v*Math.PI),color=altitude>=0?horizon.clone().lerp(zenith,Math.pow(altitude,.42)):horizon.clone();
   let cloud=0;
   for(const [cx,cy,sx,sy] of [[.1,.35,.09,.025],[.32,.41,.11,.018],[.63,.32,.12,.028],[.86,.4,.1,.019]]){
    const dx=Math.min(Math.abs(u-cx),1-Math.abs(u-cx));
    const wisps=.67+.33*Math.sin(u*103+Math.sin(v*157)*1.8);
    cloud+=Math.exp(-((dx/sx)**2+((v-cy)/sy)**2)*2)*wisps;
   }
   color.lerp(cloudColor,Math.min(.72,cloud*.65));
   const i=(y*w+x)*4;pixels[i]=color.r;pixels[i+1]=color.g;pixels[i+2]=color.b;pixels[i+3]=1;
  }
  const texture=new T.DataTexture(pixels,w,h,T.RGBAFormat,T.FloatType);texture.mapping=T.EquirectangularReflectionMapping;texture.needsUpdate=true;return texture;
 }
 const daySky=sky(false),eveningSky=sky(true);scene.environment=daySky;scene.background=daySky;
 const key=new T.DirectionalLight('#fff4dc',3.8);key.position.set(-25,70,35);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-65;key.shadow.camera.right=65;key.shadow.camera.top=65;key.shadow.camera.bottom=-65;key.shadow.camera.far=190;key.shadow.normalBias=.05;key.shadow.bias=-.00012;scene.add(key);
 const fill=new T.DirectionalLight('#d7e6ff',1.35);fill.position.set(35,35,-45);scene.add(fill);
 const rim=new T.DirectionalLight('#e0ecff',2.1);rim.position.set(-35,18,-40);scene.add(rim);
 const ambient=new T.HemisphereLight('#ffffff','#4b4940',.6);scene.add(ambient);
 function surfaceTexture(grass:boolean){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=grass?'#71835a':'#777970';ctx.fillRect(0,0,256,256);let seed=grass?173:811;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<15000;i++){const shade=Math.floor(65+random()*65);ctx.fillStyle=grass?`rgba(${shade},${shade+18},${shade-24},.32)`:`rgba(${shade+16},${shade+16},${shade+10},.65)`;const x=random()*256,y=random()*256;ctx.fillRect(x,y,grass?.6:1+random()*2,grass?1+random()*3:1+random()*2);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(grass?180:10,grass?180:2);texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return texture;
 }
 const grassTexture=surfaceTexture(true),ballastTexture=surfaceTexture(false);
 const groundMat=new T.MeshPhysicalMaterial({color:'#e2e7d7',map:grassTexture,roughness:1,metalness:0});
 const floor=new T.Mesh(new T.PlaneGeometry(3000,3000),groundMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.44;floor.receiveShadow=true;scene.add(floor);
 const ballastMat=new T.MeshPhysicalMaterial({color:'#c6c5b7',map:ballastTexture,roughness:1});
 const ballast=new T.Mesh(new RoundedBoxGeometry(83,.5,10.2,1,.2),ballastMat);ballast.position.y=-.2;ballast.receiveShadow=true;ballast.castShadow=true;scene.add(ballast);
 const mats:Record<string,T.MeshPhysicalMaterial>={};for(const [name,c] of Object.entries(COLORS))mats[name]=new T.MeshPhysicalMaterial({color:c.hex,roughness:name==='black'?.28:.235,metalness:0,clearcoat:.42,clearcoatRoughness:.19,ior:1.46,envMapIntensity:1});
 mats.glass.transparent=true;mats.glass.opacity=.35;mats.glass.roughness=.12;mats.glass.depthWrite=false;
 mats.metal.metalness=.9;mats.metal.roughness=.2;mats.amber.transparent=true;mats.amber.opacity=.75;
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
  if(p.kind==='round'&&p.ldrawId&&LDRAW_GEOMETRY[p.ldrawId]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(LDRAW_GEOMETRY[p.ldrawId].groups['16'],3));g.computeVertexNormals();cache.set(part,g);return g;}
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
 // Mechanical parts use the official LDraw shapes at 20 LDU per stud.
 // Their source identifiers, authors and CC BY 4.0 license are shipped locally.
 const officialCache=new Map<string,T.BufferGeometry>();
 const fixedMaterials:Record<string,T.Material>={'0':mats.black,'14':mats.yellow,'71':mats.gray,'72':mats.dark,'383':mats.metal,'494':mats.metal,'25':new T.MeshPhysicalMaterial({color:'#f58624',roughness:.3})};
 const specialObjects=new Map<Brick,T.Group>();
 let actuator:T.Group|null=null;
 const actuatorGeometries:{geometry:T.BufferGeometry;closed:number[];open:number[]}[]=[];
 for(const b of SPECIALS){
  if(b.part==='cord50')continue;
  const p=ALL_CATALOG[b.part],id=b.part==='actuator61927'?'61927-f1':p.ldrawId;
  if(!id||!LDRAW_GEOMETRY[id])throw new Error(`Official geometry missing for ${p.id}`);
  const source=LDRAW_GEOMETRY[id],object=new T.Group();object.position.set(b.x,b.y,b.z);object.rotation.set(b.rx||0,b.ry,b.rz||0);object.userData.part=b.part;object.userData.ldrawId=id;object.userData.step=b.step;groups[b.group].add(object);specialObjects.set(b,object);
  for(const [color,vertices] of Object.entries(source.groups)){
   const cacheKey=id+':'+color;let geometry=officialCache.get(cacheKey);
   if(!geometry){geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();officialCache.set(cacheKey,geometry);}
   if(b.part==='actuator61927'){
    geometry=geometry.clone();const extended=LDRAW_GEOMETRY['61927-f2'];const open=extended.groups[color].map((v,i)=>v+extended.offset[i%3]-source.offset[i%3]);actuatorGeometries.push({geometry,closed:vertices,open});actuator=object;
   }
   const mesh=new T.Mesh(geometry,color==='16'?mats[b.color]:(fixedMaterials[color]||mats[b.color]));mesh.castShadow=b.color!=='glass';mesh.receiveShadow=true;mesh.userData.step=b.step;mesh.userData.part=b.part;object.add(mesh);detailMeshes.push(mesh);
  }
 }
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
  dirty=true;
 },undefined,()=>{/* The custom printed fallback remains visible if the local asset fails. */});
 label(groups.counter,'150 t','#f4c428','#242824',4,1.1,[-21.025,3.8,0],[0,-Math.PI/2,0],17);
 // A single catalogued 50 cm cord is shown as two reeved strands.
 const cables=[-1,1].map(()=>bar(groups.turret,new T.Vector3(),new T.Vector3(0,1,0),.04,mats.black,30));
 function setRod(m:T.Mesh,a:T.Vector3,b:T.Vector3){const d=b.clone().sub(a);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=d.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const composerTarget=new T.WebGLRenderTarget(initialWidth,initialHeight,{type:T.HalfFloatType,samples:isMobile?2:4});
 const composer=new EffectComposer(renderer,composerTarget);const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
 const ao=new SSAOPass(scene,camera,initialWidth,initialHeight);ao.kernelRadius=1.25;ao.minDistance=.002;ao.maxDistance=.095;composer.addPass(ao);const outputPass=new OutputPass();composer.addPass(outputPass);
 // Parts stay as regular meshes for consistent shadows and assembly-step highlighting.
 const ghost=new T.MeshPhysicalMaterial({color:'#bbc5b1',roughness:.4,metalness:0});
 for(const m of [...brickMeshes,...detailMeshes])m.userData.baseMaterial=m.material;
 const allMeshes=[...brickMeshes,...detailMeshes];
 const viewDirections:Record<string,T.Vector3>={hero:new T.Vector3(77,17,86),side:new T.Vector3(6,19,112),front:new T.Vector3(110,26,18),top:new T.Vector3(10,105,.2),detail:new T.Vector3(24,11,27)};
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
  groups.turret.position.set(-4,11.8375+e*9,0);groups.turret.rotation.y=T.MathUtils.degToRad(settings.slew);
  groups.counter.position.set(-1-e*9,e*5,0);groups.cab.position.set(0,e*8,1+e*8);
  groups.boom.position.set(0,5.5+e*12,0);groups.boom.rotation.z=a;groups.jib.position.set(e*9,e*3,0);
  groups.rearBogie.position.y=-e*.7;groups.frontBogie.position.y=-e*.7;
  for(const x of [-15,15])for(const z of [-1,1])groups[`leg${x}${z}`].position.set(x,6.0375,z*(2+e*6));
  const tip=new T.Vector3(42+e*9,1,0).applyAxisAngle(new T.Vector3(0,0,1),a).add(groups.boom.position);
  groups.hook.position.copy(tip).add(new T.Vector3(0,-settings.hook-3.8,0));
  cables.forEach((m,i)=>{const z=i===0?-.6:.6;setRod(m,tip.clone().add(new T.Vector3(0,0,z)),groups.hook.position.clone().add(new T.Vector3(0,3.5,z)));});
  if(actuator){
   const end=new T.Vector3(11,0,0).applyAxisAngle(new T.Vector3(0,0,1),a).add(groups.boom.position),base=new T.Vector3(3,3,0),direction=end.clone().sub(base);
   const extension=T.MathUtils.clamp((direction.length()-8.5)/5,0,1),offset=new T.Vector3(...LDRAW_GEOMETRY['61927-f1'].offset as [number,number,number]);
   actuator.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction.normalize());actuator.position.copy(base).add(offset.applyQuaternion(actuator.quaternion));actuator.userData.extension=extension;
   for(const {geometry,closed,open} of actuatorGeometries){const positions=geometry.attributes.position as T.BufferAttribute;for(let i=0;i<closed.length;i++)positions.array[i]=closed[i]+(open[i]-closed[i])*extension;positions.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();}
  }
  for(const mesh of [...brickMeshes,...detailMeshes]){mesh.visible=mesh.userData.step<=settings.step;mesh.material=settings.step<32&&mesh.userData.step<settings.step?ghost:mesh.userData.baseMaterial;}
  floor.visible=true;scene.updateMatrixWorld(true);dirty=true;
 }
 pose();
 function lighting(){
  scene.background=scene.environment=settings.night?eveningSky:daySky;scene.backgroundIntensity=1;scene.fog=new T.Fog(settings.night?'#d4bfba':'#b8d9e9',220,900);
  groundMat.color.set(settings.night?'#bbc4aa':'#e2e7d7');scene.environmentIntensity=settings.night?.72:.9;
  key.intensity=settings.night?2.8:3.2;key.color.set(settings.night?'#ffcca0':'#fff4df');key.position.set(-25,settings.night?32:70,35);
  fill.intensity=settings.night?.65:.9;rim.intensity=settings.night?.7:1.0;ambient.intensity=settings.night?.34:.65;ambient.color.set(settings.night?'#abc6e2':'#dceeff');ambient.groundColor.set('#657247');renderer.toneMappingExposure=settings.night?1.02:1.06;
 }
 lighting();frameModel();
 const resize=new ResizeObserver(()=>{if(disposed||contextLost)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);if(!manualCamera)frameModel();dirty=true;});resize.observe(host);
 function renderStudio(){if(contextLost||renderFailed)return;try{composer.render();dirty=false;}catch{rendererUnavailable();}}
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 function animate(){if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden||contextLost||renderFailed)return;controls.autoRotate=settings.auto&&!reducedMotion.matches;controls.update();if(dirty||controls.autoRotate)renderStudio();}
 controls.update();studioStatus();animate();
 function update(s:SceneSettings){if(disposed)return;const changedLight=s.night!==settings.night;const changedPose=['elevation','slew','hook','explode','step'].some(k=>s[k as keyof SceneSettings]!==settings[k as keyof SceneSettings]);settings={...s};if(changedLight){lighting();dirty=true;}if(changedPose){pose();if(!manualCamera)frameModel();}}
 function view(v:string){if(disposed)return;manualCamera=false;frameModel(v);dirty=true;}
 function capture(){if(disposed||contextLost||renderFailed){rendererUnavailable();return;}renderStudio();renderer.domElement.toBlob(b=>{if(b)saveBlob(b,'kirow-studio.png');});}
 function snapshot(){if(disposed||contextLost||renderFailed)throw new Error('3D renderer unavailable');renderStudio();return renderer.domElement.toDataURL('image/jpeg',.9);}
 function ldrawText(){
  if(disposed)return '';const saved={...settings};settings={...INITIAL,step:32};pose();scene.updateMatrixWorld(true);
  const lines=['0 FILE kirow.ldr','0 Kirow SNCF - Referenced construction study','0 Name: kirow.ldr','0 Author: Atelier Kirow','0 !LICENSE Redistributable under CC BY 4.0 : see CAreadme.txt','0 // Referenced LEGO parts. Mechanical connections remain unvalidated.'];
  const reflection=new T.Matrix4().makeScale(1,-1,1),n=(v:number)=>Number(v.toFixed(5));
  const append=(world:T.Matrix4,color:number,file:string)=>{const m=reflection.clone().multiply(world).multiply(reflection).elements;lines.push(`1 ${color} ${n(m[12]*20)} ${n(m[13]*20)} ${n(m[14]*20)} ${[m[0],m[4],m[8],m[1],m[5],m[9],m[2],m[6],m[10]].map(n).join(' ')} ${file}`);};
  try{
   for(const step of STEPS){
    for(const b of BRICKS.filter(p=>p.step===step.number)){
     const p=CATALOG[b.part],local=new T.Matrix4().makeRotationY(b.ry);local.setPosition(b.x,b.y+p.h,b.z);append(groups[b.group].matrixWorld.clone().multiply(local),COLORS[b.color].ldraw,`${p.ldrawId||p.id}.dat`);
    }
    for(const b of SPECIALS.filter(p=>p.step===step.number)){
     const p=ALL_CATALOG[b.part],object=specialObjects.get(b);lines.push(`0 // Catalogue reference: ${p.id}`);
     if(!object){lines.push(`0 // ${p.id}: 1 real flexible cord, 50 cm. Its routed curve is not a rigid LDraw part.`);continue;}
     const id=object.userData.ldrawId as string,offset=LDRAW_GEOMETRY[id].offset;
     append(object.matrixWorld.clone().multiply(new T.Matrix4().makeTranslation(-offset[0],-offset[1],-offset[2])),COLORS[b.color].ldraw,b.part==='actuator61927'?'kirow-actuator.ldr':`${id}.dat`);
    }
    lines.push('0 STEP');
   }
   if(actuator){
    lines.push('0 FILE kirow-actuator.ldr','0 Technic actuator assembly 61927c01 at the displayed extension','0 // Derived from official LDraw 61927-f1 and 61927-f2; CC BY 4.0.','0 // This submodel positions real actuator components; it is not a new LEGO part.','1 25 0 0 0 0 1 0 -1 0 0 0 0 1 47157.dat','1 16 0 0 0 1 0 0 0 1 0 0 0 1 62271c01.dat',`1 72 0 0 ${n(170+actuator.userData.extension*100)} 1 0 0 0 1 0 0 0 1 62274c01.dat`);
   }
   return lines.join('\n');
  }finally{settings=saved;pose();}
 }
 function ldraw(){if(disposed)return;downloadText(ldrawText(),'kirow-etude.ldr');}
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(frame);resize.disconnect();renderer.domElement.removeEventListener('keydown',onZoomKey);controls.dispose();
  renderer.domElement.removeEventListener('webglcontextlost',onContextLost);renderer.domElement.removeEventListener('webglcontextrestored',onContextRestored);
  composer.dispose();ao.dispose();outputPass.dispose();
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>([daySky,eveningSky,logoTexture]);
  scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const material of [o.material,o.userData.baseMaterial])if(material)(Array.isArray(material)?material:[material]).forEach(m=>materials.add(m));}});
  Object.values(mats).forEach(m=>materials.add(m));Object.values(fixedMaterials).forEach(m=>materials.add(m));materials.add(ghost);
  for(const g of geometries)g.dispose();for(const g of cache.values())g.dispose();for(const g of officialCache.values())if(!geometries.has(g))g.dispose();
  for(const m of materials){for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();
  renderer.dispose();renderer.domElement.remove();
 }
 return {update,view,capture,snapshot,dispose,ldraw,ldrawText};
}
