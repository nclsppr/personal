#!/usr/bin/env python3
"""Import extra official LDraw parts for the large model without changing the mini.

Run from the repository root: python3 kirow/large-scale/scripts/import-parts.py
The additional catalogue is authoritative; geometry helper files remain read-only.
"""
import argparse
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MINI = ROOT.parent
EXTRA_GEOMETRY = ("40918-f2", "u9487c01", "62274c02", "47157")


def catalogue():
    text = ROOT.joinpath("catalog.ts").read_text()
    match = re.search(
        r"^export const NEW_CATALOG: Record<string, Part> = (\{.*?^\});",
        text, flags=re.MULTILINE | re.DOTALL,
    )
    if not match:
        raise ValueError("Cannot read the JSON object in NEW_CATALOG")
    return json.loads(match.group(1))


def check_geometry(part, result):
    if result["id"] != part or not result["groups"]:
        raise ValueError(f"Invalid geometry for {part}")
    for color, coordinates in result["groups"].items():
        if len(coordinates) % 9 or not all(math.isfinite(x) for x in coordinates):
            raise ValueError(f"Invalid triangle array for {part}, color {color}")
    if not all(size > 0 for size in result["size"]):
        raise ValueError(f"Empty bounds for {part}")


def main():
    spec = importlib.util.spec_from_file_location(
        "kirow_readonly_ldraw_importer", MINI / "scripts/import-ldraw.py"
    )
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=helper.ARCHIVE)
    args = parser.parse_args()
    helper.ARCHIVE = args.archive.resolve()
    if not helper.ARCHIVE.exists():
        helper.ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
        temporary = helper.ARCHIVE.with_suffix(".download")
        urllib.request.urlretrieve(
            "https://library.ldraw.org/library/updates/complete.zip", temporary
        )
        temporary.replace(helper.ARCHIVE)

    entries = catalogue()
    ids = list(dict.fromkeys(
        [part["ldrawId"] for part in entries.values()] + list(EXTRA_GEOMETRY)
    ))
    results = {}
    for part in ids:
        key, result = helper.import_part(part)
        check_geometry(key, result)
        results[key] = result

    # All inputs must succeed before any published output is replaced.
    archive_hash = hashlib.sha256()
    with helper.ARCHIVE.open("rb") as archive:
        for block in iter(lambda: archive.read(1024 * 1024), b""):
            archive_hash.update(block)
    report = {
        "source": helper.BASE,
        "archiveSource": "https://library.ldraw.org/library/updates/complete.zip",
        "archiveSha256": archive_hash.hexdigest(),
        "license": "CC BY 4.0",
        "coordinateConvention": {
            "unit": "stud",
            "lduPerStud": 20,
            "up": "Y",
            "origin": "centred X/Z footprint, lowest Y",
            "resized": False,
            "offset": "Subtract this vector after LDraw x/20, -y/20, z/20 conversion.",
        },
        "catalogueParts": {key: part["ldrawId"] for key, part in entries.items()},
        "imported": ids,
        "geometryOnlySubassemblies": list(EXTRA_GEOMETRY),
        "failures": {},
        "parts": {
            key: {
                "size": value["size"],
                "offset": value["offset"],
                "triangles": sum(len(group) // 9 for group in value["groups"].values()),
            }
            for key, value in results.items()
        },
        "assemblies": {
            "actuatorLong40918": {
                "catalogueId": "40918c01",
                "retracted": "40918-f1",
                "extended": "40918-f2",
                "sourceAxis": "Z",
                "travelStuds": 8,
                "note": "The centred offsets differ between poses. Restore each source origin before assembling or animating children. Subassemblies are not separate inventory items.",
                "sourceChildTransformsLDU": [
                    {"part": "47157", "color": 4, "translation": [0, 0, 0],
                     "matrix": [0, 1, 0, -1, 0, 0, 0, 0, 1]},
                    {"part": "u9487c01", "color": 16, "translation": [0, 0, 0],
                     "matrix": [1, 0, 0, 0, 1, 0, 0, 0, 1]},
                    {"part": "62274c02", "color": 72,
                     "translationRetracted": [0, 0, 250],
                     "translationExtended": [0, 0, 410],
                     "matrix": [1, 0, 0, 0, 1, 0, 0, 0, 1]},
                ],
            }
        },
    }
    authors = sorted({author for part in results.values() for author in part["authors"]})
    notice = [
        "LDraw geometry attribution: large-scale Kirow additions", "",
        "Source: https://library.ldraw.org/",
        "License: Creative Commons Attribution 4.0 International",
        "https://creativecommons.org/licenses/by/4.0/", "",
        "The local data/ldraw-geometry.json derives from the official LDraw Parts Library.",
        "Changes: recursive assembly, polygon triangulation, coordinate conversion",
        "(20 LDU per stud, Y up), translation to a centred footprint and bottom origin.",
        "No part is resized. Conditional edge lines are omitted from surface meshes.",
        "Source color assignments inside assemblies are retained.",
        "Individual source URLs and dependencies remain in the geometry JSON.", "",
        "Contributors:", *authors, "", "Imported part files:",
        *(part["source"] for part in results.values()), "", "Full license:",
        helper.official_archive().read("ldraw/CAlicense4.txt").decode("utf-8-sig"),
    ]
    outputs = {
        "data/ldraw-geometry.json": json.dumps(results, separators=(",", ":")) + "\n",
        "data/ldraw-import-report.json": json.dumps(report, indent=2) + "\n",
        "assets/LDraw-LICENSES.txt": "\n".join(notice).rstrip() + "\n",
    }
    for relative, content in outputs.items():
        path = ROOT / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_text(content)
        temporary.replace(path)
    print(f"Imported {len(entries)} catalogue references and {len(EXTRA_GEOMETRY)} supporting geometries.")


if __name__ == "__main__":
    main()

