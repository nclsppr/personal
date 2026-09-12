// Companion wagons use the shared, passed-in catalogue to avoid a blueprint cycle.
// Dimensions are in studs. No part is resized to fill a deck or support.
type Vec3 = [number, number, number];
type Catalog = Record<string, { l: number; w: number; h: number }>;
export type TransportPiece = {
  part: string; color: string; position: Vec3; rotation?: Vec3;
  group: string; step: number;
};
export type TransportGroup = {
  id: string; parent: 'root'; position: Vec3; transportOnly: true;
};
export type TransportStep = {
  title: string; titleEn: string; description: string; descriptionEn: string;
};

export function createTransport(catalog: Catalog): {
  pieces: TransportPiece[]; groups: TransportGroup[]; steps: TransportStep[];
} {
  const pieces: TransportPiece[] = [];
  const groups: TransportGroup[] = [
    { id: 'transport-track', parent: 'root', position: [0, 0, 0], transportOnly: true },
    { id: 'transport-front', parent: 'root', position: [72, 0, 0], transportOnly: true },
    { id: 'transport-rear', parent: 'root', position: [-72, 0, 0], transportOnly: true },
  ];
  const steps: TransportStep[] = [];
  let group = 'transport-track';
  const quarter = Math.PI / 2;
  const rotated: Vec3 = [0, quarter, 0];

  function stage(title: string, titleEn: string, description: string, descriptionEn: string) {
    steps.push({ title, titleEn, description, descriptionEn });
  }
  function put(part: string, color: string, x: number, y: number, z: number, rotation?: Vec3) {
    if (!catalog[part]) throw new Error('Missing transport catalogue part: ' + part);
    if (!steps.length) throw new Error('Transport piece has no assembly step');
    const position = [x, y, z].map(value => Math.round(value * 100000) / 100000) as Vec3;
    pieces.push({ part, color, position, group, step: steps.length, ...(rotation ? { rotation: [...rotation] as Vec3 } : {}) });
  }

  const trackStations = Array.from({ length: 12 }, (_, index) => 58 + index * 4)
    .flatMap(x => [-x, x]).sort((a, b) => a - b);
  stage('Convoi : traverses supplémentaires', 'Convoy: extra sleepers',
    'Prolongez la voie existante de chaque côté, jusqu’à 104 tenons du centre. Les traverses sont des plaques LEGO à leur taille réelle.',
    'Extend both ends of the existing track to 104 studs from the centre. Sleepers use actual-size LEGO plates.');
  for (const x of trackStations) for (const z of [-4, 0, 4]) put('p24', 'black', x, 0, z, rotated);
  stage('Convoi : assises des rails', 'Convoy: rail beds',
    'Deux files de plaques soutiennent les surfaces de roulement, dans l’alignement de la voie centrale.',
    'Two rows of plates support the running surfaces, aligned with the central track.');
  for (const x of trackStations) for (const z of [-4.5, 4.5]) put('p14', 'black', x, .4, z);
  stage('Convoi : surfaces de roulement', 'Convoy: running surfaces',
    'Recouvrez les assises de tuiles. Cette voie de présentation ne constitue pas un système ferroviaire éprouvé.',
    'Cover the rail beds with tiles. This display track is not a tested railway system.');
  for (const x of trackStations) for (const z of [-4.5, 4.5]) put('t14', 'dark', x, .8, z);
  stage('Convoi : fixations de voie', 'Convoy: track fastenings',
    'Ajoutez les clips de part et d’autre des rails, en reprenant les stations de la voie centrale.',
    'Add clips on both sides of the rails, continuing the central track pattern.');
  for (const x of trackStations) for (const z of [-5.5, 5.5]) put('clip11', 'black', x, .4, z);

  for (const wagon of [
    { id: 'transport-front', fr: 'Wagon porte-flèche', en: 'Boom-support wagon' },
    { id: 'transport-rear', fr: 'Wagon porte-contrepoids', en: 'Counterweight wagon' },
  ]) {
    group = wagon.id;
    const localStage = (fr: string, en: string, description: string, descriptionEn: string) =>
      stage(wagon.fr + ' : ' + fr, wagon.en + ': ' + en, description, descriptionEn);
    const truckCenters = [-14, 14];
    const axles = truckCenters.flatMap(center => [center - 3.5, center + 3.5]);

    localStage('roues et axes', 'wheels and axles',
      'Chaque wagon comporte deux bogies de deux essieux. Les roues 56908 gardent leur diamètre de 43,2 mm ; les axes 16L sont orientés dans la largeur.',
      'Each wagon has two two-axle bogies. Wheels 56908 retain their 43.2 mm diameter; 16L axles run across the wagon.');
    for (const x of axles) {
      // The axle mesh is bottom-centred: Y 3.6 places its centre at Y 3.9.
      put('axle16', 'black', x, 3.6, 0, rotated);
      for (const side of [-1, 1]) put('wheel56908', 'black', x, 1.2, side * 5.3);
    }
    localStage('flasques et bagues', 'flanges and bushes',
      'Les plaques rondes 11213 évoquent les flasques ferroviaires. Leur fixation aux roues et le guidage restent à éprouver sur prototype.',
      'Round plates 11213 suggest railway wheel flanges. Their attachment to the wheels and rail guidance still require a physical prototype.');
    for (const x of axles) for (const side of [-1, 1]) {
      put('roundPlate11213', 'black', x, 3.9, side * 3.45 - .3, [quarter, 0, 0]);
      put('bush3713', 'gray', x, 3.45, side * 7.45);
    }
    localStage('cadres des bogies', 'bogie frames',
      'Construisez les cadres au-dessus des roues. Les longerons et traverses restent distincts du grand plateau.',
      'Build the frames above the wheels. Bogie beams and cross-members remain distinct from the main deck.');
    for (const center of truckCenters) {
      for (const z of [-6.5, 6.5]) for (const x of [center - 4, center, center + 4]) {
        put('p14', 'black', x, 6.8, z);
      }
      for (const z of [-4, 0, 4]) {
        put('p24', 'black', center, 6.8, z);
      }
    }
    localStage('longerons du plateau', 'deck beams',
      'Posez les longerons latéraux de 44 tenons et les traverses. Ils soutiennent le plateau de 14 tenons de large.',
      'Place the 44-stud side beams and cross-members. They support the 14-stud-wide deck.');
    for (let x = -20; x <= 20; x += 4) for (const z of [-6.5, 6.5]) put('b14', 'dark', x, 7.2, z);
    for (const x of [-18, -10, -2, 6, 14]) for (const z of [-4, 0, 4]) put('b24', 'black', x, 7.2, z, rotated);
    for (const x of [-21, 21]) for (const z of [-4, 0, 4]) put('b24', 'dark', x, 7.2, z, rotated);
    localStage('première couche de plancher', 'first deck layer',
      'Recouvrez le plateau de plaques 2 × 4, sans agrandir aucune pièce. La surface mesure 44 × 14 tenons.',
      'Cover the deck with 2 × 4 plates, without enlarging any part. The surface measures 44 × 14 studs.');
    for (let x = -20; x <= 20; x += 4) for (let z = -6; z <= 6; z += 2) put('p24', 'black', x, 8.4, z);
    localStage('seconde couche croisée', 'cross-bonded second layer',
      'Croisez l’orientation des plaques pour décaler les joints du plancher. La dernière bande ferme exactement les 14 tenons de largeur.',
      'Turn the plates to stagger deck joints. The final strip completes the exact 14-stud width.');
    for (let x = -21; x <= 21; x += 2) for (const z of [-5, -1, 3]) put('p24', 'dark', x, 8.8, z, rotated);
    for (let x = -20; x <= 20; x += 4) put('p24', 'dark', x, 8.8, 6);
    localStage('rives et signalisation', 'edges and markers',
      'Ajoutez les rives lisses et les petits feux d’extrémité. Les couleurs sont nommées dans l’inventaire.',
      'Add smooth deck edges and small end lights. Colors are named in the inventory.');
    for (let x = -20; x <= 20; x += 4) for (const z of [-6.5, 6.5]) put('t14', 'dark', x, 9.2, z);
    for (const x of [-21, 21]) for (const z of [-5.5, 5.5]) {
      put('p11', 'red', x, 9.2, z);
      put('lamp4073', 'white', x, 9.6, z);
    }
    localStage('tampons et attelages', 'buffers and couplers',
      'Installez les tampons en briques et les attelages aux deux extrémités. L’accouplement de tout le convoi doit être validé physiquement.',
      'Fit brick-built buffers and couplers at both ends. Coupling the full convoy requires physical validation.');
    for (const side of [-1, 1]) {
      for (const z of [-4.5, 4.5]) {
        // Round bricks form compact buffer heads; their real size stays unchanged.
        put('round22', 'black', side * 22, 7.8, z, [0, 0, -side * quarter]);
      }
      put('coupler2920', 'black', side * 23, 6.6, 0, [0, side * quarter, 0]);
      put('magnet73092', 'black', side * 24.5, 6.6, 0, [0, side * quarter, 0]);
    }
    localStage('marchepieds et mains courantes', 'access steps and handrails',
      'Ajoutez les petits marchepieds et les prises de main près des extrémités du plateau.',
      'Add small access steps and handholds near the deck ends.');
    for (const x of [-18, 18]) for (const side of [-1, 1]) {
      put('grille2412b', 'black', x, 7.6, side * 7.4);
      put('bar4', 'black', x + 1.5, 7.2, side * 7.6);
    }
  }

  group = 'transport-front';
  stage('Porte-flèche : embase du berceau', 'Boom support: cradle base',
    'Renforcez le bord du plateau tourné vers la grue. Le berceau repose sur des plaques à l’intérieur du wagon.',
    'Reinforce the deck edge facing the crane. The cradle rests on plates within the wagon.');
  for (const z of [-5, 5]) put('p44', 'yellow', -17, 9.2, z);
  stage('Porte-flèche : montants du berceau', 'Boom support: cradle uprights',
    'Deux montants jaunes portent la traverse du berceau. Leur hauteur correspond à la pose de transport de cette étude.',
    'Two yellow uprights carry the cradle beam. Their height follows this study’s transport pose.');
  for (let row = 0; row < 11; row++) for (const z of [-5, 5]) put('b22', 'yellow', -18, 9.6 + row * 1.2, z);
  stage('Porte-flèche : traverse d’appui', 'Boom support: resting beam',
    'La traverse est sur la première rangée de tenons du plateau, près de X = 53.5. Les tenons culminent vers Y = 24,2 ; l’appui de la flèche doit être essayé.',
    'The beam sits on the deck’s first stud row, near X = 53.5. Stud tops reach approximately Y = 24.2; the boom support needs physical testing.');
  // At wagon X +72, the beam spans global X 53..54; centre 53.5.
  // The body ends at 24 and its normal studs reach approximately 24.2.
  for (const z of [-4, 0, 4]) put('b14', 'dark', -18.5, 22.8, z, rotated);
  for (const z of [-5.5, 5.5]) put('b11', 'yellow', -18.5, 24, z);

  group = 'transport-rear';
  stage('Porte-contrepoids : semelles de chargement', 'Counterweight carrier: load beds',
    'Les semelles séparent le chargement jaune du plateau sombre. Leur implantation laisse les extrémités du wagon accessibles.',
    'Load beds separate the yellow load from the dark deck. Their layout keeps both wagon ends accessible.');
  for (const x of [-10, -6, -2, 2, 6, 10]) for (const z of [-4, 0, 4]) put('p44', 'yellow', x, 9.2, z);
  stage('Porte-contrepoids : masses basses', 'Counterweight carrier: lower blocks',
    'Assemblez deux masses basses, distinctes du cadre porteur. Il s’agit de volumes de la maquette, sans masse de levage revendiquée.',
    'Build two low blocks, separate from the carrier frame. These are model volumes; no lifting mass is claimed.');
  for (let row = 0; row < 3; row++) for (const x of [-8, 8]) for (const z of [-4, 0, 4]) {
    put('b24', 'yellow', x, 9.6 + row * 1.2, z);
  }
  for (const x of [-8, 8]) for (const z of [-4, 0, 4]) put('p24', 'yellow', x, 13.2, z);
  stage('Porte-contrepoids : cadre ouvert', 'Counterweight carrier: open frame',
    'Quatre montants forment un cadre ouvert au centre, inspiré du chargement visible sur la photographie de transport.',
    'Four uprights form an open central frame, inspired by the load visible in the transport photograph.');
  for (let row = 0; row < 9; row++) for (const x of [-5, 5]) for (const z of [-5, 5]) {
    put('b22', 'yellow', x, 9.6 + row * 1.2, z);
  }
  stage('Porte-contrepoids : traverses supérieures', 'Counterweight carrier: upper beams',
    'Reliez les montants avec les traverses et gardez l’ouverture centrale. Les liaisons et le maintien du chargement restent à éprouver.',
    'Join the uprights with beams while keeping the centre open. Connections and load restraint still require testing.');
  for (const z of [-5.5, 5.5]) for (const x of [-4, 0, 4]) put('b14', 'yellow', x, 20.4, z);
  for (const x of [-5.5, 5.5]) {
    for (const z of [-3, 1]) put('b14', 'yellow', x, 20.4, z, rotated);
    put('b12', 'yellow', x, 20.4, 4, rotated);
  }
  for (const z of [-5.5, 5.5]) for (const x of [-4, 0, 4]) put('t14', 'yellow', x, 21.6, z);
  stage('Porte-contrepoids : poignées et calages', 'Counterweight carrier: handles and chocks',
    'Terminez par les poignées et les calages. Les éléments de transport sont comptés séparément de la grue.',
    'Finish with handles and chocks. Transport elements are counted separately from the crane.');
  for (const x of [-10, 10]) for (const side of [-1, 1]) {
    put('bar4', 'black', x, 10.4, side * 5.2);
    put('clip11', 'black', x, 13.6, side * 5.2);
    put('slope45_2x2', 'yellow', x, 9.6, side * 1.5, [0, side * quarter, 0]);
  }

  return { pieces, groups, steps };
}
