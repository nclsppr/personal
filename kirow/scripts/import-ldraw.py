#!/usr/bin/env python3
"""Import official LDraw geometry at build time; the website has no external loader.

The derived geometry retains its source and authors, under CC BY 4.0.
Run from the repository root: python3 kirow/scripts/import-ldraw.py
"""
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path
import json
import urllib.error
import urllib.request
import zipfile

BASE = "https://library.ldraw.org/library/official/"
ROOT = Path(__file__).resolve().parents[1]
CACHE = Path("/tmp/kirow-ldraw-sources")
ARCHIVE = Path("/tmp/kirow-ldraw-complete.zip")
PARTS = ["3062b", "53401", "57878", "57877", "2878", "18939", "18938", "60592", "60601", "2412b", "61927-f1", "61927-f2", "4185b", "70644", "2486", "4022", "2920", "73092", "3701", "3707", "3713", "2780", "3680", "3679", "4079", "4592", "4593", "4073", "2429", "2430"]


@lru_cache(None)
def official_archive():
    return zipfile.ZipFile(ARCHIVE)


@lru_cache(None)
def source(name):
    name = name.replace("\\", "/").lower()
    candidates = [name] if name.startswith(("parts/", "p/")) else ["parts/" + name, "p/" + name]
    if ARCHIVE.exists():
        for location in candidates:
            try:
                return location, official_archive().read("ldraw/" + location).decode("utf-8-sig")
            except KeyError:
                pass
        raise ValueError("Missing official LDraw source: " + name)
    for location in candidates:
        cached = CACHE / location
        if cached.exists():
            return location, cached.read_text()
        try:
            request = urllib.request.Request(BASE + location, headers={"User-Agent": "Kirow-parts-audit/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                text = response.read().decode("utf-8-sig")
            if not text.startswith("0 "):
                continue
            cached.parent.mkdir(parents=True, exist_ok=True)
            cached.write_text(text)
            return location, text
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise
    raise ValueError("Missing official LDraw source: " + name)


def transformed(point, translation, matrix):
    return tuple(translation[row] + sum(matrix[row * 3 + col] * point[col] for col in range(3)) for row in range(3))


@lru_cache(None)
def geometry(name):
    location, text = source(name)
    triangles = []
    authors = set()
    sources = {BASE + location}
    clockwise = False
    invert_next = False
    for raw in text.splitlines():
        fields = raw.split()
        if not fields:
            continue
        if raw.startswith("0 Author: "):
            authors.add(raw.removeprefix("0 Author: "))
        if fields[0] == "0":
            if "BFC" in fields and "CERTIFY" in fields:
                clockwise = "CW" in fields
            if "BFC" in fields and "INVERTNEXT" in fields:
                invert_next = True
            continue
        kind = int(fields[0])
        if kind == 1:
            color = fields[1]
            values = list(map(float, fields[2:14]))
            translation, matrix = values[:3], values[3:]
            child, child_authors, child_sources = geometry(" ".join(fields[14:]))
            authors.update(child_authors)
            sources.update(child_sources)
            determinant = (matrix[0] * (matrix[4]*matrix[8]-matrix[5]*matrix[7]) - matrix[1] * (matrix[3]*matrix[8]-matrix[5]*matrix[6]) + matrix[2] * (matrix[3]*matrix[7]-matrix[4]*matrix[6]))
            reverse = invert_next != (determinant < 0)
            for child_color, points in child:
                vertices = tuple(transformed(point, translation, matrix) for point in points)
                if reverse:
                    vertices = vertices[::-1]
                triangles.append((color if child_color == "16" else child_color, vertices))
            invert_next = False
        elif kind in (3, 4):
            values = list(map(float, fields[2:]))
            vertices = tuple(tuple(values[i:i+3]) for i in range(0, len(values), 3))
            if clockwise:
                vertices = vertices[::-1]
            triangles.append((fields[1], vertices[:3]))
            if kind == 4:
                triangles.append((fields[1], (vertices[0], vertices[2], vertices[3])))
    return tuple(triangles), frozenset(authors), frozenset(sources)


def import_part(part):
    triangles, authors, sources = geometry(part + ".dat")
    points = [(x / 20, -y / 20, z / 20) for _, vertices in triangles for x, y, z in vertices]
    low = [min(point[axis] for point in points) for axis in range(3)]
    high = [max(point[axis] for point in points) for axis in range(3)]
    offset = [(low[0]+high[0])/2, low[1], (low[2]+high[2])/2]
    groups = {}
    for color, vertices in triangles:
        values = groups.setdefault(color, [])
        # Reflect Y into Three coordinates and retain outward-facing winding.
        for x, y, z in vertices[::-1]:
            values.extend([round(x/20-offset[0], 5), round(-y/20-offset[1], 5), round(z/20-offset[2], 5)])
    result = {"id": part, "source": BASE + "parts/" + part + ".dat", "license": "CC BY 4.0", "authors": sorted(authors), "dependencies": sorted(sources), "offset": offset, "size": [round(high[i]-low[i], 5) for i in range(3)], "groups": groups}
    print(part, result["size"], len(points)//3, "triangles", flush=True)
    return part, result


if __name__ == "__main__":
    if not ARCHIVE.exists():
        urllib.request.urlretrieve("https://library.ldraw.org/library/updates/complete.zip", ARCHIVE)
    results = {}
    failures = {}
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {part: pool.submit(import_part, part) for part in PARTS}
        for part, future in futures.items():
            try:
                key, value = future.result()
                results[key] = value
            except Exception as error:
                failures[part] = str(error)
    ROOT.joinpath("data").mkdir(exist_ok=True)
    ROOT.joinpath("data/ldraw-geometry.json").write_text(json.dumps(results, separators=(",", ":")) + "\n")
    ROOT.joinpath("data/ldraw-import-report.json").write_text(json.dumps({"source": BASE, "license": "CC BY 4.0", "imported": list(results), "failures": failures}, indent=2) + "\n")
    authors = sorted({author for part in results.values() for author in part["authors"]})
    notice = ["LDraw geometry attribution", "", "Source: https://library.ldraw.org/", "License: Creative Commons Attribution 4.0 International", "https://creativecommons.org/licenses/by/4.0/", "", "The local ldraw-geometry.json is derived from the official LDraw Parts Library.", "Changes: recursive assembly, polygon triangulation, coordinate conversion", "(20 LDU per stud, Y up), translation to a centred footprint and bottom origin.", "No part is resized. Conditional edge lines are omitted from surface meshes.", "Actuator motion translates the real inner assembly through its documented range.", "Individual source URLs and dependencies remain in the geometry JSON.", "", "Contributors:", *authors, "", "Imported part files:"]
    notice.extend(part["source"] for part in results.values())
    notice.extend(["", "Full license:", official_archive().read("ldraw/CAlicense4.txt").decode("utf-8-sig")])
    ROOT.joinpath("assets/LDraw-LICENSES.txt").write_text("\n".join(notice).rstrip() + "\n")
    if failures:
        print(json.dumps(failures, indent=2))
        raise SystemExit(1)
