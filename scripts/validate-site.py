#!/usr/bin/env python3
"""Validate the static site, bilingual structure and global SEO contracts."""

from __future__ import annotations

from datetime import date, datetime
from html import unescape
from pathlib import Path
import json
import hashlib
import re
import struct
import subprocess
import sys
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent.parent
CANONICAL_HOST = "nicolaspieper.com"
CANONICAL_ORIGIN = f"https://{CANONICAL_HOST}"
SOCIAL_WIDTH = 1200
SOCIAL_HEIGHT = 630
SITE_TIMEZONE = ZoneInfo("Europe/Paris")


def read(relative: str | Path) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def validate_required_files(errors: list[str]) -> None:
    required = (
        "404.html",
        "CNAME",
        "index.html",
        "fr/index.html",
        "work/index.html",
        "fr/work/index.html",
        "projects/index.html",
        "fr/projects/index.html",
        "objects/index.html",
        "fr/objects/index.html",
        "data/objects.json",
        "scripts/generate-objects.py",
        "assets/img/objects/og-objects-en.png",
        "assets/img/objects/og-objects-fr.png",
        "cv/index.html",
        "fr/cv/index.html",
        "blog/index.html",
        "fr/blog/index.html",
        "claude/index.html",
        "claude/roadtrip-austria-2026/index.html",
        "robots.txt",
        "sitemap.xml",
        "llms.txt",
        "assets/img/og-home.png",
        "assets/img/og-home-fr.png",
        "assets/img/og-work.png",
        "assets/img/og-work-fr.png",
        "assets/img/og-cv.png",
        "assets/img/og-cv-fr.png",
        "assets/img/og-blog.png",
        "assets/img/og-blog-fr.png",
        "assets/img/og-claude.png",
        "assets/img/og-roadtrip.png",
        "assets/img/projects/surplasse-logo.webp",
        "assets/img/projects/papers-empire-logo.webp",
        "assets/img/projects/parkventory-logo.svg",
        "assets/img/projects/fouranu-logo.png",
        "assets/img/projects/monflorian-avatar-v2.webp",
        "assets/img/projects/monflorian-wordmark.webp",
        "assets/img/projects/PROVENANCE.md",
        "assets/img/projects/projects-social-card.jpg",
        "assets/img/projects/projects-social-card-fr.jpg",
        "assets/img/projects/surplasse-social-card.png",
        "assets/img/projects/papers-empire-social-card.jpg",
        "assets/img/projects/parkventory-social-card.png",
        "assets/img/projects/fouranu-social-card.jpg",
        "assets/img/projects/monflorian-social-card.png",
    )
    for relative in required:
        if not (ROOT / relative).is_file():
            errors.append(f"missing required file: {relative}")

    cname = read("CNAME").strip()
    if cname != CANONICAL_HOST:
        errors.append(f"CNAME must contain exactly {CANONICAL_HOST}")


def section_ids(content: str) -> set[str]:
    return set(re.findall(r'<section[^>]*\bid="([a-z0-9-]+)"', content))


def local_anchors(content: str) -> set[str]:
    return set(re.findall(r'href="(#[a-z0-9-]+)"', content))


def validate_language_parity(errors: list[str]) -> None:
    pairs = (
        ("index.html", "fr/index.html"),
        ("work/index.html", "fr/work/index.html"),
        ("projects/index.html", "fr/projects/index.html"),
        ("objects/index.html", "fr/objects/index.html"),
        ("cv/index.html", "fr/cv/index.html"),
        ("blog/index.html", "fr/blog/index.html"),
        (
            "blog/growing-up-with-the-web/index.html",
            "fr/blog/growing-up-with-the-web/index.html",
        ),
        (
            "blog/claude-in-the-enterprise/index.html",
            "fr/blog/claude-in-the-enterprise/index.html",
        ),
        (
            "blog/organizing-the-solutions-team/index.html",
            "fr/blog/organizing-the-solutions-team/index.html",
        ),
        (
            "blog/claude-assisted-by-a-human/index.html",
            "fr/blog/claude-assisted-by-a-human/index.html",
        ),
        (
            "blog/ai-in-the-sdlc/index.html",
            "fr/blog/ai-in-the-sdlc/index.html",
        ),
        (
            "blog/ai-coding-agents-logging/index.html",
            "fr/blog/ai-coding-agents-logging/index.html",
        ),
    )
    for english_path, french_path in pairs:
        english = read(english_path)
        french = read(french_path)
        if section_ids(english) != section_ids(french):
            errors.append(f"section mismatch: {english_path} and {french_path}")
        if local_anchors(english) != local_anchors(french):
            errors.append(f"anchor mismatch: {english_path} and {french_path}")
        english_canonical = canonical_url_for_html(ROOT / english_path)
        french_canonical = canonical_url_for_html(ROOT / french_path)
        expected_alternates = {
            "en": english_canonical,
            "fr": french_canonical,
            "x-default": english_canonical,
        }
        if alternate_links(english) != expected_alternates:
            errors.append(f"unexpected hreflang set: {english_path}")
        if alternate_links(french) != expected_alternates:
            errors.append(f"unexpected hreflang set: {french_path}")


