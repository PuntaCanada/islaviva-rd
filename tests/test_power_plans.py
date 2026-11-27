import datetime as dt
import pathlib
import sys
import unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/"scripts"))
from power_plans import parse_ranges, parse_explicit_rows, parse_press

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
class ExplicitRowsTest(unittest.TestCase):
 def row(self, date="27/11/2026", circuit="HI3803", area="Higüey, Los Prados", start="09:20", end="15:20"):
  return "<table><tr>"+"".join("<td>"+v+"</td>" for v in (date,circuit,area,start,end))+"</tr></table>"
 def test_explicit(self):
  rows=parse_explicit_rows(self.row(),dt.date(2026,11,27))
  self.assertEqual(len(rows),1)
  self.assertEqual(rows[0]["circuit"],"HI3803")
  self.assertEqual(rows[0]["status"],"scheduled_not_live")
  self.assertEqual(rows[0]["start"],"09:20")
 def test_missing_date(self):
  self.assertEqual(parse_explicit_rows(self.row(date="viernes"),dt.date(2026,11,27)),[])
 def test_past(self):
  self.assertEqual(parse_explicit_rows(self.row(date="26/11/2026"),dt.date(2026,11,27)),[])
 def test_reverse_time(self):
  self.assertEqual(parse_explicit_rows(self.row(start="16:00"),dt.date(2026,11,27)),[])
 def test_invalid_circuit(self):
  self.assertEqual(parse_explicit_rows(self.row(circuit="unknown"),dt.date(2026,11,27)),[])
class PressRegression(unittest.TestCase):
 def test_higuey(self):
  # Minimal reconstructed markup using factual fields from the 26 November report.
  html='<p>EDEEste: 26 de noviembre de 2026</p><h2>Cortes de luz en <strong>Higüey</strong></h2><p>El horario previsto es de <b>9:20 a. m.</b> a <b>3:20 p. m.</b>.</p><p>En el circuito <b>HI3803</b>, la programación incluye: Los Prados.</p><p>En el circuito <b>HI3805</b>, la programación incluye: Villa Nazaret.</p><h2>Otros artículos</h2><p>En el circuito ZZ1234, la programación incluye: Otro lugar.</p>'
  rows=parse_press(html,dt.date(2026,11,26),"https://atardecer.com.do/cortes-luz-edeeste-jueves-26-noviembre-2026/")
  self.assertEqual({r["circuit"] for r in rows},{"HI3803","HI3805"})
  self.assertTrue(all(r["area"]=="Higüey" and r["start"]=="09:20" and r["end"]=="15:20" for r in rows))
  self.assertEqual(parse_press(html,dt.date(2026,11,27),"https://atardecer.com.do/"),[])
if __name__=="__main__": unittest.main()

