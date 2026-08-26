#!/usr/bin/env python3
"""Validate the static site contracts used by GitHub Pages."""

from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
CANONICAL_HOST = "nicolaspieper.com"


def validate_required_files(errors: list[str]) -> None:
    required = (
        "404.html",
        "CNAME",
        "index.html",
        "fr/index.html",
        "robots.txt",
        "sitemap.xml",
    )
    for relative in required:
        if not (ROOT / relative).is_file():
            errors.append(f"missing required file: {relative}")

    cname = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
    if cname != CANONICAL_HOST:
        errors.append(f"CNAME must contain exactly {CANONICAL_HOST}")


def section_ids(content: str) -> set[str]:
    return set(re.findall(r'<section[^>]*\bid="([a-z0-9-]+)"', content))


def local_anchors(content: str) -> set[str]:
    return set(re.findall(r'href="(#[a-z0-9-]+)"', content))


def validate_language_parity(errors: list[str]) -> None:
    pairs = (
        ("index.html", "fr/index.html"),
        ("cv/index.html", "fr/cv/index.html"),
    )
    for english_path, french_path in pairs:
        english = (ROOT / english_path).read_text(encoding="utf-8")
        french = (ROOT / french_path).read_text(encoding="utf-8")
        if section_ids(english) != section_ids(french):
            errors.append(f"section mismatch: {english_path} and {french_path}")
        if local_anchors(english) != local_anchors(french):
            errors.append(f"anchor mismatch: {english_path} and {french_path}")

    french_home = (ROOT / "fr/index.html").read_text(encoding="utf-8")
    if not re.search(r'<html[^>]*\blang="fr"', french_home):
        errors.append('fr/index.html must declare lang="fr"')


def local_path_for_url(path: str) -> Path:
    relative = path.lstrip("/")
    if not relative or path.endswith("/"):
        return ROOT / relative / "index.html"
    return ROOT / relative


def validate_sitemap(errors: list[str]) -> None:
    sitemap = ET.parse(ROOT / "sitemap.xml")
    namespace = {"sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locations = sitemap.findall("sitemap:url/sitemap:loc", namespace)
    if not locations:
        errors.append("sitemap.xml contains no URLs")
        return

    for location in locations:
        value = (location.text or "").strip()
        parsed = urlparse(value)
        if parsed.scheme != "https" or parsed.netloc != CANONICAL_HOST:
            errors.append(f"non-canonical sitemap URL: {value}")
            continue
        if not local_path_for_url(parsed.path).is_file():
            errors.append(f"sitemap URL has no matching file: {value}")


def main() -> int:
    errors: list[str] = []
    validate_required_files(errors)
    validate_language_parity(errors)
    validate_sitemap(errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print("Static site validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
