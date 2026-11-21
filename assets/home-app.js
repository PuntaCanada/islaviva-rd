

const extraTranslations={es:{eyebrow:'NOVEDAD · TU ZONA',title:'Tu próximo hogar. Tu próximo camino.',subtitle:'Viviendas y avisos de infraestructura adaptados a tu ciudad.',propertyTag:'VIVIENDA',propertyTitle:'Encuentra dónde vivir',propertyDesc:'Explora anuncios de alquiler o venta de fuentes externas para la zona que elijas.',rent:'Alquilar',buy:'Comprar',propertyCta:'Buscar anuncios para mi zona ↗',propertyNote:'Búsquedas externas. Sin inventario propio ni precios verificados todavía.',roadTag:'INFRAESTRUCTURA',roadTitle:'Obras y cierres viales',roadDesc:'Encuentra noticias oficiales sobre obras, desvíos y cierres en la región seleccionada.',roadStatus:'Avisos oficiales; no son datos de tráfico en tiempo real',roadCta:'Buscar avisos de mi zona ↗',roadNote:'Comprueba la fecha y vigencia de cada aviso.'},de:{eyebrow:'NEU · DEINE REGION',title:'Dein nächstes Zuhause. Dein nächster Weg.',subtitle:'Immobilien und Bauhinweise passend zur ausgewählten Stadt.',propertyTag:'IMMOBILIEN',propertyTitle:'Ein neues Zuhause finden',propertyDesc:'Miet- und Kaufangebote externer Immobilienseiten für deine Region entdecken.',rent:'Mieten',buy:'Kaufen',propertyCta:'Angebote in meiner Region suchen ↗',propertyNote:'Externe Suche. Noch keine eigenen Inserate oder geprüften Preise.',roadTag:'INFRASTRUKTUR',roadTitle:'Baustellen & Straßensperrungen',roadDesc:'Offizielle Hinweise zu Bauarbeiten, Umleitungen und Sperrungen in deiner Region suchen.',roadStatus:'Amtliche Meldungen, keine Live-Verkehrsdaten',roadCta:'Regionale Meldungen suchen ↗',roadNote:'Datum und Gültigkeit jeder Meldung überprüfen.'},en:{eyebrow:'NEW · YOUR AREA',title:'Your next home. Your next route.',subtitle:'Property searches and infrastructure notices for your city.',propertyTag:'PROPERTY',propertyTitle:'Find a place to call home',propertyDesc:'Explore rental and sale listings from external websites in your region.',rent:'Rent',buy:'Buy',propertyCta:'Find listings in my area ↗',propertyNote:'External search only. No owned inventory or verified prices yet.',roadTag:'INFRASTRUCTURE',roadTitle:'Roadworks & closures',roadDesc:'Find official notices on works, diversions and road closures in your region.',roadStatus:'Official notices, not live traffic conditions',roadCta:'Find notices for my area ↗',roadNote:'Check publication dates and whether notices are still valid.'},fr:{eyebrow:'NOUVEAU · VOTRE RÉGION',title:'Votre prochain logement. Votre prochain trajet.',subtitle:'Immobilier et informations sur les travaux dans votre ville.',propertyTag:'IMMOBILIER',propertyTitle:'Trouver un logement',propertyDesc:'Consultez les annonces de location ou de vente sur des sites externes dans votre région.',rent:'Louer',buy:'Acheter',propertyCta:'Voir les annonces de ma région ↗',propertyNote:'Recherche externe; pas encore de biens ni de prix vérifiés.',roadTag:'INFRASTRUCTURE',roadTitle:'Travaux et fermetures de routes',roadDesc:'Recherchez les annonces officielles de travaux, déviations et fermetures de routes.',roadStatus:'Avis officiels, pas de données de circulation en direct',roadCta:'Voir les avis locaux ↗',roadNote:'Vérifiez les dates et la validité des avis.'}};
let roadNoticesData=null;
let roadAllRegions=false;
const roadCopy={
 es:{all:'🌎 Ver toda RD',local:'📍 Solo mi ciudad',empty:'No se encontraron avisos recientes sobre obras o cierres para esta zona. Esto no confirma que las vías estén despejadas.',national:'Sin avisos locales: aquí tienes anuncios de otras zonas claramente identificados.',date:'Publicado',notice:'Aviso oficial anterior · Vigencia no confirmada',media:'Noticia publicada · No confirma un cierre activo',read:'Leer aviso original',status:'No son datos de tráfico en tiempo real',loading:'Cargando avisos publicados...'},
 de:{all:'🌎 Ganze RD anzeigen',local:'📍 Nur meine Stadt',empty:'Keine aktuellen Meldungen zu Baustellen oder Sperrungen für diesen Bereich gefunden. Das bedeutet nicht, dass alle Straßen frei sind.',national:'Keine lokalen Meldungen gefunden. Hier stehen deutlich gekennzeichnete Hinweise aus anderen Regionen.',date:'Veröffentlicht',notice:'Ältere amtliche Bekanntmachung · Gültigkeit nicht bestätigt',media:'Veröffentlichter Bericht · Keine bestätigte aktuelle Sperrung',read:'Originalmeldung lesen',status:'Keine Live-Verkehrsdaten',loading:'Veröffentlichte Hinweise werden geladen...'},
 en:{all:'🌎 Show all RD',local:'📍 My city only',empty:'No recent roadwork or closure reports found for this area. This does not mean all roads are open.',national:'No local reports found; showing clearly labeled notices from other regions.',date:'Published',notice:'Earlier official announcement · Current status unverified',media:'Published report · Not a confirmed active closure',read:'Read original notice',status:'Not real-time traffic data',loading:'Loading published notices...'},
 fr:{all:'🌎 Toute la RD',local:'📍 Ma ville seulement',empty:'Aucun avis récent trouvé dans cette zone. Cela ne confirme pas que toutes les routes soient ouvertes.',national:'Aucun avis local. Voici des avis clairement identifiés concernant d’autres zones.',date:'Publié',notice:'Ancien avis officiel · Validité non confirmée',media:'Article publié · Fermeture actuelle non confirmée',read:'Lire l’avis original',status:'Pas de données de circulation en direct',loading:'Chargement des avis...'},
 ht:{all:'🌎 Tout RD',local:'📍 Vil mwen sèlman',empty:'Pa gen avi resan nou jwenn pou zòn sa a. Sa pa vle di tout wout yo ouvè.',national:'Pa gen avi lokal; men avi ki soti nan lòt zòn yo make byen klè.',date:'Pibliye',notice:'Ansyen avi ofisyèl · Pa verifye si li toujou valab',media:'Nouvèl pibliye · Pa gen konfimasyon wout la fèmen kounye a',read:'Li avi orijinal la',status:'Pa done trafik an dirèk',loading:'Ap chaje avi yo...'}
};
function renderRoadNotices(){
 const section=document.getElementById('road-notices');
 if(!section)return;
 const t=roadCopy[lang]||roadCopy.es;
 const desc={es:'Avisos y noticias directamente aquí, con lugar, fecha y fuente. No confirma cierres activos.',de:'Meldungen direkt hier mit Ort, Datum und Quelle. Keine bestätigten Live-Sperrungen.',en:'Published notices right here, with location, date and source. Not live closure confirmation.',fr:'Avis publiés ici avec lieu, date et source. Pas de confirmation en temps réel.',ht:'Avi yo dirèkteman isit la ak kote, dat ak sous. Pa konfimasyon an dirèk.'};
 document.querySelector('[data-x="roadDesc"]').textContent=desc[lang]||desc.es;
 document.querySelector('[data-x="roadStatus"]').textContent=t.status;
 const button=document.getElementById('road-toggle-scope');
 button.textContent=roadAllRegions?t.local:t.all;
 if(!roadNoticesData){section.innerHTML='<p class="road-muted">'+esc(t.loading)+'</p>';return}
 const items=roadNoticesData.items||[];
 const byCity=items.filter(n=>Array.isArray(n.regions)&&n.regions.includes(city));
 const noLocal=!byCity.length;
 const displayed=roadAllRegions?items:(byCity.length?byCity:items.slice(0,3));
 const lead=noLocal&&!roadAllRegions?'<p class="road-muted">'+esc(t.national)+'</p>':'';
 const content=displayed.length?displayed.slice(0,5).map(n=>{
   const safe=(()=>{
     try{const u=new URL(n.url);return u.protocol==='https:'&&['presidencia.gob.do','www.presidencia.gob.do','mopc.gob.do','www.mopc.gob.do','diariolibre.com','www.diariolibre.com','hoy.com.do','www.hoy.com.do','eldia.com.do','www.eldia.com.do','almomento.net','www.almomento.net','noticiassin.com','www.noticiassin.com','puntacanapost.com','www.puntacanapost.com','eltiempo.com.do','www.eltiempo.com.do','bavarodigital.net','www.bavarodigital.net'].includes(u.hostname)?u.href:null;}catch(e){return null}
   })();
   const title=(lang==='es'?n.title:n.translations?.[lang])||n.title;
   // Never present an un-translated Spanish preview as if it were in the chosen language.
   const preview=(lang==='es'?n.preview:n.preview_translations?.[lang])||'';
   const region=Array.isArray(n.regions)&&n.regions.length?n.regions.join(' / '):'República Dominicana';
   const date=n.published?new Date(n.published).toLocaleDateString(lang,{year:'numeric',month:'short',day:'numeric',timeZone:'America/Santo_Domingo'}):(n.effective_from||'');
   const status=n.kind==='official_announcement'?t.notice:t.media;
   return '<article class="road-item"><span class="road-pill">'+esc(status)+'</span><b>'+esc(title)+'</b>'+(preview?'<p>'+esc(preview)+'</p>':'')+'<small>📍 '+esc(region)+' · '+esc(n.source)+(date?' · '+esc(date):'')+'</small>'+(safe?'<a target="_blank" rel="noopener noreferrer" href="'+esc(safe)+'">'+esc(t.read)+' ↗</a>':'')+'</article>';
 }).join(''):'<p class="road-muted">'+esc(t.empty)+'</p>';
 section.innerHTML=lead+content;
}
async function loadRoadNotices(){
 try{
  const result=await fetch('/data/roadworks.json',{cache:'no-store'});
  if(!result.ok)throw Error('no road reports');
  const data=await result.json();
  if(!Array.isArray(data.items))throw Error('invalid road reports');
  roadNoticesData=data;
 }catch(e){roadNoticesData={items:[]}}
 renderRoadNotices();
}
document.getElementById('road-toggle-scope').addEventListener('click',()=>{roadAllRegions=!roadAllRegions;renderRoadNotices()});

