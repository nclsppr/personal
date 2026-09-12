import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import sharedGeometry from '../../data/ldraw-geometry.json';
import largeGeometry from '../data/ldraw-geometry.json';

export type PartDefinition = {
  id: string; l: number; w: number; h: number; kind?: string;
  category?: string; ldrawId?: string | null;
};
export type PartShape = {
  id: string; offset: number[]; size: number[]; groups: Record<string, number[]>;
};
export const LDRAW_GEOMETRY = { ...sharedGeometry, ...largeGeometry } as Record<string, PartShape>;
export type GeometryLayer = { geometry: T.BufferGeometry; color: string };
export type GeometryEntry = { layers: GeometryLayer[]; offset: T.Vector3; file: string; imported: boolean };

// Every entry is built once. Instance matrices contain only rotation and translation.
export function createGeometryLibrary(catalog: Record<string, PartDefinition>) {
  const cache = new Map<string, GeometryEntry>();
  function get(part: string): GeometryEntry {
    const cached = cache.get(part);
    if (cached) return cached;
    const definition = catalog[part];
    if (!definition) throw new Error(`Unknown catalogue part: ${part}`);
    const id = definition.ldrawId || definition.id;
    const source = LDRAW_GEOMETRY[id];
    let entry: GeometryEntry;
    if (source) {
      const layers = Object.entries(source.groups).map(([color, vertices]) => {
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return { geometry, color };
      });
      entry = { layers, offset: new T.Vector3(...source.offset as [number, number, number]), file: `${id}.dat`, imported: true };
    } else {
      if (definition.category === 'mechanism' || (definition.kind && !['tile', 'round', 'brick', 'plate'].includes(definition.kind))) {
        throw new Error(`Official LDraw geometry missing for ${definition.id}`);
      }
      const { l, w, h, kind } = definition;
      if (![l, w, h].every(v => Number.isFinite(v) && v > 0)) throw new Error(`Invalid dimensions: ${part}`);
      const pieces: T.BufferGeometry[] = [];
      const box = (x: number, y: number, z: number, px: number, py: number, pz: number) => {
        const geometry = new T.BoxGeometry(x, y, z);
        geometry.translate(px, py, pz);
        pieces.push(geometry);
      };
      if (kind === 'round') {
        const cylinder = new T.CylinderGeometry(w / 2 - .025, w / 2 - .025, h, 20);
        cylinder.translate(0, h / 2, 0);
        pieces.push(cylinder);
      } else {
        const wall = .12, top = Math.min(.18, h / 2), bodyHeight = h - top;
        box(l - .035, top, w - .035, 0, h - top / 2, 0);
        box(l - .035, bodyHeight, wall, 0, bodyHeight / 2, -w / 2 + wall / 2 + .0175);
        box(l - .035, bodyHeight, wall, 0, bodyHeight / 2, w / 2 - wall / 2 - .0175);
        box(wall, bodyHeight, w - wall * 2 - .035, -l / 2 + wall / 2 + .0175, bodyHeight / 2, 0);
        box(wall, bodyHeight, w - wall * 2 - .035, l / 2 - wall / 2 - .0175, bodyHeight / 2, 0);
        if (w >= 2) for (let x = -l / 2 + 1; x < l / 2; x++) {
          const tube = new T.CylinderGeometry(.31, .31, bodyHeight, 12, 1, true);
          tube.translate(x, bodyHeight / 2, 0);
          pieces.push(tube);
        }
      }
      if (kind !== 'tile') for (let x = 0; x < l; x++) for (let z = 0; z < w; z++) {
        const stud = new T.CylinderGeometry(.294, .302, .18, 12);
        stud.translate(x - (l - 1) / 2, h + .09, z - (w - 1) / 2);
        pieces.push(stud);
      }
      const nonIndexed = pieces.map(geometry => geometry.index ? geometry.toNonIndexed() : geometry);
      const geometry = mergeGeometries(nonIndexed, false);
      for (const item of new Set([...pieces, ...nonIndexed])) item.dispose();
      if (!geometry) throw new Error(`Cannot compose standard geometry: ${part}`);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      // Standard LDraw origins are at the top of the body, with Y pointing down.
      entry = { layers: [{ geometry, color: '16' }], offset: new T.Vector3(0, -h, 0), file: `${id}.dat`, imported: false };
    }
    cache.set(part, entry);
    return entry;
  }
  return {
    get,
    get size() { return cache.size; },
    dispose() { for (const entry of cache.values()) for (const layer of entry.layers) layer.geometry.dispose(); cache.clear(); }
  };
}
