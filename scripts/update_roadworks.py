#!/usr/bin/env python3
"""Create source-attributed roadwork reports; never claim live closure status.
Run after update_news.py. Uses existing RSS headline metadata; no paid API.
"""
import datetime as dt
import json
import pathlib
import re
import unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
UTC=dt.timezone.utc
NOW=dt.datetime.now(UTC)
NEWS=ROOT/"data"/"news.json"
OUT=ROOT/"data"/"roadworks.json"
# Explicit road-related terms and a work/closure action must both be present.
ROAD=re.compile(r"\b(?:carretera|autopista|avenida|puente|tunel|via|tramo|"
                r"circunvalacion|interseccion|calle|trafico|transito|vial)\b")
IMPACT=re.compile(r"\b(?:cierre|cerrara|cerrado|cerrada|restringe|restriccion|"
                  r"desvio|desvios|desviar|rehabilitacion|reparacion|"
                  r"asfaltado|mantenimiento|obras|trabajos|construccion|"
                  r"intervencion|inauguracion|habilitacion)\b")
def norm(s):
    s=unicodedata.normalize("NFD",str(s or "").lower())
    return "".join(c for c in s if unicodedata.category(c)!="Mn")
def is_road_report(item):
    title=norm(item.get("title",""))
    # Do not search article body; the headline must say this is road related.
    return bool(ROAD.search(title) and IMPACT.search(title))
def recent_news_items(items,now=NOW):
    notices=[]
    for item in items:
        try:
            published=dt.datetime.fromisoformat(item["published"])
            if published.tzinfo is None: published=published.replace(tzinfo=UTC)
        except (KeyError,TypeError,ValueError):
            continue
        if not dt.timedelta(0)<=now-published<=dt.timedelta(days=7):continue
        if not is_road_report(item):continue
        notices.append({
            "title":item["title"],
            "preview":item.get("preview",""),
            "translations":item.get("translations",{}),
            "preview_translations":item.get("preview_translations",{}),
            "source":item["source"],
            "url":item["url"],
            "published":item["published"],
            "regions":item.get("regions",[]),
            "kind":"report",
            "status":"unknown",
        })
    return notices
def build_payload(items,now=NOW):
    reports=recent_news_items(items,now)
    # Source-backed official announcement: restrictions from Oct 20 until further
    # notice per government publication. We NEVER mark it actively closed,
    # because the official status could have changed since publication.
    official={
        "title":"MOPC anunció restricciones de circulación en el puente La Barquita",
        "source":"Presidencia RD / MOPC",
        "url":"https://presidencia.gob.do/noticias/mopc-anuncia-restricciones-de-circulacion-de-vehiculos-pesados-en-el-puente-de-la-barquita",
        "preview":"Aviso oficial: circulación de vehículos pesados suspendida desde el 20 de octubre hasta nuevo aviso; cierres nocturnos anunciados para vehículos ligeros. Comprueba si sigue vigente antes de viajar.",
        "translations":{
            "de":"MOPC kündigte Verkehrsbeschränkungen auf der Brücke La Barquita an",
            "en":"MOPC announced traffic restrictions on La Barquita bridge",
            "fr":"Le MOPC a annoncé des restrictions sur le pont La Barquita",
            "ht":"MOPC te anonse restriksyon sou pon La Barquita"
        },
        "preview_translations":{
            "de":"Amtliche Bekanntmachung: Schwere Fahrzeuge ab 20. Oktober bis auf Weiteres ausgeschlossen; nächtliche Einschränkungen für Pkw angekündigt. Bitte Gültigkeit vor der Fahrt prüfen.",
            "en":"Official announcement: heavy vehicles restricted from October 20 until further notice; nighttime restrictions announced for light vehicles. Verify current validity before travel.",
            "fr":"Avis officiel : circulation des poids lourds restreinte depuis le 20 octobre jusqu'à nouvel ordre ; restrictions nocturnes annoncées. Vérifiez avant le trajet.",
            "ht":"Avi ofisyèl: restriksyon sou machin lou depi 20 oktòb jiska nouvo avi; restriksyon lannuit te anonse. Verifye si sa toujou valab."
        },
        "regions":["Santo Domingo"],
        "effective_from":"2026-10-20",
        "published":None,
        "kind":"official_announcement",
        "status":"unverified_current"
    }
    return {"updated":now.isoformat(),"items":reports[:24]+[official]}
def main():
    try:
        news=json.loads(NEWS.read_text(encoding="utf-8"))
        if news.get("source_status") not in ("ok","no_recent_articles"):
            raise ValueError("News source unavailable")
        payload=build_payload(news.get("items",[]))
        OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("Roadworks:","recent media reports",len(payload["items"])-1,"official archived notice",1)
    except (OSError,ValueError,TypeError) as exc:
        # Preserve last valid notices; frontend always displays their source/time.
        print("Roadworks build unavailable:",type(exc).__name__)
if __name__=="__main__":main()
