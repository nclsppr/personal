import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PIECES, ALL_CATALOG, COLORS, STEPS, GROUPS } from './blueprint';
import { createGeometryLibrary, LDRAW_GEOMETRY, type GeometryEntry, type PartDefinition } from './geometry';
import { createEnvironment } from './environment';

type Triple = [number, number, number];
export type Piece = { id: number; part: string; color: string; position: Triple; rotation?: Triple; group: string; step: number; ldrawOrigin?: boolean };
export type GroupDefinition = { id: string; parent?: string; position: Triple; rotation?: Triple; motion?: 'slew' | 'boom' | 'extension' | 'outrigger' | 'hook'; axis?: Triple; travel?: number; side?: number; keepVertical?: boolean; transportOnly?: boolean; transportPosition?: Triple; transportAfterStep?: number };
export type SceneSettings = { elevation: number; slew: number; extension: number; outriggers: number; hook: number; explode: number; night: boolean; auto: boolean; step: number; mode: 'working' | 'transport' };
export const INITIAL: SceneSettings = { elevation: 12, slew: 0, extension: 35, outriggers: 100, hook: 12, explode: 0, night: false, auto: false, step: STEPS.length, mode: 'working' };
export type SceneStats = {
  pieceCount: number; visiblePieceCount: number; batchCount: number; geometryCount: number;
  drawCalls: number; triangles: number; instanceCount: number; rendered: boolean;
  settings: SceneSettings; pose: SceneSettings; bounds: { min: Triple; max: Triple } | null;
  actuator: { length: number; extensionStuds: number; withinTravel: boolean; base: Triple; end: Triple } | null;
};
export type SceneAPI = {
  apply: (settings: Partial<SceneSettings>) => void;
  setView: (name: string) => void;
  capture: (mimeType?: 'image/png' | 'image/jpeg', quality?: number) => string;
  exportLDraw: () => string;
  getStats: () => SceneStats;
  dispose: () => void;
  update: (settings: Partial<SceneSettings>) => void;
  view: (name: string) => void;
  snapshot: () => string;
  ldrawText: () => string;
  getTransforms: () => { id: number; group: string; matrix: number[] }[];
};
export type SceneOptions = { onStatus?: (message: string) => void; onReady?: (api: SceneAPI) => void };
type Palette = Record<string, { hex: string; ldraw: number }>;
type Batch = { pieces: Piece[]; entry: GeometryEntry; meshes: T.InstancedMesh[]; visibleCount: number };
const ONE = new T.Vector3(1, 1, 1);

export function createGroupHierarchy(definitions: GroupDefinition[], parent: T.Object3D) {
  const groups = new Map<string, T.Group>();
  const ordered: GroupDefinition[] = [];
  const definitionsById = new Map(definitions.map(definition => [definition.id, definition]));
  if (definitionsById.size !== definitions.length) throw new Error('Duplicate assembly group identifier');
  const visiting = new Set<string>();
  function add(definition: GroupDefinition) {
    if (groups.has(definition.id)) return;
    if (visiting.has(definition.id)) throw new Error(`Cyclic assembly group: ${definition.id}`);
    visiting.add(definition.id);
    let groupParent: T.Object3D = parent;
    if (definition.parent) {
      const ancestor = definitionsById.get(definition.parent);
      if (!ancestor) throw new Error(`Missing parent group: ${definition.parent}`);
      add(ancestor);
      groupParent = groups.get(definition.parent)!;
    }
    const group = new T.Group();
    group.name = definition.id;
    group.position.fromArray(definition.position);
    group.rotation.set(...definition.rotation || [0, 0, 0]);
    groupParent.add(group);
    groups.set(definition.id, group);
    ordered.push(definition);
    visiting.delete(definition.id);
  }
  definitions.forEach(add);
  return { groups, ordered };
}

export function resolvedSettings(settings: SceneSettings): SceneSettings {
  return settings.mode === 'transport' ? { ...settings, elevation: 0, slew: 0, extension: 0, outriggers: 0, hook: 6 } : settings;
}