def title_value(content: str) -> Optional[str]:
    match = re.search(r"<title>([^<]+)</title>", content)
    return unescape(match.group(1).strip()) if match else None


def meta_value(content: str, attribute: str, key: str) -> Optional[str]:
    pattern = rf'<meta[^>]*\b{attribute}="{re.escape(key)}"[^>]*\bcontent="([^"]*)"'
    match = re.search(pattern, content)
    return unescape(match.group(1)) if match else None


def link_value(
    content: str, rel: str, hreflang: Optional[str] = None
) -> Optional[str]:
    if hreflang:
        pattern = (
            rf'<link[^>]*\brel="{re.escape(rel)}"[^>]*'
            rf'\bhreflang="{re.escape(hreflang)}"[^>]*\bhref="([^"]+)"'
        )
    else:
        pattern = (
            rf'<link[^>]*\brel="{re.escape(rel)}"[^>]*\bhref="([^"]+)"'
        )
    match = re.search(pattern, content)
    return unescape(match.group(1)) if match else None


def alternate_links(content: str) -> dict[str, str]:
    links: dict[str, str] = {}
    for tag in re.findall(r"<link\b[^>]*>", content):
        attributes = dict(re.findall(r'([\w:-]+)="([^"]*)"', tag))
        if attributes.get("rel") != "alternate" or "hreflang" not in attributes:
            continue
        links[attributes["hreflang"]] = unescape(attributes.get("href", ""))
    return links


def canonical_url_for_html(path: Path) -> str:
    relative = path.relative_to(ROOT)
    if relative.name == "index.html":
        parent = relative.parent.as_posix()
        route = "/" if parent == "." else f"/{parent}/"
    else:
        route = f"/{relative.as_posix()}"
    return f"{CANONICAL_ORIGIN}{route}"


def local_path_for_url(path: str) -> Path:
    relative = path.lstrip("/")
    if not relative or path.endswith("/"):
        return ROOT / relative / "index.html"
    return ROOT / relative


def local_path_for_absolute_url(value: str) -> Optional[Path]:
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.netloc != CANONICAL_HOST:
        return None
    return local_path_for_url(parsed.path)


def json_ld_nodes(
    relative: Path, content: str, errors: list[str]
) -> list[dict[str, object]]:
    parsed_nodes: list[dict[str, object]] = []
    blocks = re.findall(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
        content,
        re.S,
    )
    if not blocks:
        errors.append(f"missing JSON-LD: {relative}")
        return parsed_nodes

    for block in blocks:
        try:
            data = json.loads(block)
        except json.JSONDecodeError as exc:
            errors.append(f"invalid JSON-LD in {relative}: {exc}")
            continue
        nodes = data.get("@graph", [data]) if isinstance(data, dict) else data
        if not isinstance(nodes, list):
            nodes = [nodes]
        for node in nodes:
            if isinstance(node, dict):
                parsed_nodes.append(node)
    return parsed_nodes


def node_types(node: dict[str, object]) -> set[str]:
    value = node.get("@type")
    if isinstance(value, str):
        return {value}
    if isinstance(value, list):
        return {item for item in value if isinstance(item, str)}
    return set()


def json_ld_types(nodes: list[dict[str, object]]) -> set[str]:
    types: set[str] = set()
    for node in nodes:
        types.update(node_types(node))
    return types


def linked_url(value: object) -> Optional[str]:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        for key in ("@id", "url"):
            candidate = value.get(key)
            if isinstance(candidate, str):
                return candidate
    return None


def image_urls(value: object) -> set[str]:
    values = value if isinstance(value, list) else [value]
    urls: set[str] = set()
    for item in values:
        if isinstance(item, str):
            urls.add(item)
        elif isinstance(item, dict):
            for key in ("url", "@id"):
                candidate = item.get(key)
                if isinstance(candidate, str):
                    urls.add(candidate)
    return urls


