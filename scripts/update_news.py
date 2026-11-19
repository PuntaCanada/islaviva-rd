#!/usr/bin/env python3
"""Fetch RSS headline metadata, linking to original publications."""
import datetime
import email.utils
import json
import pathlib
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
FEEDS = [
    ("Diario Libre", "https://www.diariolibre.com/rss/portada.xml", "Actualidad"),
    ("Diario Libre", "https://www.diariolibre.com/rss/economia.xml", "Economía"),
    ("Diario Libre", "https://www.diariolibre.com/rss/deportes.xml", "Deportes"),
]
items, seen = [], set()
for source, url, category in FEEDS:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "IslaVivaRD/0.1 (RSS headlines; source linked)"})
        with urllib.request.urlopen(request, timeout=18) as response:
            xml = response.read(1_500_000)
        root = ET.fromstring(xml)
        for item in root.findall(".//item")[:20]:
            title = " ".join((item.findtext("title") or "").split())[:180]
            link = (item.findtext("link") or "").strip()
            if not title or not link.startswith("https://www.diariolibre.com/") or link in seen:
                continue
            seen.add(link)
            try:
                published = email.utils.parsedate_to_datetime(item.findtext("pubDate") or "").isoformat()
            except Exception:
                published = ""
            items.append({"title": title, "url": link, "source": source, "category": category, "published": published})
    except Exception as error:
        print(f"Feed not available: {url} ({type(error).__name__})")
items.sort(key=lambda item: item["published"], reverse=True)
out = ROOT / "data" / "news.json"
out.parent.mkdir(exist_ok=True)
if items:
    out.write_text(json.dumps({"updated": datetime.datetime.now(datetime.timezone.utc).isoformat(), "items": items[:30]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(items)} headline links")
else:
    print("All feeds unavailable; preserving existing data.")
