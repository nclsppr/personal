// One source of truth for the scene, inventory and assembly sequence.
// Coordinates in studs; one brick = 1.2 units, one plate = 0.4 units.
export type ColorName = 'yellow'|'black'|'dark'|'gray'|'white'|'red'|'glass';
export const COLORS: Record<ColorName,{hex:string;name:string;ldraw:number}> = {
 yellow:{hex:'#f4c428',name:'Jaune',ldraw:14}, black:{hex:'#252824',name:'Noir',ldraw:0},
 dark:{hex:'#535650',name:'Gris foncé',ldraw:72},gray:{hex:'#a8aaa3',name:'Gris clair',ldraw:71},
 white:{hex:'#f2f1e8',name:'Blanc',ldraw:15},red:{hex:'#bc183b',name:'Rouge',ldraw:4},glass:{hex:'#59797e',name:'Transparent bleu',ldraw:43}
};
export type Part = {id:string;name:string;l:number;w:number;h:number;kind?:'tile'|'round'};
export const CATALOG:Record<string,Part>={
 b11:{id:'3005',name:'Brique 1 × 1',l:1,w:1,h:1.2}, b12:{id:'3004',name:'Brique 1 × 2',l:2,w:1,h:1.2},
 b14:{id:'3010',name:'Brique 1 × 4',l:4,w:1,h:1.2},b16:{id:'3009',name:'Brique 1 × 6',l:6,w:1,h:1.2},
 b18:{id:'3008',name:'Brique 1 × 8',l:8,w:1,h:1.2},b22:{id:'3003',name:'Brique 2 × 2',l:2,w:2,h:1.2},
 b23:{id:'3002',name:'Brique 2 × 3',l:3,w:2,h:1.2},b24:{id:'3001',name:'Brique 2 × 4',l:4,w:2,h:1.2},
 p11:{id:'3024',name:'Plaque 1 × 1',l:1,w:1,h:.4},p12:{id:'3023',name:'Plaque 1 × 2',l:2,w:1,h:.4},
 p14:{id:'3710',name:'Plaque 1 × 4',l:4,w:1,h:.4},p16:{id:'3666',name:'Plaque 1 × 6',l:6,w:1,h:.4},
 p18:{id:'3460',name:'Plaque 1 × 8',l:8,w:1,h:.4},p22:{id:'3022',name:'Plaque 2 × 2',l:2,w:2,h:.4},
 p24:{id:'3020',name:'Plaque 2 × 4',l:4,w:2,h:.4},p26:{id:'3795',name:'Plaque 2 × 6',l:6,w:2,h:.4},
 p28:{id:'3034',name:'Plaque 2 × 8',l:8,w:2,h:.4},p44:{id:'3031',name:'Plaque 4 × 4',l:4,w:4,h:.4},
 p46:{id:'3032',name:'Plaque 4 × 6',l:6,w:4,h:.4},p48:{id:'3035',name:'Plaque 4 × 8',l:8,w:4,h:.4},
 t12:{id:'3069b',name:'Tuile 1 × 2',l:2,w:1,h:.4,kind:'tile'},t14:{id:'2431',name:'Tuile 1 × 4',l:4,w:1,h:.4,kind:'tile'},
 t22:{id:'3068b',name:'Tuile 2 × 2',l:2,w:2,h:.4,kind:'tile'},r11:{id:'3062b',name:'Brique ronde 1 × 1',l:1,w:1,h:1.2,kind:'round'}
};
export type Brick={part:string;color:ColorName;x:number;y:number;z:number;ry:number;step:number;group:string};
export const STEPS=[
 ['Les traverses','Disposez les traverses à intervalles réguliers. Le rail profilé de la scène est un élément de décor, hors inventaire.'],
 ['Les bogies','Construisez deux ensembles de bogies de 4 × 12 tenons. Les roues représentées sont des volumes de référence.'],
 ['Les flancs des bogies','Ajoutez les flancs gris foncé et les quatre logements d’essieux de chaque bogie.'],
 ['Le soubassement','Alignez les plaques noires du châssis sur une longueur de 40 tenons.'],
 ['Les longerons','Croisez les joints des briques noires pour solidariser les plaques du châssis.'],
 ['La ceinture jaune','Ajoutez une rangée jaune sur les deux côtés du châssis.'],
 ['Le plateau','Fermez le châssis avec les plaques grises. Gardez la surface centrale accessible.'],
 ['Les traverses de tamponnement','Ajoutez les extrémités et les feux rouges. Tampons et attelages sont des détails de visualisation.'],
 ['Les stabilisateurs','Assemblez les quatre bras et leurs patins. Le déploiement est une animation, sans liaison Technic validée.'],
 ['La couronne de rotation','Préparez l’assise carrée de la tourelle. Le palier circulaire reste à remplacer par une vraie solution Technic.'],
 ['Le plancher de tourelle','Construisez le plancher jaune de la superstructure, centré sur la couronne.'],
 ['Le capot moteur · 1','Montez les parois inférieures du compartiment arrière en croisant les joints.'],
 ['Le capot moteur · 2','Poursuivez les parois jaunes. Les parties noires représentent les prises d’air.'],
 ['Les grilles','Vérifiez les aérations du capot. Les lamelles représentées sont des volumes de référence hors inventaire.'],
 ['Le toit du capot','Fermez le compartiment moteur avec les plaques jaunes.'],
 ['Le contrepoids · 1','Construisez le socle du contrepoids. Validez sa masse avant tout essai de levage réel.'],
 ['Le contrepoids · 2','Superposez les rangées jaunes et noires du contrepoids.'],
 ['Le plancher de cabine','Assemblez la plateforme latérale de la cabine et le bas des parois.'],
 ['Les montants de cabine','Montez les piliers jaunes. Laissez les ouvertures prévues pour le vitrage.'],
 ['Le vitrage','Le vitrage et les essuie-glaces de la scène sont des références visuelles. Choisir des vitrages LEGO adaptés avant montage.'],
 ['Le toit de cabine','Fermez la cabine avec un toit jaune, légèrement débordant.'],
 ['Le pied de flèche','Montez les deux joues du support. L’articulation physique devra être conçue en Technic.'],
 ['La flèche · semelle','Alignez les plaques jaunes de la première section de flèche.'],
 ['La flèche · parois basses','Croisez les joints sur les deux parois latérales.'],
 ['La flèche · parois hautes','Poursuivez les deux parois de la flèche principale.'],
 ['La flèche · fermeture','Posez les plaques jaunes supérieures. Laissez visibles leurs tenons.'],
 ['Le bras intérieur · base','Construisez la section plus étroite en plaques jaunes.'],
 ['Le bras intérieur · corps','Renforcez le bras intérieur avec une rangée de briques.'],
 ['La tête de flèche','Ajoutez le dernier étage et le nez noir de la flèche.'],
 ['Le moufle','Assemblez le corps jaune et noir du moufle. Crochet, poulies et câble sont des détails visuels à remplacer.'],
 ['Les finitions','Ajoutez les feux, les montants et les détails du pont. Les garde-corps continus sont des volumes de référence.'],
 ['Assemblage d’ensemble','Vérifiez toutes les interfaces et la stabilité dans un logiciel de construction, puis sur prototype. Ce fascicule décrit la maquette numérique ; il ne certifie pas une grue fonctionnelle.']
].map(([title,description],i)=>({number:i+1,title,description}));
export function createBlueprint(){
 const bricks:Brick[]=[];
 function add(group:string,step:number,part:string,color:ColorName,x:number,y:number,z:number,ry=0){bricks.push({part,color,x,y,z,ry,step,group});}
 // All brick positions are exact grid positions. Special mechanisms are intentionally separate.
 for(let x=-38;x<=38;x+=2)add('track',1,'p18','dark',x,.1,0,Math.PI/2);
 for(const [g,cx] of [['rearBogie',-13],['frontBogie',13]] as const){
  for(let x=-4;x<=4;x+=4)add(g,2,'p44','black',x,2.6,0);
  for(let z=-1.5;z<=1.5;z+=3)for(let x=-4;x<=4;x+=4)add(g,3,'b14','dark',x,3,z);
  for(let x=-4.5;x<=4.5;x+=3)for(const z of [-2.5,2.5])add(g,3,'r11','black',x,2,z);
 }
 for(let x=-16;x<=16;x+=8)for(const z of [-2,2])add('chassis',4,'p48','black',x,4.2,z);
 for(let x=-18;x<=18;x+=4)for(const z of [-3,3])add('chassis',5,'b24','black',x,4.6,z);
 for(let x=-18;x<=18;x+=4)for(const z of [-3.5,3.5])add('chassis',6,'b14','yellow',x,5.8,z);
 for(let x=-16;x<=16;x+=8)for(const z of [-2,2])add('chassis',7,'p48','dark',x,7,z);
 for(const x of [-22,22]){add('chassis',8,'p48','black',x,4.2,0,Math.PI/2);add('chassis',8,'b18','yellow',x,4.6,0,Math.PI/2);for(const z of [-3,3])add('chassis',8,'p11','red',x,5.8,z);}
 for(const x of [-15,15])for(const z of [-1,1]){
  const g=`leg${x}${z}`;for(let i=0;i<2;i++)add(g,9,'b24',i?'yellow':'dark',0,.2,z*(i*4+1),Math.PI/2);
  add(g,9,'p44','black',0,-5,z*6);for(let j=0;j<4;j++)add(g,9,'b22',j<3?'dark':'yellow',0,-4.6+j*1.2,z*6);add(g,9,'p28','yellow',0,1.4,z*3,Math.PI/2);
 }
 for(const x of [-2,2])add('chassis',10,'p44','black',x,7.4,0);
 for(let x=-12;x<=8;x+=4)for(const z of [-3,-1,1,3])add('turret',11,'p24','yellow',x,0,z);
 for(let row=0;row<3;row++)for(const z of [-3,3]){if(row%2){for(const x of [-13,-3])add('turret',12,'b22','yellow',x,.4+row*1.2,z);for(const x of [-10,-6])add('turret',12,'b24','yellow',x,.4+row*1.2,z);}else for(const x of [-12,-8,-4])add('turret',12,'b24','yellow',x,.4+row*1.2,z);}
 for(let row=0;row<2;row++)for(const z of [-3,3]){if(row===0){for(const x of [-13,-3])add('turret',13,'b22','yellow',x,4,z);for(const x of [-10,-6])add('turret',13,'b24','black',x,4,z);}else for(const x of [-12,-8,-4])add('turret',13,'b24',x===-8?'black':'yellow',x,5.2,z);}
 // Grille is a visual reference, excluded from the standard inventory.
 for(let x=-12;x<=-4;x+=4)for(const z of [-2,2])add('turret',15,'p44','yellow',x,6.4,z);
 for(let x=-19;x<=-15;x+=4)for(const z of [-2,2])add('counter',16,'p44','dark',x,0,z);
 for(let row=0;row<5;row++)for(let x=-19;x<=-15;x+=4)for(const z of [-3,-1,1,3])add('counter',17,'b24',row===1?'black':'yellow',x,.4+row*1.2,z);
 for(let x=-19;x<=-15;x+=4)for(const z of [-2,2])add('counter',17,'p44','yellow',x,6.4,z);
 for(const x of [1,5])add('cab',18,'p44','yellow',x,0,5);
 for(const x of [1,5])add('cab',18,'b24','yellow',x,.4,6);
 for(const x of [-.5,6.5])for(const z of [3.5,6.5])for(let row=0;row<4;row++)add('cab',19,'b11','yellow',x,2+row*1.2,z);
 for(const x of [1,5])for(const z of [3.5,6.5])add('cab',20,'p14','black',x,1.6,z);
 for(const x of [1,5])add('cab',21,'p44','yellow',x,6.8,5);
 for(const x of [1,5])add('cab',21,'p44','yellow',x,7.2,5);
 for(let row=0;row<5;row++)for(const z of [-2.5,2.5])add('turret',22,'b14','yellow',0,.4+row*1.2,z);
 for(let x=2;x<=26;x+=4)add('boom',23,'p44','yellow',x,0,0);
 for(const z of [-1.5,1.5]){for(let x=2;x<=26;x+=4)add('boom',24,'b14','yellow',x,.4,z);for(const x of [1,27])add('boom',25,'b12','yellow',x,1.6,z);for(let x=4;x<=24;x+=4)add('boom',25,'b14','yellow',x,1.6,z);}
 for(let x=2;x<=26;x+=4)add('boom',26,'p44','yellow',x,2.8,0);
 for(let x=29;x<=41;x+=4)add('jib',27,'p24','yellow',x,.4,0);
 for(let x=29;x<=41;x+=4)add('jib',28,'b24','yellow',x,.8,0);
 for(let x=29;x<=41;x+=4)add('jib',29,'p24',x===41?'black':'yellow',x,2,0);
 for(let row=0;row<3;row++)add('hook',30,'b24',row===1?'black':'yellow',0,row*1.2,0);
 for(const x of [-20,20])for(const z of [-3,3])add('chassis',31,'r11','yellow',x,7.4,z);
 for(let x=-13;x<=-3;x+=2)for(const z of [-4.5,4.5])add('turret',31,'r11','yellow',x,0,z);
 return bricks;
}
export const BRICKS=createBlueprint();
export function inventory(list=BRICKS){
 const map=new Map<string,{key:string;part:Part;color:ColorName;count:number}>();
 for(const b of list){const key=b.part+'-'+b.color;if(!map.has(key))map.set(key,{key,part:CATALOG[b.part],color:b.color,count:0});map.get(key)!.count++;}
 return [...map.values()].sort((a,b)=>b.count-a.count);
}
export function inventoryCSV(){return '\ufeffRéférence LEGO;Pièce;Couleur;Quantité\n'+inventory().map(r=>`${r.part.id};${r.part.name};${COLORS[r.color].name};${r.count}`).join('\n');}
export const PHYSICAL_NOTE='Étude de construction, non testée physiquement. L’inventaire correspond aux briques standards modélisées. Rails, roues, vérins, câbles, vitrage, crochet et articulations sont des volumes de référence hors inventaire ; ils doivent être résolus avec des pièces réelles avant achat.';
