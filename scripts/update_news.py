#!/usr/bin/env python3
"""Automatically fetch only RSS headline metadata and link to the source.
Never copy third-party article bodies or images.
"""
import datetime as dt
import email.utils
import json
import pathlib
import os
import urllib.parse
import uuid
import urllib.request
import xml.etree.ElementTree as ET

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
    ("Hoy", "https://hoy.com.do/feed/", "Actualidad", "hoy.com.do"),
    ("El Día", "https://eldia.com.do/feed/", "Actualidad", "eldia.com.do"),
    ("AlMomento", "https://almomento.net/feed/", "Actualidad", "almomento.net"),
    ("Noticias SIN", "https://noticiassin.com/feed/", "Actualidad", "noticiassin.com"),
]
# Labels are based only on explicit place mentions in headlines or supplied RSS metadata.
# A location label is NOT a claim that the article applies exclusively to that city.
REGIONS = {
    "Higüey": ("higüey", "higuey", "la altagracia"),
    "Punta Cana": ("punta cana", "bávaro", "bavaro", "verón", "veron", "cap cana"),
    "Santo Domingo": ("santo domingo", "distrito nacional", "gran santo domingo"),
    "Santiago": ("santiago de los caballeros", "santiago rodríguez", "santiago rodriguez"),
    "La Romana": ("la romana",),
    "Puerto Plata": ("puerto plata",),
    "Samaná": ("samaná", "samana", "las terrenas", "sánchez, samaná"),
}
def region_mentions(title, summary):
    import re
    import unicodedata
    def normalize(value):
        value = unicodedata.normalize("NFD", value.lower())
        return "".join(c for c in value if unicodedata.category(c)!="Mn")
    haystack=" "+normalize(title+" "+summary[:350])+" "
    found=[]
    for city,variants in REGIONS.items():
        if any(re.search(r"(?<!\\w)"+re.escape(normalize(v))+r"(?!\\w)",haystack) for v in variants):
            found.append(city)
    return found
def category_for(text, default):
    t=text.lower()
    # Only classify explicit subject cues; otherwise keep publisher's feed category.
    if any(w in t for w in ("turismo","turista","hotel","aerolínea","aeropuerto","vuelo","crucero")): return "Turismo"
    if any(w in t for w in ("inmueble","vivienda","alquiler","apartamento","construcción")): return "Vivienda"
    return default

items = {}
successful_feeds = 0
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
            summary=" ".join((node.findtext("description") or "").split())
            # Source's headline and summary are for location tagging only; do not republish full body.
            entry = {"title": title, "url": url, "source": source,
                     "category": category_for(title,category),
                     "regions": region_mentions(title, summary),
                     "published": published.isoformat()}
            existing = items.get(url)
            if existing is None or (existing["category"] == "Actualidad" and category != "Actualidad"):
                items[url] = entry
    except Exception as exc:
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
if out.exists():
    try:
        existing=json.loads(out.read_text(encoding="utf-8"))
        for old in existing.get("items",[]):
            if isinstance(old.get("translations"),dict):
                translations_by_url[old["url"]]=old["translations"]
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
    # Limit domination by a single publisher while retaining freshest items.
    ordered=sorted(items.values(),key=lambda v: v["published"],reverse=True)
    per_source={}
    latest=[]
    for entry in ordered:
        if per_source.get(entry["source"],0)>=24:continue
        latest.append(entry)
        per_source[entry["source"]]=per_source.get(entry["source"],0)+1
        if len(latest)>=72:break
    # Only translate new stories, reusing existing translations.
    for entry in latest:
        if entry["url"] in translations_by_url:
            entry["translations"]=translations_by_url[entry["url"]]
    pending=[entry for entry in latest if not entry.get("translations")]
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
                    batch[idx]["translations"]=languages
                accounting["characters"]+=budget_cost
        USAGE_FILE.write_text(json.dumps(accounting,indent=2)+"\n",encoding="utf-8")
    totals={lang:sum(bool(entry.get("translations",{}).get(lang)) for entry in latest) for lang in LANGUAGES}
    print("Translation coverage by language:", totals, "key configured:", bool(API_KEY))
    data = {"updated": NOW.isoformat(), "source_status": "ok" if latest else "no_recent_articles", "items": latest}
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Successfully fetched {successful_feeds}/{len(FEEDS)} feeds; {len(latest)} recent headlines")
