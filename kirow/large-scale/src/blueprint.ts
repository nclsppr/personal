import {createTransport} from './transport';
import { ALL_CATALOG as MINI_CATALOG, COLORS as MINI_COLORS, PARTS_EVIDENCE as MINI_EVIDENCE } from '../../src/blueprint';
import { NEW_CATALOG, NEW_COLORS, NEW_PARTS_EVIDENCE } from '../catalog';
export const ALL_CATALOG: Record<string,any> = {...MINI_CATALOG,...NEW_CATALOG};
export const COLORS: Record<string,any> = {...MINI_COLORS,...NEW_COLORS};
export const PARTS_EVIDENCE = {...MINI_EVIDENCE,variants:[...MINI_EVIDENCE.variants,...NEW_PARTS_EVIDENCE.variants],exceptions:(NEW_PARTS_EVIDENCE as any).exceptions||[]};
export type Piece={id:number;part:string;color:string;position:[number,number,number];rotation?:[number,number,number];group:string;step:number;ldrawOrigin?:boolean};
export type AssemblyGroup={id:string;parent?:string;position:[number,number,number];rotation?:[number,number,number];motion?:'slew'|'boom'|'extension'|'outrigger'|'hook';axis?:[number,number,number];travel?:number;side?:number;transportOnly?:boolean;transportPosition?:[number,number,number];transportAfterStep?:number};
export const GROUPS: AssemblyGroup[]=[
 {id:'root',position:[0,0,0]},
 {id:'turret',parent:'root',position:[-6,11.2,0],motion:'slew'},
 {id:'boom',parent:'turret',position:[4,11.4,0],motion:'boom'},
 {id:'mid',parent:'boom',position:[7,1.2,0],motion:'extension',axis:[1,0,0],travel:24},
 {id:'inner',parent:'mid',position:[7,.8,0],motion:'extension',axis:[1,0,0],travel:24},
 {id:'hook',parent:'inner',position:[44,0,0],motion:'hook'},
];
export const PIECES: Piece[]=[];
export const STEPS: {number:number;title:string;titleEn:string;description:string;descriptionEn:string}[]=[];
let stageNumber=0;
function stage(title:string,titleEn:string,description='Les positions sont celles de la maquette numérique. Les liaisons restent à éprouver sur prototype.',descriptionEn='Positions belong to the digital model. Connections still require a physical prototype.') {stageNumber++;STEPS.push({number:stageNumber,title,titleEn,description,descriptionEn});}
function put(part:string,color:string,x:number,y:number,z:number,group='root',rotation?:[number,number,number],ldrawOrigin=false) {
 if(!ALL_CATALOG[part])throw Error('Missing catalogue part '+part);
 PIECES.push({id:PIECES.length+1,part,color,position:[x,y,z].map(n=>Math.round(n*100000)/100000) as [number,number,number],group,step:stageNumber,...(rotation?{rotation}:{}),...(ldrawOrigin?{ldrawOrigin}:{} )});
}
// All coordinates use the real LEGO grid: 8 mm per stud, 1.2 studs per brick.
// A regular panel is tiled with actual parts. No part is enlarged to fill an opening.
function panel(part:string,color:string,x0:number,x1:number,z0:number,z1:number,y:number,group='root') {
 const p=ALL_CATALOG[part];
 for(let x=x0+p.l/2;x+p.l/2<=x1+1e-5;x+=p.l)for(let z=z0+p.w/2;z<z1-1e-5;z+=p.w)put(part,color,x,y,z,group);
}
function wallX(color:string,x0:number,x1:number,z:number,y:number,group:string,offset=false) {
 if(offset){put('b11',color,x0+.5,y,z,group);for(let x=x0+2;x<x1-1;x+=2)put('b12',color,x,y,z,group);put('b11',color,x1-.5,y,z,group);}
 else for(let x=x0+1;x<x1;x+=2)put('b12',color,x,y,z,group);
}
function yellowBox(x0:number,x1:number,z0:number,z1:number,y:number,layers:number,group:string,roof=true) {
 for(let row=0;row<layers;row++) {
  wallX('yellow',x0,x1,z0+.5,y+row*1.2,group,row%2===1);
  wallX('yellow',x0,x1,z1-.5,y+row*1.2,group,row%2===1);
  for(const x of [x0+.5,x1-.5])for(let z=z0+1.5;z<z1-1;z++)put('b11','yellow',x,y+row*1.2,z,group);
 }
 if(roof)panel('p24','yellow',x0,x1,z0,z1,y+layers*1.2,group);
}
// Display track: a brick-built base at the wider approximate scale, not stretched LEGO track.
stage('Traverses de la voie','Track sleepers','Disposez les traverses noires sur 112 tenons. Cette voie de présentation est construite en plaques.','Arrange black sleepers across 112 studs. This display track is built from plates.');
for(let x=-54;x<=54;x+=4)for(const z of [-4,0,4])put('p24','black',x,0,z,'root',[0,Math.PI/2,0]);
stage('Assises des rails','Rail beds');
for(const z of [-4.5,4.5])for(let x=-54;x<=54;x+=4)put('p14','black',x,.4,z);
stage('Surfaces de roulement','Rail surfaces');
for(const z of [-4.5,4.5])for(let x=-54;x<=54;x+=4)put('t14','dark',x,.8,z);
stage('Fixations de voie','Track fastenings');
for(let x=-54;x<=54;x+=4)for(const z of [-5.5,5.5])put('clip11','black',x,.4,z);
const AXLES=[-39,-32,-25,-18,18,25,32,39];
for(const [label,xs] of [['avant',AXLES.slice(4)],['arrière',AXLES.slice(0,4)]] as const){
 stage('Essieux '+label,label==='avant'?'Front axles':'Rear axles','Quatre essieux par bogie. Les roues 56908 et les flasques 11213 sont des pièces référencées, dont l’association reste expérimentale.','Four axles per bogie. Wheels 56908 and flanges 11213 are referenced parts; their combination remains experimental.');
 for(const x of xs){put('axle16','black',x,3.9,0,'root',[0,Math.PI/2,0],true);for(const z of [-5.3,5.3])put('wheel56908','black',x,1.2,z);}
 stage('Flasques '+label,label==='avant'?'Front wheel flanges':'Rear wheel flanges');
 for(const x of xs)for(const side of [-1,1])put('roundPlate11213','black',x,3.9,side*3.45-.3,'root',[Math.PI/2,0,0]);
 stage('Boîtes d’essieux '+label,label==='avant'?'Front axle boxes':'Rear axle boxes');
 for(const x of xs)for(const z of [-7.6,7.6]){put('p44','dark',x,3.4,z);put('b22','dark',x,3.8,z);put('p44','dark',x,5,z);put('round22','black',x,4.7,z,'root',[Math.PI/2,0,0]);}
 stage('Longerons du bogie '+label,label==='avant'?'Front bogie frame':'Rear bogie frame');
 const center=label==='avant'?28.5:-28.5;
 for(const z of [-7.5,7.5])for(let x=center-12;x<=center+12;x+=4)for(let row=0;row<2;row++)put('b14','dark',x,5.4+row*1.2,z);
 for(const x of xs)for(const z of [-4,0,4])put('p44','black',x,6.6,z);
 stage('Suspensions '+label,label==='avant'?'Front suspension':'Rear suspension');
 for(const x of xs)for(const side of [-1,1])for(const d of [-1.4,1.4]){put('round22','black',x+d,4.7,side*7.5);put('grille2412b','black',x+d,7.1,side*7.5);}
 stage('Traverses du bogie '+label,label==='avant'?'Front bogie cross-members':'Rear bogie cross-members');
 for(const x of [center-7,center,center+7])for(const z of [-4,0,4])put('b24','black',x,6.8,z,'root',[0,Math.PI/2,0]);
}
stage('Plancher inférieur du châssis','Lower chassis floor');panel('p24','black',-44,44,-8,8,8);
stage('Renforts transversaux','Transverse reinforcement');
for(let x=-42;x<44;x+=4)for(const z of [-6,-2,2,6])put('b24','black',x,8.4,z,'root',[0,Math.PI/2,0]);
stage('Longerons principaux','Main longitudinal beams');
for(let x=-42;x<44;x+=4)for(const z of [-8.5,8.5])put('b14','dark',x,8.4,z);
stage('Plancher croisé','Cross-bonded floor');panel('p24','dark',-44,44,-8,8,9.6);
stage('Passerelles du châssis','Chassis walkways');panel('p24','black',-44,44,-8,8,10);
stage('Rives des passerelles','Walkway edges');
for(let x=-42;x<44;x+=4)for(const z of [-8.5,8.5]){put('p14','black',x,9.6,z);put('t14','dark',x,10,z);}
stage('Coffres et équipements sous le châssis','Underframe equipment boxes');
for(const x of [-10,2,10])for(const z of [-7,7]){panel('p24','black',x-4,x+4,z-2,z+2,5.6);for(let y=6;y<8;y+=1.2)panel('b24','dark',x-4,x+4,z-2,z+2,y);}
stage('Faces des coffres','Equipment box faces');
for(const x of [-12,-8,0,4,8,12])for(const z of [-9.05,9.05]){put('grille2412b','black',x,6.7,z,'root',[Math.PI/2,0,0]);put('bar4','black',x,7.3,z,'root',[0,0,Math.PI/2]);}
stage('Traverses de tête','End beams');
for(const x of [-43,43])for(let z=-7;z<=7;z+=2){put('b22','yellow',x,7.2,z);put('p24','yellow',x,8.4,z);}
stage('Tampons et attelages','Buffers and couplers');
for(const side of [-1,1]){for(const z of [-5,5]){put('round22','black',side*45,7.8,z,'root',[0,0,side*Math.PI/2]);put('roundPlate11213','black',side*46.3,8.1,z,'root',[0,0,side*Math.PI/2]);}put('coupler2920','black',side*45,6.6,0,'root',[0,side*Math.PI/2,0]);put('magnet73092','black',side*47,6.6,0,'root',[0,side*Math.PI/2,0]);}
for(const x of [-34,34])for(const side of [-1,1]){
 const id=`leg-${x}-${side}`;GROUPS.push({id,parent:'root',position:[x,0,side*8],motion:'outrigger',axis:[0,0,side],travel:8});
 stage(`Stabilisateur ${x<0?'arrière':'avant'} ${side<0?'gauche':'droit'}`,`${x<0?'Rear':'Front'} ${side<0?'left':'right'} stabilizer`,'Le bras, la jambe et le patin restent assemblés pendant le mouvement numérique. La stabilité et le verrouillage doivent être testés.','Arm, leg and pad stay together during digital motion. Stability and locking must be tested.');
 for(const y of [6.8,7.2])for(const z of [-3,-1,1,3])put('p24','yellow',0,y,z,id);
 for(const z of [-3,-1,1,3])put('p24','yellow',0,7.6,z,id);
 const foot=id+'-foot';GROUPS.push({id:foot,parent:id,position:[0,0,0],transportPosition:[0,4.8,0]});
 for(let y=1.2;y<6.8;y+=1.2)put('round22',y>4?'black':'dark',0,y,side*3,foot);
 for(const y of [.0,.4,.8])put('p44',y===.8?'yellow':'black',0,y,side*3,foot);
 put('t14','black',0,8,side*3,id);put('lamp4073','white',0,8.4,side*3,id);
 // Fixed sleeve overlaps the sliding arm even at full extension.
 for(const z of [side*8,side*12]){for(const dx of [-2,0,2]){put('p24','black',x+dx,6.4,z,'root',[0,Math.PI/2,0]);if(Math.abs(z)>10)put('p24','yellow',x+dx,8,z,'root',[0,Math.PI/2,0]);}for(const dx of [-2.5,2.5])put('b14','yellow',x+dx,6.8,z,'root',[0,Math.PI/2,0]);}
}
stage('Couronne de rotation','Slewing ring');
for(const x of [-10,-6,-2])for(const z of [-4,0,4]){put('p44','dark',x,10.4,z);put('p44','black',x,10.8,z);}
put('turnBase18939','gray',-6,10.4,0);put('turnTop18938','black',-6,11.2,0);
stage('Plateforme tournante','Rotating platform');panel('p24','yellow',-30,38,-8,8,0,'turret');
stage('Liaisons de la plateforme','Platform bracing');panel('p24','yellow',-30,38,-8,8,.4,'turret');
for(const band of [0,1,2,3]){
 stage(`Capot moteur : niveau ${band+1}`,`Engine housing: level ${band+1}`);
 yellowBox(-30,14,-7,7,.8+band*2.4,2,'turret',false);
}
stage('Compartiments techniques','Equipment compartments');
for(const x of [-22,-10,2,10])for(const z of [-4,0,4])for(let y=.8;y<8;y+=1.2)put('b24','dark',x,y,z,'turret');
stage('Toit du capot moteur','Engine housing roof');panel('p24','yellow',-30,14,-7,7,10.4,'turret');
stage('Tuiles et grilles de ventilation','Roof tiles and ventilation grilles');
for(let x=-29;x<14;x+=2)for(const z of [-6,-4,4,6])if(x<2||Math.abs(z)>5)put('t12','yellow',x,10.8,z,'turret');
for(let x=-28;x<14;x+=4)for(const z of [-2,0,2])if(x<2)put('grille2412b','black',x,10.8,z,'turret');
stage('Portes et poignées','Service doors and handles');
// Flush cladding follows the broad access doors in the supplied photographs.
for(let x=-28;x<14;x+=8)for(const side of [-1,1]){for(let y=2;y<9;y+=2)put('t14','yellow',x,y,side*7.03,'turret',[Math.PI/2,0,0]);put('bar4','black',x+2.5,3,side*7.1,'turret');}
const cabFirst=PIECES.length;
stage('Socle de la cabine latérale','Lateral cab base');
panel('p24','yellow',14,34,6,12,.8,'turret');yellowBox(14,34,6,12,1.2,2,'turret',false);
stage('Tableau de bord et sièges','Cab dashboard and seats');
for(const x of [19,25])put('seat4079','black',x,1.2,8,'turret',[0,Math.PI/2,0]);
for(const x of [29,31]){put('leverBase4592','black',x,3.6,8,'turret');put('lever4593','black',x,3.8,8,'turret');}
stage('Trois grands panneaux de cabine','Three large cab window panels','Les tuiles noires représentent les vitrages sombres. Ces panneaux sont opaques ; les fixations latérales sont à éprouver.','Black tiles represent the dark windows. These panels are opaque; their side connections remain to be tested.');
for(const cx of [18,23,28])for(const dx of [-1,1])for(let row=0;row<6;row++)put('t12','black',cx+dx,4.1+row,11.6,'turret',[Math.PI/2,0,0]);
stage('Montants fins de cabine','Slender cab pillars');
for(const x of [14.5,15.5,20.5,25.5,30.5,31.5])for(const z of [6.5,11.5])for(let row=0;row<5;row++)put('b11','yellow',x,3.6+row*1.2,z,'turret');
stage('Pare-brise avant incliné','Sloped front windscreen');
GROUPS.push({id:'cab-front',parent:'turret',position:[33,3.6,9],rotation:[0,0,.18]});
for(const z of [-2.5,2.5])for(let row=0;row<5;row++)put('b11','yellow',0,row*1.2,z,'cab-front');
for(const z of [-1.5,-.5,.5,1.5])for(const y of [1,3,5])put('t12','black',0,y,z,'cab-front',[0,0,-Math.PI/2]);
stage('Toit de cabine','Cab roof');panel('p24','yellow',14,34,6,12,9.6,'turret');
for(let x=15;x<34;x+=2)for(let z=6.5;z<12;z++)put('t12','yellow',x,10,z,'turret');
for(const p of PIECES.slice(cabFirst))if(p.group==='turret')p.position[2]+=1;
GROUPS.find(g=>g.id==='cab-front')!.position[2]+=1;
stage('Support du contrepoids','Counterweight carrier');
for(const z of [-4,4])for(let y=1.2;y<5;y+=1.2)for(const x of [-36,-32])put('b24','black',x,y,z,'turret');
GROUPS.push({id:'counterweight',parent:'turret',position:[0,0,0],transportPosition:[-32,-2.4,0]});
const weightFirst=PIECES.length;
stage('Contrepoids à caissons','Layered counterweight');
for(let row=0;row<8;row++)for(const z of [-6,-2,2,6])for(const x of [-36,-32])put('b24',row%3===0?'black':'yellow',x,.8+row*1.2,z,'turret');
for(const z of [-6,-2,2,6])for(const x of [-36,-32])put('p44','yellow',x,10.4,z,'turret');
for(const p of PIECES.slice(weightFirst))p.group='counterweight';
stage('Joues du pivot de flèche','Boom pivot cheeks');
for(const z of [-5.5,5.5])for(let row=0;row<9;row++)for(const x of [4])put('pivotBrick3701','yellow',x,1.2+row*1.2,z,'turret');
put('axle16','black',4,11.4,0,'turret',[0,Math.PI/2,0],true);
for(const z of [-7,7])put('bush3713','gray',4,11.4,z,'turret',undefined,true);
// Three hollow, nested box sections. Their fixed stud dimensions leave a clear sliding cavity.
function boomSection(group:string,length:number,width:number,height:number,rows:number,name:string,nameEn:string) {
 stage(name+' : semelle inférieure',nameEn+': lower skin');
 panel('p24','yellow',0,length,-width/2,width/2,-.4,group);
 for(let band=0;band<Math.ceil(rows/2);band++){
  stage(name+` : flancs ${band+1}`,nameEn+`: side walls ${band+1}`);
  for(let row=0;row<Math.min(2,rows-band*2);row++)for(const z of [-width/2+.5,width/2-.5])wallX('yellow',0,length,z,(band*2+row)*1.2,group,row%2===1);
 }
 stage(name+' : fermeture supérieure',nameEn+': upper skin');panel('p24','yellow',0,length,-width/2,width/2,height,group);
 stage(name+' : surfaces lisses',nameEn+': smooth surfaces');
 for(let x=1;x<length;x+=2)for(let z=-width/2+.5;z<width/2;z++)put('t12','yellow',x,height+.4,z,group);
}
boomSection('boom',52,8,6,5,'Flèche principale','Main boom');
boomSection('mid',48,6,3.6,3,'Section intermédiaire','Middle section');
boomSection('inner',44,4,1.2,1,'Section terminale','Inner section');
stage('Colliers et guides de télescopage','Telescopic collars and guides');
for(const [g,l,w,h] of [['boom',52,8,6],['mid',48,6,3.6],['inner',44,4,1.2]] as const){
 for(const z of [-w/2-.5,w/2+.5])for(let y=0;y<h;y+=1.2){put('b12','yellow',l-1,y,z,g);put('b11','yellow',l-.5,y,z+(z<0?-1:1),g);}
 for(let z=-w/2+.5;z<w/2;z++)put('t12','black',l-1,h+.8,z,g);
}
stage('Deux vérins de levage','Twin lifting actuators');
for(const z of [-4.8,4.8]){put('actuatorLong40918','gray',8,9.1,z,'turret');put('pin2780','black',8,9.1,z,'turret',undefined,true);put('pin2780','black',17.5,-.4,z,'boom',undefined,true);}
stage('Moufles de tête','Boom head sheaves');
for(const z of [-1.5,0,1.5])put('pulley4185','black',44,-.9,z,'inner');
for(const z of [-2.5,2.5]){put('b14','yellow',44,-1,z,'inner');put('slope45_2x2','yellow',45,.2,z+Math.sign(z)*.5,'inner',[0,Math.PI/2,0]);}
put('axle8','black',44,.6,0,'inner',[0,Math.PI/2,0],true);
stage('Bloc du crochet','Hook block');
for(const z of [-1.5,1.5])put('pulley4185','black',0,0,z,'hook');
for(const z of [-2.5,2.5]){put('b14','yellow',0,.3,z,'hook');put('t14','black',0,1.5,z,'hook');}
put('hook70644','black',0,-4.4,0,'hook');put('axle8','black',0,1.5,0,'hook',[0,Math.PI/2,0],true);
stage('Treuil et enroulement','Winch and drums');
for(const x of [-10,-6])for(const z of [-3,3]){put('pulley4185','black',x,10.8,z,'turret');put('round22','black',x,11,z,'turret');}
stage('Passerelles et garde-corps','Walkways and safety rails');
for(let x=-26;x<=34;x+=8)put('railing2486','yellow',x,1.2,-8,'turret');
for(const x of [-40,-32,26,34])for(const side of [-1,1])put('railing2486','yellow',x,10.8,side*8.5);
stage('Conduites et détails hydrauliques','Pipes and hydraulic details');
for(let x=-36;x<40;x+=4)for(const side of [-1,1]){put('bar4','black',x,7.6,side*9.1,'root',[0,0,Math.PI/2]);put('clip11','black',x,7.6,side*8.8,'root',[Math.PI/2,0,0]);}
for(let x=2;x<50;x+=4)for(const side of [-1,1])put('bar4','black',x,6.7,side*3.5,'boom',[0,0,Math.PI/2]);
stage('Marches d’accès','Access steps');
for(const side of [-1,1])for(let row=0;row<4;row++)for(const x of [-40,24]){put('grille2412b','black',x,3.2+row*1.8,side*(9.5-row*.3));put('bar4','black',x-2,4+row,side*9.4);}
stage('Revêtement des passerelles', 'Walkway surfacing');
for(let x=-29;x<38;x+=2)for(const z of [-7.5,7.5])if(x<14||z<0)put('t12','yellow',x,.8,z,'turret');
for(let x=15;x<38;x+=2)for(let z=-6.5;z<6;z++)put('t12','yellow',x,.8,z,'turret');
stage('Trappes et coffres du pont', 'Deck access hatches and lockers');
for(const x of [29,33]){yellowBox(x-2,x+2,-7,-3,1.2,3,'turret');for(const z of [-6.5,-4.5])put('t14','yellow',x,5.2,z,'turret');}
stage('Sols des plateformes de tête', 'End platform surfacing');
for(let x=33;x<44;x+=2)for(let z=-7.5;z<8;z++)put('t12','black',x,10.4,z);
for(let z=-7.5;z<8;z++)put('t12','black',-43,10.4,z);
stage('Feux, poignées et finitions','Lights, handles and finishing details');
for(const x of [-43,43])for(const z of [-6.5,6.5]){put('p11','red',x,9.6,z);put('lamp4073','white',x,10.8,z);}
for(const x of [15,31])for(const z of [7.5,12.5])put('lamp4073','white',x,10.4,z,'turret');
put('lamp4073','amber',-24,11.2,4,'turret');put('lamp4073','amber',17,10.4,11,'turret');
// Clear two slots in the upper front engine wall for the real actuator bodies.
for(let i=PIECES.length-1;i>=0;i--){const p=PIECES[i];if(p.group==='turret'&&p.part==='b11'&&p.position[0]===13.5&&Math.abs(p.position[2])>=4.5&&p.position[1]>8)PIECES.splice(i,1);}
export const CRANE_PIECE_COUNT=PIECES.length;
export const TRANSPORT_FIRST_STEP=STEPS.length+1;
const transport=createTransport(ALL_CATALOG);
GROUPS.push(...transport.groups);
for(const s of transport.steps){STEPS.push({...s,number:STEPS.length+1});}
for(const p of transport.pieces)PIECES.push({...p,id:0,step:p.step+TRANSPORT_FIRST_STEP-1});
GROUPS.find(g=>g.id==='counterweight')!.transportAfterStep=STEPS.find(s=>s.title==='Porte-contrepoids : semelles de chargement')!.number;
PIECES.forEach((p,i)=>p.id=i+1);
export const TRANSPORT_PIECE_COUNT=transport.pieces.length;
export const DIMENSIONS={chassisStuds:88,chassisMm:704,studMm:8,scaleApprox:20,trackStuds:112,axles:8,boomSections:3,referenceLengthMeters:14};
export const PHYSICAL_NOTE='Étude numérique à partir de photos publiques. Échelle indicative proche de 1:20, fondée sur un châssis de 88 tenons. Les pièces gardent leurs dimensions réelles ; les assemblages, les glissières, les vérins, le câble et la stabilité ne sont pas validés sur prototype. Les panneaux de fenêtres noirs sont opaques, conformément à la variante de catalogue utilisée. Les marquages sont personnalisés. La voie de présentation et les deux wagons du convoi sont compris dans l’inventaire complet. Le câble visible est un repère de simulation non inventorié.';
export const PHYSICAL_NOTE_EN='Digital study based on public photographs. Approximate 1:20 scale based on an 88-stud chassis. Parts retain their real dimensions; connections, slides, actuators, cable and stability have not been tested with a physical prototype. The black window panels are opaque, matching the catalogue variant used. Markings are custom graphics. The display track and both accompanying wagons are included in the complete inventory. The visible cable is an unlisted simulation guide.';
export function inventory(list:Piece[]=PIECES){const map=new Map<string,any>();for(const p of list){const key=p.part+'-'+p.color;if(!map.has(key))map.set(key,{key,part:ALL_CATALOG[p.part],color:p.color,count:0});map.get(key).count++;}return [...map.values()].sort((a,b)=>b.count-a.count);}
