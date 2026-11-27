"""Import dated official maintenance plan references, not live outages."""
import datetime as dt
import re
import urllib.request
from html.parser import HTMLParser
from urllib.parse import urlsplit
from news_quality import normalize

SOURCES = {
 "EDENORTE": "https://edenorte.com.do/interrupciones-programadas/",
 "EDESUR": "https://www.edesur.com.do/enlaces-empresa/mantenimientos-programados/",
}
MONTHS = dict(zip("enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split(), range(1,13)))
class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.parts=[]
  self.hidden=0
 def handle_starttag(self, tag, attrs):
  if tag in ("script","style"): self.hidden+=1
 def handle_endtag(self, tag):
  if tag in ("script","style"): self.hidden=max(0,self.hidden-1)
 def handle_data(self, data):
  if not self.hidden: self.parts.append(data)

def parse_ranges(html, today):
 page=Page()
 page.feed(html)
 text=normalize(" ".join(page.parts))
 months="|".join(MONTHS)
 pattern=rf"(?:del? )?(\d{{1,2}})(?: de ({months}))?(?:,? (20\d{{2}}))? al (\d{{1,2}}) de ({months})(?:,? (20\d{{2}}))"
 result=set()
 for a,m,y,b,n,z in re.findall(pattern,text):
  try:
   end=dt.date(int(z),MONTHS[n],int(b))
   start=dt.date(int(y or z),MONTHS[m or n],int(a))
   if not y and start>end and m: start=start.replace(year=start.year-1)
   if 0 <= (end-start).days <= 14 and start <= today+dt.timedelta(days=14) and end>=today:
    result.add((start.isoformat(),end.isoformat()))
  except ValueError: continue
 return sorted(result)

def collect(now):
 today=(now-dt.timedelta(hours=4)).date()
 plans=[]; errors=[]
 for provider,url in SOURCES.items():
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"IslaVivaRD/1.0","Accept":"text/html"})
   with urllib.request.urlopen(req,timeout=12) as response:
    if urlsplit(response.geturl()).hostname != urlsplit(url).hostname: raise ValueError("unexpected redirect")
    raw=response.read(2000001)
    if len(raw)>2000000: raise ValueError("oversized response")
    ranges=parse_ranges(raw.decode("utf-8"),today)
   if not ranges: raise ValueError("no current dated plan recognized")
   for start,end in ranges:
    plans.append({"source":provider,"url":url,"start_date":start,"end_date":end,"status":"plan_reference_not_live","checked":now.isoformat()})
  except (OSError,ValueError) as exc:
   errors.append({"source":provider,"error":type(exc).__name__})
 return {"items":plans,"errors":errors,"checked":now.isoformat()}
