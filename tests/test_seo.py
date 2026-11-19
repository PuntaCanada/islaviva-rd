"""Regression checks for public search discovery and clearly dated utility context."""
import json
import pathlib
import xml.etree.ElementTree as ET
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE="https://islaviva-rd.pages.dev/"
class SearchDiscoveryTests(unittest.TestCase):
 def test_sitemap_has_real_indexable_pages(self):
  data=(ROOT/"sitemap.xml").read_text(encoding="utf-8")
  root=ET.fromstring(data)
  urls=[e.text for e in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
  self.assertIn(BASE,urls)
  self.assertIn(BASE+"apagones-higuey.html",urls)
  self.assertIn(BASE+"ofertas-supermercados-rd.html",urls)
  self.assertEqual(len(urls),len(set(urls)))
  for url in urls:
   self.assertTrue(url.startswith(BASE))
   rel=url.removeprefix(BASE)
   self.assertTrue((ROOT/(rel or "index.html")).is_file(),url)
 def test_robots_points_to_sitemap(self):
  robots=(ROOT/"robots.txt").read_text(encoding="utf-8")
  self.assertIn("Sitemap: "+BASE+"sitemap.xml",robots)
  self.assertIn("User-agent: *",robots)
 def test_canonical_metadata(self):
  page=(ROOT/"index.html").read_text(encoding="utf-8")
  self.assertIn('rel="canonical" href="'+BASE+'"',page)
  self.assertIn('application/ld+json',page)
  self.assertIn('/apagones-higuey.html',page)
  self.assertIn('/ofertas-supermercados-rd.html',page)
 def test_historical_incident_never_claims_active_outage(self):
  content=json.loads((ROOT/"data/local_context.json").read_text(encoding="utf-8"))
  self.assertIsInstance(content["items"],list)
  for item in content["items"]:
   self.assertEqual(item["status"],"archived_report")
   self.assertTrue(item["url"].startswith("https://"))
   self.assertIn("date",item)
if __name__=="__main__":unittest.main()
