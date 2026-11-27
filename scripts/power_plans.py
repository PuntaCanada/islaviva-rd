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
   if not z: continue
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

def parse_explicit_rows(html, today):
 """Accept only self-contained table rows with explicit date, circuit and times.
 Never propagate a weekly header date to individual outages."""
 class Rows(HTMLParser):
  def __init__(self):
   super().__init__(convert_charrefs=True)
   self.row=None; self.cell=None; self.rows=[]
  def handle_starttag(self,tag,attrs):
   if tag=="tr": self.row=[]
   if tag in ("td","th") and self.row is not None: self.cell=[]
  def handle_data(self,data):
   if self.cell is not None: self.cell.append(data)
  def handle_endtag(self,tag):
   if tag in ("td","th") and self.cell is not None and self.row is not None:
    self.row.append(" ".join(" ".join(self.cell).split())); self.cell=None
   if tag=="tr" and self.row is not None:
    self.rows.append(self.row); self.row=None; self.cell=None
 parser=Rows(); parser.feed(html)
 results=[]
 for cells in parser.rows:
  if len(cells)!=5: continue
  date,circuit,area,start,end=cells
  if not re.fullmatch(r"\d{2}/\d{2}/20\d{2}|\d{4}-\d{2}-\d{2}",date): continue
  if not re.fullmatch(r"[A-Z]{2,5}\d{3,6}",circuit): continue
  if not area or len(area)>500: continue
  if not all(re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d",v) for v in (start,end)): continue
  try:
   day=dt.datetime.strptime(date,"%d/%m/%Y").date() if "/" in date else dt.date.fromisoformat(date)
  except ValueError: continue
  if not today<=day<=today+dt.timedelta(days=14) or start>=end: continue
  results.append({"date":day.isoformat(),"circuit":circuit,"area":area,"start":start,"end":end,"timezone":"America/Santo_Domingo","status":"scheduled_not_live"})
 return results
