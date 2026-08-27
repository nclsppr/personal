#!/usr/bin/env python3
"""Validate the static site contracts used by GitHub Pages."""

from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
CANONICAL_HOST = "nicolaspieper.com"


def validate_required_files(errors: list[str]) -> None:
    required = (
        "404.html",
        "CNAME",
        "index.html",
        "fr/index.html",
        "projects/index.html",
        "fr/projects/index.html",
        "robots.txt",
        "sitemap.xml",
        "assets/img/projects/surplasse-logo.webp",
        "assets/img/projects/papers-empire-logo.webp",
        "assets/img/projects/parkventory-logo.svg",
        "assets/img/projects/fouranu-logo.png",
        "assets/img/projects/monflorian-avatar-v2.webp",
        "assets/img/projects/monflorian-wordmark.webp",
        "assets/img/projects/projects-social-card.jpg",
        "assets/img/projects/surplasse-social-card.png",
        "assets/img/projects/papers-empire-social-card.jpg",
        "assets/img/projects/parkventory-social-card.png",
        "assets/img/projects/fouranu-social-card.jpg",
        "assets/img/projects/monflorian-social-card.png",
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
        ("projects/index.html", "fr/projects/index.html"),
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


def meta_value(content: str, attribute: str, key: str) -> Optional[str]:
    pattern = rf'<meta[^>]*\b{attribute}="{re.escape(key)}"[^>]*\bcontent="([^"]+)"'
    match = re.search(pattern, content)
    return match.group(1) if match else None


def link_value(content: str, rel: str, hreflang: Optional[str] = None) -> Optional[str]:
    if hreflang:
        pattern = rf'<link[^>]*\brel="{re.escape(rel)}"[^>]*\bhreflang="{re.escape(hreflang)}"[^>]*\bhref="([^"]+)"'
    else:
        pattern = rf'<link[^>]*\brel="{re.escape(rel)}"[^>]*\bhref="([^"]+)"'
    match = re.search(pattern, content)
    return match.group(1) if match else None


def validate_projects(errors: list[str]) -> None:
    pages = (
        {
            "path": "projects/index.html",
            "title": "Projects by Nicolas Pieper | Web products and engineering systems",
            "canonical": "https://nicolaspieper.com/projects/",
            "language": "en",
            "alternate": "https://nicolaspieper.com/fr/projects/",
            "attribution": "Products and systems I initiate and lead, from idea to production. I build them with AI coding assistants, then review, test and verify every release.",
        },
        {
            "path": "fr/projects/index.html",
            "title": "Projets de Nicolas Pieper | Produits web et systèmes d’ingénierie",
            "canonical": "https://nicolaspieper.com/fr/projects/",
            "language": "fr",
            "alternate": "https://nicolaspieper.com/projects/",
            "attribution": "Des produits et des systèmes que j’initie et pilote, de l’idée à la production. Je les construis avec des assistants IA, puis je relis, teste et vérifie chaque livraison.",
        },
    )
    expected_projects = ["surplasse", "papers-empire", "parkventory", "four-a-nu", "mon-florian"]
    social_card = "https://nicolaspieper.com/assets/img/projects/projects-social-card.jpg?v=2"

    for page in pages:
        content = (ROOT / page["path"]).read_text(encoding="utf-8")
        title_match = re.search(r"<title>([^<]+)</title>", content)
        if not title_match or title_match.group(1) != page["title"]:
            errors.append(f"unexpected title: {page['path']}")
        if page["attribution"] not in content:
            errors.append(f"missing approved attribution: {page['path']}")
        if link_value(content, "canonical") != page["canonical"]:
            errors.append(f"unexpected canonical: {page['path']}")
        if link_value(content, "alternate", page["language"]) != page["canonical"]:
            errors.append(f"missing self hreflang: {page['path']}")
        other_language = "fr" if page["language"] == "en" else "en"
        if link_value(content, "alternate", other_language) != page["alternate"]:
            errors.append(f"missing paired hreflang: {page['path']}")
        if link_value(content, "alternate", "x-default") != "https://nicolaspieper.com/projects/":
            errors.append(f"unexpected x-default: {page['path']}")
        if meta_value(content, "property", "og:image") != social_card:
            errors.append(f"unexpected og:image: {page['path']}")
        if meta_value(content, "name", "twitter:image") != social_card:
            errors.append(f"unexpected twitter:image: {page['path']}")

        project_ids = re.findall(r'<section class="doc-section project-entry" id="([a-z0-9-]+)"', content)
        if project_ids != expected_projects:
            errors.append(f"project order mismatch: {page['path']}")

        json_blocks = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', content, re.S)
        if len(json_blocks) != 1:
            errors.append(f"expected one JSON-LD block: {page['path']}")
            continue
        try:
            graph = json.loads(json_blocks[0]).get("@graph", [])
        except json.JSONDecodeError as exc:
            errors.append(f"invalid JSON-LD in {page['path']}: {exc}")
            continue
        schema_types = {node.get("@type") for node in graph if isinstance(node, dict)}
        required_types = {"CollectionPage", "ItemList", "BreadcrumbList"}
        if not required_types.issubset(schema_types):
            errors.append(f"missing project JSON-LD types: {page['path']}")


def validate_home_project_links(errors: list[str]) -> None:
    expected_urls = [
        "https://surplasse.com/",
        "https://papersempire.com/",
        "https://parkventory.com/",
        "https://fouranu.com/",
        "https://monflorian.com/",
    ]
    monflorian_assets = (
        "/assets/img/projects/monflorian-avatar-v2.webp",
        "/assets/img/projects/monflorian-wordmark.webp",
    )

    for path in ("index.html", "fr/index.html"):
        content = (ROOT / path).read_text(encoding="utf-8")
        urls = re.findall(r'<a class="project-compact" href="([^"]+)"', content)
        if urls != expected_urls:
            errors.append(f"home project link order mismatch: {path}")
        project_contents = re.findall(
            r'<a class="project-compact"[^>]*>(.*?)</a>', content, re.S
        )
        if len(project_contents) != len(expected_urls):
            errors.append(f"home project markup count mismatch: {path}")
        if any(re.search(r"<a\b", block) for block in project_contents):
            errors.append(f"nested home project link: {path}")
        project_tags = re.findall(r'<a class="project-compact"[^>]*>', content)
        if any(
            'target="_blank"' not in tag or 'rel="noopener"' not in tag
            for tag in project_tags
        ):
            errors.append(f"home project external-link contract mismatch: {path}")
        for asset in monflorian_assets:
            if asset not in content:
                errors.append(f"missing Mon Florian V2 asset in {path}: {asset}")

    for path in ("projects/index.html", "fr/projects/index.html"):
        content = (ROOT / path).read_text(encoding="utf-8")
        for asset in monflorian_assets:
            if asset not in content:
                errors.append(f"missing Mon Florian V2 asset in {path}: {asset}")

    retired_asset = ROOT / "assets/img/projects/monflorian-logo.webp"
    if retired_asset.exists():
        errors.append("retired Mon Florian logo must not exist")

    for html_path in ROOT.rglob("*.html"):
        if "v2022" in html_path.parts:
            continue
        if "monflorian-logo.webp" in html_path.read_text(encoding="utf-8"):
            errors.append(f"retired Mon Florian logo referenced by {html_path.relative_to(ROOT)}")


def local_path_for_url(path: str) -> Path:
    relative = path.lstrip("/")
    if not relative or path.endswith("/"):
        return ROOT / relative / "index.html"
    return ROOT / relative


def validate_sitemap(errors: list[str]) -> None:
    sitemap = ET.parse(ROOT / "sitemap.xml")
    namespace = {
        "sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "image": "http://www.google.com/schemas/sitemap-image/1.1",
    }
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

    image_locations = sitemap.findall("sitemap:url/image:image/image:loc", namespace)
    if not image_locations:
        errors.append("sitemap.xml contains no image entries")
    for location in image_locations:
        value = (location.text or "").strip()
        parsed = urlparse(value)
        if parsed.scheme != "https" or parsed.netloc != CANONICAL_HOST:
            errors.append(f"non-canonical sitemap image URL: {value}")
            continue
        if not local_path_for_url(parsed.path).is_file():
            errors.append(f"sitemap image has no matching file: {value}")


def main() -> int:
    errors: list[str] = []
    validate_required_files(errors)
    validate_language_parity(errors)
    validate_projects(errors)
    validate_home_project_links(errors)
    validate_sitemap(errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print("Static site validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
