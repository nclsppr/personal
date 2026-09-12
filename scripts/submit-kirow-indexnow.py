#!/usr/bin/env python3
"""Check deployed Kirow pages, then optionally notify IndexNow of their update."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener


ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://nicolaspieper.com"
KEY_FILE = ROOT / "indexnow-key.txt"
KEY_URL = f"{ORIGIN}/indexnow-key.txt"
URLS = tuple(ORIGIN + path for path in ("/kirow/", "/kirow/en/", "/kirow/grande-echelle/", "/kirow/en/large-scale/"))
ENDPOINT = "https://api.indexnow.org/indexnow"


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError(f"Unexpected redirect from {req.full_url}")


class PageMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.robots = []
        self.canonicals = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "meta" and (values.get("name") or "").lower() in {"robots", "bingbot"}:
            self.robots.append((values.get("content") or "").lower())
        if tag == "link" and (values.get("rel") or "").lower() == "canonical":
            self.canonicals.append(values.get("href"))


def fetch(opener, url):
    request = Request(url, headers={"User-Agent": "Kirow-IndexNow-Submission/1.0"})
    with opener.open(request, timeout=30) as response:
        if response.status != 200:
            raise ValueError(f"Expected HTTP 200 for {url}, got {response.status}")
        body = response.read(2_000_001)
        if len(body) > 2_000_000:
            raise ValueError(f"Unexpectedly large response for {url}")
        return body, response.headers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--submit", action="store_true", help="Notify IndexNow after all live checks pass")
    args = parser.parse_args()
    key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not re.fullmatch(r"[A-Za-z0-9-]{8,128}", key):
        raise ValueError("Invalid local IndexNow verification key")
    opener = build_opener(NoRedirects())
    live_key, _ = fetch(opener, KEY_URL)
    if live_key.decode("utf-8").strip() != key:
        raise ValueError("The deployed verification key does not match the local file")
    for url in URLS:
        body, headers = fetch(opener, url)
        local_file = ROOT / url.removeprefix(ORIGIN).lstrip("/") / "index.html"
        if body != local_file.read_bytes():
            raise ValueError(f"Deployed HTML differs from this checkout: {url}")
        metadata = PageMetadata()
        metadata.feed(body.decode("utf-8"))
        directives = ",".join(metadata.robots + headers.get_all("X-Robots-Tag", []))
        if re.search(r"\b(noindex|none|nofollow)\b", directives, re.IGNORECASE):
            raise ValueError(f"Deployed page has restrictive robots directives: {url}")
        if metadata.canonicals != [url]:
            raise ValueError(f"Deployed page must declare exactly its own canonical: {url}")
        print(f"Live HTML and canonical verified: {url}")
    if not args.submit:
        print("Checks passed. No URL submitted. Run again with --submit to notify IndexNow.")
        return
    payload = json.dumps({
        "host": "nicolaspieper.com",
        "key": key,
        "keyLocation": KEY_URL,
        "urlList": list(URLS),
    }).encode("utf-8")
    request = Request(ENDPOINT, data=payload, method="POST", headers={
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "Kirow-IndexNow-Submission/1.0",
    })
    with opener.open(request, timeout=30) as response:
        if response.status not in {200, 202}:
            raise ValueError(f"Unexpected IndexNow response: HTTP {response.status}")
        if response.status == 202:
            print("IndexNow HTTP 202: URLs received; verification key validation is pending.")
        else:
            print(f"IndexNow HTTP 200: {len(URLS)} URLs were submitted successfully.")
        print("This confirms receipt only. Crawling, indexing and ranking are not guaranteed.")


if __name__ == "__main__":
    try:
        main()
    except HTTPError as error:
        print(f"Submission stopped: HTTP {error.code} from {error.url}", file=sys.stderr)
        sys.exit(1)
    except (OSError, URLError, ValueError) as error:
        print(f"Submission stopped: {error}", file=sys.stderr)
        sys.exit(1)
