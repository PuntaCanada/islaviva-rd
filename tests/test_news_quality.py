"""Offline quality checks for IslaViva RD; no secrets or network required."""
import datetime as dt
import json
import pathlib
import sys
import unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from news_quality import (category_for, region_mentions, canonical_url,
                          is_near_duplicate, select_stories, validate_news, quality_rank, cached_title_translations, trustworthy_regions, reliable_title_translation, filter_title_translations, feed_health, news_diagnostics)

class NewsQualityTests(unittest.TestCase):
    def test_subjects(self):
        cases = [
            ("Jonrón de Ángel Ortiz deja tendidas a las Águilas y da victoria al Licey", "Actualidad", "Deportes"),
            ("Los Toros vencen al Escogido con jonrón", "Actualidad", "Deportes"),
            ("Los Toros se sacuden y derrotan 7-2 a los Leones", "Actualidad", "Deportes"),
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

    def test_cinema_headlines_vs_games_and_real_events(self):
        examples = [
            ("Macaulay Culkin podría regresar a Mi pobre angelito después de 35 años", "Cultura"),
            ("La nueva precuela de Los juegos del hambre genera 56 millones", "Cultura"),
            ("Nueva película de acción llega al cine", "Cultura"),
            ("Los Toros vencen en los juegos del fin de semana", "Deportes"),
            ("GTA VI será el videojuego del año", "Gaming y tecnología"),
            ("Policía investiga homicidio en Santo Domingo", "Seguridad"),
        ]
        for title, expected in examples:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, "Actualidad"), expected)

    def test_gaming_and_technology_metadata(self):
        # Specific game names and unambiguous title signals override generic feed.
        cases = [
            ("GTA VI, el mayor videojuego de la historia", "Actualidad", "Gaming y tecnología"),
            ("GTA VI: cómo un videojuego puede convertirse en un fenómeno económico", "Economía", "Gaming y tecnología"),
            ("Rockstar Games revela novedades de Grand Theft Auto", "Cultura", "Gaming y tecnología"),
            ("PlayStation anuncia nueva consola", "Actualidad", "Gaming y tecnología"),
            ("Ciberseguridad para usuarios de telefonos inteligentes", "Actualidad", "Gaming y tecnología"),
            ("Los Toros vencen el juego decisivo", "Actualidad", "Deportes"),
            ("El juego político en el Congreso", "Actualidad", "Política"),
        ]
        for title, default, expected in cases:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, default), expected)
        self.assertEqual(category_for(
            "Nuevo lanzamiento digital anunciado", "Actualidad",
            summary="La compañía lanzará su videojuego esta semana.",
        ), "Gaming y tecnología")
        self.assertEqual(category_for(
            "Lanzamiento de nuevo producto", "Actualidad",
            feed_categories=["Tecnología", "Innovación"],
        ), "Gaming y tecnología")
        self.assertEqual(category_for(
            "Los Toros vencen en un juego histórico", "Actualidad",
            summary="Los fanáticos compararon el evento con un videojuego.",
        ), "Deportes")
        self.assertEqual(category_for(
            "Oferta pública inicial de Anthropic supera récord histórico",
            "Economía", feed_categories=["Tecnología"],
        ), "Economía")
        self.assertEqual(category_for(
            "Banco Central evalúa la inflación", "Economía",
            summary="La entidad usará inteligencia artificial en uno de sus proyectos.",
        ), "Economía")

    def test_new_specific_categories_and_false_positives(self):
        positive = [
            ("Ministerio de Salud anuncia campaña de vacunación", "Salud"),
            ("Hospital de Higüey amplía atención médica", "Salud"),
            ("NASA anuncia una nueva misión espacial", "Ciencia"),
            ("Investigación científica revela nuevos datos", "Ciencia"),
            ("Ministerio de Educación anuncia inicio del año escolar", "Educación"),
            ("Universidades ofrecen becas universitarias", "Educación"),
            ("Policía Nacional investiga robos en Santiago", "Seguridad"),
            ("Ministerio Público investiga un homicidio", "Seguridad"),
            ("Accidente de tránsito provoca cierre de carretera", "Tránsito"),
            ("Obras viales generan desvíos de tránsito", "Tránsito"),
        ]
        for title, expected in positive:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, "Actualidad"), expected)
        negative = [
            ("Empresa anuncia estudio de mercado", "Economía"),
            ("El Congreso debate nueva ley", "Política"),
            ("Equipo gana la carrera de atletismo", "Deportes"),
            ("Banco Central analiza la inflación", "Economía"),
            ("Investigación sobre videojuegos llega a una universidad", "Gaming y tecnología"),
            ("GTA VI estrena nuevo tráiler", "Gaming y tecnología"),
        ]
        for title, expected in negative:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, expected), expected)

    def test_regressions_found_in_real_feed_audit(self):
        examples=[
            ("Netflix revela el primer adelanto de una serie", "Actualidad", "Cultura"),
            ("Ladrones entran a residencias en Verón", "Regionales", "Seguridad"),
            ("Las Águilas despiden a Pipe Urueta", "Actualidad", "Deportes"),
            ("Estrellas logran quinta victoria seguida", "Actualidad", "Deportes"),
            ("Judo de RD va a Campeonato Mundial", "Actualidad", "Deportes"),
            ("Consuelo y Miramar ganan en el 44 TBS de San Pedro", "Actualidad", "Deportes"),
            ("Oferta pública inicial de Anthropic", "Medioambiente", "Economía"),
            ("Misión FMI analiza desempeño financiero", "Actualidad", "Economía"),
        ]
        for title,source,expected in examples:
            with self.subTest(title=title):
                self.assertEqual(category_for(title, source), expected)

    def test_regions_require_explicit_place(self):
        self.assertEqual(region_mentions("Obras en Higüey y Bávaro"), ["Higüey", "Punta Cana"])
        self.assertEqual(region_mentions("Gobierno se reúne en Santo Domingo"), ["Santo Domingo"])
        self.assertEqual(region_mentions("Lo último en la República Dominicana"), [])
        self.assertEqual(region_mentions("Santiago es el apellido del atleta"), [])
        self.assertEqual(region_mentions("Playa Macao estrena nueva vía"), ["Punta Cana"])

    def test_santiago_requires_explicit_locality_context(self):
        self.assertEqual(trustworthy_regions("Obras en la provincia de Santiago"), ["Santiago"])
        self.assertEqual(trustworthy_regions("Santiago firma un nuevo contrato"), [])
        self.assertEqual(trustworthy_regions("Debate en Santiago de Chile"), [])
        self.assertEqual(trustworthy_regions("Abren un hospital",
            "SANTIAGO, RD. La iniciativa beneficiará a familias"), ["Santiago"])
        self.assertEqual(trustworthy_regions("Gobierno se reúne en Punta Cana",
            "SANTIAGO, RD. Reportan detalles"), ["Punta Cana"])

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

    def test_translation_cache_requires_same_source_headline(self):
        old={"de":"Alter Titel","en":"Old title"}
        self.assertEqual(cached_title_translations("Noticia original", "Noticia original", old), old)
        self.assertEqual(cached_title_translations("Noticia original", "Noticia corregida", old), {})
        self.assertEqual(cached_title_translations("Noticia", "Noticia", {"en":"", "xx":"bad"}), {})

    def test_dateline_does_not_mislabel_regional_newswire(self):
        self.assertEqual(trustworthy_regions(
            "Putin se reúne con dirigentes internacionales",
            "Punta Cana. El presidente viajó a China", "El Tiempo"), [])
        self.assertEqual(trustworthy_regions(
            "Abren hospital en Nisibón",
            "HIGÜEY, LA ALTAGRACIA. Después de años de espera", "Bávaro Digital"),
            ["Higüey"])
        self.assertEqual(trustworthy_regions(
            "Migración reporta ataque",
            "PUERTO PLATA.– Agentes fueron atacados", "Diario Libre"),
            ["Puerto Plata"])
        self.assertEqual(trustworthy_regions("Obras en Bávaro", "Punta Cana. Las obras"),
                         ["Punta Cana"])

    def test_protected_media_names_and_places_in_translations(self):
        original="Macaulay Culkin podría volver a Mi pobre angelito en Higüey"
        self.assertFalse(reliable_title_translation(original,
                        "Macaulay Culkin returns to My Poor Angel"))
        self.assertTrue(reliable_title_translation(original,
                       "Macaulay Culkin could return to Home Alone in Higüey"))
        self.assertFalse(reliable_title_translation(original,
                        "Macaulay Culkin could return to Home Alone"))
        self.assertFalse(reliable_title_translation(
            "La precuela de los juegos del hambre", "Die Tribute von Pabunem"))
        self.assertTrue(reliable_title_translation(
            "La precuela de los juegos del hambre", "The Hunger Games prequel"))
        self.assertEqual(filter_title_translations(
            "Mi pobre angelito", {"de":"Mein armer Engel",
                                  "en":"Home Alone", "xx":"irrelevant"}),
                         {"en":"Home Alone"})
        self.assertEqual(cached_title_translations(
            "Mi pobre angelito", "Mi pobre angelito",
            {"de":"Mein armer Engel", "en":"Home Alone"}), {"en":"Home Alone"})

    def test_feed_health_never_claims_partial_success_is_complete(self):
        self.assertEqual(feed_health(15, 15, 72), "ok")
        self.assertEqual(feed_health(7, 15, 72), "partial")
        self.assertEqual(feed_health(2, 15, 0), "no_recent_articles")
        self.assertEqual(feed_health(0, 15, 0), "unavailable")
        with self.assertRaises(ValueError):
            feed_health(16, 15, 4)

    def test_diagnostics_counts_only_actual_items(self):
        entries=[
            {"source":"El Día","image":"","regions":[]},
            {"source":"El Día","image":"https://example.com/img.jpg","regions":["Higüey"]},
            {"source":"Diario Libre","image":"","regions":[]},
        ]
        self.assertEqual(news_diagnostics(entries, 9, 15), {
            "feeds_successful":9, "feeds_configured":15,
            "publishers":{"Diario Libre":1,"El Día":2},
            "with_image_url":1, "with_region":1,
            "by_region":{"Higüey":1},
            "regional_publishers":{"El Día":1},
        })

    def test_cached_news_structure(self):
        data=json.loads((ROOT/"data"/"news.json").read_text(encoding="utf-8"))
        self.assertIsInstance(data.get("items"), list)
        for entry in data["items"]:
            self.assertTrue(entry["title"])
            self.assertTrue(entry["url"].startswith("https://"))
            self.assertIn("source",entry)

if __name__=="__main__":
    unittest.main()
