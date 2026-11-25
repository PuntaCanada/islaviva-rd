"""Offline validation of local notices and source filtering (no API, no network)."""
import json
import pathlib
import sys
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from update_local_notices import TOPICS, SOURCES, clean, UTC
import re
import datetime as dt
from update_local_notices import retain_failed_feed_notices, NOW
from news_quality import normalize

class LocalBulletinsTests(unittest.TestCase):
    def test_strict_relevant_terms(self):
        self.assertTrue(re.search(TOPICS["power"],normalize("EDEEste anuncia interrupción programada del servicio")))
        self.assertTrue(re.search(TOPICS["water"],normalize("INAPA anuncia avería en acueducto")))
        self.assertTrue(re.search(TOPICS["events"],normalize("Festival cultural y concierto en Higüey")))
        self.assertFalse(re.search(TOPICS["power"],normalize("EDEEste entrega materiales escolares")))
        self.assertFalse(re.search(TOPICS["water"],normalize("Gobierno presenta resultados de educación")))
    def test_clean_preview(self):
        self.assertEqual(clean("<p>Interrupción <b>temporal</b> de servicio.</p>"),"Interrupción temporal de servicio.")
    def test_cached_notices_cannot_claim_live_outage(self):
        cached=json.loads((ROOT/"data"/"local_notices.json").read_text(encoding="utf-8"))
        self.assertIsInstance(cached["items"],list)
        for n in cached["items"]:
            self.assertEqual(n["status"],"published_unverified")
            self.assertTrue(n["url"].startswith("https://"))
            self.assertIn(n["kind"],("power","water","events"))
    def test_partial_failure_retains_recent_attributable_notice(self):
        a,b=[url for source,kind,url,domain in SOURCES if source=="INAPA"]
        row={"source":"INAPA","kind":"water","title":"INAPA anuncia avería en acueducto","url":"https://inapa.gob.do/notice/","published":(NOW-dt.timedelta(days=1)).isoformat(),"status":"published_unverified","feed_url":a}
        self.assertEqual(retain_failed_feed_notices([row],{a},{b}),[row])
        self.assertEqual(retain_failed_feed_notices([row],{b},{a}),[])
        self.assertEqual(retain_failed_feed_notices([dict(row,published=(NOW-dt.timedelta(days=8)).isoformat())],{a},{b}),[])
        self.assertEqual(retain_failed_feed_notices([dict(row,url="https://example.org/")],{a},{b}),[])
        legacy=dict(row);legacy.pop("feed_url")
        self.assertEqual(retain_failed_feed_notices([legacy],{a},{b}),[])
        self.assertEqual(retain_failed_feed_notices([legacy],{a,b},set()),[legacy])
    def test_feed_domains_https(self):
        self.assertTrue(all(url.startswith("https://") and hostname in url for _,_,url,hostname in SOURCES))

if __name__=="__main__":unittest.main()
