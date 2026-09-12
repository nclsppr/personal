import type { Part } from '../src/blueprint';
import partsEvidence from './data/parts-evidence.json';

// Additions only: the small model catalogue remains the shared, unchanged base.
// Dimensions follow the native LDraw axes (l = X, w = Z, h = Y).
// Brick and plate heights exclude studs; exact unscaled bounds are in the geometry JSON.
export const NEW_CATALOG: Record<string, Part> = {
  "wheel56908": {
    "id": "56908",
    "name": "Jante Technic de 43,2 mm × 26 mm",
    "nameEn": "Technic wheel 43.2 mm × 26 mm",
    "l": 5.4,
    "w": 3.3,
    "h": 5.4,
    "ldrawId": "56908",
    "referenceType": "design",
    "designId": "56908",
    "category": "mechanism"
  },
  "roundPlate11213": {
    "id": "11213",
    "name": "Plaque ronde 6 × 6 avec trou et tenon d’encliquetage",
    "nameEn": "Round plate 6 × 6 with hole and snap stud",
    "l": 6,
    "w": 6,
    "h": 0.4,
    "kind": "round",
    "ldrawId": "11213",
    "referenceType": "design",
    "designId": "11213",
    "category": "standard"
  },
  "t12": {
    "id": "3069",
    "name": "Tuile 1 × 2",
    "nameEn": "Tile 1 × 2",
    "l": 2,
    "w": 1,
    "h": 0.4,
    "kind": "tile",
    "ldrawId": "3069b",
    "referenceType": "design",
    "designId": "3069",
    "category": "standard"
  },
  "t14": {
    "id": "2431",
    "name": "Tuile 1 × 4",
    "nameEn": "Tile 1 × 4",
    "l": 4,
    "w": 1,
    "h": 0.4,
    "kind": "tile",
    "ldrawId": "2431",
    "referenceType": "design",
    "designId": "2431",
    "category": "standard"
  },
  "t18": {
    "id": "4162",
    "name": "Tuile 1 × 8",
    "nameEn": "Tile 1 × 8",
    "l": 8,
    "w": 1,
    "h": 0.4,
    "kind": "tile",
    "ldrawId": "4162",
    "referenceType": "design",
    "designId": "4162",
    "category": "standard"
  },
  "slope45_2x2": {
    "id": "3039",
    "name": "Brique inclinée à 45° 2 × 2",
    "nameEn": "Slope 45° 2 × 2",
    "l": 2,
    "w": 2,
    "h": 1.2,
    "ldrawId": "3039",
    "referenceType": "design",
    "designId": "3039",
    "category": "standard"
  },
  "slopeCurved2x2": {
    "id": "15068",
    "name": "Pente courbe 2 × 2 × 2/3",
    "nameEn": "Curved slope 2 × 2 × 2/3",
    "l": 2,
    "w": 2,
    "h": 0.8,
    "ldrawId": "15068",
    "referenceType": "design",
    "designId": "15068",
    "category": "standard"
  },
  "wedgeLeft43710": {
    "id": "43710",
    "name": "Brique biseautée 4 × 2, gauche",
    "nameEn": "Wedge 4 × 2, left",
    "l": 2,
    "w": 4,
    "h": 1.2,
    "ldrawId": "43710",
    "referenceType": "design",
    "designId": "43710",
    "category": "standard"
  },
  "wedgeRight43711": {
    "id": "43711",
    "name": "Brique biseautée 4 × 2, droite",
    "nameEn": "Wedge 4 × 2, right",
    "l": 2,
    "w": 4,
    "h": 1.2,
    "ldrawId": "43711",
    "referenceType": "design",
    "designId": "43711",
    "category": "standard"
  },
  "windshield6x3": {
    "id": "62360",
    "name": "Pare-brise courbe 3 × 6 × 1",
    "nameEn": "Curved windscreen 3 × 6 × 1",
    "l": 6,
    "w": 3,
    "h": 1.2,
    "ldrawId": "62360",
    "referenceType": "design",
    "designId": "62360",
    "category": "mechanism"
  },
  "technic16": {
    "id": "3703",
    "name": "Brique Technic 1 × 16 avec trous",
    "nameEn": "Technic brick 1 × 16 with holes",
    "l": 16,
    "w": 1,
    "h": 1.2,
    "ldrawId": "3703",
    "referenceType": "design",
    "designId": "3703",
    "category": "mechanism"
  },
  "axle12": {
    "id": "3708",
    "name": "Axe Technic 12L",
    "nameEn": "Technic axle 12L",
    "l": 12,
    "w": 0.6,
    "h": 0.6,
    "ldrawId": "3708",
    "referenceType": "design",
    "designId": "3708",
    "category": "mechanism"
  },
  "axle16": {
    "id": "50451",
    "name": "Axe Technic 16L",
    "nameEn": "Technic axle 16L",
    "l": 16,
    "w": 0.6,
    "h": 0.6,
    "ldrawId": "50451",
    "referenceType": "design",
    "designId": "50451",
    "category": "mechanism"
  },
  "bar4": {
    "id": "30374",
    "name": "Barre 4L",
    "nameEn": "Bar 4L",
    "l": 0.4,
    "w": 0.4,
    "h": 4,
    "ldrawId": "30374",
    "referenceType": "design",
    "designId": "30374",
    "category": "mechanism"
  },
  "clip11": {
    "id": "15712",
    "name": "Tuile 1 × 1 avec clip ouvert",
    "nameEn": "Modified tile 1 × 1 with open clip",
    "l": 1,
    "w": 1,
    "h": 0.9,
    "ldrawId": "15712",
    "referenceType": "design",
    "designId": "15712",
    "category": "mechanism"
  },
  "round22": {
    "id": "3941",
    "name": "Brique ronde 2 × 2 avec trou d’axe",
    "nameEn": "Round brick 2 × 2 with axle hole",
    "l": 2,
    "w": 2,
    "h": 1.2,
    "kind": "round",
    "ldrawId": "3941",
    "referenceType": "design",
    "designId": "3941",
    "category": "standard"
  },
  "actuatorLong40918": {
    "id": "40918c01",
    "name": "Vérin linéaire Technic long, assemblage",
    "nameEn": "Long Technic linear actuator assembly",
    "l": 1.9,
    "w": 14.9,
    "h": 2.4,
    "ldrawId": "40918-f1",
    "referenceType": "catalogue-assembly",
    "designId": null,
    "category": "mechanism"
  },
  "frame43": {
    "id": "60594",
    "name": "Cadre de fenêtre 1 × 4 × 3 sans attaches de volet",
    "nameEn": "Window frame 1 × 4 × 3 without shutter tabs",
    "l": 4,
    "w": 1,
    "h": 3.6,
    "ldrawId": "60594",
    "referenceType": "design",
    "designId": "60594",
    "category": "mechanism"
  },
  "windowGlass43": {
    "id": "60603",
    "name": "Panneau ouvrant pour fenêtre 1 × 4 × 3",
    "nameEn": "Opening pane for window 1 × 4 × 3",
    "l": 3.7,
    "w": 0.4,
    "h": 3,
    "ldrawId": "60603",
    "referenceType": "design",
    "designId": "60603",
    "category": "mechanism"
  }
};

export const NEW_COLORS = {
  transblack: { hex: '#212121', name: 'Noir transparent', nameEn: 'Trans-Black', ldraw: 10375, bricklink: 251 }
};

export const NEW_PARTS_EVIDENCE = partsEvidence;