def expected_schema_types(relative: Path) -> set[str]:
    value = relative.as_posix()
    exact = {
        "index.html": {"Person", "WebSite", "ProfilePage"},
        "fr/index.html": {"Person", "WebSite", "ProfilePage"},
        "work/index.html": {"WebPage", "BreadcrumbList"},
        "fr/work/index.html": {"WebPage", "BreadcrumbList"},
        "projects/index.html": {"CollectionPage", "ItemList", "BreadcrumbList"},
        "fr/projects/index.html": {
            "CollectionPage",
            "ItemList",
            "BreadcrumbList",
        },
        "cv/index.html": {"Person", "ProfilePage", "BreadcrumbList"},
        "objects/index.html": {"CollectionPage", "ItemList", "BreadcrumbList"},
        "fr/objects/index.html": {"CollectionPage", "ItemList", "BreadcrumbList"},
        "fr/cv/index.html": {"Person", "ProfilePage", "BreadcrumbList"},
        "blog/index.html": {"Blog", "BreadcrumbList"},
        "fr/blog/index.html": {"Blog", "BreadcrumbList"},
        "claude/index.html": {"WebPage", "BreadcrumbList"},
        "claude/roadtrip-austria-2026/index.html": {
            "Article",
            "BreadcrumbList",
        },
    }
    if value in exact:
        return exact[value]
    if re.fullmatch(r"(?:fr/)?blog/[^/]+/index\.html", value):
        return {"BlogPosting", "BreadcrumbList"}
    return set()


def image_mime(path: Path) -> Optional[str]:
    suffix = path.suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(suffix)


def image_dimensions(path: Path) -> Optional[tuple[int, int]]:
    data = path.read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return struct.unpack(">II", data[16:24])
    if not data.startswith(b"\xff\xd8"):
        return None

    offset = 2
    sof_markers = {
        0xC0,
        0xC1,
        0xC2,
        0xC3,
        0xC5,
        0xC6,
        0xC7,
        0xC9,
        0xCA,
        0xCB,
        0xCD,
        0xCE,
        0xCF,
    }
    while offset + 4 <= len(data):
        if data[offset] != 0xFF:
            offset += 1
            continue
        marker = data[offset + 1]
        offset += 2
        if marker in {0xD8, 0xD9}:
            continue
        if offset + 2 > len(data):
            break
        length = struct.unpack(">H", data[offset : offset + 2])[0]
        if length < 2 or offset + length > len(data):
            break
        if marker in sof_markers and length >= 7:
            height, width = struct.unpack(">HH", data[offset + 3 : offset + 7])
            return width, height
        offset += length
    return None


def html_pages() -> list[Path]:
    pages = []
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT)
        if "v2022" in relative.parts or "scripts" in relative.parts:
            continue
        pages.append(path)
    return sorted(pages)


def validate_img_dimensions(relative: Path, content: str, errors: list[str]) -> None:
    for tag in re.findall(r"<img\b[^>]*>", content, re.S):
        if not re.search(r"\bwidth=", tag) or not re.search(r"\bheight=", tag):
            source = re.search(r'\bsrc="([^"]+)"', tag)
            label = source.group(1) if source else "unknown image"
            errors.append(f"image missing width/height in {relative}: {label}")