let localBulletins=[];
let archivedLocalContext=[];
const pulseTranslations={
 es:{kicker:'TU VIDA LOCAL',title:'Lo importante cerca de ti',subtitle:'Información oficial y avisos publicados. No es un monitor en tiempo real.',badge:'Estado actual no confirmado',read:'Ver avisos oficiales',power:'Electricidad',powerDesc:'Trabajos programados y comunicados de EDEEste; consulta fecha, circuito y vigencia.',water:'Agua potable',waterDesc:'Comunicados de INAPA sobre servicio, averías y obras. Ningún corte actual confirmado aquí.',roads:'Obras y carreteras',roadsDesc:'Avisos publicados de obras, desvíos y restricciones con fuente y fecha, directamente en IslaViva RD.',events:'Eventos',eventsDesc:'Agenda de actividades del Ministerio de Turismo o noticias municipales de Higüey.'},
 de:{kicker:'DEIN ALLTAG',title:'Wichtiges aus deiner Region',subtitle:'Amtliche Informationen und veröffentlichte Hinweise, keine Live-Störungsübersicht.',badge:'Aktueller Status nicht bestätigt',read:'Amtliche Hinweise ansehen',power:'Stromversorgung',powerDesc:'Geplante Arbeiten und Meldungen von EDEEste. Datum, Stromkreis und Gültigkeit prüfen.',water:'Wasserversorgung',waterDesc:'Meldungen von INAPA zu Störungen und Bauarbeiten. Hier ist keine aktuelle Unterbrechung bestätigt.',roads:'Straßen & Baustellen',roadsDesc:'Veröffentlichte Straßenarbeiten, Umleitungen und Einschränkungen mit Quelle und Datum direkt auf IslaViva RD.',events:'Veranstaltungen',eventsDesc:'Veranstaltungskalender der Tourismusbehörde beziehungsweise Mitteilungen der Stadt Higüey.'},
 en:{kicker:'YOUR LOCAL LIFE',title:'Useful updates near you',subtitle:'Official information and published notices, not a real-time outage monitor.',badge:'Current status not verified',read:'Check official updates',power:'Electricity',powerDesc:'EDEEste maintenance and service notices. Check the date, circuit and validity.',water:'Water supply',waterDesc:'INAPA announcements about supply issues and works. No current outage confirmed here.',roads:'Roadworks',roadsDesc:'Source-linked dated roadwork and diversion notices, right on IslaViva RD.',events:'Events',eventsDesc:'Tourism authority event listings or Higüey municipal notices.'},
 fr:{kicker:'VIE LOCALE',title:'L’essentiel près de chez vous',subtitle:'Informations officielles publiées, sans suivi des pannes en direct.',badge:'Situation actuelle non vérifiée',read:'Voir les avis officiels',power:'Électricité',powerDesc:'Annonces de travaux et de coupures EDEEste. Vérifiez la date et le circuit.',water:'Eau potable',waterDesc:'Annonces INAPA sur les interruptions et travaux. Pas de coupure actuelle confirmée ici.',roads:'Routes et travaux',roadsDesc:'Avis de travaux et déviations avec date et source, sur IslaViva RD.',events:'Événements',eventsDesc:'Agenda de l’office du tourisme ou informations municipales de Higüey.'},
 ht:{kicker:'LAVI NAN ZÒN OU',title:'Sa ki enpòtan bò kote w',subtitle:'Avi ofisyèl ki pibliye, se pa enfòmasyon an dirèk sou pann.',badge:'Sitiyasyon aktyèl pa verifye',read:'Gade avi ofisyèl',power:'Kouran elektrik',powerDesc:'Avi antretyen ak sèvis EDEEste. Verifye dat ak zòn nan.',water:'Dlo potab',waterDesc:'Nouvèl INAPA sou dlo ak travay. Pa gen koupe aktyèl ki konfime isit la.',roads:'Wout ak travay',roadsDesc:'Avi travay wout ak dat ak sous dirèkteman sou IslaViva RD.',events:'Evènman',eventsDesc:'Kalandriye touris ak avi minisipal Higüey.'}
};
function renderLocalPulse(){
 const t=pulseTranslations[lang]||pulseTranslations.es;
 const guides={es:'⚡ Guía: cortes de luz en Higüey',de:'⚡ Ratgeber: Stromausfälle in Higüey',en:'⚡ Guide: power outages in Higüey',fr:'⚡ Guide : coupures de courant à Higüey',ht:'⚡ Gid: kouran koupe nan Higüey'};
 document.getElementById('power-guide-link').textContent=(guides[lang]||guides.es)+' ↗';
 document.getElementById('pulse-kicker').textContent=t.kicker;
 document.getElementById('pulse-title').textContent=t.title;
 document.getElementById('pulse-subtitle').textContent=t.subtitle;
 document.getElementById('pulse-city').textContent='📍 '+city;
 const eventsUrl=city==='Higüey'?'https://ayuntamientohiguey.gob.do/category/noticias/':'https://es.godominicanrepublic.com/que-hacer/espectaculos-y-eventos';
 const cards=[
  ['⚡',t.power,t.powerDesc,'https://edeeste.com.do/inicio/servicios/estado-de-circuito-y-suministro/',false,'power'],
  ['💧',t.water,t.waterDesc,'https://inapa.gob.do/servicios/sistema-de-monitoreo-del-inapa/',false,'water'],
  ['🚧',t.roads,t.roadsDesc,'#zona-extra',true,'roads'],
  ['🎉',t.events,t.eventsDesc,eventsUrl,false,'events']
 ];
 const noticesUi={
  es:{none:'Sin avisos locales recientes en nuestras fuentes',view:'Ver fuente oficial',status:'Aviso publicado, no estado en vivo',events:'Consultar agenda',roads:'Ver avisos de vías'},
  de:{none:'Keine neuen lokalen Meldungen in unseren Quellen',view:'Offizielle Quelle öffnen',status:'Veröffentlichte Meldung, kein Live-Status',events:'Veranstaltungen ansehen',roads:'Straßenmeldungen ansehen'},
  en:{none:'No recent local notices in our sources',view:'Open official source',status:'Published notice, not live status',events:'See events',roads:'View road notices'},
  fr:{none:'Aucun avis local récent dans nos sources',view:'Voir la source officielle',status:'Avis publié, pas de statut en direct',events:'Voir les événements',roads:'Voir les avis routiers'},
  ht:{none:'Pa gen nouvo avi lokal nan sous nou yo',view:'Louvri sous ofisyèl',status:'Avi pibliye, pa sitiyasyon an dirèk',events:'Gade evènman',roads:'Gade avi wout'}
 }[lang]||{none:'Sin avisos locales recientes',view:'Ver fuente',status:'Aviso publicado',events:'Eventos',roads:'Vías'};
 document.getElementById('pulse-grid').innerHTML=cards.map(([icon,title,desc,url,internal,kind])=>{
  const relevant=localBulletins.filter(x=>x.kind===kind&&Array.isArray(x.regions)&&x.regions.includes(city)).slice(0,2);
  const historical=kind==='power'&&!relevant.length?archivedLocalContext.filter(x=>x.kind===kind&&Array.isArray(x.regions)&&x.regions.includes(city)).slice(0,1):[];
  const historicalText={
   es:'Archivo · No confirma un apagón actual',de:'Ältere Meldung · Kein bestätigter aktueller Ausfall',en:'Past report · Not a confirmed current outage',fr:'Ancien article · Pas de panne actuelle confirmée',ht:'Ansyen rapò · Pa konfimasyon pann kounye a'
  }[lang]||'Archivo · No confirma un apagón actual';
  const archivedHTML=historical.map(x=>{
   const headline=x.translations?.[lang]||x.title;
   const date=x.date?new Date(x.date+'T12:00:00Z').toLocaleDateString(lang,{day:'numeric',month:'short',year:'numeric',timeZone:'America/Santo_Domingo'}):'';
   return '<div class="pulse-notice pulse-archived"><small>'+esc(historicalText)+' · '+esc(date)+'</small><b>'+esc(headline)+'</b><a href="'+esc(x.url)+'" rel="noopener noreferrer" target="_blank">'+esc(x.source)+' ↗</a></div>';
  }).join('');
  const brief=relevant.map(x=>{
   let safe=false;
   try{safe=new URL(x.url).protocol==='https:';}catch(e){}
   const date=x.published?new Date(x.published).toLocaleDateString(lang,{day:'numeric',month:'short',timeZone:'America/Santo_Domingo'}):'';
   const headline=lang==='es'?x.title:(x.translations?.[lang]||x.title);
   return '<div class="pulse-notice"><small>🗓️ '+esc(date)+' · '+esc(x.source)+(lang!=='es'&&!x.translations?.[lang]?' · ES':'')+'</small><b>'+esc(headline)+'</b>'+(safe?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">↗ '+esc(noticesUi.view)+'</a>':'')+'</div>';
  }).join('');
  const noMatch=kind==='power'||kind==='water'||kind==='events';
  const actionLabels={
   es:{power:'Consultar mi circuito',water:'Consultar avisos INAPA'},de:{power:'Stromkreis direkt prüfen',water:'INAPA-Hinweise prüfen'},en:{power:'Check my power circuit',water:'Check INAPA notices'},fr:{power:'Vérifier mon circuit',water:'Voir les avis INAPA'},ht:{power:'Tcheke sikwi kouran mwen',water:'Tcheke avi INAPA'}
  }[lang]||{power:'Consultar mi circuito',water:'Consultar avisos INAPA'};
  const label=relevant.length?noticesUi.status:(kind==='power'?actionLabels.power:kind==='water'?actionLabels.water:kind==='events'?noticesUi.events:noticesUi.roads);
  const cta=kind==='power'?actionLabels.power:kind==='water'?actionLabels.water:kind==='events'?noticesUi.events:kind==='roads'?noticesUi.roads:noticesUi.view;
  return '<article class="pulse-card"><span class="pulse-icon" aria-hidden="true">'+icon+'</span><b>'+esc(title)+'</b><span class="pulse-caption'+(!relevant.length?' pulse-caption-muted':'')+'">'+esc(label)+'</span><p>'+esc(desc)+'</p>'+brief+archivedHTML+'<a href="'+esc(url)+'"'+(internal?'':' target="_blank" rel="noopener noreferrer"')+'>'+esc(cta)+' ↗</a></article>';
 }).join('');
}
async function loadArchivedLocalContext(){
 try{
  const r=await fetch('/data/local_context.json',{cache:'no-store'});
  if(!r.ok)throw Error('no local context');
  const d=await r.json();
  archivedLocalContext=Array.isArray(d.items)?d.items.filter(x=>{
   const age=Date.now()-Date.parse((x.date||'')+'T12:00:00Z');
   return x.status==='archived_report'&&age>0&&age<45*86400000&&/^https:\/\//.test(x.url);
  }):[];
 }catch(e){archivedLocalContext=[]}
 renderLocalPulse();
}
async function loadLocalBulletins(){
 try{
  const r=await fetch('/data/local_notices.json',{cache:'no-store'});
  if(!r.ok)throw Error('local bulletins unavailable');
  const data=await r.json();
  if(!Array.isArray(data.items))throw Error('invalid local bulletins');
  const latest=Date.parse(data.updated||'');
  // Old cached announcements must not remain as apparent current notices.
  localBulletins=(Date.now()-latest<30*3600000&&latest<=Date.now()+1800000)?
    data.items.filter(n=>n.status==='published_unverified'&&Date.now()-Date.parse(n.published)<7*86400000):[];
 }catch(e){localBulletins=[]}
 renderLocalPulse();
}

const shopLabels={
 es:{kicker:'OFERTAS Y COMPRAS',title:'Descubre promociones de supermercados',desc:'Ofertas publicadas por los comercios. Precios y disponibilidad pueden variar según tienda y canal.',disclosure:'Enlaces gratuitos · Sin publicidad pagada',note:'No copiamos folletos publicitarios ni mostramos descuentos sin verificar. Consulta siempre las fechas y condiciones de cada promoción.',sirena:'Promociones y especiales del día',jumbo:'Sección oficial de ofertas',open:'Ver ofertas en la tienda'},
 de:{kicker:'SHOPPING & ANGEBOTE',title:'Supermarktangebote entdecken',desc:'Direkte Aktionen der Händler. Online- und Filialpreise sowie Verfügbarkeit können abweichen.',disclosure:'Kostenlose Links · Keine bezahlte Werbung',note:'Keine kopierten Werbeprospekte und keine ungeprüften Rabatte. Bitte Aktionszeitraum und Bedingungen beim Händler prüfen.',sirena:'Angebote und Tagesaktionen',jumbo:'Offizielle Angebotsübersicht',open:'Angebote im Shop ansehen'},
 en:{kicker:'SHOPPING & DEALS',title:'Find supermarket offers',desc:'Offers published by stores. Online and in-store prices and stock may differ.',disclosure:'Free links · Not sponsored',note:'No copied flyers or unverified discounts. Always check dates and terms with the retailer.',sirena:'Daily deals and promotions',jumbo:'Official deals listing',open:'Explore store offers'},
 fr:{kicker:'ACHATS & PROMOTIONS',title:'Promotions des supermarchés',desc:'Offres publiées par les enseignes. Les prix et stocks peuvent varier selon le magasin.',disclosure:'Liens gratuits · Non sponsorisés',note:'Pas de prospectus copiés ni de remises non vérifiées. Vérifiez les dates et conditions.',sirena:'Promotions du jour',jumbo:'Offres officielles',open:'Voir les offres'},
 ht:{kicker:'ACHAT AK PWOMOSYON',title:'Ofri nan makèt',desc:'Ofri magazen yo pibliye. Pri ak stock ka diferan selon magazen an.',disclosure:'Lyen gratis · Pa piblisite peye',note:'Nou pa kopye afich ni mete rabè ki pa verifye. Verifye dat ak kondisyon yo.',sirena:'Pwomosyon jounen an',jumbo:'Ofri ofisyèl',open:'Gade ofri yo'}
};
function renderShopping(){
 const t=shopLabels[lang]||shopLabels.es;
 const guides={es:'Guía de ofertas de supermercados',de:'Ratgeber: Supermarktangebote',en:'Supermarket deals guide',fr:'Guide des promotions',ht:'Gid pwomosyon makèt'};
 document.getElementById('shopping-guide-link').textContent=(guides[lang]||guides.es)+' ↗';
 document.getElementById('shopping-guide-link').href=(lang==='es'?'/':'/'+lang+'/')+'ofertas-supermercados-rd.html';
 document.getElementById('shopping-kicker').textContent=t.kicker;
 document.getElementById('shopping-title').textContent=t.title;
 document.getElementById('shopping-desc').textContent=t.desc;
 document.getElementById('shopping-disclosure').textContent=t.disclosure;
 document.getElementById('shopping-note').textContent=t.note;
 const labels={
 es:{nav:'🛒 Ofertas',hero:'🛒 Ofertas y pedidos ↓',sr:'Consulta productos y promociones en la tienda.',sb:'Ver Sirena ↗',jr:'Explora las ofertas publicadas y verifica disponibilidad.',jb:'Ver Jumbo ↗',ur:'Consulta si hay restaurantes o entregas disponibles para tu dirección.',ub:'Ver Uber Eats ↗',notice:'Enlaces externos informativos · Sin patrocinio ni afiliación confirmada · Precios, cobertura y pedidos se gestionan en cada plataforma.'},
 de:{nav:'🛒 Angebote',hero:'🛒 Angebote & Bestellungen ↓',sr:'Produkte und Aktionen direkt beim Händler prüfen.',sb:'Sirena öffnen ↗',jr:'Veröffentlichte Angebote und Verfügbarkeit prüfen.',jb:'Jumbo öffnen ↗',ur:'Prüfen, ob Restaurants oder Lieferungen an deiner Adresse verfügbar sind.',ub:'Uber Eats öffnen ↗',notice:'Externe Informationslinks · Keine bestätigte Partnerschaft · Preise und Bestellungen liegen bei den jeweiligen Anbietern.'},
 en:{nav:'🛒 Deals',hero:'🛒 Deals & ordering ↓',sr:'Browse store products and promotions.',sb:'Visit Sirena ↗',jr:'Explore published offers and check availability.',jb:'Visit Jumbo ↗',ur:'Check restaurant and delivery availability at your address.',ub:'Visit Uber Eats ↗',notice:'External information links · No confirmed affiliation · Prices, coverage and orders are handled by each platform.'},
 fr:{nav:'🛒 Promotions',hero:'🛒 Promotions et commandes ↓',sr:'Consultez les produits et promotions du magasin.',sb:'Voir Sirena ↗',jr:'Découvrez les offres et vérifiez la disponibilité.',jb:'Voir Jumbo ↗',ur:'Vérifiez les restaurants et livraisons disponibles à votre adresse.',ub:'Voir Uber Eats ↗',notice:'Liens externes informatifs · Aucun partenariat confirmé · Chaque plateforme gère les prix et les commandes.'},
 ht:{nav:'🛒 Pwomosyon',hero:'🛒 Pwomosyon ak kòmann ↓',sr:'Gade pwodwi ak pwomosyon magazen an.',sb:'Gade Sirena ↗',jr:'Gade pwomosyon yo epi verifye disponiblite.',jb:'Gade Jumbo ↗',ur:'Verifye si restoran ak livrezon disponib nan adrès ou.',ub:'Gade Uber Eats ↗',notice:'Lyen ekstèn pou enfòmasyon · Pa gen patenarya konfime · Chak platfòm jere pri ak kòmann.'}
};
const x=labels[lang]||labels.es;const brands=document.querySelectorAll('#compras .iv-brand');
if(brands.length===3){[x.sr,x.jr,x.ur].forEach((v,i)=>{const el=brands[i].querySelector('small');if(el)el.textContent=v});[x.sb,x.jb,x.ub].forEach((v,i)=>{const el=brands[i].querySelector('.iv-brand-action');if(el)el.textContent=v})}
const notice=document.querySelector('#compras .iv-brand-note');if(notice)notice.textContent=x.notice;
const heroLink=document.querySelector('#offers-hero-link');if(heroLink)heroLink.textContent=x.hero;
const navLink=document.querySelector('#offers-nav-link');if(navLink)navLink.textContent=x.nav;
document.getElementById('shopping-cards').innerHTML=''; // Single brand-card set above avoids duplicate store listings.
}


const tfTranslations={
 es:{trafficEyebrow:'🚗 TRÁFICO EN TU ZONA',trafficTitle:'Tráfico en vivo con Waze',trafficDesc:'Mapa oficial de Waze: tráfico, incidencias y rutas. No son datos propios de IslaViva RD.',privacy:'El mapa de terceros se carga solo al pulsar el botón. Waze podría recibir tu dirección IP y datos del navegador.',load:'Cargar mapa de tráfico',open:'Abrir Waze',credit:'Mapa y tráfico: Waze',fuelEyebrow:'⛽ COMBUSTIBLES',fuelTitle:'Precios de la gasolina',fuelDesc:'Tarifas nacionales de referencia; el precio no corresponde a una estación específica.',regular:'Gasolina Regular',premium:'Gasolina Premium',gallon:'por galón',valid:'Válidos hasta el',outdated:'No hay precios vigentes verificados en IslaViva RD. Consulta la lista actualizada.',all:'Todos los precios',source:'Fuente: combustibles.do (datos MICM)',loading:'Consultando precios publicados...'},
 de:{trafficEyebrow:'🚗 VERKEHR VOR ORT',trafficTitle:'Live-Verkehr mit Waze',trafficDesc:'Offizielle Waze-Karte mit Verkehr, Meldungen und Routen. Keine eigenen Live-Verkehrsdaten von IslaViva RD.',privacy:'Die externe Karte lädt erst nach einem Klick. Waze kann dabei deine IP-Adresse und Browserdaten erhalten.',load:'Live-Verkehrskarte laden',open:'Waze öffnen',credit:'Karte und Verkehrsdaten: Waze',fuelEyebrow:'⛽ KRAFTSTOFF',fuelTitle:'Aktuelle Benzinpreise',fuelDesc:'Landesweit veröffentlichte Richtpreise, keine individuell verglichenen Tankstellenpreise.',regular:'Normalbenzin',premium:'Premiumbenzin',gallon:'pro Gallone',valid:'Gültig bis',outdated:'Keine verifizierten gültigen Preise mehr auf IslaViva RD. Bitte die aktuelle Liste aufrufen.',all:'Alle Kraftstoffpreise',source:'Quelle: combustibles.do (MICM-Daten)',loading:'Datierte Preise werden geladen...'},
 en:{trafficEyebrow:'🚗 TRAFFIC NEAR YOU',trafficTitle:'Live traffic with Waze',trafficDesc:'Official Waze traffic map, alerts and routes. Traffic data is provided by Waze.',privacy:'The third-party map only loads after you click. Waze may receive your IP address and browser information.',load:'Load live traffic map',open:'Open Waze',credit:'Traffic map and data: Waze',fuelEyebrow:'⛽ FUEL',fuelTitle:'Gasoline prices',fuelDesc:'Published national reference prices, not a comparison of gas station prices.',regular:'Regular gasoline',premium:'Premium gasoline',gallon:'per gallon',valid:'Valid through',outdated:'No currently valid price figures verified here. Check the latest full list.',all:'All fuel prices',source:'Source: combustibles.do (MICM data)',loading:'Loading dated prices...'},
 fr:{trafficEyebrow:'🚗 CIRCULATION',trafficTitle:'Circulation en direct avec Waze',trafficDesc:'Carte officielle Waze avec trafic, alertes et itinéraires.',privacy:'La carte externe est chargée seulement après votre clic. Waze peut recevoir votre adresse IP et des données du navigateur.',load:'Charger la carte du trafic',open:'Ouvrir Waze',credit:'Carte et données : Waze',fuelEyebrow:'⛽ CARBURANT',fuelTitle:'Prix de l’essence',fuelDesc:'Prix nationaux publiés, et non prix de stations individuelles.',regular:'Essence ordinaire',premium:'Essence premium',gallon:'par gallon',valid:"Valable jusqu'au",outdated:'Aucun prix actuel vérifié ici. Consultez la liste complète à jour.',all:'Tous les prix',source:'Source : combustibles.do (données MICM)',loading:'Chargement des prix datés...'},
 ht:{trafficEyebrow:'🚗 TRAFIK NAN ZÒN OU',trafficTitle:'Trafik an dirèk ak Waze',trafficDesc:'Kat Waze ak trafik, avètisman ak wout yo. Se done Waze.',privacy:'Kat Waze ap chaje sèlman si ou klike. Waze ka resevwa adrès IP ak enfòmasyon navigatè w.',load:'Chaje kat trafik la',open:'Louvri Waze',credit:'Kat ak trafik: Waze',fuelEyebrow:'⛽ GAZOLIN',fuelTitle:'Pri gazolin',fuelDesc:'Pri referans nan peyi a, pa pri chak estasyon.',regular:'Gazolin regilye',premium:'Gazolin prim',gallon:'pa galon',valid:'Valab jiska',outdated:'Pa gen pri valab nou verifye isit la. Gade tout pri ki pi resan yo.',all:'Tout pri gaz',source:'Sous: combustibles.do (done MICM)',loading:'Ap chaje pri ki gen dat...'}
};
const wazeCities={
 'Higüey':[18.6150,-68.7080],
 'Punta Cana':[18.5601,-68.3725],
 'Santo Domingo':[18.4861,-69.9312],
 'Santiago':[19.4517,-70.6970],
 'La Romana':[18.4273,-68.9728],
 'Puerto Plata':[19.7934,-70.6884],
 'Samaná':[19.2056,-69.3369]
};
let wazeLoaded=false;
function wazeEmbedUrl(){
 const coords=wazeCities[city]||wazeCities['Higüey'];
 const code=({es:'es',de:'de',en:visitorCountry==='US'?'en':'en-GB',fr:'fr',ht:'en-GB'})[lang]||'es';
 return 'https://embed.waze.com/'+code+'/iframe?zoom=12&lat='+coords[0]+'&lon='+coords[1];
}
function renderWaze(){
 const t=tfTranslations[lang]||tfTranslations.es;
 document.getElementById('traffic-eyebrow').textContent=t.trafficEyebrow;
 document.getElementById('traffic-title').textContent=t.trafficTitle+' · '+city;
 document.getElementById('traffic-desc').textContent=t.trafficDesc;
 document.getElementById('waze-credit').textContent=t.credit;
 document.getElementById('waze-open').textContent=t.open+' ↗';
 const container=document.getElementById('waze-container');
 if(wazeLoaded){
  let frame=container.querySelector('iframe');
  if(!frame){
   frame=document.createElement('iframe');frame.title=t.trafficTitle+' · '+city;
   frame.referrerPolicy='strict-origin-when-cross-origin';
   frame.allowFullscreen=true;
   container.replaceChildren(frame);
  }
  frame.title=t.trafficTitle+' · '+city;
  const url=wazeEmbedUrl();
  if(frame.getAttribute('src')!==url)frame.setAttribute('src',url);
 }else{
  document.getElementById('waze-privacy').textContent=t.privacy;
  document.getElementById('waze-load').textContent=t.load;
 }
}
document.getElementById('waze-load').addEventListener('click',()=>{wazeLoaded=true;renderWaze()});
let fuelPricesData=null;
let fuelUsdDopRate=null;
let fuelUsdRateDate='';
const FUEL_FX_KEY='islaviva-usd-dop-fx-v1';
function fuelUsdLabel(){
 return ({es:'USD aprox.',de:'ca. USD',en:'approx. USD',fr:'env. USD',ht:'USD apeprè'})[lang]||'USD aprox.';
}
function fuelUsdRateCaption(){
 return ({es:'Cambio orientativo USD/RD$ · ',de:'Unverbindlicher Wechselkurs USD/RD$ · ',en:'Indicative USD/DOP rate · ',fr:'Taux indicatif USD/DOP · ',ht:'To chanj referans USD/RD$ · '})[lang]||'Cambio orientativo USD/RD$ · ';
}
async function loadFuelExchangeRate(){
 try{
  // The open-access API permits commercial currency conversion with attribution.
  // Cache one daily rate locally to avoid repeated third-party requests.
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(FUEL_FX_KEY)||'null')}catch(e){}
  const sameDay=new Date().toISOString().slice(0,10);
  if(cached&&cached.fetchedDay===sameDay&&Number.isFinite(cached.rate)&&cached.rate>30&&cached.rate<100){
   fuelUsdDopRate=cached.rate;
   fuelUsdRateDate=cached.date||sameDay;
   renderFuelPrices();
   return;
  }
  const response=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'default'});
  if(!response.ok)throw Error('USD/DOP FX unavailable');
  const data=await response.json();
  const rate=Number(data.rates?.DOP);
  const last=Number(data.time_last_update_unix);
  if(data.result!=='success'||!Number.isFinite(rate)||rate<=30||rate>=100||
      !Number.isFinite(last)||Math.abs(Date.now()-last*1000)>72*3600000)throw Error('USD/DOP rate stale or invalid');
  fuelUsdDopRate=rate;
  fuelUsdRateDate=new Date(last*1000).toISOString().slice(0,10);
  try{localStorage.setItem(FUEL_FX_KEY,JSON.stringify({fetchedDay:sameDay,rate,date:fuelUsdRateDate}))}catch(e){}
 }catch(e){
  // Do not invent a USD number if current conversion cannot be verified.
  fuelUsdDopRate=null;
  fuelUsdRateDate='';
 }
 renderFuelPrices();
}
function renderFuelPrices(){
 const t=tfTranslations[lang]||tfTranslations.es;
 document.getElementById('fuel-eyebrow').textContent=t.fuelEyebrow;
 document.getElementById('fuel-title').textContent=t.fuelTitle;
 document.getElementById('fuel-desc').textContent=t.fuelDesc;
 document.getElementById('fuel-source').textContent=t.source;
 document.getElementById('fuel-all').textContent=t.all+' ↗';
 const target=document.getElementById('fuel-prices');
 const d=fuelPricesData;
 // Check against Dominican local calendar, NOT the visitor's calendar.
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santo_Domingo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const today=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:new Date().toLocaleDateString('sv-SE',{timeZone:'America/Santo_Domingo'});
 const valid=d&&d.valid_from<=today&&d.valid_until>=today&&Number.isFinite(d.regular)&&Number.isFinite(d.premium);
 if(!valid){
  target.innerHTML='<p class="fuel-unavailable">'+esc(d?t.outdated:t.loading)+'</p>';
  return;
 }
 const price=n=>'RD$ '+n.toLocaleString(lang,{minimumFractionDigits:2,maximumFractionDigits:2});
 target.innerHTML=[
  ['regular',t.regular,d.regular],
  ['premium',t.premium,d.premium]
 ].map(([id,label,amount])=>'<div class="fuel-price"><span>'+esc(label)+'</span><strong>'+esc(price(amount))+'</strong><small>'+esc(t.gallon)+'</small>'+(Number.isFinite(fuelUsdDopRate)?'<span class="fuel-usd-price">'+esc(fuelUsdLabel())+' '+esc((amount/fuelUsdDopRate).toLocaleString(lang,{minimumFractionDigits:2,maximumFractionDigits:2}))+'</span>':'')+'</div>').join('')
 +'<p class="fuel-status">'+esc(t.valid)+' '+esc(new Date(d.valid_until+'T12:00:00Z').toLocaleDateString(lang,{timeZone:'America/Santo_Domingo',day:'2-digit',month:'long',year:'numeric'}))+'</p>'+(Number.isFinite(fuelUsdDopRate)?'<p class="fuel-fx-source">'+esc(fuelUsdRateCaption()+'1 USD ≈ RD$ '+fuelUsdDopRate.toLocaleString(lang,{maximumFractionDigits:2}))+' · '+esc(fuelUsdRateDate)+' · <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates By Exchange Rate API ↗</a></p>':'');
}
async function loadFuelPrices(){
 try{
  const response=await fetch('/data/fuel_prices.json',{cache:'no-store'});
  if(!response.ok)throw Error('fuel file unavailable');
  const d=await response.json();
  if(!Number.isFinite(d.regular)||!Number.isFinite(d.premium))throw Error('invalid fuel prices');
  fuelPricesData=d;
  if(d.source_url?.startsWith('https://combustibles.do/'))document.getElementById('fuel-all').href=d.all_url||'https://combustibles.do/';
 }catch(e){fuelPricesData=null}
 renderFuelPrices();
}

