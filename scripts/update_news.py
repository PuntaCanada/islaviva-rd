#!/usr/bin/env python3
"""Automatically fetch only RSS headline metadata and link to the source.
Never copy third-party article bodies or images.
"""
import datetime as dt
import email.utils
import html
import re
from html.parser import HTMLParser
import json
import pathlib
import os
import urllib.parse
import uuid
import urllib.request
import xml.etree.ElementTree as ET
from news_quality import category_for, region_mentions, canonical_url, select_stories, validate_news, cached_title_translations, trustworthy_regions, filter_title_translations, feed_health, news_diagnostics

ROOT = pathlib.Path(__file__).resolve().parents[1]
UTC = dt.timezone.utc
NOW = dt.datetime.now(UTC)
MAX_AGE = dt.timedelta(hours=48)
FEEDS = [
    ("Diario Libre", "https://www.diariolibre.com/rss/portada.xml", "Actualidad", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/actualidad.xml", "Actualidad", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/economia.xml", "Economía", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/deportes.xml", "Deportes", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/politica.xml", "Política", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/mundo.xml", "Mundo", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/planeta.xml", "Medioambiente", "diariolibre.com"),
    ("Diario Libre", "https://www.diariolibre.com/rss/revista.xml", "Cultura", "diariolibre.com"),
    # Additional publisher RSS endpoints are best-effort, not guaranteed or licensed content feeds.
    ("Hoy", "https://hoy.com.do/rss/home.xml", "Actualidad", "hoy.com.do"),
    ("El Día", "https://eldia.com.do/feed/", "Actualidad", "eldia.com.do"),
    ("AlMomento", "https://almomento.net/feed/", "Actualidad", "almomento.net"),
    ("Noticias SIN", "https://noticiassin.com/feed/", "Actualidad", "noticiassin.com"),
    # Regional publishers (best-effort RSS discovery, never assume availability).
    ("Punta Cana Post", "https://puntacanapost.com/feed/", "Regionales", "puntacanapost.com"),
    ("El Tiempo", "https://eltiempo.com.do/feed/", "Regionales", "eltiempo.com.do"),
    ("Bávaro Digital", "https://bavarodigital.net/feed/", "Regionales", "bavarodigital.net"),
    # Independently verified RSS/2.0 XML with ten recent same-domain HTTPS
    # articles per publisher in the CI candidate audit on 2026-11-21.
    ("Diario 55", "https://diario55.com/feed/", "Regionales", "diario55.com"),
    ("Noticia.do", "https://noticia.do/feed/", "Regionales", "noticia.do"),
    # Verified: 10 recent RSS items and 10 same-domain HTTPS source links
    # on GitHub Actions regional-source audit, 2026-11-21.
    ("Diario Norte RD", "https://diarionorterd.com/feed/", "Regionales", "diarionorterd.com"),
]

class _PreviewParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts=[]
        self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in ("script","style"): self.skip+=1
        if tag in ("p","br","div") and not self.skip:self.parts.append(" ")
    def handle_endtag(self,tag):
        if tag in ("script","style") and self.skip:self.skip-=1
        if tag in ("p","div") and not self.skip:self.parts.append(" ")
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)

def clean_preview(value, limit=165):
    parser=_PreviewParser()
    parser.feed(value or "")
    raw=" ".join(html.unescape("".join(parser.parts)).split())
    raw=re.sub(r"\s*(Leer más|Read more|Continuar leyendo)\s*(»|…|\.\.\.)?\s*$","",raw,flags=re.I)
    if len(raw)>limit:
        raw=raw[:limit].rsplit(" ",1)[0].rstrip(".,;: ")+"…"
    return raw if len(raw)>=35 else ""

def safe_image(value):
    if not value: return ""
    url=html.unescape(value.strip())
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or not parsed.hostname or parsed.username or parsed.password or len(url)>900:
        return ""
    if parsed.hostname in ("localhost",) or parsed.hostname.endswith((".local",".internal")):return ""
    if url.lower().split("?")[0].endswith((".svg",".gif")):return ""
    return url

def rss_image(node):
    # Publisher RSS image metadata only; images are linked remotely, never rehosted.
    for child in node:
        tag=child.tag.rsplit("}",1)[-1].lower()
        if tag in ("content","thumbnail"):
            url=safe_image(child.attrib.get("url",""))
            media_type=child.attrib.get("type","")
            if url and (not media_type or media_type.startswith("image/")):return url
        if tag=="enclosure":
            url=safe_image(child.attrib.get("url",""))
            if url and child.attrib.get("type","").startswith("image/"):return url
    # Do not scrape embedded article images without a media RSS declaration.
    return ""

items = {}
successful_feeds = 0
failed_feeds = []
for source, feed_url, category, allowed_domain in FEEDS:
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
            if not title or p.scheme != "https" or not p.hostname or (p.hostname!=allowed_domain and p.hostname!="www."+allowed_domain):
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
            summary=node.findtext("description") or ""
            preview=clean_preview(summary)
            # RSS categories are publisher-provided metadata, not article text.
            feed_tags=[tag.text.strip() for tag in node.findall("category")
                       if tag.text and tag.text.strip()][:8]
            image_url=rss_image(node)
            # Source's headline and summary are for location tagging only; do not republish full body.
            entry = {"title": title, "url": url, "source": source,
                     "category": category_for(title,category,preview,feed_tags),
                     "regions": trustworthy_regions(title, preview, source),
                     "preview": preview,
                     "image": image_url,
                     "published": published.isoformat()}
            key = canonical_url(url)
            existing = items.get(key)
            if existing is None or (existing["category"] == "Actualidad" and category != "Actualidad"):
                items[key] = entry
    except Exception as exc:
        failed_feeds.append({"source":source,"url":feed_url,"reason":type(exc).__name__})
        print(f"RSS feed unavailable: {feed_url}: {type(exc).__name__} {exc}")
