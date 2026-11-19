#!/usr/bin/env python3
"""Review the actual RSS snapshot for probable category mismatches.

Conservative independent rules; produces actionable GitHub Actions warnings and
a readable step summary. Does not fetch articles, modify RSS data or add costs.
"""
import argparse
import collections
import json
import os
import pathlib
import re
import sys
import unicodedata

ROOT=pathlib.Path(__file__).resolve().parents[1]
DEFAULT=ROOT/"data"/"news.json"

def normalize(value):
    value=unicodedata.normalize("NFD",str(value or "").lower())
    value="".join(c for c in value if unicodedata.category(c)!="Mn")
    return " ".join(re.findall(r"[a-z0-9]+",value))

# Intentionally independent of the production classifier. Each rule requires
# a distinctive title signal, so the review does not mirror every misclassification.
RULES={
 "Deportes":re.compile(r"\b(?:judo|beisbol|jonron|lidom|voleibol|"
   r"baloncesto|basketbol|futbol|mundial de futbol|"
   r"aguilas (?:despiden|vencen|ganan)|estrellas (?:logran|vencen)|"
   r"(?:licey|tbs distrito|tbs de san pedro)|toros (?:vencen|derrotan))\b"),
 "Seguridad":re.compile(r"\b(?:ladrones|robos?|asaltos?|homicidios?|"
   r"feminicidios?|asesinatos?|secuestros?|"
   r"policia (?:desmantela|investiga|arresta)|"
   r"ministerio publico investiga)\b"),
 "Gaming y tecnología":re.compile(r"\b(?:gta (?:vi|6)|videojuegos?|"
   r"grand theft auto|playstation|xbox|nintendo)\b"),
 "Cultura":re.compile(r"\b(?:netflix (?:revela|estrena|anuncia)|"
   r"serie (?:de television|en netflix)|"
   r"pelicula (?:protagonizada|estrena)|"
   r"festival (?:de cine|gastronomico|de musica))\b"),
 "Economía":re.compile(r"\b(?:oferta publica inicial|"
   r"mercado bursatil|banco central (?:analiza|evalua)|"
   r"fondo monetario internacional|"
   r"desempeno financiero|recaudo tributario)\b"),
 "Salud":re.compile(r"\b(?:campana de vacunacion|"
   r"atencion medica|hospitales?|ministerio de salud|dengue)\b"),
 "Tránsito":re.compile(r"\b(?:accidente de transito|accidente vial|"
   r"carretera cerrada|cierre de carretera|obras viales)\b"),
}
# Cross-category boundaries can be genuinely editorial: "FIFA museum" is
# culture even though FIFA is sports; "film about crime" is culture.
SOFT_EXCEPTIONS={
 ("Deportes","Cultura"):re.compile(r"\b(?:museo|exposicion|documental|pelicula)\b"),
 ("Seguridad","Cultura"):re.compile(r"\b(?:drama|pelicula|serie|documental|actriz|actor)\b"),
}
ENVIRONMENT_SIGNAL=re.compile(
 r"\b(?:meteorologia|clima|lluvia|aguacero|huracan|tormenta|"
 r"medio ambiente|medioambiente|ecologia|bosque|"
 r"inundacion|cambio climatico|contaminacion|"
 r"energia renovable|biodiversidad|calentamiento global)\b")

def audit(items):
    issues=[]
    for entry in items:
        title=str(entry.get("title",""))
        category=str(entry.get("category",""))
        t=normalize(title)
        for expected,pattern in RULES.items():
            if expected==category or not pattern.search(t):
                continue
            except_pattern=SOFT_EXCEPTIONS.get((expected,category))
            if except_pattern and except_pattern.search(t):
                continue
            issues.append({"title":title,"current":category,"suggested":expected,
                           "reason":"eindeutiger Themenhinweis in der Überschrift"})
            break
        else:
            if category=="Medioambiente" and not ENVIRONMENT_SIGNAL.search(t):
                # A poor feed category is suspicious, but the headline may be
                # cryptic and the summary can still explain an environment story.
                preview=normalize(entry.get("preview",""))
                if not ENVIRONMENT_SIGNAL.search(preview):
                    issues.append({"title":title,"current":category,"suggested":"Prüfen",
                                   "reason":"kein erkennbarer Umweltbezug in Titel oder Kurzbeschreibung"})
    return issues

def review(data):
    items=data.get("items",[])
    counts=collections.Counter(str(x.get("category","")) for x in items)
    return {"stories":len(items),"categories":dict(sorted(counts.items())),
            "findings":audit(items)}

def summary(report):
    rows=["## IslaViva RD · Nachrichten-Kategorieprüfung",
          f"**{report['stories']} Meldungen**, **{len(report['findings'])} Prüfhilfen**",
          "", "### Kategorien"]
    rows += [f"- {name}: {count}" for name,count in report["categories"].items()]
    if report["findings"]:
        rows+=["","### Auffälligkeiten (Hinweise, keine automatisch bestätigten Fehler)",
               "| Titel | Jetzt | Vorschlag | Grund |","|---|---|---|---|"]
        for finding in report["findings"][:30]:
            values=[finding[k].replace("|","/").replace("\n"," ") for k in ("title","current","suggested","reason")]
            rows+=["| "+" | ".join(values)+" |"]
    else:
        rows+=["","Keine deutlichen Widersprüche anhand der verfügbaren RSS-Metadaten erkannt."]
    rows+=["","Nur Überschrift und RSS-Kurzbeschreibung; keine Volltextprüfung. "
           "Wird nichts gemeldet, ist das **keine Garantie** für korrekte Kategorien."]
    return "\n".join(rows)+"\n"

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--file",type=pathlib.Path,default=DEFAULT)
    parser.add_argument("--strict",action="store_true",help="fail when findings exist; for tests only")
    args=parser.parse_args()
    try:
        data=json.loads(args.file.read_text(encoding="utf-8"))
        report=review(data)
    except (OSError,ValueError,KeyError) as error:
        print(f"Category audit unavailable: {error}",file=sys.stderr)
        return 1
    print(summary(report))
    for finding in report["findings"][:30]:
        message=(f"{finding['title'][:80]} | {finding['current']} -> "
                 f"{finding['suggested']} ({finding['reason']})")
        # Escape GitHub workflow command syntax.
        message=message.replace("%","%25").replace("\r","%0D").replace("\n","%0A")
        print(f"::warning title=RSS-Kategorie prüfen::{message}")
    path=os.getenv("GITHUB_STEP_SUMMARY")
    if path:
        with open(path,"a",encoding="utf-8") as stream:
            stream.write(summary(report))
    return 1 if args.strict and report["findings"] else 0

if __name__=="__main__":
    raise SystemExit(main())
