import datetime as dt
import pathlib
import sys
import unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/"scripts"))
from power_plans import parse_ranges

class PowerPlansTest(unittest.TestCase):
 def test_cross_month(self):
  self.assertEqual(parse_ranges("<h2>del 28 de noviembre al 4 de diciembre 2026</h2>",dt.date(2026,11,27)),[("2026-11-28","2026-12-04")])
 def test_edesur(self):
  self.assertEqual(parse_ranges("<h2>del 21 de noviembre, 2026 al 27 de noviembre, 2026</h2>",dt.date(2026,11,27)),[("2026-11-21","2026-11-27")])
 def test_expired(self):
  self.assertEqual(parse_ranges("del 21 al 27 de noviembre 2026",dt.date(2026,11,28)),[])
 def test_invalid(self):
  self.assertEqual(parse_ranges("del 31 de noviembre al 4 de diciembre 2026",dt.date(2026,11,27)),[])
 def test_hidden(self):
  self.assertEqual(parse_ranges("<script>del 28 al 30 de noviembre 2026</script>",dt.date(2026,11,27)),[])
if __name__=="__main__": unittest.main()