out = ROOT / "data" / "news.json"
out.parent.mkdir(exist_ok=True)

LANGUAGES=("de","en","fr","ht")
API_KEY=os.getenv("AZURE_TRANSLATOR_KEY","").strip()
REGION=os.getenv("AZURE_TRANSLATOR_REGION","").strip()
USAGE_FILE=ROOT/"data"/"translation_usage.json"
MONTH=NOW.strftime("%Y-%m")
TRANSLATION_BUDGET=400_000
try:
    accounting=json.loads(USAGE_FILE.read_text(encoding="utf-8"))
except (OSError,ValueError):
    accounting={}
if accounting.get("month")!=MONTH:
    accounting={"month":MONTH,"characters":0}
translations_by_url={}
previews_by_url={}
if out.exists():
    try:
        existing=json.loads(out.read_text(encoding="utf-8"))
        for old in existing.get("items",[]):
            if isinstance(old.get("translations"),dict):
                translations_by_url[old["url"]]=(old.get("title", ""), old["translations"])
            if isinstance(old.get("preview_translations"),dict) and old.get("preview")==next((e.get("preview") for e in items.values() if e["url"]==old["url"]),""):
                previews_by_url[old["url"]]=old["preview_translations"]
    except (ValueError,KeyError,OSError):
        pass
def translate_batch(texts):
    if not API_KEY or not texts:
        return {}
    url="https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=es"+ "".join("&to="+lang for lang in LANGUAGES)
    data=json.dumps([{"text":t} for t in texts],ensure_ascii=False).encode("utf-8")
    headers={
        "Ocp-Apim-Subscription-Key":API_KEY,
        "Content-Type":"application/json; charset=UTF-8",
        "X-ClientTraceId":str(uuid.uuid4()),
    }
    if REGION and REGION.lower()!="global":
        headers["Ocp-Apim-Subscription-Region"]=REGION
    request=urllib.request.Request(url,data=data,method="POST",headers=headers)
    try:
        with urllib.request.urlopen(request,timeout=25) as response:
            result=json.load(response)
    except Exception as exc:
        print("Translation service unavailable:",type(exc).__name__)
        return {}
    parsed={}
    for idx,row in enumerate(result):
        entry={}
        for tr in row.get("translations",[]):
            code=tr.get("to")
            translated=" ".join((tr.get("text") or "").split())
            if code in LANGUAGES and translated:
                entry[code]=translated[:250]
        if entry:
            parsed[idx]=entry
    return parsed

if successful_feeds == 0:
    # Preserve the previous snapshot; the frontend independently refuses to show stale items.
    print("All RSS feeds failed: preserving existing file, no fake updates.")
else:
    latest, duplicates_removed = select_stories(items.values(), limit=72, per_source_limit=24)
    print("Near-duplicate or duplicate URLs removed:", duplicates_removed)
    # Validate before making any translation API calls or publishing data.
    validate_news(latest, NOW)
    source_counts={}
    for record in latest:
        source_counts[record["source"]]=source_counts.get(record["source"],0)+1
    print("Selected publisher distribution:", source_counts)
    # Only translate new stories, reusing existing translations.
    for entry in latest:
        if entry["url"] in translations_by_url:
            old_title, saved_translations=translations_by_url[entry["url"]]
            entry["translations"]=cached_title_translations(old_title, entry["title"], saved_translations)
    for entry in latest:
        if entry["url"] in previews_by_url:
            entry["preview_translations"]=previews_by_url[entry["url"]]
    pending=[entry for entry in latest if len(entry.get("translations",{}))!=len(LANGUAGES)]
    if API_KEY and pending:
        for start in range(0,len(pending),8):
            batch=pending[start:start+8]
            budget_cost=sum(len(x["title"]) for x in batch)*len(LANGUAGES)
            if accounting["characters"]+budget_cost>TRANSLATION_BUDGET:
                print("Monthly translation budget cap reached")
                break
            translated=translate_batch([x["title"] for x in batch])
            if translated:
                for idx,languages in translated.items():
                    batch[idx]["translations"]={**batch[idx].get("translations",{}),
                                                **filter_title_translations(batch[idx]["title"],languages)}
                accounting["characters"]+=budget_cost
    preview_pending=[entry for entry in latest if entry.get("preview") and len(entry.get("preview_translations",{}))!=len(LANGUAGES)]
    if API_KEY and preview_pending:
        for start in range(0,len(preview_pending),8):
            batch=preview_pending[start:start+8]
            estimated=sum(len(e["preview"]) for e in batch)*len(LANGUAGES)
            if accounting["characters"]+estimated>TRANSLATION_BUDGET:break
            converted=translate_batch([e["preview"] for e in batch])
            if converted:
                for idx,values in converted.items():
                    batch[idx]["preview_translations"]=values
                accounting["characters"]+=estimated
    if API_KEY:
        USAGE_FILE.write_text(json.dumps(accounting,indent=2)+"\n",encoding="utf-8")
    totals={lang:sum(bool(entry.get("translations",{}).get(lang)) for entry in latest) for lang in LANGUAGES}
    print("Translation coverage by language:", totals, "key configured:", bool(API_KEY))
    data = {"updated": NOW.isoformat(),
            "source_status": feed_health(successful_feeds, len(FEEDS), len(latest)),
            "source_diagnostics": news_diagnostics(latest, successful_feeds, len(FEEDS)),
            "failed_feeds": failed_feeds,
            "items": latest}
    validate_news(data["items"], NOW)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Successfully fetched {successful_feeds}/{len(FEEDS)} feeds; {len(latest)} recent headlines")
