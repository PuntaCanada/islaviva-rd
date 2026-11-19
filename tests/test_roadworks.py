"""Offline checks for direct roadwork reports (no network or API keys)."""
import datetime as dt
import json
import pathlib
import sys
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
from update_roadworks import build_payload, is_road_report, recent_news_items, UTC

class RoadReportsTests(unittest.TestCase):
    def test_road_related_headline(self):
        self.assertTrue(is_road_report({"title":"Cierre parcial de la autopista por obras"}))
        self.assertTrue(is_road_report({"title":"Desvío en el puente por trabajos de reparación"}))
        self.assertFalse(is_road_report({"title":"Gobierno inicia obras en hospitales"}))
        self.assertFalse(is_road_report({"title":"Carretera Duarte destaca obra de arte"}))
    def test_no_stale_as_current_news(self):
        now=dt.datetime(2026,11,19,tzinfo=UTC)
        def story(t,age):
            return {"title":t,"published":(now-dt.timedelta(days=age)).isoformat(),
                    "source":"Diario Libre","url":"https://www.diariolibre.com/example",
                    "regions":["Higüey"]}
        notices=recent_news_items([
            story("Cierre parcial de la carretera por obras",2),
            story("Cierre parcial de la carretera por obras",14),
            story("Economía y empleo en República Dominicana",1)],now)
        self.assertEqual(len(notices),1)
        self.assertEqual(notices[0]["status"],"unknown")
    def test_official_not_marked_live(self):
        now=dt.datetime(2026,11,19,tzinfo=UTC)
        output=build_payload([],now)
        self.assertEqual(len(output["items"]),1)
        self.assertEqual(output["items"][0]["status"],"unverified_current")
        self.assertEqual(output["items"][0]["kind"],"official_announcement")
        self.assertTrue(output["items"][0]["url"].startswith("https://presidencia.gob.do/"))
    def test_output_schema(self):
        cached=json.loads((ROOT/"data"/"roadworks.json").read_text(encoding="utf-8"))
        self.assertIsInstance(cached["items"],list)
        for notice in cached["items"]:
            self.assertIn(notice["kind"],("report","official_announcement"))
            self.assertTrue(notice["url"].startswith("https://"))
            self.assertTrue(notice["source"])
            self.assertNotEqual(notice["status"],"active")
if __name__=="__main__":
    unittest.main()
