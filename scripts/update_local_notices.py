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
 ("INAPA","water","https://inapa.gob.do/feed/","inapa.gob.do"),
 ("Ayuntamiento Higüey","events","https://ayuntamientohiguey.gob.do/feed/","ayuntamientohiguey.gob.do")
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
def main():
 results=[]
 successes=0
 for s in SOURCES:
  try:
   rows=get_notices(*s);results.extend(rows);successes+=1
   print(s[0],len(rows),"eligible notices")
  except (OSError,ValueError,ET.ParseError,TimeoutError) as exc:
   print("Optional authority feed unavailable",s[0],type(exc).__name__)
 if not successes:
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