def validate_global_metadata(
    errors: list[str],
) -> dict[str, tuple[Path, str]]:
    indexable: dict[str, tuple[Path, str]] = {}
    titles: dict[str, Path] = {}
    descriptions: dict[str, Path] = {}

    for path in html_pages():
        relative = path.relative_to(ROOT)
        content = path.read_text(encoding="utf-8")
        robots = (meta_value(content, "name", "robots") or "").lower()
        validate_img_dimensions(relative, content, errors)

        if "noindex" in robots:
            continue
        if "index" not in robots or "follow" not in robots:
            errors.append(f"indexable page must declare index, follow: {relative}")
        if "max-image-preview:large" not in robots:
            errors.append(f"missing max-image-preview:large: {relative}")

        title = title_value(content)
        description = meta_value(content, "name", "description")
        if not title:
            errors.append(f"missing title: {relative}")
        elif len(title) > 80:
            errors.append(f"title exceeds 80 characters: {relative}")
        if not description:
            errors.append(f"missing description: {relative}")
        elif len(description) > 180:
            errors.append(f"description exceeds 180 characters: {relative}")
        if not meta_value(content, "name", "author"):
            errors.append(f"missing author metadata: {relative}")

        if title:
            if title in titles:
                errors.append(
                    f"duplicate title: {relative} and {titles[title]}"
                )
            titles[title] = relative
        if description:
            if description in descriptions:
                errors.append(
                    f"duplicate description: {relative} and {descriptions[description]}"
                )
            descriptions[description] = relative

        canonical = link_value(content, "canonical")
        expected_canonical = canonical_url_for_html(path)
        if canonical != expected_canonical:
            errors.append(
                f"unexpected canonical in {relative}: {canonical or 'missing'}"
            )
            continue
        indexable[canonical] = (relative, content)

        lang_match = re.search(r'<html[^>]*\blang="([^"]+)"', content)
        language = lang_match.group(1) if lang_match else None
        if language not in {"en", "fr"}:
            errors.append(f"unexpected or missing language: {relative}")
        expected_locale = "fr_FR" if language == "fr" else "en_US"

        h1_count = len(re.findall(r"<h1\b", content))
        if h1_count != 1:
            errors.append(f"expected one h1 in {relative}, found {h1_count}")

        required_og = (
            "type",
            "site_name",
            "title",
            "description",
            "url",
            "image",
            "image:type",
            "image:width",
            "image:height",
            "image:alt",
            "locale",
        )
        og = {
            key: meta_value(content, "property", f"og:{key}")
            for key in required_og
        }
        for key, value in og.items():
            if not value:
                errors.append(f"missing og:{key} in {relative}")
        if og["site_name"] != "Nicolas Pieper":
            errors.append(f"unexpected og:site_name in {relative}")
        if og["url"] != canonical:
            errors.append(f"og:url does not match canonical in {relative}")
        if og["locale"] != expected_locale:
            errors.append(f"unexpected og:locale in {relative}")

        twitter = {
            key: meta_value(content, "name", f"twitter:{key}")
            for key in ("card", "title", "description", "image", "image:alt")
        }
        for key, value in twitter.items():
            if not value:
                errors.append(f"missing twitter:{key} in {relative}")
        if twitter["card"] != "summary_large_image":
            errors.append(f"unexpected twitter:card in {relative}")
        if twitter["image"] != og["image"]:
            errors.append(f"Twitter and Open Graph images differ in {relative}")
        if twitter["image:alt"] != og["image:alt"]:
            errors.append(f"Twitter and Open Graph image alts differ in {relative}")

        if og["image"]:
            image_path = local_path_for_absolute_url(og["image"])
            if image_path is None or not image_path.is_file():
                errors.append(f"missing local social image in {relative}")
            else:
                expected_mime = image_mime(image_path)
                if og["image:type"] != expected_mime:
                    errors.append(f"incorrect og:image:type in {relative}")
                dimensions = image_dimensions(image_path)
                if dimensions != (SOCIAL_WIDTH, SOCIAL_HEIGHT):
                    errors.append(
                        f"social image must be 1200x630 in {relative}: {dimensions}"
                    )
                if og["image:width"] != str(SOCIAL_WIDTH):
                    errors.append(f"incorrect og:image:width in {relative}")
                if og["image:height"] != str(SOCIAL_HEIGHT):
                    errors.append(f"incorrect og:image:height in {relative}")

        if og["type"] == "article":
            for key in ("published_time", "modified_time", "author"):
                value = meta_value(content, "property", f"article:{key}")
                if not value:
                    errors.append(f"missing article:{key} in {relative}")
            if (
                meta_value(content, "property", "article:author")
                != f"{CANONICAL_ORIGIN}/"
            ):
                errors.append(f"article:author must be the profile URL: {relative}")

        nodes = json_ld_nodes(relative, content, errors)
        actual_types = json_ld_types(nodes)
        required_types = expected_schema_types(relative)
        missing_types = required_types - actual_types
        if missing_types:
            errors.append(
                f"missing JSON-LD types in {relative}: "
                f"{', '.join(sorted(missing_types))}"
            )

        primary_types = {
            "Article",
            "Blog",
            "BlogPosting",
            "CollectionPage",
            "ProfilePage",
            "WebPage",
        }
        primary_nodes = [
            node for node in nodes if node_types(node) & primary_types
        ]
        if len(primary_nodes) != 1:
            errors.append(
                f"expected one primary JSON-LD node in {relative}, "
                f"found {len(primary_nodes)}"
            )
        else:
            primary = primary_nodes[0]
            primary_url = linked_url(primary.get("mainEntityOfPage"))
            if primary_url is None:
                primary_url = linked_url(primary.get("url"))
            if primary_url != canonical:
                errors.append(f"JSON-LD canonical mismatch in {relative}")
            if primary.get("inLanguage") != language:
                errors.append(f"JSON-LD language mismatch in {relative}")

        if og["type"] == "article":
            article_nodes = [
                node
                for node in nodes
                if node_types(node) & {"Article", "BlogPosting"}
            ]
            if len(article_nodes) == 1:
                article_node = article_nodes[0]
                published = meta_value(
                    content, "property", "article:published_time"
                )
                modified = meta_value(
                    content, "property", "article:modified_time"
                )
                if article_node.get("datePublished") != published:
                    errors.append(
                        f"JSON-LD published date mismatch in {relative}"
                    )
                if article_node.get("dateModified") != modified:
                    errors.append(
                        f"JSON-LD modified date mismatch in {relative}"
                    )
                if linked_url(article_node.get("author")) != (
                    f"{CANONICAL_ORIGIN}/#person"
                ):
                    errors.append(f"JSON-LD author mismatch in {relative}")
                if og["image"] not in image_urls(article_node.get("image")):
                    errors.append(f"JSON-LD image mismatch in {relative}")

        if "BreadcrumbList" in required_types:
            breadcrumb_nodes = [
                node
                for node in nodes
                if "BreadcrumbList" in node_types(node)
            ]
            if len(breadcrumb_nodes) == 1:
                items = breadcrumb_nodes[0].get("itemListElement")
                if not isinstance(items, list) or not items:
                    errors.append(f"empty JSON-LD breadcrumb in {relative}")
                else:
                    positioned_items = [
                        item for item in items if isinstance(item, dict)
                    ]
                    last_item = max(
                        positioned_items,
                        key=lambda item: item.get("position", 0)
                        if isinstance(item.get("position"), int)
                        else 0,
                        default=None,
                    )
                    if last_item is None or linked_url(
                        last_item.get("item")
                    ) != canonical:
                        errors.append(
                            f"JSON-LD breadcrumb canonical mismatch in {relative}"
                        )

    return indexable


