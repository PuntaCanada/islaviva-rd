#!/usr/bin/env python3
"""Non-production RSS candidate audit: no new sources enter the news feed.

Public candidate feeds are probed read-only, with hostname enforcement, XML
parsing, timestamp evidence and bounded downloads. A candidate is *not*
verified merely because its URL contains '/feed/' or returns a 200.
"""
import argparse
import datetime as dt
import email.utils
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CANDIDATES = (
    ("Diario 55", "Santiago", "https://diario55.com/feed/", "diario55.com"),
    ("Noticia.do", "Santiago", "https://noticia.do/feed/", "noticia.do"),
    ("República News", "Cibao / Puerto Plata", "https://republicanews.com/feed/", "republicanews.com"),
    # Site names are sourced from the original public news publishers. These
    # possible feed paths are HYPOTHESES, not approved production RSS feeds.
    ("Diario Norte RD", "Puerto Plata", "https://diarionorterd.com/feed/", "diarionorterd.com"),
    ("G Micheli al Día", "La Romana", "https://gmichelialdia.com/feed/", "gmichelialdia.com"),
    ("La Voz de Samaná", "Samaná", "https://www.lavozdesamana.net/feeds/posts/default?alt=rss", "lavozdesamana.net"),
)
MAX_SIZE = 1_500_000

def evaluate_rss(data, now=None, expected_host=None):
    """Validate XML, publisher article links, and recent published dates."""
    root = ET.fromstring(data)
    tag = root.tag.rsplit("}", 1)[-1].lower()
    if tag not in ("rss", "rdf", "feed"):
        raise ValueError("Not RSS/Atom XML")
    items = root.findall(".//item")
    if not items:
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    if not items:
        raise ValueError("No RSS/Atom articles")
    if now is None:
        now = dt.datetime.now(dt.timezone.utc)
    recent = 0
    valid_links = 0
    for item in items[:30]:
        raw = item.findtext("pubDate") or item.findtext("{http://www.w3.org/2005/Atom}updated")
        if raw:
            try:
                published = email.utils.parsedate_to_datetime(raw) if "," in raw else dt.datetime.fromisoformat(raw.replace("Z","+00:00"))
                if published.tzinfo is None:
                    published = published.replace(tzinfo=dt.timezone.utc)
                if dt.timedelta(minutes=-30) <= now-published <= dt.timedelta(hours=72):
                    recent += 1
            except (ValueError, TypeError, OverflowError):
                pass
        link = item.findtext("link") or ""
        if not link:
            for node in item.findall("{http://www.w3.org/2005/Atom}link"):
                link = node.attrib.get("href", "")
                if link:
                    break
        parsed = urllib.parse.urlparse(link)
        if parsed.scheme == "https" and parsed.hostname and (not expected_host or parsed.hostname in (expected_host, "www."+expected_host)):
            valid_links += 1
    if not valid_links:
        raise ValueError("No HTTPS article links")
    return {"entries_sampled":min(len(items),30), "recent_72h":recent,"https_links":valid_links}

def probe(candidate):
    source, region, url, hostname = candidate
    try:
        request=urllib.request.Request(url,headers={
            "User-Agent":"IslaVivaRD/1.0 (RSS metadata source viability check)",
            "Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml",
        })
        opener=urllib.request.build_opener()
        with opener.open(request,timeout=12) as response:
            final=urllib.parse.urlparse(response.geturl())
            if final.scheme!="https" or final.hostname not in (hostname,"www."+hostname):
                raise ValueError("Redirect outside publisher domain")
            body=response.read(MAX_SIZE+1)
            if len(body)>MAX_SIZE:
                raise ValueError("XML exceeds size limit")
            content_type=response.headers.get("Content-Type","")
            details=evaluate_rss(body,expected_host=hostname)
            if details["recent_72h"]==0:
                raise ValueError("No recently dated articles in sampled feed")
            if details["https_links"] < max(1,details["entries_sampled"]//2):
                raise ValueError("Too few HTTPS article links on publisher domain")
            return {"source":source,"region":region,"url":url,"status":"candidate_xml_verified","content_type":content_type,**details}
    except Exception as exc:
        return {"source":source,"region":region,"url":url,"status":"not_verified","error":type(exc).__name__+": "+str(exc)[:130]}

def selftest():
    now=dt.datetime(2026,11,21,20,0,tzinfo=dt.timezone.utc)
    rss=b"""<rss version="2.0"><channel><item><title>Sample</title><link>https://diario55.com/story</link><pubDate>Sat, 21 Nov 2026 18:00:00 GMT</pubDate></item></channel></rss>"""
    assert evaluate_rss(rss,now)=={"entries_sampled":1,"recent_72h":1,"https_links":1}
    try:
        evaluate_rss(b"<html><body>Not a feed</body></html>",now)
    except ValueError:
        pass
    else:
        raise AssertionError("HTML falsely accepted as RSS")
    assert evaluate_rss(rss,now,expected_host="diario55.com")["https_links"]==1
    try:
        evaluate_rss(rss,now,expected_host="another.example")
    except ValueError:
        pass
    else:
        raise AssertionError("Unrelated publisher domains falsely accepted")
    print("PASS: valid dated RSS metadata accepted; HTML refused")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--selftest",action="store_true")
    args=parser.parse_args()
    if args.selftest:
        selftest()
    else:
        results=[probe(candidate) for candidate in CANDIDATES]
        for item in results:
            print(json.dumps(item,ensure_ascii=False))
        print("SUMMARY: checked",len(results),"verified",sum(x["status"]=="candidate_xml_verified" for x in results))
        print("NO CANDIDATES HAVE BEEN ADDED TO THE LIVE IMPORTER.")
