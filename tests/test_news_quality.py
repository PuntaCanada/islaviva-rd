"""Offline quality checks for IslaViva RD; no secrets or network required."""
import datetime as dt
import json
import pathlib
import sys
import unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from news_quality import (category_for, region_mentions, canonical_url,
                          is_near_duplicate, select_stories, validate_news, quality_rank)

class NewsQualityTests(unittest.TestCase):
    def test_subjects(self):
        cases = [
            ("Jonrón de Ángel Ortiz deja tendidas a las Águilas y da victoria al Licey", "Actualidad", "Deportes"),
            ("Los Toros vencen al Escogido con jonrón", "Actualidad", "Deportes"),
            ("Llegan turistas y crecen los hoteles de Punta Cana", "Actualidad", "Turismo"),
            ("Banco Central analiza la inflación", "Actualidad", "Economía"),
            ("Presidente presenta medidas en el Congreso", "Actualidad", "Política"),
            ("El festival de música abre en la ciudad", "Actualidad", "Cultura"),
            ("Huracán amenaza la región este", "Actualidad", "Medioambiente"),
            ("La construcción de viviendas aumenta", "Actualidad", "Vivienda"),
            ("Toros bravos en el campo de La Romana", "Actualidad", "Actualidad"),
            ("La Romana gana atención de medios", "Regionales", "Regionales"),
        ]
        for title, default, expected in cases:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, default), expected)

    def test_regions_require_explicit_place(self):
        self.assertEqual(region_mentions("Obras en Higüey y Bávaro"), ["Higüey", "Punta Cana"])
        self.assertEqual(region_mentions("Gobierno se reúne en Santo Domingo"), ["Santo Domingo"])
        self.assertEqual(region_mentions("Lo último en la República Dominicana"), [])
        self.assertEqual(region_mentions("Santiago es el apellido del atleta"), [])
        self.assertEqual(region_mentions("Playa Macao estrena nueva vía"), ["Punta Cana"])

    def test_duplicates(self):
        now = dt.datetime.now(dt.timezone.utc).isoformat()
        def article(title, url, source="Diario Libre", **more):
            return dict(title=title, url=url, source=source, category="Actualidad",
                        regions=[], preview="", published=now, **more)
        x = article("Nuevo proyecto de carretera une Higüey y Punta Cana",
                    "https://www.diariolibre.com/nueva-via?utm_source=abc")
        y = article("Nuevo proyecto de carretera une Higüey y Punta Cana",
                    "https://diariolibre.com/nueva-via?utm_source=xyz")
        z = article("Proyecto de carretera une Higüey y Punta Cana esta semana",
                    "https://eldia.com.do/nueva-via", "El Día")
        distinct = article("Gobierno anuncia nuevos planes de turismo en La Romana",
                           "https://eldia.com.do/plan-turismo", "El Día")
        self.assertEqual(canonical_url(x["url"]), canonical_url(y["url"]))
        self.assertTrue(is_near_duplicate(x, y))
        self.assertFalse(is_near_duplicate(x, distinct))
        kept, dropped = select_stories([x,y,z,distinct], per_source_limit=4)
        self.assertTrue(dropped >= 1)
        self.assertIn(distinct, kept)
        self.assertTrue(validate_news(kept, dt.datetime.now(dt.timezone.utc)))

    def test_two_publishers_same_baseball_event(self):
        now=dt.datetime.now(dt.timezone.utc).isoformat()
        a={"title":"Jonrón de Ángel Ortiz deja tendidas a las Águilas y da victoria al Licey",
           "url":"https://noticiassin.com/baseball-ortiz","source":"Noticias SIN","published":now}
        b={"title":"Ortiz pega dramático jonrón y el Licey deja en el terreno a las Águilas",
           "url":"https://eldia.com.do/ortiz-licey","source":"El Día","published":now}
        self.assertTrue(is_near_duplicate(a,b))
        unrelated={**b,"title":"Licey firma nuevos acuerdos con atletas","url":"https://eldia.com.do/otro"}
        self.assertFalse(is_near_duplicate(a,unrelated))

    def test_preference_for_explicit_locality(self):
        now=dt.datetime.now(dt.timezone.utc).isoformat()
        base={"title":"Prueba","url":"https://example.com/item","source":"El Tiempo",
              "category":"Regionales","regions":[],"published":now}
        local={**base,"regions":["Higüey"]}
        self.assertGreater(quality_rank(local, "Higüey"), quality_rank(base, "Higüey"))

    def test_cached_news_structure(self):
        data=json.loads((ROOT/"data"/"news.json").read_text(encoding="utf-8"))
        self.assertIsInstance(data.get("items"), list)
        for entry in data["items"]:
            self.assertTrue(entry["title"])
            self.assertTrue(entry["url"].startswith("https://"))
            self.assertIn("source",entry)

if __name__=="__main__":
    unittest.main()