def validate_noindex_surfaces(errors: list[str]) -> None:
    paths = (
        "400.html",
        "401.html",
        "403.html",
        "404.html",
        "410.html",
        "429.html",
        "500.html",
        "502.html",
        "503.html",
        "504.html",
        "dashboard/index.html",
        "scripts/og-template.html",
        "scripts/projects-og-template.html",
    )
    for relative in paths:
        robots = (meta_value(read(relative), "name", "robots") or "").lower()
        if "noindex" not in robots:
            errors.append(f"expected noindex: {relative}")


def validate_projects(errors: list[str]) -> None:
    pages = (
        {
            "path": "projects/index.html",
            "title": "Web products and engineering systems · Nicolas Pieper",
            "canonical": f"{CANONICAL_ORIGIN}/projects/",
            "language": "en",
            "alternate": f"{CANONICAL_ORIGIN}/fr/projects/",
            "social_card": (
                f"{CANONICAL_ORIGIN}/assets/img/projects/"
                "projects-social-card.jpg?v=2"
            ),
            "attribution": (
                "Products and systems I initiate and lead, from idea to "
                "production. I build them with AI coding assistants, then "
                "review, test and verify every release."
            ),
        },
        {
            "path": "fr/projects/index.html",
            "title": "Produits web et systèmes d’ingénierie · Nicolas Pieper",
            "canonical": f"{CANONICAL_ORIGIN}/fr/projects/",
            "language": "fr",
            "alternate": f"{CANONICAL_ORIGIN}/projects/",
            "social_card": (
                f"{CANONICAL_ORIGIN}/assets/img/projects/"
                "projects-social-card-fr.jpg?v=1"
            ),
            "attribution": (
                "Des produits et des systèmes que j’initie et pilote, de "
                "l’idée à la production. Je les construis avec des assistants "
                "IA, puis je relis, teste et vérifie chaque livraison."
            ),
        },
    )
    expected_projects = [
        "surplasse",
        "papers-empire",
        "parkventory",
        "four-a-nu",
        "mon-florian",
    ]

    for page in pages:
        content = read(page["path"])
        if title_value(content) != page["title"]:
            errors.append(f"unexpected title: {page['path']}")
        if page["attribution"] not in content:
            errors.append(f"missing approved attribution: {page['path']}")
        if link_value(content, "canonical") != page["canonical"]:
            errors.append(f"unexpected canonical: {page['path']}")
        if (
            link_value(content, "alternate", page["language"])
            != page["canonical"]
        ):
            errors.append(f"missing self hreflang: {page['path']}")
        other_language = "fr" if page["language"] == "en" else "en"
        if (
            link_value(content, "alternate", other_language)
            != page["alternate"]
        ):
            errors.append(f"missing paired hreflang: {page['path']}")
        if (
            link_value(content, "alternate", "x-default")
            != f"{CANONICAL_ORIGIN}/projects/"
        ):
            errors.append(f"unexpected x-default: {page['path']}")
        if meta_value(content, "property", "og:image") != page["social_card"]:
            errors.append(f"unexpected og:image: {page['path']}")
        if meta_value(content, "name", "twitter:image") != page["social_card"]:
            errors.append(f"unexpected twitter:image: {page['path']}")

        project_ids = re.findall(
            r'<section class="doc-section project-entry" id="([a-z0-9-]+)"',
            content,
        )
        if project_ids != expected_projects:
            errors.append(f"project order mismatch: {page['path']}")


