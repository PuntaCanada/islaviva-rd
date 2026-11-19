#!/usr/bin/env python3
"""Automatically fetch only RSS headline metadata and link to the source.
Never copy third-party article bodies or images.
"""
import datetime as dt
import email.utils
import json
import pathlib
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
UTC = dt.timezone.utc
NOW = dt.datetime.now(UTC)
MAX_AGE = dt.timedelta(hours=48)
FEEDS = [
    ("Diario Libre", "https://www.diariolibre.com/rss/portada.xml", "Actualidad"),
    ("Diario Libre", "https://www.diariolibre.com/rss/actualidad.xml", "Actualidad"),
    ("Diario Libre", "https://www.diariolibre.com/rss/economia.xml", "Economía"),
    ("Diario Libre", "https://www.diariolibre.com/rss/deportes.xml", "Deportes"),
    ("Diario Libre", "https://www.diariolibre.com/rss/politica.xml", "Política"),
    ("Diario Libre", "https://www.diariolibre.com/rss/mundo.xml", "Mundo"),
]
items = {}
successful_feeds = 0
for source, feed_url, category in FEEDS:
    try:
        req = urllib.request.Request(feed_url, headers={
            "User-Agent": "IslaVivaRD/1.0 (RSS news headlines, attribution and source links)",
            "Accept": "application/rss+xml, application/xml, text/xml",
        })
        with urllib.request.urlopen(req, timeout=18) as response:
            content = response.read(2_000_000)
        tree = ET.fromstring(content)
        if not tree.findall(".//item"):
            raise ValueError("No RSS items")
        successful_feeds += 1
        for node in tree.findall(".//item")[:35]:
            title = " ".join((node.findtext("title") or "").split())[:180]
            url = (node.findtext("link") or "").strip()
            p = urllib.parse.urlparse(url)
            if not title or p.scheme != "https" or p.hostname not in ("diariolibre.com", "www.diariolibre.com"):
                continue
            try:
                published = email.utils.parsedate_to_datetime(node.findtext("pubDate") or "")
                if published.tzinfo is None:
                    published = published.replace(tzinfo=UTC)
                published = published.astimezone(UTC)
            except (ValueError, TypeError, IndexError):
                continue
            if published > NOW + dt.timedelta(minutes=30) or NOW - published > MAX_AGE:
                continue
            entry = {"title": title, "url": url, "source": source, "category": category, "published": published.isoformat()}
            existing = items.get(url)
            if existing is None or (existing["category"] == "Actualidad" and category != "Actualidad"):
                items[url] = entry
    except Exception as exc:
        print(f"RSS feed unavailable: {feed_url}: {type(exc).__name__} {exc}")
out = ROOT / "data" / "news.json"
out.parent.mkdir(exist_ok=True)
if successful_feeds == 0:
    # Preserve the previous snapshot; the frontend independently refuses to show stale items.
    print("All RSS feeds failed: preserving existing file, no fake updates.")
else:
    latest = sorted(items.values(), key=lambda v: v["published"], reverse=True)[:36]
    data = {"updated": NOW.isoformat(), "source_status": "ok" if latest else "no_recent_articles", "items": latest}
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Successfully fetched {successful_feeds}/{len(FEEDS)} feeds; {len(latest)} recent headlines")
