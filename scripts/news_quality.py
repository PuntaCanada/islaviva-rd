"""Pure stdlib news quality helpers for IslaViva RD.

Feed data is untrusted. Regions are inferred only from explicit headline mentions,
never from a newspaper's headquarters or broad distribution area.
No paid model, account, external package, or remote service is required.
"""
import datetime as dt
import difflib
import re
import unicodedata
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

TOPIC_RULES = (
    ("Deportes", (
        r"\b(?:deporte(?:s)?|beisbol|pelota|lidom|jonron(?:es)?|home run|grand slam|"
        r"futbol|baloncesto|balonmano|basket|nba|mlb|olimpi(?:co|ca|cos|cas)|"
        r"maraton|boxeo|tenis|voleibol|atleta(?:s)?|escogido|licey|"
        r"aguilas cibae(?:nas)?|estrellas orientales|gigantes del cibao|"
        r"toros del este|toros (?:se sacuden|vencen|derrotan|ganan)|leones del escogido|(?:aguilas|estrellas) (?:vencen|derrotan|ganan))\b",
    )),
    ("Turismo", (r"\b(?:turismo|turist(?:a|as|ico|icos)|hoteles?|resort|playas?|"
                 r"aeropuertos?|aerolineas?|cruceros?|vacacion(?:es|al)|visitantes)\b",)),
    ("Vivienda", (r"\b(?:inmuebles?|viviendas?|alquiler(?:es)?|apartamentos?|"
                  r"construccion|urbanizacion|residencial(?:es)?)\b",)),
    ("Economía", (r"\b(?:economia|economico|finanzas?|inflacion|deuda publica|"
                   r"mercado financiero|exportaciones?|importaciones?|"
                   r"precios? de|banco central|empleos?|salarios?|"
                   r"inversion(?:es)?|comercio|empresas?)\b",)),
    ("Medioambiente", (r"\b(?:medioambiente|medio ambiente|ecologia|"
                         r"huracanes?|tormentas?|inundaciones?|lluvias|"
                         r"contaminacion|bosques?|conservacion)\b",)),
    ("Cultura", (r"\b(?:cultura|festival|concierto|teatro|artista|"
                   r"museo|literatura|exposicion de arte|"
                   r"musica|cine|patrimonio)\b",)),
    ("Política", (r"\b(?:politica|politico|presidente|vicepresident[ea]|"
                    r"senad(?:o|or|ora)|congreso|diputad[oa]s?|"
                    r"eleccion(?:es)?|partido|gobierno|"
                    r"ministros?|alcald[ea])\b",)),
)
TOPIC_REGEX = [(topic, [re.compile(p) for p in patterns]) for topic, patterns in TOPIC_RULES]
REGIONS = {
    "Higüey": ("higuey", "la altagracia", "salvaleon de higuey"),
    "Punta Cana": ("punta cana", "bavaro", "veron", "cap cana", "uvero alto", "macao"),
    "Santo Domingo": ("santo domingo", "distrito nacional", "gran santo domingo"),
    "Santiago": ("santiago de los caballeros", "santiago, rd"),
    "La Romana": ("la romana",),
    "Puerto Plata": ("puerto plata",),
    "Samaná": ("samana", "las terrenas", "sanchez de samana"),
}
REGION_PATTERNS = {
    k: [re.compile(r"(?<!\w)" + re.escape(v) + r"(?!\w)") for v in vs]
    for k, vs in REGIONS.items()
}
TRIVIAL_WORDS = frozenset(
    "de del la las los el en a al y por para con un una unos unas que se su sus "
    "como sobre ante desde tras es fue son hay hoy ayer ahora rd dominicana "
    "dominicano republica pais nuevo nueva mas esta este esto asi".split()
)

def normalize(text):
    value = unicodedata.normalize("NFD", (text or "").lower())
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", value)).strip()

def category_for(title, default="Actualidad"):
    t = normalize(title)
    for topic, expressions in TOPIC_REGEX:
        if any(exp.search(t) for exp in expressions):
            return topic
    return default

def region_mentions(title):
    t = normalize(title)
    # Explicit city/province mentions only. Bare "Santiago" is ambiguous.
    return [region for region, pats in REGION_PATTERNS.items()
            if any(p.search(t) for p in pats)]

