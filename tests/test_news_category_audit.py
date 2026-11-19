"""Test the independent, conservative RSS category audit without network calls."""
import pathlib
import sys
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/"scripts"))
from audit_news_categories import audit, review, summary

class CategoryAuditTests(unittest.TestCase):
    def test_specific_mismatches(self):
        stories=[
            {"title":"GTA VI anuncia tráiler","category":"Actualidad"},
            {"title":"Oferta pública inicial de Anthropic supera récord","category":"Medioambiente","preview":"Anthropic estudia salir a bolsa."},
            {"title":"Policía desmantela puntos de drogas","category":"Seguridad"},
            {"title":"Ladrones entran a residencias en Verón","category":"Regionales"},
            {"title":"Netflix revela el estreno de una serie","category":"Actualidad"},
            {"title":"Un museo de FIFA presenta una exposición","category":"Cultura"},
        ]
        result=audit(stories)
        self.assertEqual(
            {(x["title"],x["suggested"]) for x in result},
            {
                ("GTA VI anuncia tráiler","Gaming y tecnología"),
                ("Oferta pública inicial de Anthropic supera récord","Economía"),
                ("Ladrones entran a residencias en Verón","Seguridad"),
                ("Netflix revela el estreno de una serie","Cultura"),
            }
        )
    def test_environment_and_exception_not_flagged(self):
        records=[
            {"title":"Indomet advierte lluvias intensas","category":"Medioambiente","preview":""},
            {"title":"Cambio climático altera bosques","category":"Medioambiente"},
            {"title":"Museo FIFA inaugura exposición","category":"Cultura"},
            {"title":"Nuevo hospital abre sus puertas","category":"Salud"},
        ]
        self.assertEqual(audit(records),[])
    def test_report_is_non_destructive(self):
        rows=[{"title":"GTA VI","category":"Actualidad"}]
        report=review({"items":rows})
        self.assertEqual(rows[0]["category"],"Actualidad")
        self.assertEqual(report["stories"],1)
        self.assertIn("Prüfhilfen",summary(report))

if __name__=="__main__":
    unittest.main()