const careerLang={
 es:{kicker:'EMPLEOS Y CURSOS',title:'Encuentra trabajo y sigue aprendiendo',desc:'Portales oficiales de empleo y capacitación online, sin ofertas ficticias.',note:'Los empleos se publican en sitios externos. IslaViva RD no es una agencia de colocación ni está afiliada a AWS.',disclosure:'Enlaces gratuitos · No patrocinados',cards:[['RD Trabaja','Portal del Ministerio de Trabajo. Busca vacantes, recursos de orientación y formación.','Consultar empleos'],['ProDominicana','Oportunidades laborales y pasantías de la institución.','Buscar vacantes'],['AWS Skill Builder','Aprende computación en la nube e IA con cursos digitales gratuitos. También existen opciones de pago.','Explorar cursos gratuitos']]},
 de:{kicker:'JOBS & WEITERBILDUNG',title:'Jobs finden und Neues lernen',desc:'Offizielle Stellenportale und Online-Lernen – ohne erfundene Jobanzeigen.',note:'Stellenanzeigen liegen auf externen Portalen. IslaViva RD vermittelt keine Jobs und ist kein AWS-Partner.',disclosure:'Kostenlose Links · Nicht gesponsert',cards:[['RD Trabaja','Jobportal des dominikanischen Arbeitsministeriums mit Stellen und Berufsangeboten.','Jobs ansehen'],['ProDominicana','Jobs und Praktika bei der staatlichen Einrichtung.','Stellen ansehen'],['AWS Skill Builder','Cloud- und KI-Weiterbildungen mit vielen kostenlosen Onlinekursen; weitere Inhalte sind kostenpflichtig.','Kostenlose Kurse entdecken']]},
 en:{kicker:'JOBS & LEARNING',title:'Find work and build your skills',desc:'Official Dominican job sites and online training, with no fabricated listings.',note:'Jobs are hosted by external providers. IslaViva RD is not a recruiting agency or an AWS partner.',disclosure:'Free links · Not sponsored',cards:[['RD Trabaja','Dominican Ministry of Labor jobs and employability resources.','Explore jobs'],['ProDominicana','Jobs and internships at the government institution.','Browse opportunities'],['AWS Skill Builder','Learn cloud computing and AI with many free courses. Paid options also exist.','Explore free courses']]},
 fr:{kicker:'EMPLOIS & FORMATION',title:'Trouver un emploi et se former',desc:'Sites d’emploi officiels et formations en ligne, sans offres fictives.',note:'Les offres sont publiées par les sites tiers. IslaViva RD n’est pas une agence de recrutement ni partenaire AWS.',disclosure:'Liens gratuits · Non sponsorisés',cards:[['RD Trabaja','Portail du ministère dominicain du Travail.','Voir les emplois'],['ProDominicana','Emplois et stages au sein de cette institution.','Consulter les postes'],['AWS Skill Builder','Cours sur le cloud et l’IA, dont de nombreuses ressources gratuites.','Découvrir les cours']]},
 ht:{kicker:'TRAVAY AK FÒMASYON',title:'Jwenn travay epi aprann',desc:'Sit ofisyèl pou travay ak fòmasyon sou entènèt, san fo òf.',note:'Òf travay yo sou sit deyò. IslaViva RD pa yon ajans travay ni yon patnè AWS.',disclosure:'Lyen gratis · Pa patwone',cards:[['RD Trabaja','Sit Ministè Travay Repiblik Dominikèn.','Gade travay'],['ProDominicana','Travay ak estaj nan enstitisyon an.','Chèche travay'],['AWS Skill Builder','Kou sou cloud ak entèlijans atifisyèl, anpil ladan yo gratis.','Dekouvri kou yo']]}
};
function renderCareer(){
 const t=careerLang[lang]||careerLang.es;
 document.getElementById('career-kicker').textContent=t.kicker;
 document.getElementById('career-title').textContent=t.title;
 document.getElementById('career-desc').textContent=t.desc;
 document.getElementById('career-hint').textContent=t.note;
 document.getElementById('career-disclosure').textContent=t.disclosure;
 const places=[
  {icon:'💼',href:'https://rdtrabaja.do/'},
  {icon:'🧑‍💻',href:'https://empleos.prodominicana.gob.do/'},
  {icon:'☁️',href:'https://aws.amazon.com/training/digital/'}
 ];
 document.getElementById('career-grid').innerHTML=places.map((entry,i)=>
  '<article class="career-card"><span class="career-card-icon" aria-hidden="true">'+entry.icon+'</span><b>'+esc(t.cards[i][0])+'</b><p>'+esc(t.cards[i][1])+'</p><a href="'+esc(entry.href)+'" target="_blank" rel="noopener noreferrer">'+esc(t.cards[i][2])+' ↗</a></article>').join('');
}

const partnerUi={
 es:{kicker:'DESCUBRE TAMBIÉN',title:'Otros proyectos útiles',disclosure:'Proyectos relacionados · Promoción propia',items:[['Comparar internet','Planes de internet y telefonía'],['By María Beauty & Store','Maquillaje y belleza en Higüey'],['RecargaNet RD (prueba)','Demostración; aún sin recargas reales']]},
 de:{kicker:'AUCH INTERESSANT',title:'Weitere nützliche Angebote',disclosure:'Verwandte Projekte · Eigenwerbung',items:[['Internet vergleichen','Internet- und Mobilfunktarife'],['By María Beauty & Store','Kosmetik & Make-up in Higüey'],['RecargaNet RD (Testphase)','Demo; derzeit keine echten Aufladungen']]},
 en:{kicker:'ALSO EXPLORE',title:'More useful services',disclosure:'Related projects · Self-promotion',items:[['Compare internet','Internet and mobile plans'],['By María Beauty & Store','Makeup and beauty in Higüey'],['RecargaNet RD (demo)','Demo only; no real top-ups yet']]},
 fr:{kicker:'À DÉCOUVRIR',title:'D’autres services utiles',disclosure:'Projets liés · Autopromotion',items:[['Comparer Internet','Internet et téléphonie'],['By María Beauty & Store','Beauté et maquillage à Higüey'],['RecargaNet RD (démo)','Démo uniquement ; pas de recharge réelle']]},
 ht:{kicker:'DEKOUVRI TOU',title:'Lòt sèvis itil',disclosure:'Pwojè ki gen rapò · Piblisite pa nou',items:[['Konpare entènèt','Plan entènèt ak telefòn'],['By María Beauty & Store','Makiyaj ak bote nan Higüey'],['RecargaNet RD (tès)','Se yon demonstrasyon; pa gen rechaj reyèl']]}
};
function renderPartners(){
 const t=partnerUi[lang]||partnerUi.es;
 document.getElementById('partner-kicker').textContent=t.kicker;
 document.getElementById('partner-title').textContent=t.title;
 document.getElementById('partner-disclosure').textContent=t.disclosure;
 const sites=[
  {icon:'📶',href:'https://comparanetrd.pages.dev/'},
  {icon:'💄',href:'https://by-maria-beauty-store.pages.dev/'},
  // RecargaNet's public site URL has not been verified yet: link to the actual public project instead.
  {icon:'📱',href:'https://github.com/PuntaCanada/recarganet-rd'}
 ];
 document.getElementById('site-partners-grid').innerHTML=sites.map((p,i)=>
  '<a class="site-partner-card" href="'+esc(p.href)+'" target="_blank" rel="noopener noreferrer"><span class="site-partner-icon" aria-hidden="true">'+p.icon+'</span><span><b>'+esc(t.items[i][0])+'</b><small>'+esc(t.items[i][1])+'</small></span><span class="site-partner-arrow" aria-hidden="true">↗</span></a>').join('');
}

let propertyMode='rent';
function renderExtras(){let t=extraTranslations[lang]||extraTranslations.es;document.querySelectorAll('[data-x]').forEach(el=>el.textContent=t[el.dataset.x]);document.querySelector('#selectedregion').textContent='📍 '+city;document.querySelector('#rentMode').classList.toggle('active',propertyMode==='rent');document.querySelector('#buyMode').classList.toggle('active',propertyMode==='buy');let q=(propertyMode==='rent'?'alquiler apartamento casa ':'venta apartamento casa ')+city+' República Dominicana site:corotos.com.do OR site:supercasas.com';document.querySelector('#propertyGo').href='https://www.google.com/search?q='+encodeURIComponent(q);renderRoadNotices();}
document.querySelector('#rentMode').addEventListener('click',()=>{propertyMode='rent';renderExtras()});document.querySelector('#buyMode').addEventListener('click',()=>{propertyMode='buy';renderExtras()});