export function applyGroupPose(ordered: GroupDefinition[], groups: Map<string, T.Group>, input: SceneSettings) {
  const settings = resolvedSettings(input);
  for (const definition of ordered) {
    const group = groups.get(definition.id)!;
    group.visible = !definition.transportOnly || settings.mode === 'transport';
    group.position.fromArray(settings.mode === 'transport' && definition.transportPosition && settings.step >= (definition.transportAfterStep || 0) ? definition.transportPosition : definition.position);
    group.rotation.set(...definition.rotation || [0, 0, 0]);
    if (definition.motion === 'slew') group.rotation.y += T.MathUtils.degToRad(settings.slew);
    if (definition.motion === 'boom') group.rotation.z += T.MathUtils.degToRad(settings.elevation);
    if (definition.motion === 'extension') group.position.x += settings.extension / 100 * (definition.travel || 0);
    if (definition.motion === 'outrigger') group.position.addScaledVector(new T.Vector3(...definition.axis || [0, 0, definition.side || 1]), settings.outriggers / 100 * (definition.travel || 0));
    if (definition.motion === 'hook') {
      const parent = group.parent!;
      parent.updateWorldMatrix(true, false);
      const anchor = new T.Vector3(...definition.position).applyMatrix4(parent.matrixWorld);
      anchor.y -= settings.hook;
      group.position.copy(parent.worldToLocal(anchor));
      // A suspended hook stays vertical in world space while following the turret yaw.
      const parentRotation = parent.getWorldQuaternion(new T.Quaternion());
      const yaw = new T.Euler().setFromQuaternion(parentRotation, 'YXZ').y + (definition.rotation?.[1] || 0);
      const worldRotation = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), yaw);
      group.quaternion.copy(parentRotation.invert().multiply(worldRotation));
    }
    group.updateWorldMatrix(false, false);
  }
}

export function pieceMatrix(piece: Piece, entry: GeometryEntry, explode = 0) {
  const position = new T.Vector3(...piece.position);
  const rotation = new T.Quaternion().setFromEuler(new T.Euler(...piece.rotation || [0, 0, 0]));
  if (piece.ldrawOrigin) position.add(entry.offset.clone().applyQuaternion(rotation));
  if (explode > 0) {
    const factor = explode / 100;
    const angle = (piece.id * 2.399963229728653) % (Math.PI * 2);
    position.x += (piece.position[0] * .11 + Math.cos(angle) * 2.2) * factor;
    position.y += (3 + piece.step * .35 + Math.abs(piece.position[1]) * .15) * factor;
    position.z += (piece.position[2] * .28 + Math.sin(angle) * 2.2) * factor;
  }
  return new T.Matrix4().compose(position, rotation, ONE);
}

// Shared by rendering, export and the assembly audit, so tests inspect the actual pose.
export function actuatorTransform(piece: Piece, entry: GeometryEntry, groups: Map<string, T.Group>) {
  const turret = groups.get('turret'), boom = groups.get('boom'), parent = groups.get(piece.group);
  if (!turret || !boom || !parent) throw new Error('Articulated actuator groups are missing');
  const pins = (PIECES as Piece[]).filter(candidate => candidate.part === 'pin2780' && candidate.ldrawOrigin);
  const basePins = pins.filter(pin => pin.group === piece.group && pin.position.every((value, axis) => Math.abs(value - piece.position[axis]) < .0001));
  const endPins = pins.filter(pin => pin.group === 'boom' && Math.abs(pin.position[2] - piece.position[2]) < .0001);
  if (basePins.length !== 1 || endPins.length !== 1) throw new Error(`Actuator ${piece.id} needs one unambiguous catalogue pin at each anchor`);
  const base = turret.localToWorld(new T.Vector3(...basePins[0].position));
  const end = boom.localToWorld(new T.Vector3(...endPins[0].position));
  const direction = end.clone().sub(base), length = direction.length();
  const extensionStuds = T.MathUtils.clamp(length - 12.5, 0, 8);
  const rotation = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), direction.normalize());
  const position = base.clone().add(entry.offset.clone().applyQuaternion(rotation));
  const world = new T.Matrix4().compose(position, rotation, ONE);
  const matrix = parent.matrixWorld.clone().invert().multiply(world);
  return { matrix, length, extensionStuds, withinTravel: length >= 12.5 - .0001 && length <= 20.5 + .0001, base: base.toArray() as Triple, end: end.toArray() as Triple };
}

