import partsEvidence from './parts-evidence.json';
export const PARTS_EVIDENCE=partsEvidence;
// One source of truth for the scene, inventory and assembly sequence.
// Coordinates in studs; one brick = 1.2 units, one plate = 0.4 units.
export type ColorName = 'yellow'|'black'|'dark'|'gray'|'white'|'red'|'glass'|'metal'|'amber';
export const COLORS: Record<ColorName,{hex:string;name:string;nameEn?:string;ldraw:number;bricklink?:number}> = {
 yellow:{hex:'#f4c428',name:'Jaune',nameEn:'Yellow',ldraw:14,bricklink:3}, black:{hex:'#252824',name:'Noir',nameEn:'Black',ldraw:0,bricklink:11},
 dark:{hex:'#535650',name:'Gris bleuté foncé',nameEn:'Dark Bluish Gray',ldraw:72,bricklink:85},gray:{hex:'#a8aaa3',name:'Gris bleuté clair',nameEn:'Light Bluish Gray',ldraw:71,bricklink:86},
 white:{hex:'#f2f1e8',name:'Blanc',nameEn:'White',ldraw:15,bricklink:1},red:{hex:'#bc183b',name:'Rouge',nameEn:'Red',ldraw:4,bricklink:5},glass:{hex:'#b7d3d9',name:'Transparent incolore',nameEn:'Trans-Clear',ldraw:47,bricklink:12},
 metal:{hex:'#b9bebc',name:'Argent chromé',nameEn:'Chrome Silver',ldraw:383,bricklink:22},amber:{hex:'#f89a1c',name:'Transparent orange',nameEn:'Trans-Orange',ldraw:57,bricklink:98}
};
export type Part = {id:string;name:string;l:number;w:number;h:number;kind?:'tile'|'round';nameEn?:string;category?:'standard'|'mechanism';ldrawId?:string|null;referenceType?:'design'|'catalogue-variant'|'catalogue-assembly'|'catalogue-length';designId?:string|null};
export const CATALOG:Record<string,Part>={
 "b11": {
  "id": "3005",
  "name": "Brique 1 × 1",
  "l": 1,
  "w": 1,
  "h": 1.2,
  "nameEn": "Brick 1 × 1",
  "category": "standard",
  "ldrawId": "3005",
  "referenceType": "design",
  "designId": "3005"
 },
 "b12": {
  "id": "3004",
  "name": "Brique 1 × 2",
  "l": 2,
  "w": 1,
  "h": 1.2,
  "nameEn": "Brick 1 × 2",
  "category": "standard",
  "ldrawId": "3004",
  "referenceType": "design",
  "designId": "3004"
 },
 "b14": {
  "id": "3010",
  "name": "Brique 1 × 4",
  "l": 4,
  "w": 1,
  "h": 1.2,
  "nameEn": "Brick 1 × 4",
  "category": "standard",
  "ldrawId": "3010",
  "referenceType": "design",
  "designId": "3010"
 },
 "b18": {
  "id": "3008",
  "name": "Brique 1 × 8",
  "l": 8,
  "w": 1,
  "h": 1.2,
  "nameEn": "Brick 1 × 8",
  "category": "standard",
  "ldrawId": "3008",
  "referenceType": "design",
  "designId": "3008"
 },
 "b22": {
  "id": "3003",
  "name": "Brique 2 × 2",
  "l": 2,
  "w": 2,
  "h": 1.2,
  "nameEn": "Brick 2 × 2",
  "category": "standard",
  "ldrawId": "3003",
  "referenceType": "design",
  "designId": "3003"
 },
 "b24": {
  "id": "3001",
  "name": "Brique 2 × 4",
  "l": 4,
  "w": 2,
  "h": 1.2,
  "nameEn": "Brick 2 × 4",
  "category": "standard",
  "ldrawId": "3001",
  "referenceType": "design",
  "designId": "3001"
 },
 "p11": {
  "id": "3024",
  "name": "Plaque 1 × 1",
  "l": 1,
  "w": 1,
  "h": 0.4,
  "nameEn": "Plate 1 × 1",
  "category": "standard",
  "ldrawId": "3024",
  "referenceType": "design",
  "designId": "3024"
 },
 "p14": {
  "id": "3710",
  "name": "Plaque 1 × 4",
  "l": 4,
  "w": 1,
  "h": 0.4,
  "nameEn": "Plate 1 × 4",
  "category": "standard",
  "ldrawId": "3710",
  "referenceType": "design",
  "designId": "3710"
 },
 "p24": {
  "id": "3020",
  "name": "Plaque 2 × 4",
  "l": 4,
  "w": 2,
  "h": 0.4,
  "nameEn": "Plate 2 × 4",
  "category": "standard",
  "ldrawId": "3020",
  "referenceType": "design",
  "designId": "3020"
 },
 "p28": {
  "id": "3034",
  "name": "Plaque 2 × 8",
  "l": 8,
  "w": 2,
  "h": 0.4,
  "nameEn": "Plate 2 × 8",
  "category": "standard",
  "ldrawId": "3034",
  "referenceType": "design",
  "designId": "3034"
 },
 "p44": {
  "id": "3031",
  "name": "Plaque 4 × 4",
  "l": 4,
  "w": 4,
  "h": 0.4,
  "nameEn": "Plate 4 × 4",
  "category": "standard",
  "ldrawId": "3031",
  "referenceType": "design",
  "designId": "3031"
 },
 "p48": {
  "id": "3035",
  "name": "Plaque 4 × 8",
  "l": 8,
  "w": 4,
  "h": 0.4,
  "nameEn": "Plate 4 × 8",
  "category": "standard",
  "ldrawId": "3035",
  "referenceType": "design",
  "designId": "3035"
 },
 "r11": {
  "id": "3062",
  "name": "Brique ronde 1 × 1, tenon creux",
  "l": 1,
  "w": 1,
  "h": 1.2,
  "kind": "round",
  "nameEn": "Round brick 1 × 1, open stud",
  "category": "standard",
  "ldrawId": "3062b",
  "referenceType": "design",
  "designId": "3062"
 }
};
export type Brick={part:string;color:ColorName;x:number;y:number;z:number;ry:number;rx?:number;rz?:number;step:number;group:string};
export const STEPS=[
 [
  "La voie",
  "Emboîtez cinq voies droites LEGO 53401 gris bleuté foncé. Leurs traverses font partie du moulage : aucune barre de rail sur mesure."
 ],
 [
  "Les bogies",
  "Préparez huit supports LEGO 2878, seize roues LEGO 57878 et huit essieux métalliques réf. BrickLink x1687. Chaque essieu mesure 5 tenons."
 ],
 [
  "Les flancs des bogies",
  "Ajoutez les briques LEGO 3010 gris bleuté foncé. Les pivots associent une base LEGO 3680 noire et un dessus LEGO 3679 gris bleuté clair."
 ],
 [
  "Le soubassement",
  "Alignez les plaques LEGO 3035 noires sur une longueur de 40 tenons."
 ],
 [
  "Les longerons",
  "Croisez les joints des briques LEGO 3001 noires pour relier les plaques du châssis."
 ],
 [
  "La ceinture jaune",
  "Ajoutez une rangée de briques LEGO 3010 jaunes sur les deux côtés du châssis."
 ],
 [
  "Le plateau",
  "Fermez le châssis avec les plaques LEGO 3035 gris bleuté foncé. Gardez la surface centrale accessible."
 ],
 [
  "Les traverses de tamponnement",
  "Ajoutez les plaques LEGO 3035, briques LEGO 3008 et feux LEGO 3024. Les vrais tampons LEGO 4022 reçoivent les supports LEGO 2920 et aimants LEGO 73092."
 ],
 [
  "Les stabilisateurs",
  "Assemblez les bras et patins avec LEGO 3001, 3003, 3031 et 3034. Les charnières LEGO 2429 et 2430 sont prévues pour les articulations, dont les ancrages et la tenue restent à éprouver."
 ],
 [
  "La couronne de rotation",
  "La couronne réelle associe LEGO 18939 gris bleuté clair et LEGO 18938 noir, sur les plaques LEGO 3031. Vérifiez les ancrages avant une rotation physique."
 ],
 [
  "Le plancher de tourelle",
  "Construisez le plancher jaune avec les plaques LEGO 3020, centré sur la couronne LEGO 18939 / 18938."
 ],
 [
  "Le capot moteur · 1",
  "Montez les parois inférieures jaunes avec les briques LEGO 3001 et 3003, en croisant les joints."
 ],
 [
  "Le capot moteur · 2",
  "Poursuivez les parois avec LEGO 3001 et 3003. La bande noire est constituée de briques LEGO 3001."
 ],
 [
  "Préparer les grilles",
  "Préparez huit grilles noires LEGO 2412, variante de catalogue 2412b. Elles seront posées sur les tenons du toit à l’étape suivante."
 ],
 [
  "Le toit et les grilles",
  "Fermez le compartiment avec les plaques LEGO 3031 jaunes et posez les huit grilles LEGO 2412 (2412b) noires. Le marquage KIROW est un graphisme personnalisé."
 ],
 [
  "Le contrepoids · 1",
  "Construisez le socle avec les plaques LEGO 3031 gris bleuté foncé. Sa masse et son ancrage restent à vérifier avant tout essai de levage."
 ],
 [
  "Le contrepoids · 2",
  "Superposez les briques LEGO 3001 jaunes et noires, puis les plaques LEGO 3031 jaunes. L’inscription 150 t est un graphisme personnalisé du modèle."
 ],
 [
  "Le plancher de cabine",
  "Assemblez la plateforme avec LEGO 3031 et le bas des parois avec LEGO 3001, en jaune."
 ],
 [
  "Les montants de cabine",
  "Montez les piliers jaunes LEGO 3005. Les ouvertures reçoivent les cadres LEGO 60592 de l’étape suivante."
 ],
 [
  "Les fenêtres et les commandes",
  "Posez dix cadres jaunes LEGO 60592 avec dix vitres incolores LEGO 60601. Ajoutez le siège LEGO 4079, le socle LEGO 4592 et le levier LEGO 4593, noirs, sur les plaques LEGO 3710."
 ],
 [
  "Le toit de cabine",
  "Fermez la cabine avec les plaques LEGO 3031 jaunes. Les cadres LEGO 60592 conservent leurs dimensions réelles."
 ],
 [
  "L’articulation et le vérin",
  "Les joues LEGO 3010 se terminent par deux briques Technic LEGO 3701. Ajoutez l’axe LEGO 3707, les bagues LEGO 3713 et les chevilles LEGO 2780. Le vérin réel est l’assemblage réf. BrickLink 61927c01. Sa course, ses points d’ancrage et la résistance de la flèche restent à valider."
 ],
 [
  "La flèche · semelle",
  "Alignez les plaques LEGO 3031 jaunes de la première section de flèche."
 ],
 [
  "La flèche · parois basses",
  "Croisez les joints des briques LEGO 3010 jaunes sur les deux parois latérales."
 ],
 [
  "La flèche · parois hautes",
  "Poursuivez les parois avec les briques LEGO 3010 et LEGO 3004 jaunes."
 ],
 [
  "La flèche · fermeture",
  "Posez les plaques LEGO 3031 jaunes supérieures. Le marquage SNCF est un graphisme personnalisé, pas une pièce imprimée LEGO."
 ],
 [
  "Le bras intérieur · base",
  "Construisez la section plus étroite avec les plaques LEGO 3020 jaunes."
 ],
 [
  "Le bras intérieur · corps",
  "Renforcez le bras intérieur avec les briques LEGO 3001 jaunes. Le télescopage physique n’est pas validé."
 ],
 [
  "La tête de flèche",
  "Ajoutez les plaques LEGO 3020 jaunes et noire, puis deux poulies LEGO 4185 noires de 24 mm. Leurs axes et leurs appuis restent à mettre au point."
 ],
 [
  "Le moufle",
  "Assemblez LEGO 3001 jaune et noir, deux poulies LEGO 4185, le crochet métallique noir LEGO 70644 et une seule ficelle LEGO fine de 50 cm, réf. BrickLink x77ac50. Les deux brins visibles appartiennent à cette ficelle ; cheminement et fixation sont à éprouver."
 ],
 [
  "Les finitions",
  "Posez les garde-corps jaunes LEGO 2486 sur les montants LEGO 3062. Les feux blancs et le gyrophare orange transparent utilisent LEGO 4073."
 ],
 [
  "Assemblage d’ensemble",
  "Toutes les références de pièces et couleurs ont des sources. Contrôlez les collisions, les liaisons et la stabilité dans un logiciel de construction, puis sur prototype. Ciel, herbe et ballast sont du décor ; les marquages sont personnalisés. Cette étude ne certifie pas une grue fonctionnelle."
 ]
].map(([title,description],i)=>({number:i+1,title,description}));
export function createBlueprint(){
 const bricks:Brick[]=[];
 function add(group:string,step:number,part:string,color:ColorName,x:number,y:number,z:number,ry=0){bricks.push({part,color,x,y,z,ry,step,group});}
 // All brick positions are exact grid positions. Special mechanisms are intentionally separate.
 // Each 53401 track segment includes its own sleepers.
 for(const [g,cx] of [['rearBogie',-13],['frontBogie',13]] as const){
  for(let x=-4;x<=4;x+=4)add(g,2,'p44','black',x,2.6,0);
  for(let z=-1.5;z<=1.5;z+=3)for(let x=-4;x<=4;x+=4)add(g,3,'b14','dark',x,3,z);
  // Axle holders 2878 replace the round placeholder axle boxes.
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
 // Real 2412b grilles fit on the completed roof at step 15.
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
 for(let row=0;row<4;row++)for(const z of [-2.5,2.5])add('turret',22,'b14','yellow',0,.4+row*1.2,z);
 // The top row is replaced by Technic bricks 3701, with a real axle through the pivot.
 for(let x=2;x<=26;x+=4)add('boom',23,'p44','yellow',x,0,0);
 for(const z of [-1.5,1.5]){for(let x=2;x<=26;x+=4)add('boom',24,'b14','yellow',x,.4,z);for(const x of [1,27])add('boom',25,'b12','yellow',x,1.6,z);for(let x=4;x<=24;x+=4)add('boom',25,'b14','yellow',x,1.6,z);}
 for(let x=2;x<=26;x+=4)add('boom',26,'p44','yellow',x,2.8,0);
 for(let x=29;x<=41;x+=4)add('jib',27,'p24','yellow',x,.4,0);
 for(let x=29;x<=41;x+=4)add('jib',28,'b24','yellow',x,.8,0);
 for(let x=29;x<=41;x+=4)add('jib',29,'p24',x===41?'black':'yellow',x,2,0);
 for(let row=0;row<3;row++)add('hook',30,'b24',row===1?'black':'yellow',0,row*1.2,0);
 for(const x of [-20,20])for(const z of [-3,3])add('chassis',31,'r11','yellow',x,7.4,z);
 for(const x of [-13,-6])for(const z of [-4.5,4.5])add('turret',31,'r11','yellow',x,0,z);
 for(const b of bricks){
  if(['rearBogie','frontBogie','chassis'].includes(b.group))b.y+=1.4375;
  if(b.group.startsWith('leg')&&b.y<0)b.y-=1.4375;
 }
 return bricks;
}
export const BRICKS=createBlueprint();

// Every special is a counted physical item. Coordinates describe the study pose,
// not a certified mechanical connection. The string is one item with two visible falls.
export const SPECIAL_CATALOG:Record<string,Part>={
 "rail53401": {
  "id": "53401",
  "name": "Voie droite 16 × 8",
  "nameEn": "Straight track 16 × 8",
  "l": 16,
  "w": 8,
  "h": 0.8,
  "category": "mechanism",
  "ldrawId": "53401",
  "referenceType": "design",
  "designId": "53401"
 },
 "wheel57878": {
  "id": "57878",
  "name": "Roue ferroviaire RC Ø 16,6 / 23 mm",
  "nameEn": "RC train wheel Ø 16.6 / 23 mm",
  "l": 2.875,
  "w": 0.6875,
  "h": 2.875,
  "category": "mechanism",
  "ldrawId": "57878",
  "referenceType": "design",
  "designId": "57878"
 },
 "holder2878": {
  "id": "2878",
  "name": "Support de roues ferroviaires RC",
  "nameEn": "RC train wheel holder",
  "l": 6,
  "w": 3,
  "h": 2.2,
  "category": "mechanism",
  "ldrawId": "2878",
  "referenceType": "design",
  "designId": "2878"
 },
 "axle57879": {
  "id": "x1687",
  "name": "Essieu ferroviaire métallique 5 tenons",
  "nameEn": "Metal train axle 5 studs",
  "l": 5,
  "w": 0.25,
  "h": 0.25,
  "category": "mechanism",
  "ldrawId": "57877",
  "referenceType": "catalogue-variant",
  "designId": null
 },
 "turnBase18939": {
  "id": "18939",
  "name": "Couronne Technic 60 dents, base",
  "nameEn": "Technic 60-tooth turntable, base",
  "l": 7,
  "w": 7,
  "h": 0.8,
  "category": "mechanism",
  "ldrawId": "18939",
  "referenceType": "design",
  "designId": "18939"
 },
 "turnTop18938": {
  "id": "18938",
  "name": "Couronne Technic 60 dents biseautées, dessus",
  "nameEn": "Technic 60-tooth bevel turntable, top",
  "l": 7,
  "w": 7,
  "h": 0.8,
  "category": "mechanism",
  "ldrawId": "18938",
  "referenceType": "design",
  "designId": "18938"
 },
 "window60592": {
  "id": "60592",
  "name": "Cadre de fenêtre 1 × 2 × 2",
  "nameEn": "Window frame 1 × 2 × 2",
  "l": 2,
  "w": 1,
  "h": 2.4,
  "category": "mechanism",
  "ldrawId": "60592",
  "referenceType": "design",
  "designId": "60592"
 },
 "glass60601": {
  "id": "60601",
  "name": "Vitre pour fenêtre 1 × 2 × 2",
  "nameEn": "Glass for window 1 × 2 × 2",
  "l": 1.65,
  "w": 0.2,
  "h": 1.95,
  "category": "mechanism",
  "ldrawId": "60601",
  "referenceType": "design",
  "designId": "60601"
 },
 "grille2412b": {
  "id": "2412b",
  "name": "Tuile grille 1 × 2, rainure dessous",
  "nameEn": "Grille tile 1 × 2 with bottom groove",
  "l": 2,
  "w": 1,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "2412b",
  "referenceType": "catalogue-variant",
  "designId": "2412"
 },
 "actuator61927": {
  "id": "61927c01",
  "name": "Vérin linéaire Technic, type 1, embouts gris foncé",
  "nameEn": "Technic linear actuator, type 1, dark bluish gray ends",
  "l": 11,
  "w": 2,
  "h": 2,
  "category": "mechanism",
  "ldrawId": "61927c01",
  "referenceType": "catalogue-assembly",
  "designId": null
 },
 "pulley4185": {
  "id": "4185",
  "name": "Poulie Technic Ø 24 mm",
  "nameEn": "Technic pulley Ø 24 mm",
  "l": 3,
  "w": 0.5,
  "h": 3,
  "category": "mechanism",
  "ldrawId": "4185b",
  "referenceType": "design",
  "designId": "4185"
 },
 "hook70644": {
  "id": "70644",
  "name": "Grand crochet Technic en métal",
  "nameEn": "Large metal Technic hook",
  "l": 3.85,
  "w": 1,
  "h": 4.69,
  "category": "mechanism",
  "ldrawId": "70644",
  "referenceType": "design",
  "designId": "70644"
 },
 "cord50": {
  "id": "x77ac50",
  "name": "Ficelle fine 50 cm",
  "nameEn": "Thin cord 50 cm",
  "l": 62.5,
  "w": 0.08,
  "h": 0.08,
  "category": "mechanism",
  "ldrawId": null,
  "referenceType": "catalogue-length",
  "designId": null
 },
 "railing2486": {
  "id": "2486",
  "name": "Garde-corps 1 × 8 × 2",
  "nameEn": "Railing 1 × 8 × 2",
  "l": 8,
  "w": 1,
  "h": 2.4,
  "category": "mechanism",
  "ldrawId": "2486",
  "referenceType": "design",
  "designId": "2486"
 },
 "buffer4022": {
  "id": "4022",
  "name": "Traverse de tampons ferroviaires",
  "nameEn": "Train buffer beam",
  "l": 6.5,
  "w": 2,
  "h": 1.5,
  "category": "mechanism",
  "ldrawId": "4022",
  "referenceType": "design",
  "designId": "4022"
 },
 "coupler2920": {
  "id": "2920",
  "name": "Support d’aimant d’attelage",
  "nameEn": "Train coupling magnet holder",
  "l": 2,
  "w": 2,
  "h": 0.8,
  "category": "mechanism",
  "ldrawId": "2920",
  "referenceType": "design",
  "designId": "2920"
 },
 "magnet73092": {
  "id": "73092",
  "name": "Aimant cylindrique d’attelage",
  "nameEn": "Cylindrical train coupling magnet",
  "l": 1,
  "w": 1,
  "h": 1,
  "category": "mechanism",
  "ldrawId": "73092",
  "referenceType": "design",
  "designId": "73092"
 },
 "pivotBrick3701": {
  "id": "3701",
  "name": "Brique Technic 1 × 4 à trous",
  "nameEn": "Technic brick 1 × 4 with holes",
  "l": 4,
  "w": 1,
  "h": 1.2,
  "category": "mechanism",
  "ldrawId": "3701",
  "referenceType": "design",
  "designId": "3701"
 },
 "axle8": {
  "id": "3707",
  "name": "Axe Technic 8 tenons",
  "nameEn": "Technic axle 8L",
  "l": 8,
  "w": 0.55,
  "h": 0.55,
  "category": "mechanism",
  "ldrawId": "3707",
  "referenceType": "design",
  "designId": "3707"
 },
 "bush3713": {
  "id": "3713",
  "name": "Bague d’arrêt Technic",
  "nameEn": "Technic bush",
  "l": 1,
  "w": 0.9,
  "h": 0.9,
  "category": "mechanism",
  "ldrawId": "3713",
  "referenceType": "design",
  "designId": "3713"
 },
 "pin2780": {
  "id": "2780",
  "name": "Cheville Technic à friction 2 tenons",
  "nameEn": "Technic friction pin 2L",
  "l": 2,
  "w": 0.6,
  "h": 0.6,
  "category": "mechanism",
  "ldrawId": "2780",
  "referenceType": "design",
  "designId": "2780"
 },
 "bogieBase3680": {
  "id": "3680",
  "name": "Plateau tournant 2 × 2, base",
  "nameEn": "Turntable 2 × 2, base",
  "l": 2,
  "w": 2,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "3680",
  "referenceType": "design",
  "designId": "3680"
 },
 "bogieTop3679": {
  "id": "3679",
  "name": "Plateau tournant 2 × 2, dessus",
  "nameEn": "Turntable 2 × 2, top",
  "l": 2,
  "w": 2,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "3679",
  "referenceType": "design",
  "designId": "3679"
 },
 "seat4079": {
  "id": "4079",
  "name": "Siège 2 × 2",
  "nameEn": "Seat 2 × 2",
  "l": 2,
  "w": 2,
  "h": 2.4,
  "category": "mechanism",
  "ldrawId": "4079",
  "referenceType": "design",
  "designId": "4079"
 },
 "leverBase4592": {
  "id": "4592",
  "name": "Socle du levier de commande",
  "nameEn": "Control lever base",
  "l": 1,
  "w": 1,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "4592",
  "referenceType": "design",
  "designId": "4592"
 },
 "lever4593": {
  "id": "4593",
  "name": "Levier de commande",
  "nameEn": "Control lever",
  "l": 0.4,
  "w": 0.4,
  "h": 1.6,
  "category": "mechanism",
  "ldrawId": "4593",
  "referenceType": "design",
  "designId": "4593"
 },
 "lamp4073": {
  "id": "4073",
  "name": "Plaque ronde 1 × 1",
  "nameEn": "Round plate 1 × 1",
  "l": 1,
  "w": 1,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "4073",
  "referenceType": "design",
  "designId": "4073"
 },
 "hinge2429": {
  "id": "2429",
  "name": "Charnière orientable 1 × 4, base",
  "nameEn": "Swivel hinge 1 × 4, base",
  "l": 2,
  "w": 1,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "2429",
  "referenceType": "design",
  "designId": "2429"
 },
 "hinge2430": {
  "id": "2430",
  "name": "Charnière orientable 1 × 4, dessus",
  "nameEn": "Swivel hinge 1 × 4, top",
  "l": 2,
  "w": 1,
  "h": 0.4,
  "category": "mechanism",
  "ldrawId": "2430",
  "referenceType": "design",
  "designId": "2430"
 }
};
export const ALL_CATALOG:Record<string,Part>={...CATALOG,...SPECIAL_CATALOG};
export function createSpecials(){
 const parts:Brick[]=[];
 const add=(group:string,step:number,part:string,color:ColorName,x:number,y:number,z:number,ry=0,rx=0,rz=0)=>parts.push({part,color,x,y,z,ry,rx,rz,step,group});
 for(const x of [-32,-16,0,16,32])add('track',1,'rail53401','dark',x,.1,0);
 for(const g of ['rearBogie','frontBogie']){
  for(const x of [-4.5,-1.5,1.5,4.5]){
   add(g,2,'holder2878','black',x,2.0375,0,Math.PI/2);
   add(g,2,'axle57879','metal',x,2.2125,0,Math.PI/2);
   for(const z of [-2.44375,2.44375])add(g,2,'wheel57878','black',x,.8875,z,z>0?Math.PI:0);
  }
  add(g,3,'bogieBase3680','black',0,3.4,0);
  add(g,3,'bogieTop3679','gray',0,3.8,0);
 }
 for(const x of [-22,22]){
  add('chassis',8,'buffer4022','black',x,4.2,0,x<0?-Math.PI/2:Math.PI/2);
  add('chassis',8,'coupler2920','black',x+Math.sign(x)*1.2,4.2,0,x<0?-Math.PI/2:Math.PI/2);
  add('chassis',8,'magnet73092','black',x+Math.sign(x)*2.1,4.2,0,x<0?-Math.PI/2:Math.PI/2);
 }
 for(const x of [-15,15])for(const z of [-1,1]){
  const g=`leg${x}${z}`;
  add(g,9,'hinge2429','yellow',0,1.8,z,Math.PI/2);
  add(g,9,'hinge2430','yellow',0,1.8,z*3,Math.PI/2);
 }
 add('chassis',10,'turnBase18939','gray',-4,7.4,0);
 add('chassis',10,'turnTop18938','black',-4,8.4,0);
 for(const x of [-11,-9,-7,-5])for(const z of [-2.5,2.5])add('turret',15,'grille2412b','black',x,6.8,z);
 for(const y of [2,4.4]){
  for(const x of [1,3,5]){add('cab',20,'window60592','yellow',x,y,6.5);add('cab',20,'glass60601','glass',x,y+.24,6.25);}
  for(const x of [-.5,6.5]){add('cab',20,'window60592','yellow',x,y,5,Math.PI/2);add('cab',20,'glass60601','glass',x-.25,y+.24,5,Math.PI/2);}
 }
 add('cab',20,'seat4079','black',2,1.6,5,Math.PI/2);
 add('cab',20,'leverBase4592','black',5,1.6,5);
 add('cab',20,'lever4593','black',5,1.8,5);
 for(const z of [-2.5,2.5])add('turret',22,'pivotBrick3701','yellow',0,5.2,z);
 add('turret',22,'axle8','black',0,5.8,0);
 for(const z of [-3.5,3.5])add('turret',22,'bush3713','gray',0,5.8,z);
 add('turret',22,'actuator61927','gray',3,3,0);
 for(const z of [-1.5,1.5]){
  add('turret',22,'pin2780','black',3,3,z);
  add('boom',22,'pin2780','black',11,0,z);
 }
 for(const z of [-.7,.7])add('jib',29,'pulley4185','black',42,-.5,z);
 for(const z of [-1.05,1.05])add('hook',30,'pulley4185','black',0,1.25,z);
 add('hook',30,'hook70644','black',0,-4.6,0);
 add('turret',30,'cord50','black',0,0,0);
 for(const z of [-4.5,4.5])add('turret',31,'railing2486','yellow',-9.5,1.2,z);
 for(const z of [3.5,6.5])add('cab',31,'lamp4073','white',6.5,7.6,z);
 add('cab',31,'lamp4073','amber',1,7.6,5);
 for(const p of parts)if(p.group==='chassis'||(p.group.endsWith('Bogie')&&p.step===3))p.y+=1.4375;
 return parts;
}
export const SPECIALS=createSpecials();
export const ALL_PARTS=[...BRICKS,...SPECIALS];
export function inventory(list=ALL_PARTS){
 const map=new Map<string,{key:string;part:Part;color:ColorName;count:number}>();
 for(const b of list){const key=b.part+'-'+b.color;if(!map.has(key))map.set(key,{key,part:ALL_CATALOG[b.part],color:b.color,count:0});map.get(key)!.count++;}
 return [...map.values()].sort((a,b)=>b.count-a.count);
}
export function inventoryCSV(){return '\ufeffRéférence catalogue;ID dessin LEGO;Pièce;Couleur;Quantité;Source\n'+inventory().map(r=>`${r.part.id};${r.part.designId??''};${r.part.name};${COLORS[r.color].name};${r.count};${PARTS_EVIDENCE.variants.find(v=>v.key===r.key)!.sources[0].url}`).join('\n');}
export const PHYSICAL_NOTE='Toutes les références et couleurs de l’inventaire existent au catalogue LEGO, avec sources datées. La scène emploie des pièces réelles et une ficelle LEGO de 50 cm, réf. catalogue x77ac50. Les marquages SNCF, KIROW et 150 t sont des graphismes personnalisés. Les interfaces, les mouvements, la longueur utile du câble et la stabilité restent à valider sur prototype : ce modèle numérique ne certifie pas une grue fonctionnelle.';
