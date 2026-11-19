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

# Prefer strong gaming/technology signals to generic economy, culture or sports words.
# Plain "juego" is intentionally excluded: it also means a sporting match.
GAMING_TITLE_RE = re.compile(
    r"\b(?:gta\s*(?:vi|6|v|5)|grand\s+theft\s+auto|rockstar\s+games|"
    r"videojuegos?|gaming|gamers?|esports?|e\s*sports?|"
    r"playstation(?:\s*[3456])?|xbox|nintendo|steam\s+deck|"
    r"ps[3456]\b|consolas?\s+de\s+videojuegos?|"
    r"inteligencia\s+artificial|ciberseguridad|"
    r"smartphones?|telefonos?\s+inteligentes?)\b"
)
GAMING_CONTEXT_RE = re.compile(
    r"\b(?:gta\s*(?:vi|6|v|5)|grand\s+theft\s+auto|"
    r"videojuegos?|gaming|esports?|playstation|xbox|nintendo|"
    r"ciberseguridad|inteligencia\s+artificial)\b"
)
GAMING_FEED_RE = re.compile(
    r"\b(?:videojuegos?|gaming|tecnologia|tecnologico|informatica|"
    r"software|hardware|consolas?|electronica|ciberseguridad)\b"
)

# Narrow title rules: avoid ambiguous standalone words such as "clase", "ley",
# "carrera", "estudio", "caso", "choque" and "trafico" without a road context.
SPECIAL_TOPIC_RULES = (
    ("Salud", re.compile(
        r"\b(?:salud publica|ministerio de salud|hospitales?|clinicas?|"
        r"vacunas?|vacunacion|dengue|malaria|epidemia|brotes? de (?:virus|dengue|gripe)|"
        r"enfermedades?|medicamentos?|pacientes?|medicos?|"
        r"atencion medica|emergencia sanitaria)\b")),
    ("Ciencia", re.compile(
        r"\b(?:investigacion cientifica|estudio cientifico|"
        r"descubrimiento cientifico|cientific[oa]s?|astronomia|"
        r"telescopio|nasa|observatorio espacial|"
        r"misiones? espaciales?|laboratorio de investigacion)\b")),
    ("Educación", re.compile(
        r"\b(?:educacion|educativo|escuelas?|colegios?|"
        r"universidades?|universitarios?|estudiantes?|"
        r"docentes?|profesores?|becas? (?:universitarias?|escolares?)|"
        r"ministerio de educacion|minerd|ano escolar|"
        r"centros educativos|alfabetizacion)\b")),
    ("Seguridad", re.compile(
        r"\b(?:policia nacional|policial|policias?|delincuencia|"
        r"criminalidad|homicidios?|asesinatos?|feminicidios?|"
        r"robos?|asaltos?|secuestros?|ladrones?|narcotrafico|"
        r"trafico de drogas|detenidos?|arrestados?|"
        r"ministerio publico|investigacion criminal|"
        r"seguridad ciudadana)\b")),
    ("Tránsito", re.compile(
        r"\b(?:accidentes? de transito|accidentes? viales?|"
        r"seguridad vial|congestion vehicular|"
        r"embotellamientos?|tapones? vehiculares?|"
        r"cierres? (?:de )?(?:calles?|carreteras?|vias?)|"
        r"desvios? (?:de )?(?:transito|trafico|vehiculos?)|"
        r"obras? viales?|transito vehicular|"
        r"circulacion vehicular|carreteras? cerradas?)\b")),
)

TOPIC_RULES = (
    ("Deportes", (
        r"\b(?:deporte(?:s)?|beisbol|pelota|lidom|jonron(?:es)?|home run|grand slam|"
        r"futbol|baloncesto|balonmano|basket|nba|mlb|olimpi(?:co|ca|cos|cas)|"
        r"maraton|boxeo|tenis|voleibol|atleta(?:s)?|escogido|licey|"
        r"aguilas cibae(?:nas)?|estrellas orientales|gigantes del cibao|"
        r"toros del este|toros (?:se sacuden|vencen|derrotan|ganan)|leones del escogido|(?:aguilas|estrellas) (?:vencen|derrotan|ganan|despiden|logran)|tbs (?:distrito|de san pedro)|judo)\b",
    )),
    ("Turismo", (r"\b(?:turismo|turist(?:a|as|ico|icos)|hoteles?|resort|playas?|"
                 r"aeropuertos?|aerolineas?|cruceros?|vacacion(?:es|al)|visitantes)\b",)),
    ("Vivienda", (r"\b(?:inmuebles?|viviendas?|alquiler(?:es)?|apartamentos?|"
                  r"construccion|urbanizacion|residencial(?:es)?)\b",)),
    ("Economía", (r"\b(?:economia|economico|finanzas?|inflacion|deuda publica|"
                   r"mercado financiero|oferta publica inicial|desempeno financiero|mision fmi|exportaciones?|importaciones?|"
                   r"precios? de|banco central|empleos?|salarios?|"
                   r"inversion(?:es)?|comercio|empresas?)\b",)),
    ("Medioambiente", (r"\b(?:medioambiente|medio ambiente|ecologia|"
                         r"huracan(?:es)?|tormentas?|inundaciones?|lluvias|"
                         r"contaminacion|bosques?|conservacion)\b",)),
    ("Cultura", (r"\b(?:cultura|festival|concierto|teatro|artista|"
                   r"museo|literatura|exposicion de arte|"
                   r"musica|cine|patrimonio|netflix (?:revela|estrena|anuncia))\b",)),
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

def category_for(title, default="Actualidad", summary="", feed_categories=None):
    """Classify headline metadata only; never download or copy article bodies.

    Strong title signals can override a broad feed label. RSS summaries and
    publisher tags only contribute with topic-specific evidence; generic terms
    such as "juego" do not turn sports news into gaming news.
    """
    t = normalize(title)
    if GAMING_TITLE_RE.search(t):
        return "Gaming y tecnología"
    for topic, expression in SPECIAL_TOPIC_RULES:
        if expression.search(t):
            return topic
    metadata = normalize(summary[:700])
    tags = normalize(" ".join(feed_categories or [])[:300])
    headline_context = re.search(
        r"\b(?:juegos?\s+(?:de\s+)?video|lanzamiento|consolas?|"
        r"tecnologia|tecnologico|digital|informatic[oa]|"
        r"software|hardware|programacion|aplicaciones?)\b", t
    )
    # A specific RSS summary can establish the topic when the title also
    # provides context. A generic "Tecnología" feed tag alone cannot:
    # market/IPO news about technology companies stays Economía.
    if GAMING_CONTEXT_RE.search(metadata) and headline_context:
        return "Gaming y tecnología"
    if GAMING_FEED_RE.search(tags) and headline_context:
        return "Gaming y tecnología"
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
            "Política", "Cultura", "Medioambiente", "Regionales", "Mundo",
            "Gaming y tecnología", "Salud", "Ciencia", "Educación",
            "Seguridad", "Tránsito"
        }, "unexpected category"
        assert all(r in REGIONS for r in entry.get("regions", [])), "bad region"
        published = dt.datetime.fromisoformat(entry["published"])
        assert now - dt.timedelta(hours=age_hours, minutes=5) <= published <= now + dt.timedelta(minutes=30), "stale or future news"
    return True
