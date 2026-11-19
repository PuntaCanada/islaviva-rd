#!/usr/bin/env python3
"""Public RSS announcements for local-life dashboard. No paid API.
Never represent press announcements as verified live service status.
"""
import datetime as dt
import email.utils
import html
import json
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from news_quality import region_mentions, canonical_url
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"data"/"local_notices.json"
UTC=dt.timezone.utc
NOW=dt.datetime.now(UTC)
SOURCES=[
 ("EDEEste","power","https://edeeste.com.do/feed/","edeeste.com.do"),
 ("EDEEste","power","https://edeeste.com.do/category/noticias/feed/","edeeste.com.do"),
 ("INAPA","water","https://inapa.gob.do/feed/","inapa.gob.do"),
 ("INAPA","water","https://inapa.gob.do/noticias/feed/","inapa.gob.do"),
 ("Ayuntamiento Higüey","events","https://ayuntamientohiguey.gob.do/feed/","ayuntamientohiguey.gob.do"),
 ("Ayuntamiento Higüey","events","https://ayuntamientohiguey.gob.do/category/noticias/feed/","ayuntamientohiguey.gob.do")
]
TOPICS={
 "power":r"\b(?:interrupcion|apagones?|averia|mantenimiento|circuitos?|subestacion|suministro electrico)\b",
 "water":r"\b(?:agua potable|acueducto|averia|suministro|interrupcion|servicio de agua|tuberia)\b",
 "events":r"\b(?:eventos?|feria|festival|concierto|celebracion|agenda cultural|actividad(?:es)?|jornada|desfile)\b"
}
class StripMarkup(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True);self.parts=[]
 def handle_data(self,s):self.parts.append(s)
def clean(s):
 p=StripMarkup()
 try:p.feed(s or "")
 except ValueError: pass
 return " ".join(html.unescape("".join(p.parts)).split())[:185]
def get_notices(source,kind,url,domain):
 req=urllib.request.Request(url,headers={"User-Agent":"IslaVivaRD/1.0 (https://islaviva-rd.pages.dev; public news attribution)",
 "Accept":"application/rss+xml,application/xml,text/xml"})
 with urllib.request.urlopen(req,timeout=14) as response:
  root=ET.fromstring(response.read(1_500_000))
 notices=[]
 for item in root.findall(".//item")[:40]:
  title=" ".join((item.findtext("title") or "").split())[:180]
  link=(item.findtext("link") or "").strip()
  parsed=urllib.parse.urlsplit(link)
  if not title or parsed.scheme!="https" or parsed.hostname not in (domain,"www."+domain):continue
  from news_quality import normalize
  if not re.search(TOPICS[kind],normalize(title)):continue
  try:
   published=email.utils.parsedate_to_datetime(item.findtext("pubDate") or "")
   if published.tzinfo is None: published=published.replace(tzinfo=UTC)
   published=published.astimezone(UTC)
  except (ValueError,TypeError,IndexError):continue
  if not dt.timedelta(0)<=NOW-published<=dt.timedelta(days=7):continue
  regions=region_mentions(title)
  # Do not infer city from publisher location or company area.
  preview=clean(item.findtext("description") or "")
  notices.append({"kind":kind,"title":title,"preview":preview,"url":link,"source":source,
   "published":published.isoformat(),"regions":regions,"status":"published_unverified"})
 return notices
def news_source_notices():
 """Cross-check existing 48h news: only explicit relevant topics and named local areas.
 A press article is NOT an official outage confirmation.
 """
 path=ROOT/"data"/"news.json"
 try: cached=json.loads(path.read_text(encoding="utf-8"))
 except (OSError,ValueError):return []
 results=[]
 for item in cached.get("items",[]):
  if not isinstance(item,dict) or not item.get("regions"):continue
  title=normalize(item.get("title",""))
  # Only explicit disruption words; do not treat every general infrastructure
  # investment, repair or announcement as a current outage.
  if re.search(r"\b(?:apagones?|interrupcion(?:es)?|corte(?:s)? de luz|"
               r"subestacion|fallas? electricas?|circuitos? fuera de servicio)\b",title):
   kind="power"
  elif re.search(r"\b(?:agua potable|acueducto|interrupcion de agua|"
                 r"falta de agua|averia en (?:la )?red de agua)\b",title):
   kind="water"
  else:continue
  try:
   published=dt.datetime.fromisoformat(item["published"])
   if published.tzinfo is None:published=published.replace(tzinfo=UTC)
   if not dt.timedelta(0)<=NOW-published<=dt.timedelta(days=2):continue
  except (ValueError,TypeError,KeyError):continue
  results.append({
   "kind":kind,"title":item["title"],"preview":item.get("preview",""),
   "url":item["url"],"source":item["source"],
   "published":item["published"],"regions":item["regions"],
   "status":"published_unverified",
   "translations":item.get("translations",{}),
   "preview_translations":item.get("preview_translations",{})
  })
 return results

def main():
 results=[]
 successes=0
 for s in SOURCES:
  try:
   rows=get_notices(*s);results.extend(rows);successes+=1
   print(s[0],len(rows),"eligible notices")
  except (OSError,ValueError,ET.ParseError,TimeoutError) as exc:
   print("Optional authority feed unavailable",s[0],type(exc).__name__)
 results.extend(news_source_notices())
 if not successes and not results:
  print("All feeds unavailable; preserving previous snapshot")
  return
 results.sort(key=lambda x:x["published"],reverse=True)
 seen=set();unique=[]
 for item in results:
  u=canonical_url(item["url"])
  if u in seen:continue
  seen.add(u);unique.append(item)
 # No fabricated outage status; expiry is only a press publication recency limit.
 data={"updated":NOW.isoformat(),"sources_checked":successes,"status":"published_not_live","items":unique[:35]}
 OUT.parent.mkdir(exist_ok=True)
 OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if __name__=="__main__":main()
