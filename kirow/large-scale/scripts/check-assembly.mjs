#!/usr/bin/env node
/** Macro assembly checks using the renderer's unscaled part geometry and transforms.
 * This checks visible assembly regressions, not LEGO clutch, strength or buildability.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = await build({
  stdin: {
    contents: `export * as T from 'three';
      export * as blueprint from './src/blueprint';
      export * as engine from './src/scene';
      export { createGeometryLibrary, LDRAW_GEOMETRY } from './src/geometry';`,
    resolveDir: root, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const { T, blueprint, engine, createGeometryLibrary, LDRAW_GEOMETRY } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64')
);
const { PIECES, GROUPS, STEPS, ALL_CATALOG } = blueprint;
const library = createGeometryLibrary(ALL_CATALOG);
const parent = new T.Group();
const { groups, ordered } = engine.createGroupHierarchy(GROUPS, parent);
const groupById = new Map(GROUPS.map(group => [group.id, group]));
function withinGroup(id, ancestor) {
  for (let current = id; current; current = groupById.get(current)?.parent) if (current === ancestor) return true;
  return false;
}
const failures = [], checks = [];
const assert = (condition, description) => { if (!condition) failures.push(description); };
const close = (a, b, tolerance = .04) => Math.abs(a - b) <= tolerance;
const vector = values => new T.Vector3(...values);
const label = record => `${record.piece.id}:${record.piece.part} (${record.piece.group})`;

function snapshot(settings) {
  engine.applyGroupPose(ordered, groups, settings);
  parent.updateMatrixWorld(true);
  return PIECES.map(piece => {
    const entry = library.get(piece.part);
    const local = new T.Box3();
    for (const layer of entry.layers) local.union(layer.geometry.boundingBox);
    const matrix = groups.get(piece.group).matrixWorld.clone().multiply(engine.pieceMatrix(piece, entry));
    return { piece, entry, local, matrix, bounds: local.clone().applyMatrix4(matrix) };
  });
}
function stage(title) {
  const found = STEPS.find(step => step.titleEn === title);
  if (!found) throw new Error(`Assembly audit cannot locate stage: ${title}`);
  return found.number;
}
function overlap(a, b) {
  return ['x', 'y', 'z'].map(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]));
}
function boxDistance(a, b) {
  return Math.hypot(...['x', 'y', 'z'].map(axis => Math.max(a.min[axis] - b.max[axis], b.min[axis] - a.max[axis], 0)));
}
function solidIntersections(first, second, name) {
  // In transport, these boxes have parallel axes. Ignore ordinary stud insertion
  // and moulding gaps; a depth greater than .25 on all axes is a macro clash.
  const hits = [];
  for (const a of first) for (const b of second) {
    const depths = overlap(a.bounds, b.bounds);
    if (depths.every(depth => depth > .25)) hits.push(`${label(a)} / ${label(b)} depth=${depths.map(n => n.toFixed(3)).join(',')}`);
  }
  assert(!hits.length, `${name}: ${hits.length} deep intersections; ${hits.slice(0, 5).join('; ')}`);
  checks.push(`${name}: ${hits.length} deep intersections`);
}
function nativeOrigin(record) {
  return record.entry.offset.clone().negate().applyMatrix4(record.matrix);
}
function axleLine(record) {
  const center = nativeOrigin(record);
  const direction = new T.Vector3(1, 0, 0).transformDirection(record.matrix);
  return { center, direction, halfLength: ALL_CATALOG[record.piece.part].l / 2 };
}
function distanceFromAxle(point, axle) {
  const offset = point.clone().sub(axle.center);
  const along = offset.dot(axle.direction);
  return { along: Math.abs(along), radial: offset.addScaledVector(axle.direction, -along).length() };
}

try {
  const transportSettings = { ...engine.INITIAL, mode: 'transport', elevation: 0, slew: 0, extension: 0, outriggers: 0, hook: 6, explode: 0 };
  const transport = snapshot(transportSettings);
  const seen = new Map();
  for (const record of transport) {
    const key = [record.piece.part, ...record.matrix.elements.map(value => Math.round(value * 1e5))].join(':');
    assert(!seen.has(key), `Coincident pieces: ${seen.get(key)} / ${label(record)}`);
    seen.set(key, label(record));
    const scales = new T.Vector3(); record.matrix.decompose(new T.Vector3(), new T.Quaternion(), scales);
    assert(scales.toArray().every(value => close(value, 1, 1e-6)), `A real piece is stretched: ${label(record)}`);
    assert([...record.bounds.min.toArray(), ...record.bounds.max.toArray()].every(Number.isFinite), `Non-finite geometry: ${label(record)}`);
  }
  checks.push(`${PIECES.length} pieces: unique placements, finite bounds and unit scale`);

  const cabStart = stage('Lateral cab base'), cabEnd = stage('Cab roof');
  const cab = transport.filter(record => record.piece.step >= cabStart && record.piece.step <= cabEnd);
  const section = name => transport.filter(record => record.piece.group === name);
  solidIntersections(cab, section('boom'), 'Cab / lowered boom');
  solidIntersections(section('boom'), section('mid'), 'Retracted main / middle sections');
  solidIntersections(section('mid'), section('inner'), 'Retracted middle / inner sections');

  const trackBase = Math.min(...transport.filter(record => record.piece.step === stage('Track sleepers')).map(record => record.bounds.min.y));
  const railStep = stage('Rail surfaces');
  const rails = transport.filter(record => record.piece.step === railStep);
  const wheels = transport.filter(record => record.piece.part === 'wheel56908' && record.piece.group === 'root');
  const axles = transport.filter(record => record.piece.part === 'axle16' && record.piece.group === 'root');
  assert(wheels.length === blueprint.DIMENSIONS.axles * 2 && axles.length === blueprint.DIMENSIONS.axles, 'Railway running gear must retain two wheels per documented axle');
  for (const wheel of wheels) {
    const supporting = rails.filter(rail => overlap(wheel.bounds, rail.bounds).filter((_, index) => index !== 1).every(depth => depth > .1));
    assert(supporting.some(rail => close(wheel.bounds.min.y, rail.bounds.max.y)), `Wheel misses the railhead: ${label(wheel)}`);
    const center = wheel.local.getCenter(new T.Vector3()).applyMatrix4(wheel.matrix);
    assert(axles.some(record => {
      const axle = axleLine(record), distance = distanceFromAxle(center, axle);
      return distance.radial < .04 && distance.along < axle.halfLength;
    }), `No axle passes through wheel centre: ${label(wheel)}`);
  }
  checks.push(`${wheels.length} wheels touch railheads and align with ${axles.length} axles`);

  for (const name of ['Boom head sheaves', 'Hook block']) {
    const number = stage(name);
    const mechanism = transport.filter(record => record.piece.step === number);
    const sheaves = mechanism.filter(record => record.piece.part === 'pulley4185');
    const cheeks = mechanism.filter(record => ['b14', 'slope45_2x2'].includes(record.piece.part));
    solidIntersections(sheaves, cheeks, `${name}: sheaves / cheeks`);
  }

  const runningStages = new Set(STEPS.filter(step => /^(Rail surfaces|Convoy: running surfaces)$/.test(step.titleEn)).map(step => step.number));
  const allRails = transport.filter(record => runningStages.has(record.piece.step));
  const wagonGroups = GROUPS.filter(group => group.transportOnly && transport.some(record => record.piece.group === group.id && record.piece.part === 'wheel56908'));
  let wagonWheels = 0;
  for (const wagon of wagonGroups) {
    const wheels = transport.filter(record => record.piece.group === wagon.id && record.piece.part === 'wheel56908');
    const axles = transport.filter(record => record.piece.group === wagon.id && record.piece.part === 'axle16');
    assert(wheels.length === 2 * axles.length, `Wagon wheels and axles disagree: ${wagon.id}`);
    wagonWheels += wheels.length;
    for (const wheel of wheels) {
      const supporting = allRails.filter(rail => overlap(wheel.bounds, rail.bounds).filter((_, index) => index !== 1).every(depth => depth > .1));
      assert(supporting.some(rail => close(wheel.bounds.min.y, rail.bounds.max.y)), `Wagon wheel misses the railhead: ${label(wheel)}`);
      const center = wheel.local.getCenter(new T.Vector3()).applyMatrix4(wheel.matrix);
      assert(axles.some(record => {
        const axle = axleLine(record), distance = distanceFromAxle(center, axle);
        return distance.radial < .04 && distance.along < axle.halfLength;
      }), `Wagon axle misses wheel centre: ${label(wheel)}`);
    }
  }
  checks.push(`${wagonWheels} wagon wheels checked separately across ${wagonGroups.length} accompanying wagons`);

  const cradleStage = STEPS.find(step => step.titleEn === 'Boom support: resting beam');
  if (wagonGroups.length) {
    assert(Boolean(cradleStage), 'Transport configuration has no resting cradle stage');
    if (cradleStage) {
      const cradle = transport.filter(record => record.piece.step === cradleStage.number);
      const craneBoom = transport.filter(record => ['boom', 'mid', 'inner'].includes(record.piece.group));
      solidIntersections(cradle, craneBoom, 'Transport cradle / boom and head');
      const innerFloorStep = stage('Inner section: lower skin');
      const innerFloor = transport.filter(record => record.piece.step === innerFloorStep);
      const contacts = [];
      for (const support of cradle) for (const skin of innerFloor) {
        const overlapXZ = overlap(support.bounds, skin.bounds).filter((_, index) => index !== 1);
        const gap = skin.bounds.min.y - support.bounds.max.y;
        if (overlapXZ.every(depth => depth > .1) && gap >= -.04 && gap <= .08) contacts.push({ support, skin, gap });
      }
      assert(contacts.length > 0, 'Transport cradle does not meet the underside of the inner boom section');
      const hook = transport.filter(record => record.piece.group === 'hook');
      const convoy = transport.filter(record => GROUPS.find(group => group.id === record.piece.group)?.transportOnly);
      const stationary = transport.filter(record => record.piece.group === 'root' || groupById.get(record.piece.group)?.transportOnly || GROUPS.some(group => group.motion === 'outrigger' && withinGroup(record.piece.group, group.id)));
      solidIntersections(hook, stationary, 'Transport hook / stationary crane, wagons and rails');
      const wagonDecks = convoy.filter(record => /deck layer|second layer/.test(STEPS.find(step => step.number === record.piece.step)?.titleEn || ''));
      const decksUnderHook = wagonDecks.filter(deck => hook.some(part => overlap(part.bounds, deck.bounds).filter((_, index) => index !== 1).every(depth => depth > .1)));
      if (decksUnderHook.length) {
        const lowestHook = Math.min(...hook.map(record => record.bounds.min.y));
        const deckTop = Math.max(...decksUnderHook.map(record => record.bounds.max.y));
        assert(lowestHook > deckTop + .1, `Transport hook hits the wagon deck: clearance ${(lowestHook - deckTop).toFixed(3)} studs`);
        checks.push(`Transport hook clears the deck by ${(lowestHook - deckTop).toFixed(3)} studs`);
      }
      if (contacts.length) checks.push(`Cradle/inner-skin resting gap ${Math.min(...contacts.map(contact => contact.gap)).toFixed(3)} studs`);
    }
  }

  for (const extension of [0, 50, 100]) {
    const posed = snapshot({ ...engine.INITIAL, mode: 'working', outriggers: extension, explode: 0 });
    const fixed = posed.filter(record => record.piece.group === 'root');
    for (const leg of GROUPS.filter(group => group.motion === 'outrigger')) {
      const pieces = posed.filter(record => withinGroup(record.piece.group, leg.id));
      let nearest = Infinity;
      for (const piece of pieces) for (const frame of fixed) nearest = Math.min(nearest, boxDistance(piece.bounds, frame.bounds));
      assert(nearest < .08, `Detached ${leg.id} at ${extension}%: nearest fixed part is ${nearest.toFixed(3)} studs away`);
      const lowest = Math.min(...pieces.map(record => record.bounds.min.y));
      assert(close(lowest, trackBase), `Outrigger pad leaves the track-base plane: ${leg.id}, y=${lowest.toFixed(3)}`);
    }
  }
  checks.push('Four outriggers stay adjacent to the fixed frame at 0%, 50% and 100%');
  snapshot({ ...engine.INITIAL, mode: 'working', explode: 0 });
  for (const group of GROUPS.filter(group => group.transportOnly)) assert(groups.get(group.id).visible === false, `Wagon group leaks into working mode: ${group.id}`);
  snapshot(transportSettings);
  for (const group of GROUPS.filter(group => group.transportOnly)) assert(groups.get(group.id).visible === true, `Wagon group is missing in transport mode: ${group.id}`);
  const railTop = Math.max(...rails.map(record => record.bounds.max.y));
  for (const leg of GROUPS.filter(group => group.motion === 'outrigger')) {
    const feet = GROUPS.filter(group => group.transportPosition && withinGroup(group.id, leg.id));
    for (const foot of feet) {
      const pieces = transport.filter(record => withinGroup(record.piece.group, foot.id));
      const bottom = Math.min(...pieces.map(record => record.bounds.min.y));
      assert(bottom > railTop + .1, `Transport foot remains at rail level: ${foot.id}, y=${bottom.toFixed(3)}`);
    }
  }
  checks.push('Transport wagons switch visibility; raised feet clear the railhead plane');


  const elevations = [...new Set([0, engine.INITIAL.elevation, 65])];
  for (const elevation of elevations) {
    const posed = snapshot({ ...engine.INITIAL, mode: 'working', elevation, explode: 0 });
    for (const group of ['inner', 'hook']) {
      const sheaves = posed.filter(record => record.piece.group === group && record.piece.part === 'pulley4185');
      const shafts = posed.filter(record => record.piece.group === group && record.piece.part === 'axle8');
      assert(shafts.length > 0 && sheaves.length > 0, `Sheaves and shaft are missing from ${group}`);
      for (const sheave of sheaves) {
        const center = sheave.local.getCenter(new T.Vector3()).applyMatrix4(sheave.matrix);
        const normal = new T.Vector3(0, 0, 1).transformDirection(sheave.matrix);
        assert(shafts.some(record => {
          const axle = axleLine(record), distance = distanceFromAxle(center, axle);
          return distance.radial < .04 && distance.along < axle.halfLength && Math.abs(normal.dot(axle.direction)) > .999;
        }), `Sheave centre has no aligned shaft at ${elevation} degrees: ${label(sheave)}`);
      }
    }
    const hook = groups.get('hook');
    const vertical = new T.Vector3(0, 1, 0).transformDirection(hook.matrixWorld);
    assert(vertical.distanceTo(new T.Vector3(0, 1, 0)) < 1e-6, `Suspended hook tilts at ${elevation} degrees`);
  }
  checks.push(`Head and hook sheave axes align; hook stays vertical at ${elevations.join(', ')} degrees`);

  const boomAxis = transport.find(record => record.piece.part === 'axle16' && record.piece.group === 'turret');
  assert(Boolean(boomAxis), 'Boom pivot axle is missing');
  if (boomAxis) {
    const axis = axleLine(boomAxis), pivot = groups.get('boom');
    // Read the pivot from a fresh transport pose after the moving-pose checks.
    snapshot(transportSettings);
    assert(nativeOrigin(boomAxis).distanceTo(pivot.getWorldPosition(new T.Vector3())) < .04, 'Boom rotates away from its actual pivot axle');
    const supports = transport.filter(record => record.piece.part === 'pivotBrick3701');
    for (const side of [-1, 1]) {
      assert(supports.some(record => {
        if (Math.sign(record.piece.position[2]) !== side) return false;
        const hole = new T.Vector3(0, ALL_CATALOG[record.piece.part].h / 2, 0).applyMatrix4(record.matrix);
        return distanceFromAxle(hole, axis).radial < .04;
      }), `Boom axle does not pass through the ${side < 0 ? 'left' : 'right'} pivot support`);
    }
    for (const bush of transport.filter(record => record.piece.part === 'bush3713' && record.piece.group === 'turret')) {
      const center = bush.local.getCenter(new T.Vector3()).applyMatrix4(bush.matrix);
      assert(distanceFromAxle(center, axis).radial < .04, `Pivot bush is off the axle: ${label(bush)}`);
    }
  }
  checks.push('Boom pivot, axle, two supports and bushes share an axis');

  const closed = LDRAW_GEOMETRY['40918-f1'], open = LDRAW_GEOMETRY['40918-f2'];
  assert(Boolean(closed && open), 'Both native actuator end poses are required for the assembly audit');
  let measuredTravel = 0;
  if (closed && open) {
    for (const [colour, vertices] of Object.entries(closed.groups)) {
      const extended = open.groups[colour];
      assert(extended?.length === vertices.length, `Actuator topology differs in material ${colour}`);
      if (!extended || extended.length !== vertices.length) continue;
      for (let triangle = 0; triangle < vertices.length; triangle += 9) {
        const motions = [];
        for (let vertex = 0; vertex < 3; vertex++) {
          const index = triangle + vertex * 3;
          motions.push(new T.Vector3(...[0, 1, 2].map(axis =>
            extended[index + axis] + open.offset[axis] - vertices[index + axis] - closed.offset[axis]
          )));
        }
        assert(motions.every(motion => motion.distanceTo(motions[0]) < .0001), `A native actuator triangle stretches in material ${colour}, triangle ${triangle / 9}`);
        measuredTravel = Math.max(measuredTravel, ...motions.map(motion => motion.length()));
      }
    }
  }
  const actuatorPieces = PIECES.filter(piece => piece.part === 'actuatorLong40918');
  assert(actuatorPieces.length === 2, 'The model must retain its two lifting actuators');
  const actuatorAngles = [...new Set([0, engine.INITIAL.elevation, ...Array.from({ length: 13 }, (_, index) => (index + 1) * 5)])];
  const anchorMisses = new Map(), travelMisses = new Map();
  for (const elevation of actuatorAngles) {
    for (const slew of [0, 90, -90]) {
      const posed = snapshot({ ...engine.INITIAL, mode: 'working', elevation, slew, explode: 0 });
      const pins = posed.filter(record => record.piece.part === 'pin2780');
      for (const piece of actuatorPieces) {
        const entry = library.get(piece.part);
        const motion = engine.actuatorTransform(piece, entry, groups);
        if (!(motion.withinTravel && motion.extensionStuds >= 0 && motion.extensionStuds <= measuredTravel + .0001)) {
          const previous = travelMisses.get(piece.id);
          if (!previous || motion.length > previous.length) travelMisses.set(piece.id, { length: motion.length, elevation, slew });
        }
        const scale = new T.Vector3(); motion.matrix.decompose(new T.Vector3(), new T.Quaternion(), scale);
        assert(scale.toArray().every(value => close(value, 1, 1e-6)), `Actuator body is stretched at ${elevation} degrees`);
        for (const [name, point] of [['base', motion.base], ['end', motion.end]]) {
          const distance = Math.min(...pins.map(pin => nativeOrigin(pin).distanceTo(vector(point))));
          const key = `${piece.id}:${name}`;
          if (distance > (anchorMisses.get(key)?.distance || 0)) anchorMisses.set(key, { distance, elevation, slew });
        }
      }
    }
  }
  for (const [id, miss] of travelMisses) assert(false, `Actuator ${id} exceeds its native travel at elevation=${miss.elevation}, slew=${miss.slew}: ${miss.length.toFixed(3)} studs`);
  for (const [key, miss] of anchorMisses) assert(miss.distance < .04, `Actuator ${key} misses its pin centre by ${miss.distance.toFixed(3)} studs at elevation=${miss.elevation}, slew=${miss.slew}`);
  checks.push(`Actuator parts translate rigidly through ${measuredTravel.toFixed(3)} studs; anchors and travel checked at ${actuatorAngles.length} elevations and 3 yaw angles`);

  for (const message of checks) console.log(`CHECK ${message}`);
  if (failures.length) {
    for (const failure of failures) console.error(`ERROR ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('Macro assembly checks passed. Physical connections, strength and lifting capability remain unvalidated.');
  }
} finally {
  library.dispose();
}