def canonical_url(url):
    parts = urlsplit(url)
    # Tracking query parameters do not identify a distinct news story.
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
             if not k.lower().startswith(("utm_", "fbclid", "gclid", "mc_"))]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower().removeprefix("www."),
                       path, urlencode(query), ""))

def headline_tokens(title):
    return [w for w in normalize(title).split()
            if len(w) > 2 and w not in TRIVIAL_WORDS]

def is_near_duplicate(left, right):
    """Conservative match: do not suppress genuinely distinct news just because
    both concern the same politician, city or sporting competition."""
    if canonical_url(left["url"]) == canonical_url(right["url"]):
        return True
    a, b = headline_tokens(left["title"]), headline_tokens(right["title"])
    if len(a) < 5 or len(b) < 5:
        return False
    sa, sb = set(a), set(b)
    overlap = len(sa & sb) / max(1, len(sa | sb))
    # At least 4 shared meaningful words and very high similarity.
    if len(sa & sb) >= 4 and (
        overlap >= .78 or
        (overlap >= .68 and difflib.SequenceMatcher(None, " ".join(a), " ".join(b)).ratio() >= .84)
    ):
        return True
    # Two publishers may word the *same* baseball event very differently.
    # Require two same teams and a shared player/event cue, plus nearby dates.
    # No general suppression of articles merely mentioning the same politician.
    cues={"jonron", "home", "run"}
    team_pairs=({"licey","aguilas"},{"licey","escogido"},{"toros","leones"})
    common=sa & sb
    if len(common)>=5 and "jonron" in common and any(pair <= common for pair in team_pairs):
        try:
            time_a=dt.datetime.fromisoformat(left["published"])
            time_b=dt.datetime.fromisoformat(right["published"])
            return abs((time_a-time_b).total_seconds()) <= 12*3600
        except (KeyError,ValueError,TypeError):
            pass
    return False

def quality_rank(entry, preferred_city=None):
    """Deterministic score to break ties and boost meaningful local reports.
    Freshness is explicitly small: the latest unrelated national item should
    not bury a genuinely city-related story in the local section."""
    published = dt.datetime.fromisoformat(entry["published"])
    if published.tzinfo is None:
        published = published.replace(tzinfo=dt.timezone.utc)
    freshness = published.timestamp() / 1e10
    locations = entry.get("regions") or []
    locality = 12 if preferred_city and preferred_city in locations else (3 if locations else 0)
    regional_source = 2 if entry.get("source") in ("Punta Cana Post", "El Tiempo", "Bávaro Digital") else 0
    return locality + regional_source + freshness

def select_stories(entries, limit=72, per_source_limit=24):
    ordered = sorted(entries, key=lambda e: e["published"], reverse=True)
    deduped = []
    source_counts = {}
    duplicates = 0
    for entry in ordered:
        if any(is_near_duplicate(entry, previous) for previous in deduped):
            duplicates += 1
            continue
        source = entry["source"]
        if source_counts.get(source, 0) >= per_source_limit:
            continue
        deduped.append(entry)
        source_counts[source] = source_counts.get(source, 0) + 1
        if len(deduped) >= limit:
            break
    return deduped, duplicates

def validate_news(items, now, age_hours=48):
    seen = set()
    for entry in items:
        assert entry["title"].strip(), "empty headline"
        assert len(entry["title"]) <= 180, "oversized headline"
        assert len(entry.get("preview", "")) <= 175, "oversized preview"
        assert entry["url"].startswith("https://"), "invalid URL"
        key = canonical_url(entry["url"])
        assert key not in seen, "duplicate canonical URL"
        seen.add(key)
        assert entry["category"] in {
            "Actualidad", "Deportes", "Turismo", "Vivienda", "Economía",
            "Política", "Cultura", "Medioambiente", "Regionales", "Mundo"
        }, "unexpected category"
        assert all(r in REGIONS for r in entry.get("regions", [])), "bad region"
        published = dt.datetime.fromisoformat(entry["published"])
        assert now - dt.timedelta(hours=age_hours, minutes=5) <= published <= now + dt.timedelta(minutes=30), "stale or future news"
    return True