def validate_objects(errors: list[str]) -> None:
    """Keep ownership, bilingual catalog content and affiliate destinations explicit."""
    catalog_path = ROOT / "data/objects.json"
    if not catalog_path.is_file():
        return
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"invalid object catalog JSON: {exc}")
        return
    if not isinstance(catalog, dict):
        errors.append("object catalog must be a JSON object")
        return
    affiliate_tag = catalog.get("affiliateTag")
    if affiliate_tag != "nclsppr-21":
        errors.append("object catalog must use affiliateTag nclsppr-21")
    objects = catalog.get("objects")
    if not isinstance(objects, list) or not objects:
        errors.append("object catalog must contain a non-empty objects array")
        return

    object_ids: list[str] = []
    affiliate_urls: set[str] = set()
    for item in objects:
        if not isinstance(item, dict):
            errors.append("object catalog entry must be an object")
            continue
        object_id = item.get("id")
        if not isinstance(object_id, str) or not re.fullmatch(
            r"[a-z0-9]+(?:-[a-z0-9]+)*", object_id
        ):
            errors.append(f"invalid catalog object ID: {object_id}")
            continue
        if object_id in object_ids:
            errors.append(f"duplicate catalog object ID: {object_id}")
        object_ids.append(object_id)
        if item.get("status") not in {"owned", "wishlist"}:
            errors.append(f"invalid ownership status: {object_id}")
        for field in ("variant", "note"):
            localized = item.get(field)
            if not isinstance(localized, dict) or any(
                not isinstance(localized.get(language), str)
                or not localized[language].strip()
                for language in ("en", "fr")
            ):
                errors.append(f"missing bilingual {field}: {object_id}")
        links = item.get("links")
        if not isinstance(links, list) or not links:
            errors.append(f"object must offer a product or related search: {object_id}")
            continue
        if not any(isinstance(link, dict) and link.get("kind") == "exact" for link in links) and len(links) < 2:
            errors.append(f"object without an exact link must offer multiple paths: {object_id}")
        product_image = item.get("image", {})
        if product_image.get("src"):
            image_file = ROOT / product_image["src"].lstrip("/")
            if not image_file.is_file():
                errors.append(f"missing object image: {object_id}")
            elif hashlib.sha256(image_file.read_bytes()).hexdigest() != product_image.get("sha256"):
                errors.append(f"object image differs from provenance: {object_id}")
            for field in ("source", "sourcePage", "credit", "rights", "checkedAt"):
                if not product_image.get(field):
                    errors.append(f"missing image provenance {field}: {object_id}")
            if not all(product_image.get("alt", {}).get(language) for language in ("en", "fr")):
                errors.append(f"missing bilingual image description: {object_id}")
        for link in links:
            if not isinstance(link, dict):
                errors.append(f"invalid product link: {object_id}")
                continue
            if link.get("kind") not in {"exact", "alternative", "search"}:
                errors.append(f"unclassified product link: {object_id}")
            destination = link.get("url")
            if not isinstance(destination, str):
                errors.append(f"missing product link URL: {object_id}")
                continue
            parsed = urlparse(destination)
            if parsed.scheme != "https" or parsed.netloc not in {
                "amazon.fr", "www.amazon.fr"
            }:
                errors.append(f"product link must target Amazon.fr: {object_id}")
            if parse_qs(parsed.query).get("tag") != ["nclsppr-21"]:
                errors.append(f"incorrect Amazon affiliate tag: {object_id}")
            if link.get("kind") == "exact" and not re.search(
                r"/(?:dp|gp/product)/[A-Z0-9]{10}(?:/|$)", parsed.path
            ):
                errors.append(f"exact product link requires an ASIN: {object_id}")
            affiliate_urls.add(destination)

    for relative in ("objects/index.html", "fr/objects/index.html"):
        if not (ROOT / relative).is_file():
            continue
        content = read(relative)
        rendered_ids = re.findall(r'\bdata-object-id="([^"]+)"', content)
        if len(rendered_ids) != len(object_ids) or set(rendered_ids) != set(object_ids):
            errors.append(f"rendered object catalog differs from source: {relative}")
        rendered_urls: set[str] = set()
        for tag in re.findall(r"<a\b[^>]*>", content):
            attributes = dict(re.findall(r'([\w:-]+)="([^"]*)"', tag))
            href = unescape(attributes.get("href", ""))
            if urlparse(href).netloc not in {"amazon.fr", "www.amazon.fr"}:
                continue
            rendered_urls.add(href)
            if parse_qs(urlparse(href).query).get("tag") != ["nclsppr-21"]:
                errors.append(f"rendered Amazon link has incorrect tag: {relative}")
            rel = set(attributes.get("rel", "").split())
            if "sponsored" not in rel:
                errors.append(f"Amazon affiliate link lacks sponsored rel: {relative}")
            if attributes.get("target") == "_blank" and "noopener" not in rel:
                errors.append(f"Amazon new-tab link lacks noopener: {relative}")
        if rendered_urls != affiliate_urls:
            errors.append(f"rendered affiliate destinations differ from catalog: {relative}")

    generated = subprocess.run(
        [sys.executable, str(ROOT / "scripts/generate-objects.py"), "--check"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if generated.returncode:
        detail = (generated.stdout or generated.stderr).strip()
        errors.append(f"object pages need regeneration: {detail}")


def validate_navigation(errors: list[str]) -> None:
    """Keep the catalog discoverable in the shared desktop and mobile navigation."""
    for path in html_pages():
        relative = path.relative_to(ROOT)
        content = path.read_text(encoding="utf-8")
        if "noindex" in (meta_value(content, "name", "robots") or ""):
            continue
        if 'class="header-nav"' not in content:
            continue
        route = "/fr/objects/" if relative.parts[0] == "fr" else "/objects/"
        for pattern, label in (
            (r'<nav class="header-nav"[^>]*>.*?</nav>', "header"),
            (r'<footer class="site-footer"[^>]*>.*?</footer>', "footer"),
            (r'<aside class="sidebar"[^>]*>.*?</aside>', "mobile sidebar"),
        ):
            block = re.search(pattern, content, re.S)
            if block is None or f'href="{route}"' not in block.group(0):
                errors.append(f"missing Objects link in {label}: {relative}")


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
        content = read(path)
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
        content = read(path)
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
            errors.append(
                "retired Mon Florian logo referenced by "
                f"{html_path.relative_to(ROOT)}"
            )


def validate_sitemap(
    errors: list[str], indexable: dict[str, tuple[Path, str]]
) -> None:
    namespace = {
        "sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9",
        "xhtml": "http://www.w3.org/1999/xhtml",
        "image": "http://www.google.com/schemas/sitemap-image/1.1",
    }
    root = ET.parse(ROOT / "sitemap.xml").getroot()
    entries: dict[str, dict[str, object]] = {}

    if root.findall("sitemap:url/sitemap:changefreq", namespace):
        errors.append("sitemap must not contain ignored changefreq values")
    if root.findall("sitemap:url/sitemap:priority", namespace):
        errors.append("sitemap must not contain ignored priority values")

    for url_node in root.findall("sitemap:url", namespace):
        location_node = url_node.find("sitemap:loc", namespace)
        value = (location_node.text or "").strip() if location_node is not None else ""
        if not value:
            errors.append("sitemap URL missing loc")
            continue
        if value in entries:
            errors.append(f"duplicate sitemap URL: {value}")
            continue
        parsed = urlparse(value)
        if parsed.scheme != "https" or parsed.netloc != CANONICAL_HOST:
            errors.append(f"non-canonical sitemap URL: {value}")
        if not local_path_for_url(parsed.path).is_file():
            errors.append(f"sitemap URL has no matching file: {value}")

        lastmod_node = url_node.find("sitemap:lastmod", namespace)
        lastmod = (lastmod_node.text or "").strip() if lastmod_node is not None else ""
        try:
            lastmod_date = date.fromisoformat(lastmod)
            if lastmod_date > datetime.now(SITE_TIMEZONE).date():
                errors.append(f"future sitemap lastmod: {value}")
        except ValueError:
            errors.append(f"invalid sitemap lastmod: {value}")

        alternates = {
            node.attrib.get("hreflang", ""): node.attrib.get("href", "")
            for node in url_node.findall("xhtml:link", namespace)
        }
        images = {
            (node.text or "").strip()
            for node in url_node.findall("image:image/image:loc", namespace)
        }
        if not images:
            errors.append(f"sitemap URL missing representative image: {value}")
        for image_url in images:
            image_path = local_path_for_absolute_url(image_url)
            if image_path is None or not image_path.is_file():
                errors.append(f"invalid sitemap image URL: {image_url}")
        entries[value] = {
            "alternates": alternates,
            "images": images,
        }

    sitemap_urls = set(entries)
    indexable_urls = set(indexable)
    if sitemap_urls != indexable_urls:
        for value in sorted(indexable_urls - sitemap_urls):
            errors.append(f"indexable page missing from sitemap: {value}")
        for value in sorted(sitemap_urls - indexable_urls):
            errors.append(f"non-indexable page present in sitemap: {value}")

    for canonical, (relative, content) in indexable.items():
        entry = entries.get(canonical)
        if entry is None:
            continue
        html_alternates = alternate_links(content)
        sitemap_alternates = entry["alternates"]
        if html_alternates != sitemap_alternates:
            errors.append(f"sitemap hreflang mismatch: {relative}")
        for target in html_alternates.values():
            if target not in sitemap_urls:
                errors.append(f"hreflang target missing from sitemap: {target}")

        og_image = meta_value(content, "property", "og:image")
        if og_image:
            parsed = urlparse(og_image)
            unversioned = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if unversioned not in entry["images"]:
                errors.append(f"og:image missing from sitemap images: {relative}")

    for canonical, entry in entries.items():
        alternates = entry["alternates"]
        if not alternates:
            continue
        for target in alternates.values():
            target_entry = entries.get(target)
            if target_entry and target_entry["alternates"] != alternates:
                errors.append(f"non-reciprocal sitemap hreflang: {canonical}")


def robots_rules(content: str) -> list[tuple[str, str]]:
    groups: list[tuple[list[str], list[tuple[str, str]]]] = []
    agents: list[str] = []
    rules: list[tuple[str, str]] = []

    for raw_line in content.splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        name, value = (part.strip() for part in line.split(":", 1))
        directive = name.lower()
        if directive == "user-agent":
            if rules:
                groups.append((agents, rules))
                agents = []
                rules = []
            agents.append(value.lower())
        elif directive in {"allow", "disallow"} and agents:
            rules.append((directive, value))

    if agents or rules:
        groups.append((agents, rules))

    return [
        rule
        for group_agents, group_rules in groups
        if "*" in group_agents
        for rule in group_rules
    ]


def robots_path_allowed(path: str, rules: list[tuple[str, str]]) -> bool:
    matches: list[tuple[int, str]] = []
    for directive, pattern in rules:
        if not pattern:
            continue
        anchored = pattern.endswith("$")
        core = pattern[:-1] if anchored else pattern
        expression = "^" + re.escape(core).replace(r"\*", ".*")
        if anchored:
            expression += "$"
        if re.search(expression, path):
            specificity = len(core.replace("*", ""))
            matches.append((specificity, directive))

    if not matches:
        return True
    longest = max(length for length, _ in matches)
    return any(
        directive == "allow"
        for length, directive in matches
        if length == longest
    )


def validate_robots(
    errors: list[str], indexable: dict[str, tuple[Path, str]]
) -> None:
    robots = read("robots.txt")
    if f"Sitemap: {CANONICAL_ORIGIN}/sitemap.xml" not in robots:
        errors.append("robots.txt must declare the canonical sitemap")
    rules = robots_rules(robots)
    for canonical in indexable:
        path = urlparse(canonical).path
        if not robots_path_allowed(path, rules):
            errors.append(f"robots.txt blocks indexable page: {path}")
    for path in (
        "/dashboard/",
        "/scripts/og-template.html",
        "/scripts/projects-og-template.html",
    ):
        if not robots_path_allowed(path, rules):
            errors.append(f"robots.txt blocks noindex surface: {path}")
    for template in (
        "Allow: /scripts/og-template.html",
        "Allow: /scripts/projects-og-template.html",
    ):
        if template not in robots:
            errors.append(f"robots.txt must allow noindex template: {template}")


def validate_llms(
    errors: list[str], indexable: dict[str, tuple[Path, str]]
) -> None:
    content = read("llms.txt")
    listed_urls = {
        value
        for value in re.findall(r"\]\((https://nicolaspieper\.com/[^)]*)\)", content)
    }
    expected_urls = set(indexable)
    for value in sorted(expected_urls - listed_urls):
        errors.append(f"indexable page missing from llms.txt: {value}")
    for value in sorted(listed_urls - expected_urls):
        errors.append(f"non-indexable page present in llms.txt: {value}")


def main() -> int:
    errors: list[str] = []
    validate_required_files(errors)
    validate_language_parity(errors)
    validate_noindex_surfaces(errors)
    indexable = validate_global_metadata(errors)
    validate_projects(errors)
    validate_objects(errors)
    validate_navigation(errors)
    validate_home_project_links(errors)
    validate_sitemap(errors, indexable)
    validate_robots(errors, indexable)
    validate_llms(errors, indexable)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(
        "Static site validation passed: "
        f"{len(indexable)} indexable pages with complete SEO contracts."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