const texts={
es:{topbar:'Un lugar para descubrir, vivir y entender República Dominicana',navnews:'Actualidad',navcity:'Mi ciudad',navtravel:'Viajar',navlife:'Vivir en RD',herokicker:'Tu ventana al Caribe',heroheadline:'Tu isla.<br>Tu historia.<br><em>Tu mundo.</em>',herobody:'Las noticias que importan, los lugares que inspiran y todo lo que necesitas para vivir o viajar por República Dominicana. En tu idioma.',readnews:'Explorar noticias ↗',mycity:'Descubrir mi ciudad ↘',herofoot:'✦ Noticias · ✦ Viajes · ✦ Vida local · ✦ Comunidad',floata:'HECHO PARA TI',floatb:'Elige tu ciudad',floatc:'Un país, mil historias',locationlabel:'Tu zona:',weatherhint:'Pronóstico oficial y alertas en INDOMET ↗',weatherlink:'☁️ Ver el tiempo ↗',fuellink:'⛽ Precios combustibles ↗',reportlink:'📣 Reportar incidencia ↗',newskicker:'EN EL RADAR',newstitle:'Lo que mueve la isla.',newssub:'Fuentes confiables, contexto útil y una mirada a todo el país.',sources:'Nuestras fuentes ↗',newsdisclaimer:'Vista de demostración: los titulares son secciones editoriales de ejemplo, no noticias de última hora. Abre las fuentes originales para leer noticias actuales.',citykicker:'LA VIDA, MÁS FÁCIL',citytitle:'Todo sobre tu ciudad.',citysub:'Lo que necesitas saber, sin buscar en diez sitios diferentes.',localnote:'Los servicios están en fase piloto. No mostramos horarios, tarifas o valoraciones sin datos comprobados.',travelkicker:'VIVE LA EXPERIENCIA',traveltitle:'Más allá de la postal.',travelsub:'Ideas para tu próxima aventura, escapada o fin de semana.',travelcurated:'Inspiración para viajar ✦',affnote:'Las recomendaciones turísticas enlazan actualmente a información oficial; no hay reservas ni enlaces de afiliación activos. Los enlaces comerciales futuros se identificarán como publicidad.',missionkicker:'MÁS QUE NOTICIAS',missiontitle:'Información que realmente te sirve.',missionone:'A tu manera',missiononedesc:'Cinco idiomas, noticias relevantes y tu ciudad favorita guardada en tu navegador.',missiontwo:'Transparente por diseño',missiontwodesc:'Fuentes identificadas, datos verificados y publicidad siempre distinguible.',footerdesc:'Prototipo independiente. No afiliado al gobierno dominicano. Los servicios mostrados son una prueba de concepto.',demo:'Vista previa, aún sin datos en vivo',external:'Abrir fuente oficial ↗',serviceinfo:'Los datos locales se conectarán cuando la fuente y sus condiciones de uso estén verificadas.',search:'Buscar en el portal',searchplaceholder:'Noticias, playas, colegios, basura…',searchgo:'Buscar',noresult:'No se encontraron secciones. Prueba otra palabra.',section:'Sección temática',trips:'Ideas de viaje',pilot:'Servicio piloto'},
de:{topbar:'Entdecken, erleben und verstehen: Dominikanische Republik',navnews:'Nachrichten',navcity:'Meine Stadt',navtravel:'Reisen',navlife:'Leben in der DomRep',herokicker:'Dein Fenster zur Karibik',heroheadline:'Deine Insel.<br>Deine Geschichten.<br><em>Deine Welt.</em>',herobody:'Nachrichten, die zählen. Orte, die begeistern. Und alles, was du für das Leben und Reisen in der Dominikanischen Republik brauchst. In deiner Sprache.',readnews:'Nachrichten entdecken ↗',mycity:'Meine Stadt entdecken ↘',herofoot:'✦ Nachrichten · ✦ Reisen · ✦ Lokales · ✦ Community',floata:'FÜR DICH GEMACHT',floatb:'Wähle deine Stadt',floatc:'Ein Land, tausend Geschichten',locationlabel:'Deine Region:',weatherhint:'Offizielle Vorhersage und Warnungen bei INDOMET ↗',weatherlink:'☁️ Wetter ansehen ↗',fuellink:'⛽ Kraftstoffpreise ↗',reportlink:'📣 Problem melden ↗',newskicker:'IM BLICK',newstitle:'Was die Insel bewegt.',newssub:'Verlässliche Quellen, wichtige Hintergründe und Blick aufs ganze Land.',sources:'Unsere Quellen ↗',newsdisclaimer:'Demoversion: Die Überschriften bezeichnen Beispiel-Rubriken, keine aktuellen Meldungen. Für aktuelle Nachrichten bitte die Originalquellen öffnen.',citykicker:'ALLTAG, GANZ EINFACH',citytitle:'Alles über deine Stadt.',citysub:'Was du wissen musst – ohne zehn verschiedene Seiten abzusuchen.',localnote:'Lokale Dienste sind noch in der Pilotphase. Ohne geprüfte Daten zeigen wir keine Abholzeiten, Preise oder Bewertungen.',travelkicker:'ERLEBE DIE INSEL',traveltitle:'Mehr als Postkarten.',travelsub:'Ideen für dein nächstes Abenteuer, deinen Ausflug oder Kurzurlaub.',travelcurated:'Reiseinspiration ✦',affnote:'Die Reiseempfehlungen verlinken derzeit nur zu offiziellen Informationen. Noch keine Buchungen oder Affiliate-Links; künftige Werbelinks werden gekennzeichnet.',missionkicker:'MEHR ALS NACHRICHTEN',missiontitle:'Information, die dir wirklich hilft.',missionone:'Auf deine Art',missiononedesc:'Fünf Sprachen, relevante Rubriken und deine Lieblingsstadt im Browser gespeichert.',missiontwo:'Transparent von Anfang an',missiontwodesc:'Klare Quellen, geprüfte Daten und deutlich erkennbare Werbung.',footerdesc:'Unabhängiger Prototyp. Keine Verbindung zur dominikanischen Regierung. Die Dienste sind eine Konzeptdemonstration.',demo:'Vorschau, noch keine Live-Daten',external:'Offizielle Quelle öffnen ↗',serviceinfo:'Lokale Daten folgen, sobald die Quellen und Nutzungsrechte geprüft sind.',search:'Portal durchsuchen',searchplaceholder:'Nachrichten, Strände, Schulen, Müll…',searchgo:'Suchen',noresult:'Keine passende Rubrik gefunden. Versuche einen anderen Begriff.',section:'Themenbereich',trips:'Reiseideen',pilot:'Pilotangebot'},
en:{topbar:'Discover, experience and understand the Dominican Republic',navnews:'News',navcity:'My city',navtravel:'Travel',navlife:'Living in DR',herokicker:'Your window to the Caribbean',heroheadline:'Your island.<br>Your stories.<br><em>Your world.</em>',herobody:'News that matters, places that inspire, and everything you need to live in or explore the Dominican Republic. In your language.',readnews:'Explore the news ↗',mycity:'Discover my city ↘',herofoot:'✦ News · ✦ Travel · ✦ Local life · ✦ Community',floata:'MADE FOR YOU',floatb:'Choose your city',floatc:'One country, a thousand stories',locationlabel:'Your area:',weatherhint:'Official forecast and alerts at INDOMET ↗',weatherlink:'☁️ Check weather ↗',fuellink:'⛽ Fuel prices ↗',reportlink:'📣 Report an issue ↗',newskicker:'ON THE RADAR',newstitle:'What moves the island.',newssub:'Trusted sources, useful context, and a view across the country.',sources:'Our sources ↗',newsdisclaimer:'Demo preview: these headlines describe editorial sections, not breaking news. Open original sources to read current reports.',citykicker:'LIFE MADE EASIER',citytitle:'Everything about your city.',citysub:'What you need to know without searching ten different websites.',localnote:'Local services are in pilot phase. We do not display unverified pickup times, prices or ratings.',travelkicker:'EXPERIENCE MORE',traveltitle:'Beyond the postcard.',travelsub:'Ideas for your next adventure, day trip or weekend away.',travelcurated:'Travel inspiration ✦',affnote:'Travel recommendations currently link to official information only. No bookings or affiliate links are active; future commercial links will be disclosed.',missionkicker:'MORE THAN NEWS',missiontitle:'Information that truly helps.',missionone:'Your way',missiononedesc:'Five languages, relevant topics, and your favorite city saved in your browser.',missiontwo:'Transparent by design',missiontwodesc:'Clear sources, verified data and distinguishable advertising.',footerdesc:'Independent prototype. Not affiliated with the Dominican government. Services shown are proof of concept.',demo:'Preview: no live data yet',external:'Open official source ↗',serviceinfo:'Local data will be connected once sources and usage terms are verified.',search:'Search the portal',searchplaceholder:'News, beaches, schools, garbage…',searchgo:'Search',noresult:'No matching sections. Try another word.',section:'Topic',trips:'Travel ideas',pilot:'Pilot service'},
fr:{topbar:'Découvrir, vivre et comprendre la République dominicaine',navnews:'Actualités',navcity:'Ma ville',navtravel:'Voyages',navlife:'Vivre en RD',herokicker:'Votre fenêtre sur les Caraïbes',heroheadline:'Votre île.<br>Vos histoires.<br><em>Votre monde.</em>',herobody:'Les actualités importantes, les lieux qui inspirent et tout ce qu’il faut pour vivre ou voyager en République dominicaine. Dans votre langue.',readnews:'Explorer les actualités ↗',mycity:'Découvrir ma ville ↘',herofoot:'✦ Actualités · ✦ Voyages · ✦ Vie locale · ✦ Communauté',floata:'FAIT POUR VOUS',floatb:'Choisissez votre ville',floatc:'Un pays, mille histoires',locationlabel:'Votre région :',weatherhint:'Prévisions et alertes officielles sur INDOMET ↗',weatherlink:'☁️ Voir la météo ↗',fuellink:'⛽ Prix du carburant ↗',reportlink:'📣 Signaler un problème ↗',newskicker:'À LA UNE',newstitle:'Ce qui fait bouger l’île.',newssub:'Des sources fiables, du contexte utile et un regard sur tout le pays.',sources:'Nos sources ↗',newsdisclaimer:'Aperçu de démonstration : les titres présentent des rubriques, pas les dernières nouvelles. Consultez les sources originales pour l’actualité.',citykicker:'LA VIE SIMPLIFIÉE',citytitle:'Tout sur votre ville.',citysub:'Les informations essentielles sans consulter dix sites différents.',localnote:'Les services locaux sont en phase pilote. Aucun horaire, tarif ou avis non vérifié n’est affiché.',travelkicker:'VIVEZ L’EXPÉRIENCE',traveltitle:'Au-delà de la carte postale.',travelsub:'Des idées pour vos prochaines aventures et escapades.',travelcurated:'Inspirations de voyage ✦',affnote:'Les recommandations renvoient actuellement aux informations touristiques officielles. Aucun lien affilié ou réservation active ; les futurs liens commerciaux seront signalés.',missionkicker:'PLUS QUE DES INFOS',missiontitle:'Des informations vraiment utiles.',missionone:'À votre façon',missiononedesc:'Cinq langues, des sujets pertinents et votre ville préférée mémorisée.',missiontwo:'Transparent par nature',missiontwodesc:'Sources identifiées, données vérifiées et publicités clairement indiquées.',footerdesc:'Prototype indépendant. Non affilié au gouvernement dominicain. Services présentés à titre conceptuel.',demo:'Aperçu sans données en direct',external:'Consulter la source officielle ↗',serviceinfo:'Les données locales seront ajoutées après vérification des sources et des droits.',search:'Rechercher sur le portail',searchplaceholder:'Actualités, plages, écoles, déchets…',searchgo:'Rechercher',noresult:'Aucun résultat. Essayez un autre mot.',section:'Rubrique',trips:'Idées de voyage',pilot:'Service pilote'}};
Object.assign(texts,{ht:{...texts.es,...{"topbar": "Nouvèl, vwayaj ak sèvis lokal nan Repiblik Dominikèn", "navnews": "Nouvèl", "navcity": "Vil mwen", "navtravel": "Vwayaj", "navlife": "Viv nan RD", "herokicker": "Dekouvri Karayib la", "heroheadline": "Zile pa w.<br>Istwa pa w.<br><em>Mond pa w.</em>", "herobody": "Nouvèl, kote pou vizite ak enfòmasyon itil pou moun k ap viv oswa vwayaje nan Repiblik Dominikèn. Nan lang ou.", "readnews": "Gade nouvèl yo ↗", "mycity": "Dekouvri vil mwen ↘", "herofoot": "✦ Nouvèl · ✦ Vwayaj · ✦ Lavi lokal · ✦ Kominote", "floata": "POU OU", "floatb": "Chwazi vil ou", "floatc": "Yon peyi, anpil istwa", "locationlabel": "Zòn ou:", "weatherhint": "Tan an ak avètisman ofisyèl", "weatherlink": "Tan an ↗", "fuellink": "Pri gaz ↗", "reportlink": "Fè yon rapò ↗", "newskicker": "SA K AP PASE", "newstitle": "Nouvèl ak enfòmasyon", "newssub": "Sous dominikèn, ak lyen pou atik orijinal yo.", "sources": "Gade sous yo ↗", "newsdisclaimer": "Tès sit la: nouvèl an dirèk disponib sèlman lè done otomatik yo chaje.", "citykicker": "NAN ZÒN OU", "citytitle": "Vil ou, lavi ou", "citysub": "Enfòmasyon ki itil kote ou ye a.", "localnote": "Enfòmasyon lokal yo dwe verifye avèk sous ofisyèl yo.", "travelkicker": "DEKOUVRI PEYI A", "traveltitle": "Kote pou vizite", "travelsub": "Plaj, kilti ak eksperyans nan Repiblik Dominikèn.", "travelcurated": "Eksplore vwayaj ↗", "affnote": "Lyen patnè yo ap make kòm piblisite lè yo aktive.", "missionkicker": "PLIS PASE NOUVÈL", "missiontitle": "Enfòmasyon ki itil toutbon.", "missionone": "Pou ou menm", "missiononedesc": "Senk lang, sijè ki enterese ou ak vil ou sonje.", "missiontwo": "Transparans", "missiontwodesc": "Sous klè, done verifye, piblisite ki byen idantifye.", "footerdesc": "Yon pwototip endepandan. Li pa afilye ak gouvènman dominiken an.", "demo": "Demonstrasyon; pa gen done an dirèk", "external": "Gade sous ofisyèl la ↗", "serviceinfo": "N ap ajoute enfòmasyon lokal apre nou verifye sous yo.", "search": "Chèche sou sit la", "searchplaceholder": "Nouvèl, plaj, lekòl, fatra…", "searchgo": "Chèche", "noresult": "Pa gen rezilta. Eseye yon lòt mo.", "section": "Seksyon", "trips": "Lide vwayaj", "pilot": "Sèvis an tès"}}});
const news=[{emoji:'📰',tag:['ACTUALIDAD','NACHRICHTEN','NEWS','ACTUALITÉS'],title:['Noticias de República Dominicana, con contexto','Nachrichten aus der Dominikanischen Republik – mit Hintergrund','Dominican Republic news, with context','Actualités de République dominicaine avec contexte'],desc:['Sigue los titulares del día en medios dominicanos reconocidos.','Entdecke aktuelle Berichte etablierter dominikanischer Medien.','Discover current reporting from established Dominican news outlets.','Retrouvez les informations des médias dominicains reconnus.'],source:'Diario Libre · RSS',url:'https://www.diariolibre.com/servicios/rss',image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=850&q=85'}, {emoji:'☀️',tag:['CLIMA Y SEGURIDAD','WETTER & SICHERHEIT','WEATHER & SAFETY','MÉTÉO & SÉCURITÉ'],title:['Alertas y pronósticos para viajar con tranquilidad','Wetterwarnungen und Vorhersagen für deine Reise','Forecasts and alerts for a safer trip','Prévisions et alertes pour voyager sereinement'],desc:['Consulta los reportes del organismo meteorológico oficial.','Offizielle Vorhersagen und Warnungen direkt von INDOMET.','Official reports and advisories by INDOMET.','Informations officielles fournies par INDOMET.'],source:'INDOMET · Fuente oficial',url:'https://indomet.gov.do/tiempo/',image:'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=85'}, {emoji:'🌴',tag:['TURISMO','REISEN','TRAVEL','TOURISME'],title:['Guías para descubrir el país más allá del resort','Die DomRep entdecken – weit über das Resort hinaus','See the country beyond the resort','Explorer le pays au-delà des resorts'],desc:['Destinos, cultura y lugares que merecen una visita.','Orte, Kultur und Ausflüge abseits des Hotelalltags.','Places, culture and experiences worth exploring.','Des lieux, une culture et des expériences à découvrir.'],source:'Turismo RD · Fuente oficial',url:'https://www.godominicanrepublic.com/destinations',image:'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&q=85'}];
const services=[{icon:'🏠',title:['Viviendas e inmuebles','Immobilien & Wohnen','Homes & property','Logement & immobilier'],desc:['Alquiler, compra y búsqueda local','Mieten, kaufen & regional suchen','Rent, buy & browse locally','Louer, acheter & chercher près de vous'],id:'property',url:'https://www.corotos.com.do/inmuebles'},{icon:'🚧',title:['Obras y cierres viales','Baustellen & Sperrungen','Roadworks & closures','Travaux & fermetures'],desc:['Obras públicas y avisos oficiales','Bauprojekte & offizielle Hinweise','Public works & official alerts','Chantiers & avis officiels'],id:'roadworks',url:'https://mopc.gob.do/'},{icon:'🗑️',title:['Basura y reciclaje','Müll & Recycling','Waste & recycling','Déchets & recyclage'],desc:['Rutas, horarios y reportes','Abholpläne & Meldungen','Pickup schedules & reports','Collectes et signalements'],id:'trash',url:'https://ayuntamientohiguey.gob.do/rutas-y-frecuencias/'},{icon:'🏫',title:['Colegios y educación','Schulen & Bildung','Schools & education','Écoles & éducation'],desc:['Directorios, cuotas y horarios','Verzeichnisse & Gebühren','Directories, fees & hours','Annuaires, frais et horaires'],id:'schools',url:'https://www.minerd.gob.do/'},{icon:'⚡',title:['Luz y energía','Strom & Energie','Power & energy','Électricité & énergie'],desc:['Avisos, tarifas y alternativas','Hinweise, Tarife & Alternativen','Alerts, tariffs & alternatives','Alertes, tarifs et solutions'],id:'power',url:'https://www.sie.gob.do/'},{icon:'🔧',title:['Técnicos y reparaciones','Techniker & Reparaturen','Technicians & repairs','Dépannage & réparations'],desc:['Servicios y reseñas verificadas','Dienste & geprüfte Bewertungen','Services & verified ratings','Services et avis vérifiés'],id:'repair',url:null},{icon:'💧',title:['Agua y entregas','Wasser & Lieferdienste','Water & delivery','Eau & livraison'],desc:['Proveedores cerca de ti','Anbieter in deiner Nähe','Providers near you','Fournisseurs à proximité'],id:'water',url:null},{icon:'⛽',title:['Gas y combustibles','Gas & Kraftstoff','Gas & fuel','Gaz & carburants'],desc:['Precios oficiales y servicios','Amtliche Preise & Dienste','Official prices & services','Prix officiels et services'],id:'fuel',url:'https://combustibles.do/'},{icon:'🏛️',title:['Trámites y ayuda','Behörden & Hilfe','Government & help','Administration & aide'],desc:['Contactos y canales oficiales','Kontakte & offizielle Stellen','Contacts & official channels','Contacts & services officiels'],id:'public',url:'https://311.gob.do/'},{icon:'🎉',title:['Eventos locales','Lokale Veranstaltungen','Local events','Événements locaux'],desc:['Qué hacer este fin de semana','Tipps fürs Wochenende','What to do this weekend','Idées pour ce week-end'],id:'events',url:null}];
const destinations=[{name:'Isla Saona',category:['PLAYAS & NATURALEZA','STRÄNDE & NATUR','BEACHES & NATURE','PLAGES & NATURE'],desc:['Una escapada inolvidable desde Bayahíbe','Ein Inseltraum ab Bayahíbe','An island escape from Bayahíbe','Une escapade depuis Bayahíbe'],url:'https://www.godominicanrepublic.com/things-to-do/isla-saona',image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=950&q=85'},{name:'Santo Domingo',category:['CULTURA & HISTORIA','KULTUR & GESCHICHTE','CULTURE & HISTORY','CULTURE & HISTOIRE'],desc:['Calles coloniales, gastronomía y vida urbana','Altstadt, Kulinarik und urbanes Leben','Colonial streets and vibrant city life','Vie urbaine et rues coloniales'],url:'https://www.godominicanrepublic.com/destinations/santo-domingo',image:'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=950&q=85'},{name:'Los Haitises',category:['AVENTURA & NATURALEZA','ABENTEUER & NATUR','ADVENTURE & NATURE','AVENTURE & NATURE'],desc:['Manglares, cuevas y paisajes únicos','Mangroven, Höhlen und Natur','Mangroves, caves and amazing scenery','Mangroves, grottes et paysages'],url:'https://www.godominicanrepublic.com/things-to-do/national-park-los-haitises',image:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=950&q=85'}];
let lang=document.documentElement.lang||'es';if(!texts[lang])lang='es';
const validCities=['Higüey','Punta Cana','Santo Domingo','Santiago','La Romana','Puerto Plata','Samaná'];let city=localStorage.getItem('islaviva-city')||'Higüey';if(!validCities.includes(city)){city='Higüey';try{localStorage.setItem('islaviva-city',city)}catch(e){}};const order={es:0,de:1,en:2,fr:3,ht:0};let idx=()=>order[lang];const tr=k=>texts[lang]?.[k]||texts.es[k];const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newsletterLanguages={es:['Tu resumen de República Dominicana','Próximamente: novedades por email. Las inscripciones todavía no están activadas y no se recopilan direcciones.','Previsto: resumen semanal según idioma y ciudad, con confirmación por correo.'],de:['Dein Dominikanische-Republik-Newsletter','In Vorbereitung: Der Versand ist noch nicht aktiviert. Es werden derzeit keine E-Mail-Adressen gesammelt.','Geplant: wöchentliche Ausgabe nach Sprache und Region, mit Double-Opt-in.'],en:['Your Dominican Republic newsletter','Coming soon: sign-up is not enabled and no email addresses are collected yet.','Planned: weekly updates by language and city, with confirmed opt-in.'],fr:['Votre lettre d’information dominicaine','Bientôt disponible : les inscriptions ne sont pas ouvertes et aucune adresse email n’est collectée.','Prévu : résumé hebdomadaire par langue et ville avec confirmation.'],ht:['Nouvèl ak enfòmasyon nan lang ou','Newsletter la ap vini. Enskripsyon an poko aktive; nou pap kolekte adrès imel pou kounye a.','Chak semèn, selon lang ou ak vil ou, avèk konfimasyon pa imel.']};
function renderNewsletter(){let a=newsletterLanguages[lang]||newsletterLanguages.es;['newsletterTitle','newsletterText','newsletterSub'].forEach((id,i)=>document.getElementById(id).textContent=a[i]);}

const regionalSourceUi={
 es:{kicker:'FUENTES OFICIALES',title:'Información local de fuentes verificables',desc:'Accesos directos a instituciones. Selecciona tu ciudad arriba para ver los enlaces relevantes.',note:'Los enlaces llevan a sitios de terceros. No son alertas en vivo ni confirman la disponibilidad de servicios en tu dirección.',municipalNews:'Noticias municipales',municipalNewsDesc:'Consulta las publicaciones de la administración local y comprueba su fecha.',municipalServices:'Servicios municipales',municipalServicesDesc:'Información y trámites de la administración de la zona.',electricity:'Estado del circuito eléctrico',electricityDesc:'Consulta con EDEEste el estado de tu circuito; la cobertura depende del suministrador.',water:'Agua y saneamiento',waterDesc:'Consulta los servicios y el sistema de información de INAPA; verifica qué institución atiende tu dirección.',roads:'Tránsito y avisos viales',roadsDesc:'Información institucional de tránsito y canales para comunicar incidencias.',go:'Abrir fuente oficial ↗',national:'Servicios nacionales',local:'Administración local'},
 de:{kicker:'AMTLICHE QUELLEN',title:'Lokale Informationen aus überprüfbaren Quellen',desc:'Direkt zu Behörden und Einrichtungen. Wähle oben deine Stadt, um passende Links zu sehen.',note:'Diese Links führen zu externen Seiten. Sie sind keine Live-Warnungen und bestätigen keine Versorgung an deiner Adresse.',municipalNews:'Kommunale Nachrichten',municipalNewsDesc:'Meldungen der zuständigen Verwaltung mit Datum prüfen.',municipalServices:'Kommunale Dienstleistungen',municipalServicesDesc:'Informationen und Verwaltungsdienste vor Ort.',electricity:'Stromkreisstatus',electricityDesc:'Bei EDEEste den Stromkreis prüfen; die Zuständigkeit hängt vom Versorger ab.',water:'Wasser und Abwasser',waterDesc:'Dienste und Informationen von INAPA; die örtliche Zuständigkeit vorher prüfen.',roads:'Straßenverkehr und Meldungen',roadsDesc:'Amtliche Verkehrsinformationen und Möglichkeiten zur Meldung von Problemen.',go:'Amtliche Quelle öffnen ↗',national:'Landesweite Dienste',local:'Kommunalverwaltung'},
 en:{kicker:'OFFICIAL SOURCES',title:'Local information from verifiable sources',desc:'Direct links to public agencies. Select your city above for relevant contacts.',note:'Links lead to external websites. They are not live alerts and do not confirm service availability at your address.',municipalNews:'Municipal news',municipalNewsDesc:'Read dated updates from the responsible local authority.',municipalServices:'Municipal services',municipalServicesDesc:'Local government information and services.',electricity:'Electricity circuit status',electricityDesc:'Check your circuit with EDEEste; coverage depends on your utility.',water:'Water and sanitation',waterDesc:'Consult INAPA services and information; check who serves your address.',roads:'Traffic and road reports',roadsDesc:'Official transport information and incident reporting options.',go:'Visit official source ↗',national:'National services',local:'Local government'},
 fr:{kicker:'SOURCES OFFICIELLES',title:'Informations locales provenant de sources vérifiables',desc:'Accédez directement aux organismes publics. Choisissez votre ville pour voir les liens pertinents.',note:'Ces liens mènent à des sites externes. Ils ne constituent ni des alertes en direct ni une confirmation de service à votre adresse.',municipalNews:'Actualités municipales',municipalNewsDesc:'Consultez les communiqués datés de la collectivité.',municipalServices:'Services municipaux',municipalServicesDesc:'Informations et démarches auprès de la collectivité.',electricity:'État du circuit électrique',electricityDesc:'Vérifiez votre circuit auprès d’EDEEste, selon votre fournisseur.',water:'Eau et assainissement',waterDesc:'Consultez INAPA et vérifiez le service compétent pour votre adresse.',roads:'Circulation et signalements',roadsDesc:'Informations officielles sur les transports et signalements.',go:'Voir la source officielle ↗',national:'Services nationaux',local:'Collectivité locale'},
 ht:{kicker:'SOUS OFISYÈL',title:'Enfòmasyon lokal nan sous ou ka verifye',desc:'Lyen dirèk pou sèvis piblik yo. Chwazi vil ou anlè a pou jwenn lyen ki itil.',note:'Lyen yo mennen sou lòt sit. Yo pa alèt an dirèk epi yo pa konfime sèvis disponib nan adrès ou.',municipalNews:'Nouvèl meri a',municipalNewsDesc:'Gade enfòmasyon ki gen dat nan administrasyon lokal la.',municipalServices:'Sèvis minisipal',municipalServicesDesc:'Enfòmasyon ak sèvis administrasyon lokal la.',electricity:'Eta sikwi kouran',electricityDesc:'Verifye sikwi ou nan EDEEste, selon konpayi ki sèvi zòn ou.',water:'Dlo ak asenisman',waterDesc:'Gade sèvis INAPA epi verifye ki enstitisyon ki sèvi adrès ou.',roads:'Trafik ak rapò sou wout',roadsDesc:'Enfòmasyon ofisyèl sou transpò ak fason pou rapòte pwoblèm.',go:'Louvri sous ofisyèl ↗',national:'Sèvis nasyonal',local:'Administrasyon lokal'}
};
// The base render() pass also resolves [data-t] elements; keep these keys in texts.
for(const locale of ['es','de','en','fr','ht']){
 const ui=regionalSourceUi[locale];
 Object.assign(texts[locale],{
  regionSourcesKicker:ui.kicker,
  regionSourcesTitle:ui.title,
  regionSourcesDesc:ui.desc,
  regionSourcesNote:ui.note
 });
}
function renderRegionalSources(){
 const container=document.getElementById('regional-sources-grid');if(!container)return;
 const t=regionalSourceUi[lang]||regionalSourceUi.es;
 document.getElementById('regional-sources-city').textContent='📍 '+city;
 document.querySelector('[data-t="regionSourcesKicker"]').textContent=t.kicker;
 document.getElementById('regional-sources-title').textContent=t.title;
 document.getElementById('regional-sources-desc').textContent=t.desc;
 document.querySelector('[data-t="regionSourcesNote"]').textContent=t.note;
 const local=city==='Higüey'?[
   ['🏛️',t.municipalNews,t.municipalNewsDesc,'https://ayuntamientohiguey.gob.do/category/noticias/',t.local],
   ['📋',t.municipalServices,t.municipalServicesDesc,'https://ayuntamientohiguey.gob.do/servicios/',t.local]
  ]:city==='Punta Cana'?[
   ['🏛️',t.municipalNews,t.municipalNewsDesc,'https://avpc.gob.do/',t.local],
   ['📋',t.municipalServices,t.municipalServicesDesc,'https://avpc.gob.do/mapa-de-sitio/',t.local]
  ]:[];
 const services=[
   ['⚡',t.electricity,t.electricityDesc,'https://edeeste.com.do/inicio/servicios/estado-de-circuito-y-suministro/',t.national],
   ['💧',t.water,t.waterDesc,'https://inapa.gob.do/servicios/sistema-de-monitoreo-del-inapa/',t.national],
   ['🚦',t.roads,t.roadsDesc,'https://intrant.gob.do/',t.national]
 ];
 container.innerHTML=[...local,...services].map(([emoji,title,desc,url,type])=>'<a class="regional-source-card" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><span class="regional-source-emoji" aria-hidden="true">'+emoji+'</span><span class="regional-source-type">'+esc(type)+'</span><strong>'+esc(title)+'</strong><span class="regional-source-desc">'+esc(desc)+'</span><span class="regional-source-action">'+esc(t.go)+'</span></a>').join('');
}


const cityQuickLabels={
 es:'Elegir ciudad',de:'Stadt wählen',en:'Choose city',fr:'Choisir la ville',ht:'Chwazi vil'
};
function updateCityQuickSelect(){
 const button=document.getElementById('city-quick-select');if(!button)return;
 let saved='';try{saved=localStorage.getItem('islaviva-city')||''}catch(e){}
 const hasChoice=validCities.includes(saved);
 const label=hasChoice?(city==='Punta Cana'?'Punta Cana / Bávaro':city):(cityQuickLabels[lang]||cityQuickLabels.es);
 button.textContent='📍 '+label;
 button.setAttribute('aria-label',(cityQuickLabels[lang]||cityQuickLabels.es)+': '+(hasChoice?city:''));
}
const cityChooserUi={
 es:{title:'Elige tu ciudad',desc:'Noticias, clima y servicios para tu zona.',hint:'Se guarda solo en tu navegador. Puedes cambiarla cuando quieras.',change:'✎ Cambiar',close:'Cerrar'},
 de:{title:'Wähle deinen Ort',desc:'Nachrichten, Wetter und Dienste für deine Region.',hint:'Wird nur in diesem Browser gespeichert. Du kannst den Ort jederzeit ändern.',change:'✎ Ändern',close:'Schließen'},
 en:{title:'Choose your city',desc:'News, weather and services for your area.',hint:'Saved in this browser only. Change your city whenever you like.',change:'✎ Change',close:'Close'},
 fr:{title:'Choisissez votre ville',desc:'Actualités, météo et services pour votre région.',hint:'Enregistré dans ce navigateur uniquement. Modifiable à tout moment.',change:'✎ Modifier',close:'Fermer'},
 ht:{title:'Chwazi vil ou',desc:'Nouvèl, meteyo ak sèvis pou zòn ou.',hint:'Nou sere chwa ou nan navigatè sa a sèlman. Ou ka chanje vil la nenpòt lè.',change:'✎ Chanje',close:'Fèmen'}
};
function updateCityAccess(){
 const t=cityChooserUi[lang]||cityChooserUi.es;
 const weather=document.getElementById('weather-city-change');
 if(weather){weather.textContent=t.change;weather.setAttribute('aria-label',t.change+' '+city)}
 document.querySelectorAll('.location-change-button').forEach(button=>{
  button.textContent='📍 '+(city==='Punta Cana'?'Punta Cana / Bávaro':city)+' '+t.change;
  button.setAttribute('aria-label',t.change+' '+city);
 });
 document.querySelectorAll('[data-set-language]').forEach(button=>{
  const selected=button.dataset.setLanguage===lang;
  button.classList.toggle('active',selected);
  button.setAttribute('aria-pressed',String(selected));
 });
 const more=document.getElementById('language');
 if(more){
  const active={de:['de','Deutsch'],fr:['fr','Français'],ht:['ht','Kreyòl']}[lang];
  const titles={es:'Más',de:'Weitere',en:'More',fr:'Autres',ht:'Lòt'};
  const label=document.getElementById('language-more-label');
  if(label)label.innerHTML=active?'<img class="language-flag" src="/assets/flags/'+active[0]+'.svg" alt=""> '+active[1]:'🌐 '+titles[lang];
  more.setAttribute('aria-label',lang==='de'?'Weitere Sprachen':lang==='en'?'More languages':lang==='fr'?'Autres langues':lang==='ht'?'Lòt lang':'Más idiomas');
  more.querySelectorAll('[data-set-language]').forEach(button=>button.setAttribute('aria-current',button.dataset.setLanguage===lang?'true':'false'));
 }
}
const cityChooser=document.getElementById('city-chooser');
function closeCityChooser(){
 if(!cityChooser)return;
 cityChooser.hidden=true;
 document.body.classList.remove('city-chooser-open');
}
function openCityChooser(){
 if(!cityChooser)return;
 const t=cityChooserUi[lang]||cityChooserUi.es;
 document.getElementById('city-chooser-title').textContent=t.title;
 document.getElementById('city-chooser-description').textContent=t.desc;
 document.getElementById('city-chooser-hint').textContent=t.hint;
 document.getElementById('city-chooser-close').setAttribute('aria-label',t.close);
 document.getElementById('city-chooser-grid').innerHTML=validCities.map(value=>
  '<button type="button" class="city-chooser-option'+(value===city?' selected':'')+'" data-choose-city="'+esc(value)+'" aria-pressed="'+(value===city)+'">'+(value===city?'✓ ':'')+(value==='Punta Cana'?'Punta Cana / Bávaro':esc(value))+'</button>'
 ).join('');
 cityChooser.hidden=false;
 document.body.classList.add('city-chooser-open');
 document.querySelector('#city-chooser-grid .selected')?.focus();
}
document.querySelectorAll('[data-city-open]').forEach(button=>button.addEventListener('click',openCityChooser));
document.getElementById('city-chooser-close')?.addEventListener('click',closeCityChooser);
cityChooser?.querySelector('[data-city-close]')?.addEventListener('click',closeCityChooser);
document.getElementById('city-chooser-grid')?.addEventListener('click',e=>{
 const button=e.target.closest('[data-choose-city]');if(!button||!validCities.includes(button.dataset.chooseCity))return;
 city=button.dataset.chooseCity;
 try{localStorage.setItem('islaviva-city',city)}catch(e){}
 closeCityChooser();
 render();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!cityChooser?.hidden)closeCityChooser()});
function render(){updateCityQuickSelect();renderCareer();renderWaze();renderFuelPrices();renderShopping();renderPartners();renderExtras();renderLocalPulse();renderRegionalSources();updateCityAccess();renderNewsletter();renderIslandWeather();document.documentElement.lang=lang;/* Keep localized <title> from server-rendered HTML for SEO. */document.querySelectorAll('[data-t]').forEach(e=>e.textContent=tr(e.dataset.t));document.querySelectorAll('[data-t-html]').forEach(e=>e.innerHTML=tr(e.dataset.tHtml));document.querySelector('#city-status').textContent=city;document.querySelector('#city').value=city;document.querySelector('#today').textContent=new Intl.DateTimeFormat(lang,{day:'numeric',month:'long',year:'numeric',timeZone:'America/Santo_Domingo'}).format(new Date());document.querySelector('#news-grid').innerHTML=news.map((n,i)=>`<article class="story ${!i?'featured':''}" tabindex="0" role="button" data-news="${i}"><div class="story-img" style="background-image:linear-gradient(0deg,#092f3022,#092f3000),url('${n.image}')"></div><div class="story-content"><span class="tag">${n.emoji} ${n.tag[idx()]}</span><h3>${n.title[idx()]}</h3><p>${n.desc[idx()]}</p><span class="source">${n.source} ↗</span></div></article>`).join('');document.querySelectorAll('[data-news]').forEach(e=>{e.addEventListener('click',()=>showNews(+e.dataset.news));e.addEventListener('keydown',ev=>{if(ev.key==='Enter')showNews(+e.dataset.news)})});if(window.islaRenderNews)window.islaRenderNews();document.querySelector('#servicegrid').innerHTML=services.map((s,i)=>`<button class="service" data-service="${i}"><span class="arrow">↗</span><span class="serviceicon">${s.icon}</span><b>${s.title[idx()]}</b><small>${s.desc[idx()]}</small></button>`).join('');document.querySelectorAll('[data-service]').forEach(e=>e.addEventListener('click',()=>showService(+e.dataset.service)));document.querySelector('#travelgrid').innerHTML=destinations.map((d,i)=>`<div class="destination" tabindex="0" role="button" data-dest="${i}" style="background-image:url('${d.image}')"><span class="dest-arrow">↗</span><div><small>${d.category[idx()]}</small><h3>${d.name}</h3><p>${d.desc[idx()]}</p></div></div>`).join('');document.querySelectorAll('[data-dest]').forEach(e=>{e.addEventListener('click',()=>showDest(+e.dataset.dest));e.addEventListener('keydown',ev=>{if(ev.key==='Enter')showDest(+e.dataset.dest)})})}
function dialog(kicker,title,body){document.querySelector('#dialog-kicker').textContent=kicker;document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-content').innerHTML=body;document.querySelector('#overlay').classList.add('visible');document.body.style.overflow='hidden';document.querySelector('#close').focus()}
function link(url,label){return `<a class="resource" href="${url}" target="_blank" rel="noopener noreferrer">${esc(label||tr('external'))}</a>`}
function showNews(i){const n=news[i];dialog(n.tag[idx()],n.title[idx()],`<p>${esc(n.desc[idx()])}</p><p class="demo-notice">${tr('demo')}</p>${link(n.url,n.source+' ↗')}`)}
function showService(i){const s=services[i];let extras='';if(s.id==='trash'&&city==='Higüey')extras=link('https://ayuntamientohiguey.gob.do/rutas-y-frecuencias/',lang==='de'?'Offizieller Müllabfuhrplan Higüey ↗':'Rutas oficiales de Higüey ↗');if(s.id==='repair')extras=link('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('reparación electrodomésticos '+city),'Google Maps ↗');if(s.id==='schools')extras=link('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('colegios '+city),'Google Maps ↗');if(s.id==='water')extras=link('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('agua botellones '+city),'Google Maps ↗');if(s.url)extras+=link(s.url);dialog(tr('pilot')+' · '+city,s.title[idx()],`<p>${esc(s.desc[idx()])}. ${tr('serviceinfo')}</p><p class="demo-notice">${tr('demo')} · ${esc(city)}</p>${extras}`)}
function showDest(i){let d=destinations[i];dialog(tr('trips'),d.name,`<p>${esc(d.desc[idx()])}</p><p>${lang==='de'?'Entdecke zuverlässige Informationen zum Reiseziel. Ausflüge und Buchungspartner werden erst nach Prüfung ergänzt.':lang==='es'?'Descubre información oficial del destino. Las excursiones y reservas se incorporarán tras verificar los socios.':lang==='fr'?'Découvrez les informations officielles sur cette destination. Les réservations viendront après vérification des partenaires.':'Explore official travel information. Tour bookings will follow after partner verification.'}</p>${link(d.url)}`)}
function showSearch(){dialog(tr('search'),tr('search'),`<div class="searchwrap"><input id="searchInput" placeholder="${tr('searchplaceholder')}" aria-label="${tr('search')}"><button id="searchSubmit">${tr('searchgo')}</button></div><div id="searchResult"></div>`);const search=()=>{let q=document.querySelector('#searchInput').value.toLocaleLowerCase();let matches=services.filter(s=>s.title.join(' ').toLocaleLowerCase().includes(q)||s.desc.join(' ').toLocaleLowerCase().includes(q));let travel=destinations.filter(d=>d.name.toLocaleLowerCase().includes(q));let rows=matches.map(s=>`<p>• ${esc(s.title[idx()])}</p>`).concat(travel.map(d=>`<p>• ${esc(d.name)}</p>`));document.querySelector('#searchResult').innerHTML=rows.length?rows.join(''):`<p>${tr('noresult')}</p>`};document.querySelector('#searchSubmit').onclick=search;document.querySelector('#searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')search()});document.querySelector('#searchInput').focus()}
function setSiteLanguage(next){
 if(!['es','de','en','fr','ht'].includes(next))return;
 try{localStorage.setItem('islaviva-language',next);localStorage.setItem('islaviva-language-choice',next)}catch(e){}
 location.assign(next==='es'?'/':'/'+next+'/');
}
document.querySelectorAll('[data-set-language]').forEach(button=>button.addEventListener('click',()=>setSiteLanguage(button.dataset.setLanguage)));
document.querySelector('#city').addEventListener('change',e=>{city=e.target.value;localStorage.setItem('islaviva-city',city);render()});document.querySelector('#searchBtn').addEventListener('click',showSearch);document.querySelector('#close').addEventListener('click',closeDialog);document.querySelector('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeDialog()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog()});function closeDialog(){document.querySelector('#overlay').classList.remove('visible');document.body.style.overflow=''}

const weatherLabels={
es:{prefix:'Pronóstico',unavailable:'Pronóstico no disponible',source:'Datos: MET Norway',degree:'°C',alert:'Avisos oficiales: INDOMET'},
de:{prefix:'Vorhersage',unavailable:'Wettervorhersage nicht verfügbar',source:'Daten: MET Norway',degree:'°C',alert:'Amtliche Warnungen: INDOMET'},
en:{prefix:'Forecast',unavailable:'Weather forecast unavailable',source:'Data: MET Norway',degree:'°C',alert:'Official alerts: INDOMET'},
fr:{prefix:'Prévision',unavailable:'Prévisions météo indisponibles',source:'Données : MET Norway',degree:'°C',alert:'Alertes officielles : INDOMET'},
ht:{prefix:'Previzyon',unavailable:'Previzyon meteyo pa disponib',source:'Done: MET Norway',degree:'°C',alert:'Avètisman ofisyèl: INDOMET'}
};
// Only visitors geographically located in the US see Fahrenheit.
// A failed/unavailable country check always keeps Celsius.
let visitorCountry='OTHER';
async function detectVisitorCountry(){
 try{
  const response=await fetch('/api/visitor-country',{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  visitorCountry=data?.country==='US'?'US':'OTHER';
 }catch(e){visitorCountry='OTHER'}
 renderIslandWeather();
}
let islandWeather=null;
function renderIslandWeather(){
 const el=document.getElementById('weather-summary');
 if(!el)return;
 const t=weatherLabels[lang]||weatherLabels.es;
 const w=islandWeather?.cities?.[city];
 const weatherBar=document.querySelector('.statusbar');
 const clock=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hourCycle:'h23',timeZone:'America/Santo_Domingo'}).format(new Date());
 const hour=Number(clock);
 // Visual time-of-day theme; not a precise astronomical sunrise/sunset forecast.
 const phase=(hour>=19||hour<6)?'night':hour<8?'dawn':hour>=17?'dusk':'day';
 weatherBar.classList.remove('weather-day','weather-night','weather-dawn','weather-dusk');
 weatherBar.classList.add('weather-'+phase);
 const links={
  'Higüey':'https://kachelmannwetter.com/de/wetter/3493240-higueey',
  'Punta Cana':'https://kachelmannwetter.com/de/wetter/3494242-punta-cana'
 };
 document.getElementById('weather-external').href=links[city]||'https://kachelmannwetter.com/de/modellkarten/german/dominikanische-republik';
 const tempElement=document.getElementById('weather-temp');
 const details=document.getElementById('weather-details');
 const icon=document.getElementById('weather-icon');
 const labels={
  es:{clear:'Despejado',cloud:'Nublado',partly:'Parcialmente nublado',rain:'Lluvia',showers:'Chubascos',thunder:'Tormentas',fog:'Niebla',wind:'Viento',at:'Hora RD'},
  de:{clear:'Klarer Himmel',cloud:'Bewölkt',partly:'Teilweise bewölkt',rain:'Regen',showers:'Regenschauer',thunder:'Gewitter',fog:'Nebel',wind:'Wind',at:'Ortszeit RD'},
  en:{clear:'Clear sky',cloud:'Cloudy',partly:'Partly cloudy',rain:'Rain',showers:'Rain showers',thunder:'Thunderstorms',fog:'Fog',wind:'Wind',at:'RD local time'},
  fr:{clear:'Ciel dégagé',cloud:'Nuageux',partly:'Partiellement nuageux',rain:'Pluie',showers:'Averses',thunder:'Orages',fog:'Brouillard',wind:'Vent',at:'Heure locale RD'},
  ht:{clear:'Syèl klè',cloud:'Gen nyaj',partly:'Gen kèk nyaj',rain:'Lapli',showers:'Gwo lapli',thunder:'Loraj',fog:'Bwouya',wind:'Van',at:'Lè RD'}
 }[lang]||{clear:'Despejado',cloud:'Nublado',partly:'Parcialmente nublado',rain:'Lluvia',showers:'Chubascos',thunder:'Tormentas',fog:'Niebla',wind:'Viento',at:'Hora RD'};
 const fallbackIcon=phase==='night'?'🌙':phase==='dusk'?'🌇':phase==='dawn'?'🌄':'☀️';
 const timestamp=w?Date.parse(w.updated||''):NaN;
 const age=Date.now()-timestamp;
 if(!w||!Number.isFinite(timestamp)||age>6*3600000||age< -1800000||!Number.isFinite(Number(w.temperature_c))){
  tempElement.textContent='--°';icon.textContent=fallbackIcon;
  el.textContent=t.unavailable;
  details.textContent=labels.at+': '+clock+':00';
  return;
 }
 const symbol=(w.symbol||'').toLowerCase();
 let key='clear';
 if(/thunder/.test(symbol))key='thunder';
 else if(/rain|snow|sleet/.test(symbol))key=/showers/.test(symbol)?'showers':'rain';
 else if(/fog/.test(symbol))key='fog';
 else if(/partlycloudy|fair/.test(symbol))key='partly';
 else if(/cloudy/.test(symbol))key='cloud';
 const isNight=phase==='night'||symbol.includes('_night');
 const icons={thunder:'⛈️',rain:'🌧️',showers:'🌦️',fog:'🌫️',cloud:'☁️',partly:isNight?'☁️':'⛅',clear:isNight?'🌙':'☀️'};
 icon.textContent=icons[key]||fallbackIcon;
 const celsius=Number(w.temperature_c);
 const useFahrenheit=visitorCountry==='US';
 const shown=useFahrenheit?(celsius*9/5+32):celsius;
 tempElement.textContent=shown.toLocaleString(lang,{maximumFractionDigits:1})+(useFahrenheit?' °F':' °C');
 el.textContent=labels[key];
 const wind=Number(w.wind_mps);
 details.textContent=labels.at+': '+clock+':00'+(Number.isFinite(wind)?' · '+labels.wind+': '+Math.round(wind*3.6)+' km/h':'');
}
async function loadIslandWeather(){
 try{
  const response=await fetch('/data/weather.json',{cache:'no-store'});
  if(!response.ok)throw Error('forecast missing');
  const forecast=await response.json();
  if(!forecast || typeof forecast.cities!=='object')throw Error('invalid forecast');
  islandWeather=forecast;
 }catch(e){console.warn('Weather data unavailable',e)}
 renderIslandWeather();
}
let liveNews=[];
let newsScope='all', newsCategory='all', newsSource='all';
const NEWS_INTERESTS=['sport','tourism','economy','politics','local','culture','nature','gaming','health','science','education','safety','traffic','general'];
const NEWS_PREFS_KEY='islaviva-news-interests-v3';
function getSavedNewsInterests(){
 try{
  const newStored=JSON.parse(localStorage.getItem(NEWS_PREFS_KEY)||'null');
  if(Array.isArray(newStored))return new Set(newStored.filter(v=>NEWS_INTERESTS.includes(v)));
  // Existing visitors opted in before Gaming & Tech was added. Preserve their
  // previous choices while making the new category visible by default.
  const oldStored=JSON.parse(localStorage.getItem('islaviva-news-interests-v2')||localStorage.getItem('islaviva-news-interests-v1')||'null');
  if(Array.isArray(oldStored))return new Set([...oldStored.filter(v=>NEWS_INTERESTS.includes(v)),'gaming','health','science','education','safety','traffic']);
  return new Set(NEWS_INTERESTS);
 }catch(e){return new Set(NEWS_INTERESTS)}
}
let visibleNewsInterests=getSavedNewsInterests();
function saveNewsInterests(){try{localStorage.setItem(NEWS_PREFS_KEY,JSON.stringify([...visibleNewsInterests]))}catch(e){}}
const interestUi={
 es:{title:'⚙️ Mis intereses',help:'Desactiva los temas que no quieras ver. Se guarda solo en este navegador.',reset:'Mostrar todo',choices:['⚾ Deportes','🏝️ Turismo','💼 Economía','🏛️ Política','📍 Local','🎭 Cultura','🌿 Medioambiente','🎮 Gaming y tecnología','🩺 Salud','🔬 Ciencia','🎓 Educación','🚨 Seguridad','🚦 Tránsito','📰 Otros'],hidden:'Has ocultado todos los temas. Activa alguno en Mis intereses.'},
 de:{title:'⚙️ Meine Interessen',help:'Blende Themen aus, die dich nicht interessieren. Gespeichert nur in diesem Browser.',reset:'Alles anzeigen',choices:['⚾ Sport','🏝️ Tourismus','💼 Wirtschaft','🏛️ Politik','📍 Regionales','🎭 Kultur','🌿 Umwelt','🎮 Gaming & Technik','🩺 Gesundheit','🔬 Wissenschaft','🎓 Bildung','🚨 Sicherheit','🚦 Verkehr','📰 Sonstiges'],hidden:'Du hast alle Themen ausgeblendet. Aktiviere unter Meine Interessen mindestens eines.'},
 en:{title:'⚙️ My interests',help:'Hide topics you do not want to see. Saved only in this browser.',reset:'Show all',choices:['⚾ Sports','🏝️ Travel','💼 Business','🏛️ Politics','📍 Local','🎭 Culture','🌿 Environment','🎮 Gaming & Tech','🩺 Health','🔬 Science','🎓 Education','🚨 Public safety','🚦 Traffic','📰 Other'],hidden:'All topics are hidden. Enable one or more in My interests.'},
 fr:{title:'⚙️ Mes centres d’intérêt',help:'Masquez les thèmes qui ne vous intéressent pas. Enregistré uniquement dans ce navigateur.',reset:'Tout afficher',choices:['⚾ Sport','🏝️ Tourisme','💼 Économie','🏛️ Politique','📍 Local','🎭 Culture','🌿 Environnement','🎮 Jeux vidéo & tech','🩺 Santé','🔬 Sciences','🎓 Éducation','🚨 Sécurité','🚦 Circulation','📰 Autres'],hidden:'Tous les sujets sont masqués. Activez-en dans Mes centres d’intérêt.'},
 ht:{title:'⚙️ Sa ki enterese m',help:'Kache sijè ou pa vle wè yo. Preferans yo rete sèlman nan navigatè sa a.',reset:'Montre tout',choices:['⚾ Espò','🏝️ Touris','💼 Ekonomi','🏛️ Politik','📍 Lokal','🎭 Kilti','🌿 Anviwònman','🎮 Jwèt videyo & teknoloji','🩺 Sante','🔬 Syans','🎓 Edikasyon','🚨 Sekirite','🚦 Trafik','📰 Lòt'],hidden:'Ou kache tout sijè yo. Aktive kèk nan preferans ou.'}
};
// Conservative classification from original Spanish title; avoid treating every general feed as a local event.
function newsInterest(n){
 // Server classification is authoritative; legacy cached items still get a fallback.
 const cat=(n.category||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 // Older cached RSS entries can receive a non-destructive, strong title-only fallback.
 const gamingTitle=(n.title||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/\b(?:gta\s*(?:vi|6|v|5)|grand\s+theft\s+auto|videojuegos?|gaming|playstation|xbox|nintendo|ciberseguridad|inteligencia\s+artificial)\b/.test(gamingTitle))return 'gaming';
 const known={salud:'health',ciencia:'science',educacion:'education',seguridad:'safety',transito:'traffic','gaming y tecnologia':'gaming',deportes:'sport',turismo:'tourism',vivienda:'economy',economia:'economy',politica:'politics',cultura:'culture',medioambiente:'nature',regionales:'local'};
 if(known[cat])return known[cat];
 const t=(n.title||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/\b(deportes?|beisbol|pelota|lidom|home run|jonron|softbol|futbol|baloncesto|basket|nba|mlb|atleta|olimpic[oa]s?|maraton|boxeo|tenis|escogido|licey|aguilas cibae|estrellas orientales|gigantes del cibao|toros del este|toros (?:se sacuden|vencen|derrotan|ganan)|leones del escogido)\b/.test(t))return 'sport';
 if(/\b(turismo|turistas?|hotel(?:es)?|playa|aeropuerto|aerolinea|crucero|visitantes|vacaciones|resort)\b/.test(t))return 'tourism';
 if(/\b(economia|economico|empresa|mercado|finanza|financiero|deuda|inflacion|dolar|precio|comercio|exportacion|importacion|empleo|banco central)\b/.test(t))return 'economy';
 if(/\b(politica|politico|presidente|gobierno|diputad[oa]s?|congreso|senado|senador|eleccion|partido|ministro|ministerio)\b/.test(t))return 'politics';
 if(/\b(cultura|arte|musica|cine|festival|teatro|artista|concierto|literatura|religion|iglesia|basilica)\b/.test(t))return 'culture';
 if(/\b(ambiente|medioambiente|huracan|tormenta|naturaleza|lluvias|inundacion|ecologia|clima)\b/.test(t))return 'nature';
 if(Array.isArray(n.regions)&&n.regions.length)return 'local';
 return 'general';
}
function renderNewsPreferences(){
 const ui=interestUi[lang]||interestUi.es;
 const button=document.getElementById('news-personalize-button');
 if(!button)return;
 button.textContent=ui.title;
 document.getElementById('news-preferences-title').textContent=ui.title;
 document.getElementById('news-preferences-help').textContent=ui.help;
 document.getElementById('news-preferences-reset').textContent=ui.reset;
 const panel=document.getElementById('news-preferences-choices');
 panel.innerHTML=NEWS_INTERESTS.map((key,i)=>'<label class="news-preference"><input type="checkbox" data-interest="'+key+'" '+(visibleNewsInterests.has(key)?'checked':'')+'/><span>'+esc(ui.choices[i])+'</span></label>').join('');
}

const newsUi={
 es:{all:'🌎 Toda la RD',local:'📍 Mi ciudad',topics:'Todos los temas',sources:'Todas las fuentes',empty:'No hay noticias recientes verificadas para estos filtros.',localNote:'Solo titulares que mencionan explícitamente esta zona; no es una cobertura local completa.',translated:'Titulares traducidos automáticamente. Consulte el artículo original para verificar detalles.',original:'Titulares originales en español. Fuente vinculada en cada noticia.',read:'Leer artículo original',latest:'Actualizado',minutes:'hace'},
 de:{all:'🌎 Ganz RD',local:'📍 Meine Stadt',topics:'Alle Themen',sources:'Alle Quellen',empty:'Keine aktuellen geprüften Meldungen für diese Auswahl.',localNote:'Nur Artikel mit ausdrücklicher Ortsnennung; keine vollständige Lokalberichterstattung.',translated:'Automatisch übersetzte Schlagzeilen. Details bitte im Original prüfen.',original:'Original-Schlagzeilen auf Spanisch. Jede Meldung verlinkt ihre Quelle.',read:'Originalartikel lesen',latest:'Aktualisiert',minutes:'vor'},
 en:{all:'🌎 All RD',local:'📍 My city',topics:'All topics',sources:'All sources',empty:'No recent verified stories match these filters.',localNote:'Only headlines explicitly mentioning the selected area; not comprehensive local coverage.',translated:'Machine-translated headlines. Check the original for full details.',original:'Original Spanish headlines, with publisher links.',read:'Read original article',latest:'Updated',minutes:'ago'},
 fr:{all:'🌎 Toute la RD',local:'📍 Ma ville',topics:'Tous les sujets',sources:'Toutes les sources',empty:'Aucune actualité récente vérifiée pour ces filtres.',localNote:'Seulement les articles mentionnant explicitement cette région ; couverture non exhaustive.',translated:'Titres traduits automatiquement. Vérifiez les détails dans les articles originaux.',original:'Titres originaux en espagnol et liens vers les sources.',read:'Lire la source',latest:'Actualisé',minutes:'il y a'},
 ht:{all:'🌎 Tout RD',local:'📍 Vil mwen',topics:'Tout sijè',sources:'Tout sous',empty:'Pa gen nouvèl resan ki verifye pou filtè sa yo.',localNote:'Se sèlman atik ki mansyone zòn nan klèman; se pa tout nouvèl lokal.',translated:'Tit yo tradui otomatikman. Verifye detay yo nan atik orijinal yo.',original:'Tit orijinal an panyòl, ak lyen sous yo.',read:'Li atik orijinal la',latest:'Mizajou',minutes:'sa gen'}
};
let newsFeedMetadata=null;
const regionalCoverageText={
 es:{tagged:'titulares con lugar explícito',city:'De tu ciudad',none:'Ninguna mención explícita de tu ciudad'},
 de:{tagged:'Schlagzeilen mit eindeutigem Ortsbezug',city:'Deine Stadt',none:'Keine eindeutige Meldung aus deiner Stadt'},
 en:{tagged:'headlines with explicit location',city:'Your city',none:'No explicitly located stories for your city'},
 fr:{tagged:'titres avec un lieu explicite',city:'Votre ville',none:'Aucun titre situé explicitement dans votre ville'},
 ht:{tagged:'tit ki site yon kote klèman',city:'Vil ou',none:'Pa gen nouvèl ki site vil ou klèman'}
};
const feedHealthText={
 es:{complete:'Fuentes RSS disponibles',partial:'Fuentes RSS parcialmente disponibles',empty:'Sin titulares recientes',stale:'Actualización RSS retrasada',unknown:'Estado RSS no confirmado',feeds:'feeds',publishers:'medios con artículos',items:'titulares',updated:'Última recopilación',unavailable:'No respondieron',note:'Cobertura RSS, no verificación editorial de cada noticia.'},
 de:{complete:'RSS-Quellen erreichbar',partial:'RSS-Quellen teilweise erreichbar',empty:'Keine aktuellen Schlagzeilen',stale:'RSS-Aktualisierung verspätet',unknown:'RSS-Status nicht bestätigt',feeds:'Feeds',publishers:'Medien mit Artikeln',items:'Schlagzeilen',updated:'Letzter Import',unavailable:'Nicht erreichbar',note:'RSS-Abdeckung, keine redaktionelle Prüfung jeder Meldung.'},
 en:{complete:'RSS feeds available',partial:'RSS feeds partly available',empty:'No recent headlines',stale:'RSS update delayed',unknown:'RSS status unconfirmed',feeds:'feeds',publishers:'publishers with articles',items:'headlines',updated:'Last collection',unavailable:'Unavailable',note:'RSS coverage, not editorial verification of every article.'},
 fr:{complete:'Flux RSS disponibles',partial:'Flux RSS partiellement disponibles',empty:'Aucun titre récent',stale:'Mise à jour RSS en retard',unknown:'État RSS non confirmé',feeds:'flux',publishers:'éditeurs avec articles',items:'titres',updated:'Dernière collecte',unavailable:'Indisponibles',note:'Couverture RSS, sans vérification éditoriale de chaque article.'},
 ht:{complete:'Sous RSS yo disponib',partial:'Kèk sous RSS pa disponib',empty:'Pa gen nouvèl resan',stale:'Mizajou RSS anreta',unknown:'Eta RSS la pa konfime',feeds:'fil RSS',publishers:'medya ki gen atik',items:'tit',updated:'Dènye koleksyon',unavailable:'Pa disponib',note:'Se eta sous RSS yo, pa yon verifikasyon chak nouvèl.'}
};
function renderNewsFeedHealth(){
 const meta=newsFeedMetadata;
 if(!meta)return;
 const controls=document.getElementById('news-controls');
 if(!controls)return;
 let node=document.getElementById('news-feed-health');
 if(!node){
  node=document.createElement('div');node.id='news-feed-health';
  node.className='news-feed-health';node.setAttribute('role','status');
  node.setAttribute('aria-live','polite');
  controls.parentNode.insertBefore(node,controls);
 }
 const l=feedHealthText[lang]||feedHealthText.es;
 const diag=meta.source_diagnostics||{};
 const ok=Number.isInteger(diag.feeds_successful)?diag.feeds_successful:null;
 const total=Number.isInteger(diag.feeds_configured)?diag.feeds_configured:null;
 const validCounts=ok!==null&&total!==null&&total>0&&ok>=0&&ok<=total;
 const importedAt=Date.parse(meta.updated||'');
 // The scheduled RSS importer runs every three hours. Six hours is enough
 // grace for a delayed run; never label an old snapshot as a live healthy feed.
 const stale=!Number.isFinite(importedAt)||importedAt>Date.now()+30*60*1000||
             Date.now()-importedAt>6*60*60*1000;
 const status=stale?'stale':
              meta.source_status==='ok'&&validCounts&&ok===total?'complete':
              meta.source_status==='partial'&&validCounts?'partial':
              meta.source_status==='no_recent_articles'?'empty':'unknown';
 node.dataset.status=status;
 const publishers=diag.publishers&&typeof diag.publishers==='object'&&!Array.isArray(diag.publishers)?
                  Object.keys(diag.publishers).length:null;
 const date=Date.parse(meta.updated||'');
 const timestamp=Number.isFinite(date)?new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeStyle:'short',timeZone:'America/Santo_Domingo'}).format(new Date(date)):null;
 const reported=Array.isArray(meta.failed_feeds)?[...new Set(meta.failed_feeds.map(x=>x&&x.source).filter(x=>typeof x==='string'&&x.length<70))].slice(0,3):[];
 const heading=document.createElement('strong');
 heading.textContent=(status==='complete'?l.complete:status==='partial'?l.partial:status==='empty'?l.empty:status==='stale'?l.stale:l.unknown);
 const details=document.createElement('span');
 const terms=[];
 if(validCounts)terms.push(ok+'/'+total+' '+l.feeds);
 if(publishers!==null)terms.push(publishers+' '+l.publishers);
 if(Array.isArray(meta.items))terms.push(meta.items.length+' '+l.items);
 if(timestamp)terms.push(l.updated+': '+timestamp);
 // Only count locations explicitly attached to articles. Never infer a
 // publisher's region or promise comprehensive local coverage.
 const regionalLabels=regionalCoverageText[lang]||regionalCoverageText.es;
 if(Array.isArray(meta.items)){
   const located=meta.items.filter(item=>Array.isArray(item.regions)&&item.regions.length).length;
   terms.push(located+'/'+meta.items.length+' '+regionalLabels.tagged);
   const local=meta.items.filter(item=>Array.isArray(item.regions)&&item.regions.includes(city)).length;
   terms.push(local?regionalLabels.city+' ('+city+'): '+local:regionalLabels.none);
 }
 details.textContent=terms.join(' · ');
 const note=document.createElement('small');
 note.textContent=(reported.length?l.unavailable+': '+reported.join(', ')+'. ':'')+l.note;
 node.replaceChildren(heading,details,note);
}
const sourceHosts={'diariolibre.com':'Diario Libre','hoy.com.do':'Hoy','eldia.com.do':'El Día','almomento.net':'AlMomento','noticiassin.com':'Noticias SIN','puntacanapost.com':'Punta Cana Post','eltiempo.com.do':'El Tiempo','bavarodigital.net':'Bávaro Digital','diario55.com':'Diario 55','noticia.do':'Noticia.do','diarionorterd.com':'Diario Norte RD'};
// Every illustration is original inline SVG, NOT a photograph of the reported event.
// Real publisher photos must be explicitly licensed before their source is enabled here.
const licensedNewsImageSources=new Set([]);
function newsArtInfo(n){
 const words=((n.title||'')+' '+(n.category||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const category=(n.category||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const categoryDesign={health:{type:'nature',accent:'#A0DDD4',dark:'#235D59',light:'#99D1C2'},science:{type:'tech',accent:'#D8C8F5',dark:'#313E6D',light:'#A6BADB'},education:{type:'culture',accent:'#F2D39B',dark:'#425E6A',light:'#B3D8BF'},safety:{type:'city',accent:'#F2BD9A',dark:'#5F3E49',light:'#CBA8A8'},traffic:{type:'city',accent:'#F3D5A4',dark:'#2D5866',light:'#8DB9BD'}};
 const categoryDesignValue=categoryDesign[newsInterest(n)];
 if(categoryDesignValue)return categoryDesignValue;
 if((n.category==='Gaming y tecnología')||newsInterest(n)==='gaming')return {type:'tech',accent:'#A6D9EC',dark:'#253D65',light:'#72B9C9'};
 if(/beisbol|pelota|lidom|home run|jonron|toros|leones|aguilas|estrellas|gigantes|futbol|deporte|atleta|olimpic/.test(words))return {type:'sport',accent:'#E6AF67',dark:'#234E48',light:'#A1D6B2'};
 if(/huracan|tormenta|lluvia|inundacion|medioambiente|naturaleza|energia solar|medio ambiente/.test(words))return {type:'nature',accent:'#E8D78A',dark:'#225D60',light:'#92C5AE'};
 if(/turismo|hotel|playa|aeropuerto|vuelo|aerolinea|vacaciones|punta cana|bavaro|cap cana/.test(words))return {type:'travel',accent:'#F6C37A',dark:'#0A5964',light:'#8BD1C7'};
 if(/economia|comercio|empresa|empleo|negocio|precio|mercado|finanzas|peso|dolar|deuda/.test(words))return {type:'business',accent:'#F2C67A',dark:'#2B545D',light:'#B1D3B1'};
 if(/construccion|vivienda|inmueble|alquiler|carretera|infraestructura|obras/.test(words))return {type:'city',accent:'#EFC392',dark:'#2B5D59',light:'#C0DAC5'};
 if(/cultura|arte|musica|cine|festival|patrimonio|iglesia|religion/.test(words))return {type:'culture',accent:'#F5B2A2',dark:'#594961',light:'#D4BCD0'};
 if(/politica|presidente|gobierno|congreso|diputado|senado|eleccion|ministro/.test(words))return {type:'politics',accent:'#F2C890',dark:'#284D69',light:'#9CC4C8'};
 if(category==='regionales'||/higuey|santiago|samana|puerto plata|la romana/.test(words))return {type:'local',accent:'#F6BF88',dark:'#20595C',light:'#A6D5C2'};
 return {type:'general',accent:'#D8CA9B',dark:'#194E58',light:'#92C5B7'};
}
function newsIllustration(n, instance=0){
 const a=newsArtInfo(n);
 // Unique SVG resource IDs per card prevent gradient collisions.
 const artId=a.type+'-'+instance;
 const base='<svg aria-hidden="true" viewBox="0 0 600 330" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sea-'+artId+'" x2="1" y2="1"><stop stop-color="'+a.dark+'"/><stop offset="1" stop-color="'+a.light+'"/></linearGradient><pattern id="lines-'+artId+'" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#FFFFFF" stroke-opacity=".1"/></pattern></defs><rect width="600" height="330" fill="url(#sea-'+artId+')"/><rect width="600" height="330" fill="url(#lines-'+artId+')"/><circle cx="475" cy="88" r="97" fill="'+a.accent+'" opacity=".17"/><circle cx="490" cy="91" r="57" fill="'+a.accent+'" opacity=".17"/>';
 const paths={
  tech:'<rect x="152" y="80" width="290" height="175" rx="16" fill="#D7EDF1"/><rect x="171" y="100" width="251" height="129" rx="7" fill="#275A71"/><path d="M210 159h58m-28-27v54M329 139h65m-65 33h65" stroke="#89D9E1" stroke-width="12" stroke-linecap="round"/><rect x="258" y="255" width="92" height="13" rx="6" fill="#A9CBD4"/><rect x="213" y="271" width="184" height="15" rx="7" fill="#D7EDF1"/>',
  travel:'<circle cx="455" cy="96" r="47" fill="#FFE1A3"/><path d="M0 235Q160 208 301 243T600 232V330H0Z" fill="#2E9F9D"/><path d="M0 267Q148 240 303 276T600 264V330H0Z" fill="#126F84"/><path d="M157 253L191 118M191 118Q213 155 245 151M191 118Q153 142 116 149M191 118Q178 94 162 84M191 118Q217 107 242 95" fill="none" stroke="#EDE4BD" stroke-width="11" stroke-linecap="round"/><path d="M304 113L410 145L326 166L339 146Z" fill="#F3FAF5" opacity=".94"/>',
  sport:'<path d="M0 252Q300 173 600 253V330H0Z" fill="#2B8A67"/><path d="M0 298Q300 216 600 299" fill="none" stroke="#E8E9CB" stroke-width="4"/><path d="M128 254L295 194L475 263" fill="none" stroke="#E8E9CB" stroke-width="5"/><circle cx="310" cy="126" r="77" fill="#F5EBDB"/><path d="M265 64Q337 125 265 189M356 63Q284 126 356 189" stroke="#CD7160" stroke-width="5" stroke-dasharray="11 8" fill="none"/><path d="M88 102L214 212" stroke="#E5B97E" stroke-width="23" stroke-linecap="round"/>',
  nature:'<circle cx="448" cy="91" r="47" fill="#F8D9A4"/><path d="M0 249L152 108L284 244L404 137L600 279V330H0Z" fill="#4E9B8E"/><path d="M0 289L190 183L336 282L507 166L600 227V330H0Z" fill="#1E756A"/><path d="M130 308L180 207L222 308M412 320L468 218L524 320" fill="#B6D6B1" opacity=".8"/><path d="M0 293Q130 268 280 299T600 286" fill="none" stroke="#AEDDE3" stroke-width="17"/>',
  business:'<path d="M98 304V164H186V304M200 304V103H311V304M325 304V141H422V304M437 304V85H519V304" fill="#E9D6AE" opacity=".85"/><path d="M121 191H150M121 224H150M224 133H279M224 164H279M224 197H279M349 167H400M349 197H400M460 117H496M460 154H496M460 191H496" stroke="#296568" stroke-width="10"/><path d="M90 264L182 216L280 236L388 155L496 181" fill="none" stroke="#F7C16E" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M463 166L498 183L485 145" fill="none" stroke="#F7C16E" stroke-width="10"/>',
  city:'<path d="M42 310V201H122V310M133 310V148H238V310M251 310V177H361V310M380 310V114H503V310M514 310V221H571V310" fill="#D3E5D0" opacity=".85"/><path d="M73 220V239M95 220V239M165 178V204M198 178V204M165 228V255M198 228V255M284 206V226M318 206V226M412 146V172M450 146V172M412 196V222M450 196V222" stroke="#356E68" stroke-width="11"/><path d="M0 310H600" stroke="#F3D39B" stroke-width="15"/>',
  culture:'<circle cx="437" cy="104" r="83" fill="#F4D1BC" opacity=".75"/><path d="M123 284V135L227 83L330 135V284" fill="#E2D3CE"/><path d="M96 137L226 72L355 137" fill="none" stroke="#F2BC93" stroke-width="21" stroke-linejoin="round"/><path d="M171 284V182Q227 131 282 182V284" fill="#A47A87"/><path d="M0 296H600" stroke="#F3C8A1" stroke-width="16"/><path d="M395 204Q465 149 494 210T568 185" fill="none" stroke="#FFDBAD" stroke-width="12" stroke-linecap="round"/>',
  politics:'<path d="M123 284H502M156 139H468L312 63Z" fill="#E6D9BF" stroke="#ECD9A2" stroke-width="12" stroke-linejoin="round"/><path d="M186 155V272M249 155V272M312 155V272M375 155V272M439 155V272" stroke="#F5E9D6" stroke-width="29"/><path d="M165 154H458M165 277H458" stroke="#F5E9D6" stroke-width="17"/><path d="M110 304H514" stroke="#E7B887" stroke-width="19"/>',
  local:'<path d="M0 250Q163 197 299 251T600 242V330H0Z" fill="#4BA98E"/><path d="M0 293Q176 245 301 296T600 281V330H0Z" fill="#247F76"/><path d="M242 100Q242 45 299 45T356 101Q356 145 299 202Q242 145 242 100Z" fill="#F4CF9E"/><circle cx="299" cy="102" r="27" fill="#34766E"/><path d="M112 277L166 191L216 277M385 286L439 200L497 286" stroke="#EED8B1" stroke-width="12" fill="none"/>',
  general:'<rect x="117" y="81" width="307" height="199" rx="18" fill="#F4EDE0" transform="rotate(-8 117 81)"/><path d="M164 124L362 96M156 157L380 125M151 190L368 157M143 222L328 197" stroke="#749995" stroke-width="13" stroke-linecap="round"/><circle cx="450" cy="203" r="82" fill="#E1C993"/><path d="M415 203H489M452 169V238" stroke="#3C736F" stroke-width="16" stroke-linecap="round"/>'
 };
 return base+(paths[a.type]||paths.general)+'</svg>';
}
function newsVisualLabel(){
 return ({es:'Imagen ilustrativa',de:'Symbolbild',en:'Illustration',fr:'Illustration',ht:'Imaj ilistrasyon'})[lang]||'Imagen ilustrativa';
}
function newsActive(){
 const now=Date.now();
 return liveNews.filter(n=>{
  try{
   const u=new URL(n.url);const host=u.hostname.replace(/^www\./,'');
   const t=Date.parse(n.published||'');
   return Boolean(n.title) && u.protocol==='https:' && sourceHosts[host]===n.source &&
      Number.isFinite(t) && t<=now+1800000 && now-t<=48*3600000;
  }catch(e){return false}
 });
}
function effectiveNewsCategory(n){
 const interest=newsInterest(n);
 return ({gaming:'Gaming y tecnología',sport:'Deportes',health:'Salud',science:'Ciencia',education:'Educación',safety:'Seguridad',traffic:'Tránsito'})[interest]||(n.category||'Actualidad');
}
const newsCategoryLabels={
 es:{Salud:'Salud',Ciencia:'Ciencia',Educación:'Educación',Seguridad:'Seguridad',Tránsito:'Tránsito','Gaming y tecnología':'Gaming y tecnología',Cultura:'Cultura',Medioambiente:'Medioambiente',Vivienda:'Vivienda',Mundo:'Mundo',Deportes:'Deportes',Actualidad:'Actualidad',Turismo:'Turismo',Economía:'Economía',Regionales:'Regionales',Política:'Política'},
 de:{Salud:'Gesundheit',Ciencia:'Wissenschaft',Educación:'Bildung',Seguridad:'Sicherheit',Tránsito:'Verkehr','Gaming y tecnología':'Gaming & Technik',Cultura:'Kultur',Medioambiente:'Umwelt',Vivienda:'Wohnen',Mundo:'Welt',Deportes:'Sport',Actualidad:'Aktuelles',Turismo:'Tourismus',Economía:'Wirtschaft',Regionales:'Regionales',Política:'Politik'},
 en:{Salud:'Health',Ciencia:'Science',Educación:'Education',Seguridad:'Public safety',Tránsito:'Traffic','Gaming y tecnología':'Gaming & Tech',Cultura:'Culture',Medioambiente:'Environment',Vivienda:'Housing',Mundo:'World',Deportes:'Sports',Actualidad:'News',Turismo:'Tourism',Economía:'Economy',Regionales:'Regional',Política:'Politics'},
 fr:{Salud:'Santé',Ciencia:'Sciences',Educación:'Éducation',Seguridad:'Sécurité',Tránsito:'Circulation','Gaming y tecnología':'Jeux vidéo & tech',Cultura:'Culture',Medioambiente:'Environnement',Vivienda:'Logement',Mundo:'Monde',Deportes:'Sport',Actualidad:'Actualités',Turismo:'Tourisme',Economía:'Économie',Regionales:'Régional',Política:'Politique'},
 ht:{Salud:'Sante',Ciencia:'Syans',Educación:'Edikasyon',Seguridad:'Sekirite',Tránsito:'Trafik','Gaming y tecnología':'Jwèt videyo & teknoloji',Cultura:'Kilti',Medioambiente:'Anviwònman',Vivienda:'Lojman',Mundo:'Mond',Deportes:'Espò',Actualidad:'Aktyalite',Turismo:'Touris',Economía:'Ekonomi',Regionales:'Rejyonal',Política:'Politik'}
};
function newsCategoryLabel(c){return newsCategoryLabels[lang]?.[c]||c}
function renderNewsPortal(){
 renderNewsFeedHealth();
 if(!liveNews.length){
  // A valid empty RSS snapshot is not an error: remove old articles, filters
  // and local-priority announcements instead of leaving stale news in place.
  const grid=document.getElementById('news-grid');
  const ui=newsUi[lang]||newsUi.es;
  grid.innerHTML='<div class="news-empty">'+esc(ui.empty)+'</div>';
  document.getElementById('news-controls').hidden=true;
  document.getElementById('news-local-priority').hidden=true;
  const disclaimer=document.querySelector('[data-t="newsdisclaimer"]');
  if(disclaimer)disclaimer.textContent=ui.original;
  return;
 }
 const ui=newsUi[lang]||newsUi.es;
 const controls=document.getElementById('news-controls');
 controls.hidden=false;
 controls.querySelector('[data-scope="all"]').textContent=ui.all;
 controls.querySelector('[data-scope="local"]').textContent=ui.local+' ('+city+')';
 controls.querySelectorAll('[data-scope]').forEach(b=>{
  b.classList.toggle('active',b.dataset.scope===newsScope);
  b.setAttribute('aria-pressed',String(b.dataset.scope===newsScope));
 });
 renderNewsPreferences();
 const valid=newsActive().filter(n=>visibleNewsInterests.has(newsInterest(n)));
 const categories=[...new Set(valid.map(n=>effectiveNewsCategory(n)))].sort((a,b)=>a.localeCompare(b));
 const publishers=[...new Set(valid.map(n=>n.source))].sort((a,b)=>a.localeCompare(b));
 const cat=document.getElementById('news-category'),source=document.getElementById('news-source');
 const option=(key,value)=>'<option value="'+esc(value)+'">'+esc(key)+'</option>';
 cat.innerHTML=option(ui.topics,'all')+categories.map(c=>option(newsCategoryLabel(c),c)).join('');
 source.innerHTML=option(ui.sources,'all')+publishers.map(c=>option(c,c)).join('');
 if(!categories.includes(newsCategory))newsCategory='all';
 if(!publishers.includes(newsSource))newsSource='all';
 cat.value=newsCategory;source.value=newsSource;
 const selected=valid.filter(n=>(newsScope!=='local'||(Array.isArray(n.regions)&&n.regions.includes(city))) &&
   (newsCategory==='all'||effectiveNewsCategory(n)===newsCategory) &&
   (newsSource==='all'||n.source===newsSource));
 // Editorial order: city-first, then explicitly named nearby cities, then other RD.
 // Avoid source round-robin *after* ranking: it formerly pushed local news down.
 // Only publish already validated, recent (<48h) source-linked feed entries.
 const nearbyCities={
  'Higüey':['Punta Cana','La Romana'],
  'Punta Cana':['Higüey','La Romana'],
  'La Romana':['Higüey','Punta Cana'],
  'Santo Domingo':[],
  'Santiago':[],
  'Puerto Plata':[],
  'Samaná':[]
 };
 const relevance=n=>{
  const places=Array.isArray(n.regions)?n.regions:[];
  if(places.includes(city))return 2;
  if(places.some(place=>(nearbyCities[city]||[]).includes(place)))return 1;
  return 0;
 };
 const ranked=[...selected].sort((a,b)=>{
  const difference=relevance(b)-relevance(a);
  return difference||Date.parse(b.published)-Date.parse(a.published);
 });
 // Maintain some editorial diversity within each region tier, without ever
 // allowing a national article to displace a currently available city story.
 const picked=[];
 const countsBySource=new Map();
 for(const tier of [2,1,0]){
  const options=ranked.filter(n=>relevance(n)===tier);
  // Prefer a balanced publisher mix, but only *within the same geographic tier*.
  for(const n of options){
   if(picked.length>=12)break;
   if((countsBySource.get(n.source)||0)>=4)continue;
   picked.push(n);
   countsBySource.set(n.source,(countsBySource.get(n.source)||0)+1);
  }
  // Fill all available city articles before showing nearby/national articles.
  for(const n of options){
   if(picked.length>=12)break;
   if(!picked.includes(n))picked.push(n);
  }
 }
 const priority=document.getElementById('news-local-priority');
 const localCount=picked.filter(n=>relevance(n)===2).length;
 const nearCount=picked.filter(n=>relevance(n)===1).length;
 const bannerLabels={
  es:['📍 Noticias de '+city+' primero','También de la zona: '+nearCount],
  de:['📍 Meldungen aus '+city+' zuerst','Weitere Meldungen aus der Umgebung: '+nearCount],
  en:['📍 '+city+' news first','More nearby stories: '+nearCount],
  fr:['📍 Actualités de '+city+' en premier','Autres actualités proches : '+nearCount],
  ht:['📍 Nouvèl '+city+' an premye','Lòt nouvèl toupre: '+nearCount]
 };
 const chosenText=bannerLabels[lang]||bannerLabels.es;
 priority.hidden=newsScope==='local'||!(localCount||nearCount);
 if(!priority.hidden)priority.innerHTML='<span>'+esc(chosenText[0])+'</span><small>'+esc(localCount+' · '+chosenText[1])+'</small>';
 const grid=document.getElementById('news-grid');
 if(!picked.length)grid.innerHTML='<div class="news-empty">'+esc(visibleNewsInterests.size?ui.empty:(interestUi[lang]||interestUi.es).hidden)+'</div>';
 else grid.innerHTML=picked.map((n,i)=>{
   // Check protected movie titles and local place names even for old cached RSS
   // snapshots. An unsafe machine translation is never shown as verified text.
   const proposedTitle=lang!=='es'?n.translations?.[lang]:'';
   const normalizeNewsText=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   const originalNorm=normalizeNewsText(n.title);
   const translatedNorm=normalizeNewsText(proposedTitle);
   const mediaGuards=[
    ['mi pobre angelito',['mi pobre angelito','home alone','kevin allein zu haus','maman j ai rate l avion']],
    ['juegos del hambre',['juegos del hambre','hunger games','tribute von panem']]
   ];
   const unsafeMovie=mediaGuards.some(([original,accepted])=>originalNorm.includes(original)&&
      !accepted.some(t=>translatedNorm.includes(t)));
   const missingPlace=['higuey','punta cana','bavaro','la romana','puerto plata'].some(place=>
      originalNorm.includes(place)&&!translatedNorm.includes(place));
   const unsafeName=/(my poor angel|mon pauvre ange|mein armer engel|pabunem)/.test(translatedNorm);
   const safeTranslation=Boolean(proposedTitle)&&!unsafeMovie&&!missingPlace&&!unsafeName;
   const title=safeTranslation?proposedTitle:n.title;
   const preview=(lang==='es'?n.preview:(safeTranslation?n.preview_translations?.[lang]:''))||'';
   const hasTranslation=lang!=='es'&&safeTranslation;
   const translatedLabel={es:'EN ESPAÑOL',de:'ÜBERSETZT',en:'TRANSLATED',fr:'TRADUIT',ht:'TRADUI'};
   const t=Date.parse(n.published);const hours=Math.max(0,Math.floor((Date.now()-t)/3600000));
   const date=hours<1?new Intl.DateTimeFormat(lang,{hour:'2-digit',minute:'2-digit',timeZone:'America/Santo_Domingo'}).format(new Date(t)):(lang==='es'?'Hace ':lang==='de'?'Vor ':lang==='en'?'':lang==='fr'?'Il y a ':'Sa gen ')+hours+' h';
   // Relative hours alone lose the calendar day; expose the original instant
   // to mouse, keyboard and assistive-technology users alike.
   const absolutePublished=new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeStyle:'short',timeZone:'America/Santo_Domingo'}).format(new Date(t));
   const places=Array.isArray(n.regions)?n.regions.filter(x=>typeof x==='string').slice(0,2):[];
   // Publisher photos are disabled until a valid reuse permission is documented.
   // Once licensed, enable a named source above. A failed load keeps the SVG.
   let photo='';
   if(licensedNewsImageSources.has(n.source)){
     try{const u=new URL(n.image||'');if(u.protocol==='https:'&& !/\.(svg|gif)$/i.test(u.pathname))photo=u.href;}catch(e){}
   }
   const art='<span class="news-illustration">'+newsIllustration(n,i)+'</span>';
   const photoMarkup=photo?'<img src="'+esc(photo)+'" alt="" loading="lazy" decoding="async" onload="this.parentNode.classList.add(\'has-image\')" onerror="this.remove()" />':'';
   const visualCaption='<span class="news-caption">'+esc(newsVisualLabel())+'</span>';

   const teaser=preview?'<div class="news-teaser">'+esc(preview)+'</div>':'';
   return '<a class="story '+(!i?'featured':'')+'" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer"><div class="news-image">'+art+photoMarkup+visualCaption+(photo?'<span class="news-photo-credit">'+esc(n.source)+'</span>':'')+'</div><div class="story-content"><div class="story-meta"><span class="tag">📰 '+esc(newsCategoryLabel(effectiveNewsCategory(n)))+'</span>'+(places.length?'<span class="story-local">📍 '+esc(places.join(' · '))+'</span>':'')+'</div><h3>'+esc(title)+'</h3>'+teaser+'<p class="news-byline">'+esc(n.source)+' · <time datetime="'+esc(n.published)+'" title="'+esc(absolutePublished)+'" aria-label="'+esc(absolutePublished)+'">'+esc(date)+'</time> · '+esc(hasTranslation?translatedLabel[lang]:'ES')+'</p><span class="source">'+esc(ui.read)+' <span aria-hidden="true">↗</span></span></div></a>';

 }).join('');
 const notice=document.querySelector('[data-t="newsdisclaimer"]');
 if(notice){
  const hasTranslation=picked.some(n=>lang!=='es'&&n.translations?.[lang]);
  notice.textContent=(hasTranslation?ui.translated:ui.original)+(newsScope==='local'?' '+ui.localNote:'');
 }
}
async function loadAutoNews(){
 try{
  const response=await fetch('/data/news.json',{cache:'no-store'});
  if(!response.ok)throw Error('news data unavailable');
  const feed=await response.json();
  if(!Array.isArray(feed.items))throw Error('news data malformed');
  newsFeedMetadata=feed;
  renderNewsFeedHealth();
  liveNews=feed.items;
  // Rendering an empty-but-valid snapshot removes articles that have aged
  // beyond the 48-hour limit instead of leaving stale cards on screen.
  window.islaRenderNews=renderNewsPortal;
  renderNewsPortal();
 }catch(error){console.warn('News feed unavailable, demo remains labeled',error)}
}
document.getElementById('news-personalize-button').addEventListener('click',()=>{
 const panel=document.getElementById('news-preferences'),button=document.getElementById('news-personalize-button');
 panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
});
document.getElementById('news-preferences-choices').addEventListener('change',e=>{
 const input=e.target.closest('input[data-interest]');
 if(!input||!NEWS_INTERESTS.includes(input.dataset.interest))return;
 if(input.checked)visibleNewsInterests.add(input.dataset.interest);
 else visibleNewsInterests.delete(input.dataset.interest);
 saveNewsInterests();renderNewsPortal();
});
document.getElementById('news-preferences-reset').addEventListener('click',()=>{
 visibleNewsInterests=new Set(NEWS_INTERESTS);
 saveNewsInterests();renderNewsPortal();
});
document.getElementById('news-tabs').addEventListener('click',e=>{
 const button=e.target.closest('[data-scope]');if(!button)return;
 newsScope=button.dataset.scope;renderNewsPortal();
});
document.getElementById('news-category').addEventListener('change',e=>{newsCategory=e.target.value;renderNewsPortal()});
document.getElementById('news-source').addEventListener('change',e=>{newsSource=e.target.value;renderNewsPortal()});

render();
loadIslandWeather();
detectVisitorCountry();
loadAutoNews();
loadRoadNotices();
loadLocalBulletins();
loadArchivedLocalContext();
loadFuelPrices();
loadFuelExchangeRate();
// Refresh the Dominican-local day/night appearance while the tab remains open.
setInterval(renderIslandWeather,5*60*1000);
// Pick up newly published forecast data without forcing a page refresh.
setInterval(loadIslandWeather,30*60*1000);
// Long-open tabs should not show frozen headlines after the scheduled importer
// has updated the JSON. Skip background-tab network requests.
setInterval(()=>{if(document.visibilityState==='visible')loadAutoNews()},30*60*1000);
// Refresh age labels, the 48-hour cutoff and the six-hour RSS-health warning
// without extra network traffic.
setInterval(()=>{if(document.visibilityState==='visible'&&newsFeedMetadata)renderNewsPortal()},5*60*1000);
