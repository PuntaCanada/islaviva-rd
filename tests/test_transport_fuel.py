"""Date, source attribution and expiry checks for fuel snapshot and Waze integration."""
import datetime as dt
import json
import pathlib
import re
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class TransportFuelTests(unittest.TestCase):
 def test_fuel_snapshot_is_attributable_and_expires(self):
  d=json.loads((ROOT/"data"/"fuel_prices.json").read_text(encoding="utf-8"))
  start=dt.date.fromisoformat(d["valid_from"])
  end=dt.date.fromisoformat(d["valid_until"])
  self.assertEqual((end-start).days,6)
  self.assertTrue(d["source_url"].startswith("https://combustibles.do/"))
  self.assertGreater(d["regular"],0)
  self.assertGreater(d["premium"],d["regular"])
  self.assertIn("no automatic scraping",d["note"].lower())
 def test_currency_conversion_is_approximate_and_sourced(self):
  page=(ROOT/"index.html").read_text(encoding="utf-8")
  shared=(ROOT/"assets/home-app.js").read_text(encoding="utf-8")
  self.assertIn("https://open.er-api.com/v6/latest/USD",shared)
  self.assertIn("Rates By Exchange Rate API",shared)
  self.assertIn("fuelUsdDopRate",shared)
  self.assertIn("amount/fuelUsdDopRate",shared)
  self.assertIn("valid_until>=today",shared)
  self.assertIn("fuelUsdDopRate=null",shared)
 def test_waze_official_embed_and_click_to_load(self):
  page=(ROOT/"index.html").read_text(encoding="utf-8")
  shared=(ROOT/"assets/home-app.js").read_text(encoding="utf-8")
  self.assertIn("https://embed.waze.com/",shared)
  self.assertIn("wazeLoaded=false",shared)
  self.assertIn("addEventListener('click',()=>{wazeLoaded=true",shared)
  self.assertIn("referrerPolicy='strict-origin-when-cross-origin'",shared)
  self.assertIn('id="waze-container"',page)
  self.assertIn('id="fuel-prices"',page)
  self.assertIn("valid_until>=today",shared)
  self.assertIn("combustibles.do",page)
if __name__=="__main__": unittest.main()