export function createScene(host: HTMLElement, options: SceneOptions | ((message: string) => void) = {}): SceneAPI {
  const callbacks = typeof options === 'function' ? { onStatus: options } : options;
  const english = document.documentElement.lang.startsWith('en');
  const pieces = PIECES as Piece[], definitions = GROUPS as GroupDefinition[];
  const catalog = ALL_CATALOG as Record<string, PartDefinition>, palette = COLORS as Palette;
  const library = createGeometryLibrary(catalog);
  const groupIds = new Set(definitions.map(group => group.id)), pieceIds = new Set<number>();
  try {
    for (const piece of pieces) {
      if (pieceIds.has(piece.id)) throw new Error(`Duplicate piece identifier: ${piece.id}`);
      pieceIds.add(piece.id);
      if (!groupIds.has(piece.group)) throw new Error(`Missing piece group: ${piece.group}`);
      if (!palette[piece.color]) throw new Error(`Missing catalogue colour: ${piece.color}`);
      if (!piece.position.every(Number.isFinite) || !Number.isFinite(piece.step)) throw new Error(`Invalid piece position: ${piece.id}`);
      library.get(piece.part);
    }
  } catch (error) { library.dispose(); throw error; }
  let disposed = false, contextLost = false, failed = false, rendered = false, ready = false;
  let pendingTextures = 0;
  let dirty = true, frame = 0, manualCamera = false, lastView = 'hero';
  let settings = { ...INITIAL };
  const scene = new T.Scene();
  const model = new T.Group(); model.name = 'Kirow SNCF - Brick Atelier construction study'; scene.add(model);
  const { groups, ordered } = createGroupHierarchy(definitions, model);
  const transportGroups = new Set<string>();
  for (const definition of ordered) if (definition.transportOnly || (definition.parent && transportGroups.has(definition.parent))) transportGroups.add(definition.id);
  const workingLastStep = Math.max(0, ...pieces.filter(piece => !transportGroups.has(piece.group)).map(piece => piece.step));
  const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight), mobile = width < 600;
  let renderer: T.WebGLRenderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  } catch (error) {
    library.dispose();
    callbacks.onStatus?.(english ? '3D is unavailable. The preview remains available.' : 'La 3D est indisponible. L’aperçu reste disponible.');
    host.dispatchEvent(new CustomEvent('kirow-renderer-unavailable'));
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.65));
  renderer.setSize(width, height);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.style.display = 'block'; canvas.style.touchAction = 'none'; canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', english ? 'Large 3D brick model of the Kirow crane. Drag to orbit, pinch or scroll to zoom.' : 'Grande maquette 3D de la grue Kirow en briques. Faites glisser pour tourner, pincez ou utilisez la molette pour zoomer.');
  canvas.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight + -');
  canvas.title = english ? 'Arrows: pan. Shift + arrows: orbit. + / -: zoom.' : 'Flèches : déplacer. Maj + flèches : tourner. + / - : zoomer.';
  host.appendChild(canvas);
  const camera = new T.PerspectiveCamera(34, width / height, .2, 4000);
  camera.position.set(160, 80, 190);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .085;
  controls.minDistance = 24; controls.maxDistance = 650; controls.maxPolarAngle = Math.PI * .49;
  controls.autoRotateSpeed = .45; controls.target.set(4, 15, 0); controls.listenToKeyEvents(canvas);
  const startInteraction = () => { manualCamera = true; };
  const changedCamera = () => { dirty = true; };
  controls.addEventListener('start', startInteraction); controls.addEventListener('change', changedCamera);
  const zoomKey = (event: KeyboardEvent) => {
    if (!['+', '=', '-', '_'].includes(event.key)) return;
    event.preventDefault(); manualCamera = true;
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(T.MathUtils.clamp(offset.length() * (['+', '='].includes(event.key) ? .9 : 1.1), controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset); controls.update(); dirty = true;
  };
  canvas.addEventListener('keydown', zoomKey);
  const materials = new Map<string, T.MeshPhysicalMaterial>();
  function material(color: string, sourceColor = '16') {
    const key = sourceColor === '16' ? color : `ldraw:${sourceColor}`;
    const cached = materials.get(key);
    if (cached) return cached;
    const fixed: Record<string, string> = { '0': '#252824', '1': '#0055bf', '4': '#bc183b', '14': '#f4c428', '15': '#f2f1e8', '25': '#f58624', '71': '#a8aaa3', '72': '#535650', '383': '#b9bebc', '493': '#a0a5a9', '494': '#b9bebc' };
    const matching = sourceColor === '16' ? palette[color] : Object.values(palette).find(entry => entry.ldraw === Number(sourceColor));
    const hex = matching?.hex || fixed[sourceColor];
    if (!hex) throw new Error(`Unknown fixed LDraw surface colour: ${sourceColor}`);
    const glass = sourceColor === '16' && /glass|clear|trans/i.test(color);
    const metal = /metal|chrome/i.test(color) || ['383', '493', '494'].includes(sourceColor);
    const mat = new T.MeshPhysicalMaterial({ color: hex, roughness: metal ? .2 : .255, metalness: metal ? .9 : 0, clearcoat: .28, clearcoatRoughness: .19, ior: 1.46, envMapIntensity: 1 });
    if (glass) { mat.transparent = true; mat.opacity = .36; mat.roughness = .12; mat.depthWrite = false; }
    if (sourceColor === '16' && color === 'amber') { mat.transparent = true; mat.opacity = .78; }
    materials.set(key, mat);
    return mat;
  }
  const batches: Batch[] = [], byBatch = new Map<string, Piece[]>();
  for (const piece of pieces) {
    const key = [piece.group, piece.part, piece.color].join(':');
    if (!byBatch.has(key)) byBatch.set(key, []);
    byBatch.get(key)!.push(piece);
  }
  for (const list of byBatch.values()) {
    list.sort((a, b) => a.step - b.step || a.id - b.id);
    const first = list[0], entry = library.get(first.part);
    const meshes = entry.layers.map(layer => {
      const mat = material(first.color, layer.color);
      const mesh = new T.InstancedMesh(layer.geometry, mat, list.length);
      mesh.name = `${first.group}:${first.part}:${first.color}:${layer.color}`;
      mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      mesh.castShadow = !mat.transparent; mesh.receiveShadow = true;
      groups.get(first.group)!.add(mesh);
      return mesh;
    });
    batches.push({ pieces: list, entry, meshes, visibleCount: 0 });
  }
  // Two cable strands are a non-inventoried visual connection, not a claimed cord part.
  const cableMaterial = new T.LineBasicMaterial({ color: '#252824' });
  const cables = ordered.filter(group => group.motion === 'hook').map(definition => {
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(12), 3));
    const line = new T.LineSegments(geometry, cableMaterial);
    line.name = 'Display aid: two cable strands, excluded from inventory'; line.frustumCulled = false; scene.add(line);
    const steps = pieces.filter(piece => piece.group === definition.id).map(piece => piece.step);
    return { definition, line, step: steps.length ? Math.min(...steps) : STEPS.length };
  });
  const decals: T.Mesh<T.BufferGeometry, T.MeshPhysicalMaterial>[] = [];
  const decalTextures = new Set<T.Texture>();
  function decal(groupId: string, text: string, width: number, height: number, position: Triple, rotation: Triple, background?: string, pattern?: 'stripes' | 'chevrons') {
    const group = groups.get(groupId);
    if (!group) return null;
    const image = document.createElement('canvas'); image.width = Math.max(128, Math.round(width * 80)); image.height = Math.max(128, Math.round(height * 80));
    const context = image.getContext('2d');
    if (!context) return null;
    if (background || pattern) { context.fillStyle = background || palette.yellow.hex; context.fillRect(0, 0, image.width, image.height); }
    context.fillStyle = '#252824';
    if (pattern) {
      const w = image.width, h = image.height, stripe = Math.max(24, Math.min(w, h) * .24);
      if (pattern === 'stripes') for (let x = -h; x < w + h; x += stripe * 2) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x + stripe, 0); context.lineTo(x + stripe + h, h); context.lineTo(x + h, h); context.closePath(); context.fill();
      }
      else for (let y = -w; y < h + w; y += stripe * 2) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(w / 2, y + w / 2); context.lineTo(w, y); context.lineTo(w, y + stripe); context.lineTo(w / 2, y + w / 2 + stripe); context.lineTo(0, y + stripe); context.closePath(); context.fill();
      }
    } else {
      context.font = `700 ${Math.round(image.height * .7)}px Arial`; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, image.width / 2, image.height * .53, image.width * .93);
    }
    const texture = new T.CanvasTexture(image); texture.colorSpace = T.SRGBColorSpace; decalTextures.add(texture);
    const material = new T.MeshPhysicalMaterial({ map: texture, transparent: true, alphaTest: .015, roughness: .3, clearcoat: .22, polygonOffset: true, polygonOffsetFactor: -1, depthWrite: false });
    const mesh = new T.Mesh(new T.PlaneGeometry(width, height), material);
    mesh.name = `Custom graphic, not an official printed part: ${text}`;
    mesh.position.fromArray(position); mesh.rotation.set(...rotation); group.add(mesh); decals.push(mesh);
    return mesh;
  }
  const sncfDecals = [-1, 1].flatMap(side => [
    decal('turret', 'SNCF', 6, 2, [-16, 5.3, side * 7.05], [0, side < 0 ? Math.PI : 0, 0]),
    decal('boom', 'SNCF', 7.2, 2.4, [18, 3, side * 4.035], [0, side < 0 ? Math.PI : 0, 0]),
  ]).filter(Boolean) as T.Mesh<T.BufferGeometry, T.MeshPhysicalMaterial>[];
  for (const side of [-1, 1]) {
    decal('boom', 'KIROW', 3.8, 1, [5, 3, side * 4.035], [0, side < 0 ? Math.PI : 0, 0]);
    // Stickers follow existing solid faces and remain outside the parts inventory.
    decal('inner', 'Boom-head warning stripes', 3.9, 1.2, [44, -.4, side * 3.035], [0, side < 0 ? Math.PI : 0, 0], undefined, 'stripes');
    decal('counterweight', 'Counterweight warning chevrons', 2.4, 9.6, [-38.035, 5.6, side * 6.5], [0, -Math.PI / 2, 0], undefined, 'chevrons');
  }
  decal('counterweight', '150 t', 6.5, 2.4, [-38.04, 5.6, 0], [0, -Math.PI / 2, 0], palette.yellow.hex);
  for (const definition of ordered.filter(group => group.motion === 'outrigger')) {
    const side = Math.sign(definition.axis?.[2] || definition.position[2]);
    const footGroup = groups.has(`${definition.id}-foot`) ? `${definition.id}-foot` : definition.id;
    const warning = decal(footGroup, 'Stabilizer warning chevrons', 1.5, 5.3, [0, 4, side * 3], [0, 0, 0], undefined, 'chevrons');
    if (warning) {
      // A curved decal hugs the cylindrical column rather than spanning free space.
      warning.geometry.dispose();
      warning.geometry = new T.CylinderGeometry(.986, .986, 5.3, 20, 1, true, (side < 0 ? Math.PI : 0) - .76, 1.52);
    }
  }
  if (sncfDecals.length) {
    pendingTextures++;
    const texture = new T.TextureLoader().load('/kirow/assets/sncf.svg', loaded => {
      pendingTextures--;
      if (disposed) { loaded.dispose(); return; }
      loaded.colorSpace = T.SRGBColorSpace; loaded.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      for (const mesh of sncfDecals) { mesh.material.map = loaded; mesh.material.needsUpdate = true; }
      dirty = true;
    }, undefined, () => { pendingTextures--; dirty = true; });
    decalTextures.add(texture);
  }
  const environment = createEnvironment(scene, renderer, mobile);
  const visibleGroups = new Set<string>();
  const actuatorPieces = pieces.filter(piece => piece.part === 'actuatorLong40918');
  const mechanismMatrices = new Map<number, T.Matrix4>();
  let actuatorState: SceneStats['actuator'] = null;
  const actuatorEntry = actuatorPieces.length ? library.get('actuatorLong40918') : null;
  const closedActuator = LDRAW_GEOMETRY['40918-f1'], openActuator = LDRAW_GEOMETRY['40918-f2'];
  const actuatorLayers = actuatorEntry?.layers.map(layer => {
    const closed = closedActuator.groups[layer.color], open = openActuator.groups[layer.color];
    if (!open || closed.length !== open.length) throw new Error('Actuator poses have incompatible topology');
    const translatedVertices = new Set<number>();
    for (let i = 0; i < closed.length; i += 3) {
      const delta = [0, 1, 2].map(axis => open[i + axis] + openActuator.offset[axis] - closed[i + axis] - closedActuator.offset[axis]);
      if (Math.abs(delta[0]) > .0001 || Math.abs(delta[1]) > .0001 || Math.min(Math.abs(delta[2]), Math.abs(delta[2] - 8)) > .0001) throw new Error('Actuator motion would deform a real component');
      if (delta[2] > 4) translatedVertices.add(i + 2);
    }
    return { geometry: layer.geometry, closed, translatedVertices };
  }) || [];
  function updateActuators() {
    if (!actuatorPieces.length) return;
    let extension = 0;
    for (const piece of actuatorPieces) {
      const { matrix, ...state } = actuatorTransform(piece, actuatorEntry!, groups);
      extension = state.extensionStuds;
      mechanismMatrices.set(piece.id, matrix);
      actuatorState = state;
    }
    // Only the rod's original vertices translate. Housing, caps and every component retain their size.
    for (const layer of actuatorLayers) {
      const positions = layer.geometry.getAttribute('position') as T.BufferAttribute;
      for (const index of layer.translatedVertices) positions.array[index] = layer.closed[index] + extension;
      positions.needsUpdate = true; layer.geometry.computeBoundingBox(); layer.geometry.computeBoundingSphere();
    }
  }
  function displayedMatrix(piece: Piece, entry: GeometryEntry, explode = settings.explode) {
    const articulated = mechanismMatrices.get(piece.id);
    if (!articulated) return pieceMatrix(piece, entry, explode);
    const result = articulated.clone();
    if (explode > 0) {
      const offset = new T.Vector3().setFromMatrixPosition(pieceMatrix(piece, entry, explode)).sub(new T.Vector3().setFromMatrixPosition(pieceMatrix(piece, entry, 0)));
      result.elements[12] += offset.x; result.elements[13] += offset.y; result.elements[14] += offset.z;
    }
    return result;
  }
  function rebuildInstances(onlyMechanisms = false) {
    for (const batch of batches) {
      if (onlyMechanisms && batch.pieces[0].part !== 'actuatorLong40918') continue;
      batch.visibleCount = batch.pieces.findIndex(piece => piece.step > settings.step);
      if (batch.visibleCount < 0) batch.visibleCount = batch.pieces.length;
      for (let i = 0; i < batch.visibleCount; i++) {
        const matrix = displayedMatrix(batch.pieces[i], batch.entry);
        for (const mesh of batch.meshes) mesh.setMatrixAt(i, matrix);
      }
      for (const mesh of batch.meshes) {
        mesh.count = batch.visibleCount; mesh.visible = batch.visibleCount > 0; mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingBox(); mesh.computeBoundingSphere();
      }
    }
  }
  function pose(rebuild: boolean) {
    applyGroupPose(ordered, groups, settings);
    visibleGroups.clear();
    for (const definition of ordered) {
      const group = groups.get(definition.id)!;
      if (group.visible && (!definition.parent || visibleGroups.has(definition.parent))) visibleGroups.add(definition.id);
    }
    updateActuators();
    rebuildInstances(!rebuild);
    scene.updateMatrixWorld(true);
    for (const cable of cables) {
      const group = groups.get(cable.definition.id)!, parent = group.parent!;
      const start = new T.Vector3(...cable.definition.position).applyMatrix4(parent.matrixWorld);
      const end = group.getWorldPosition(new T.Vector3());
      const side = new T.Vector3(0, 0, .34).applyQuaternion(group.getWorldQuaternion(new T.Quaternion()));
      const positions = cable.line.geometry.getAttribute('position') as T.BufferAttribute;
      for (let i = 0; i < 2; i++) {
        const sign = i === 0 ? -1 : 1, a = start.clone().addScaledVector(side, sign), b = end.clone().addScaledVector(side, sign);
        positions.setXYZ(i * 2, a.x, a.y, a.z); positions.setXYZ(i * 2 + 1, b.x, b.y, b.z);
      }
      positions.needsUpdate = true;
      cable.line.visible = settings.explode === 0 && settings.step >= cable.step && visibleGroups.has(cable.definition.id);
    }
    for (const decal of decals) decal.visible = settings.explode === 0 && settings.step >= workingLastStep;
    renderer.shadowMap.needsUpdate = true; dirty = true;
  }
  function modelBounds() {
    scene.updateMatrixWorld(true);
    const bounds = new T.Box3();
    for (const batch of batches) if (visibleGroups.has(batch.pieces[0].group)) for (const mesh of batch.meshes) if (mesh.visible && mesh.count > 0 && mesh.boundingBox) bounds.union(mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
    return bounds;
  }
  const viewDirections: Record<string, Triple> = { hero: [1.1, .4, 1.5], side: [.03, .18, 1], front: [1, .23, .03], top: [.001, 1, .001], detail: [.7, .35, 1], bogies: [.6, .24, 1], boom: [.3, .3, 1] };
  function frameModel(name = lastView) {
    lastView = name;
    const direction = new T.Vector3(...viewDirections[name] || viewDirections.hero).normalize();
    const bounds = modelBounds();
    if (bounds.isEmpty()) return;
    const target = bounds.getCenter(new T.Vector3());
    if (name === 'bogies') {
      target.set(28.5, 6, 0);
      controls.target.copy(target); camera.position.copy(target).addScaledVector(direction, Math.max(80, 80 / camera.aspect)); controls.update(); dirty = true; return;
    }
    if (name === 'boom') {
      const boom = groups.get('boom');
      if (boom) target.copy(boom.localToWorld(new T.Vector3(18, 1.2, 0)));
      controls.target.copy(target); camera.position.copy(target).addScaledVector(direction, Math.max(90, 85 / camera.aspect)); controls.update(); dirty = true; return;
    }
    if (name === 'detail') {
      const cab = [...groups.entries()].find(([id]) => /cab/i.test(id));
      if (cab) cab[1].getWorldPosition(target);
      controls.target.copy(target); camera.position.copy(target).addScaledVector(direction, 75); controls.update(); dirty = true; return;
    }
    const right = new T.Vector3().crossVectors(camera.up, direction).normalize();
    const up = new T.Vector3().crossVectors(direction, right).normalize();
    const tanY = Math.tan(T.MathUtils.degToRad(camera.fov) / 2), tanX = tanY * camera.aspect;
    let distance = controls.minDistance;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const offset = new T.Vector3(x, y, z).sub(target), depth = offset.dot(direction);
      distance = Math.max(distance, depth + Math.abs(offset.dot(right)) / tanX, depth + Math.abs(offset.dot(up)) / tanY);
    }
    controls.maxDistance = Math.max(650, distance * 2.5);
    controls.target.copy(target); camera.position.copy(target).addScaledVector(direction, distance * 1.09); controls.update(); dirty = true;
  }
  function unavailable() {
    if (failed || disposed) return;
    failed = true;
    callbacks.onStatus?.(english ? '3D is unavailable. The model preview remains available.' : 'La 3D est indisponible. L’aperçu du modèle reste disponible.');
    host.dispatchEvent(new CustomEvent('kirow-renderer-unavailable'));
  }
  const contextLostListener = (event: Event) => { event.preventDefault(); contextLost = true; unavailable(); };
  const contextRestoredListener = () => {
    if (disposed) return;
    contextLost = false; failed = false; renderer.shadowMap.needsUpdate = true; dirty = true;
    host.dispatchEvent(new CustomEvent('kirow-renderer-restored'));
  };
  canvas.addEventListener('webglcontextlost', contextLostListener);
  canvas.addEventListener('webglcontextrestored', contextRestoredListener);
  renderer.debug.onShaderError = unavailable;
  function render() {
    if (disposed || contextLost || failed) return false;
    try {
      renderer.render(scene, camera);
      if (failed) return false;
      dirty = false; rendered = true;
      if (!ready && pendingTextures === 0) {
        ready = true;
        callbacks.onStatus?.(english ? 'Large model · real-time rendering' : 'Grande maquette · rendu temps réel');
        queueMicrotask(() => { if (!disposed && !failed) callbacks.onReady?.(api); });
      }
      return true;
    } catch { unavailable(); return false; }
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function animate() {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    if (document.hidden || contextLost || failed) return;
    controls.autoRotate = settings.auto && !reducedMotion.matches;
    controls.update();
    if (dirty || controls.autoRotate) render();
  }
  const resize = new ResizeObserver(() => {
    if (disposed || contextLost) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    if (!manualCamera) frameModel();
    dirty = true;
  });
  resize.observe(host);
  function apply(next: Partial<SceneSettings>) {
    if (disposed) return;
    const previous = settings, updated = { ...settings, ...next };
    for (const key of ['elevation', 'slew', 'extension', 'outriggers', 'hook', 'explode', 'step'] as const) if (!Number.isFinite(updated[key])) updated[key] = previous[key];
    updated.elevation = T.MathUtils.clamp(updated.elevation, 0, 75);
    updated.extension = T.MathUtils.clamp(updated.extension, 0, 100); updated.outriggers = T.MathUtils.clamp(updated.outriggers, 0, 100);
    updated.hook = T.MathUtils.clamp(updated.hook, 0, 100); updated.explode = T.MathUtils.clamp(updated.explode, 0, 100);
    updated.step = Math.round(T.MathUtils.clamp(updated.step, 0, STEPS.length));
    updated.night = Boolean(updated.night); updated.auto = Boolean(updated.auto);
    updated.mode = updated.mode === 'transport' ? 'transport' : 'working';
    settings = updated;
    if (settings.night !== previous.night) { environment.apply(settings.night); dirty = true; }
    const rebuilt = settings.explode !== previous.explode || settings.step !== previous.step;
    if (settings.mode !== previous.mode) manualCamera = false;
    if (rebuilt || settings.mode !== previous.mode || ['elevation', 'slew', 'extension', 'outriggers', 'hook'].some(key => settings[key as keyof SceneSettings] !== previous[key as keyof SceneSettings])) {
      pose(rebuilt); if (!manualCamera) frameModel();
    }
    dirty = true;
  }
  function setView(name: string) { if (!disposed) { manualCamera = false; frameModel(name); } }
  function capture(mimeType: 'image/png' | 'image/jpeg' = 'image/png', quality = .92) {
    if (!render()) throw new Error('3D renderer unavailable');
    return canvas.toDataURL(mimeType, quality);
  }
  function exportLDraw() {
    if (disposed) throw new Error('3D scene disposed');
    scene.updateMatrixWorld(true);
    const reflection = new T.Matrix4().makeScale(1, -1, 1), number = (value: number) => Number(value.toFixed(5));
    const lines = ['0 FILE kirow-large.ldr', '0 Kirow SNCF - Large brick construction study', '0 Name: kirow-large.ldr', '0 Author: Nicolas Pieper / Brick Atelier', '0 // Independent digital interpretation. Connections and stability require validation.', '0 // Real catalogue parts at their original size. Custom markings are not official printed parts.', '0 // Sky, terrain and visual cable strands are excluded from the inventory and export.'];
    const sorted = [...pieces].sort((a, b) => a.step - b.step || a.id - b.id);
    let step = sorted[0]?.step;
    for (const piece of sorted) {
      if (piece.step !== step) { lines.push('0 STEP'); step = piece.step; }
      const entry = library.get(piece.part);
      // Undo the importer bottom-centre offset in the piece's rotated frame.
      const world = groups.get(piece.group)!.matrixWorld.clone().multiply(displayedMatrix(piece, entry, 0)).multiply(new T.Matrix4().makeTranslation(-entry.offset.x, -entry.offset.y, -entry.offset.z));
      const matrix = reflection.clone().multiply(world).multiply(reflection).elements;
      const rotation = [matrix[0], matrix[4], matrix[8], matrix[1], matrix[5], matrix[9], matrix[2], matrix[6], matrix[10]].map(number).join(' ');
      lines.push(`1 ${palette[piece.color].ldraw} ${number(matrix[12] * 20)} ${number(matrix[13] * 20)} ${number(matrix[14] * 20)} ${rotation} ${piece.part === 'actuatorLong40918' ? 'kirow-large-actuator.ldr' : entry.file}`);
    }
    lines.push('0 STEP');
    if (actuatorState) lines.push('0 FILE kirow-large-actuator.ldr', '0 Real components of catalogue assembly 40918c01 at the displayed extension', '0 // Derived from the official LDraw parts, CC BY 4.0. No component is stretched.', '1 4 0 0 0 0 1 0 -1 0 0 0 0 1 47157.dat', '1 16 0 0 0 1 0 0 0 1 0 0 0 1 u9487c01.dat', `1 72 0 0 ${number(250 + actuatorState.extensionStuds * 20)} 1 0 0 0 1 0 0 0 1 62274c02.dat`);
    return lines.join('\n') + '\n';
  }
  function getStats(): SceneStats {
    if (dirty && !disposed) render();
    const bounds = modelBounds();
    return { pieceCount: pieces.length, visiblePieceCount: batches.reduce((sum, batch) => sum + (visibleGroups.has(batch.pieces[0].group) ? batch.visibleCount : 0), 0), batchCount: batches.length, geometryCount: library.size, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, instanceCount: batches.reduce((sum, batch) => sum + (visibleGroups.has(batch.pieces[0].group) ? batch.meshes.reduce((count, mesh) => count + mesh.count, 0) : 0), 0), rendered, settings: { ...settings }, pose: { ...resolvedSettings(settings) }, bounds: bounds.isEmpty() ? null : { min: bounds.min.toArray() as Triple, max: bounds.max.toArray() as Triple }, actuator: actuatorState ? { ...actuatorState } : null };
  }
  function getTransforms() {
    scene.updateMatrixWorld(true);
    return pieces.map(piece => ({ id: piece.id, group: piece.group, matrix: groups.get(piece.group)!.matrixWorld.clone().multiply(displayedMatrix(piece, library.get(piece.part))).toArray() }));
  }
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); resize.disconnect();
    canvas.removeEventListener('keydown', zoomKey); canvas.removeEventListener('webglcontextlost', contextLostListener); canvas.removeEventListener('webglcontextrestored', contextRestoredListener);
    controls.removeEventListener('start', startInteraction); controls.removeEventListener('change', changedCamera); controls.dispose();
    for (const batch of batches) for (const mesh of batch.meshes) mesh.dispose();
    for (const cable of cables) cable.line.geometry.dispose(); cableMaterial.dispose();
    for (const decal of decals) { decal.geometry.dispose(); decal.material.dispose(); }
    for (const texture of decalTextures) texture.dispose();
    for (const mat of materials.values()) mat.dispose();
    environment.dispose(); library.dispose(); renderer.dispose(); canvas.remove(); scene.clear();
  }
  const api: SceneAPI = { apply, setView, capture, exportLDraw, getStats, dispose, getTransforms, update: apply, view: setView, snapshot: () => capture('image/jpeg', .92), ldrawText: exportLDraw };
  pose(true); frameModel(); render(); animate();
  return api;
}
