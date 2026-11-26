// Zero-dependency quality check for IslaViva RD's five-language guides.
// A new content page must be localized before it can pass CI.
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const locales=['de','en','fr','ht'];
const source=readFileSync(join(root,'guide-i18n.js'),'utf8');
const match=source.match(/const dictionary=(\{.*?\});\s*const labels=/s);
if(!match){console.error('Cannot load guide translation dictionary');process.exit(1)}
const dict=JSON.parse(match[1]);
const exempt=new Set(['index.html','404.html','partners.html']);
const names=readdirSync(root).filter(f=>f.endsWith('.html')&&!exempt.has(f)&&!/^google[a-z0-9]+\.html$/i.test(f));
let errors=0;
function fail(file,msg){errors++;console.error('FAIL '+file+': '+msg)}
for(const name of names){
 const html=readFileSync(join(root,name),'utf8');
 if(!/<main[\s>]/i.test(html))continue; // only actual guide/content pages
 if(!html.includes('id="guide-language"'))fail(name,'missing language selector');
 if(!html.includes('src="/guide-i18n.js"'))fail(name,'missing shared translation script');
 if(!html.includes('rel="canonical"'))fail(name,'missing canonical URL');
 if(!html.includes('name="robots" content="index,follow"'))fail(name,'missing indexability tag');
 if(!html.includes('href="/"'))fail(name,'missing home navigation');
 const body=(html.split('<body>')[1]||'').split('</body>')[0]
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 const textNodes=[...body.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim()).filter(x=>x&&/[a-záéíóú¿]/i.test(x));
 const exemptText=new Set(['✺ IslaViva RD','IslaViva RD','Sirena','Jumbo','Uber','Eats','INAPA','Idioma / Language','🇩🇴 Español','🇩🇪 Deutsch','🇬🇧 English','🇫🇷 Français','🇭🇹 Kreyòl ayisyen']);
 for(const value of textNodes){
  if(exemptText.has(value))continue;
  const entry=dict[value];
  if(!entry){fail(name,'untranslated source text: '+value.slice(0,95));continue}
  for(const locale of locales)if(!entry[locale]||!entry[locale].trim())fail(name,'missing '+locale+' translation for: '+value.slice(0,65));
 }
 console.log('Checked '+name+': '+textNodes.length+' visible text fragments');
}
// Static partner directories use reviewed per-language copy, not guide-i18n.js.
// Test the full visible copy, links, metadata and reciprocal sitemap separately.
const partnerCopy={
  "es": {
    "heading": "Nuestros proyectos",
    "description": "Promoción propia · Otros proyectos de nuestra red",
    "home": "IslaViva RD · Inicio",
    "footer": "Inicio",
    "cards": [
      [
        "https://comparanetrd.pages.dev/",
        "ComparaNet RD",
        "Compara internet y telefonía"
      ],
      [
        "https://vuelosrd.pages.dev/",
        "VuelosRD",
        "Aeropuertos y vuelos"
      ],
      [
        "https://oficiord.pages.dev/",
        "OficioRD",
        "Profesionales y servicios"
      ],
      [
        "https://recarganet-rd.pages.dev/",
        "RecargaNet RD",
        "Recargas prepago – desarrollo y simulación, sin compras"
      ],
      [
        "https://by-maria-beauty-store.pages.dev/",
        "By María Beauty &amp; Store",
        "Belleza y peinados en Higüey"
      ],
      [
        "https://gewinnradar.pages.dev/",
        "GewinnRadar",
        "Sorteos y calendarios de Adviento"
      ],
      [
        "https://demoradar.pages.dev/",
        "DemoRadar",
        "Calendario de manifestaciones en Alemania"
      ],
      [
        "https://ahorrord.pages.dev/",
        "AhorroRD",
        "Ofertas de supermercados y comparación de precios"
      ],
      [
        "https://hablard.pages.dev/",
        "HablaRD",
        "Aprende español dominicano"
      ],
      [
        "https://transporterd.pages.dev/",
        "TransporteRD",
        "Transporte público en República Dominicana"
      ],
      [
        "https://aprenderd.pages.dev/",
        "AprendeRD",
        "Cursos y formación"
      ],
      [
        "https://handyfix.pages.dev/",
        "HandyFix",
        "Consejos y ayuda para móviles"
      ],
      [
        "https://dateiwerk.pages.dev/",
        "DateiWerk",
        "Herramientas de archivos en el navegador"
      ],
      [
        "https://voicefix.pages.dev/",
        "VoiceFix",
        "Ayuda con el chat de voz de Valorant"
      ]
    ]
  },
  "de": {
    "heading": "Unsere Projekte",
    "description": "Eigenwerbung · Weitere Projekte unseres Netzwerks",
    "home": "IslaViva RD · Startseite",
    "footer": "Startseite",
    "cards": [
      [
        "https://comparanetrd.pages.dev/",
        "ComparaNet RD",
        "Internet und Mobilfunk vergleichen"
      ],
      [
        "https://vuelosrd.pages.dev/",
        "VuelosRD",
        "Flughäfen und Fluginformationen"
      ],
      [
        "https://oficiord.pages.dev/",
        "OficioRD",
        "Handwerker und Dienstleistungen"
      ],
      [
        "https://recarganet-rd.pages.dev/",
        "RecargaNet RD",
        "Prepaid-Aufladungen – Entwicklung und Simulation, keine Käufe"
      ],
      [
        "https://by-maria-beauty-store.pages.dev/",
        "By María Beauty &amp; Store",
        "Beauty und Haarstyling in Higüey"
      ],
      [
        "https://gewinnradar.pages.dev/",
        "GewinnRadar",
        "Gewinnspiele und Adventskalender"
      ],
      [
        "https://demoradar.pages.dev/",
        "DemoRadar",
        "Demonstrationskalender für Deutschland"
      ],
      [
        "https://ahorrord.pages.dev/",
        "AhorroRD",
        "Supermarktangebote und Preisvergleich"
      ],
      [
        "https://hablard.pages.dev/",
        "HablaRD",
        "Dominikanisches Spanisch lernen"
      ],
      [
        "https://transporterd.pages.dev/",
        "TransporteRD",
        "Öffentliche Verkehrsmittel in der Dominikanischen Republik"
      ],
      [
        "https://aprenderd.pages.dev/",
        "AprendeRD",
        "Kurse und Weiterbildung"
      ],
      [
        "https://handyfix.pages.dev/",
        "HandyFix",
        "Smartphone-Tipps und Hilfe"
      ],
      [
        "https://dateiwerk.pages.dev/",
        "DateiWerk",
        "Dateiwerkzeuge im Browser"
      ],
      [
        "https://voicefix.pages.dev/",
        "VoiceFix",
        "Hilfe bei Valorant-Sprachchatproblemen"
      ]
    ]
  },
  "en": {
    "heading": "Our projects",
    "description": "Self-promotion · Other projects in our network",
    "home": "IslaViva RD · Home",
    "footer": "Home",
    "cards": [
      [
        "https://comparanetrd.pages.dev/",
        "ComparaNet RD",
        "Compare internet and mobile plans"
      ],
      [
        "https://vuelosrd.pages.dev/",
        "VuelosRD",
        "Airports and flight information"
      ],
      [
        "https://oficiord.pages.dev/",
        "OficioRD",
        "Tradespeople and services"
      ],
      [
        "https://recarganet-rd.pages.dev/",
        "RecargaNet RD",
        "Prepaid top-ups – development and simulation, no purchases"
      ],
      [
        "https://by-maria-beauty-store.pages.dev/",
        "By María Beauty &amp; Store",
        "Beauty and hairstyling in Higüey"
      ],
      [
        "https://gewinnradar.pages.dev/",
        "GewinnRadar",
        "Giveaways and Advent calendars"
      ],
      [
        "https://demoradar.pages.dev/",
        "DemoRadar",
        "Demonstration calendar for Germany"
      ],
      [
        "https://ahorrord.pages.dev/",
        "AhorroRD",
        "Supermarket offers and price comparisons"
      ],
      [
        "https://hablard.pages.dev/",
        "HablaRD",
        "Learn Dominican Spanish"
      ],
      [
        "https://transporterd.pages.dev/",
        "TransporteRD",
        "Public transport in the Dominican Republic"
      ],
      [
        "https://aprenderd.pages.dev/",
        "AprendeRD",
        "Courses and training"
      ],
      [
        "https://handyfix.pages.dev/",
        "HandyFix",
        "Smartphone tips and help"
      ],
      [
        "https://dateiwerk.pages.dev/",
        "DateiWerk",
        "Browser-based file tools"
      ],
      [
        "https://voicefix.pages.dev/",
        "VoiceFix",
        "Help with Valorant voice chat issues"
      ]
    ]
  },
  "fr": {
    "heading": "Nos projets",
    "description": "Autopromotion · Autres projets de notre réseau",
    "home": "IslaViva RD · Accueil",
    "footer": "Accueil",
    "cards": [
      [
        "https://comparanetrd.pages.dev/",
        "ComparaNet RD",
        "Comparer internet et téléphonie"
      ],
      [
        "https://vuelosrd.pages.dev/",
        "VuelosRD",
        "Aéroports et vols"
      ],
      [
        "https://oficiord.pages.dev/",
        "OficioRD",
        "Artisans et services"
      ],
      [
        "https://recarganet-rd.pages.dev/",
        "RecargaNet RD",
        "Recharges prépayées – développement et simulation, sans achats"
      ],
      [
        "https://by-maria-beauty-store.pages.dev/",
        "By María Beauty &amp; Store",
        "Beauté et coiffure à Higüey"
      ],
      [
        "https://gewinnradar.pages.dev/",
        "GewinnRadar",
        "Concours et calendriers de l’Avent"
      ],
      [
        "https://demoradar.pages.dev/",
        "DemoRadar",
        "Calendrier des manifestations en Allemagne"
      ],
      [
        "https://ahorrord.pages.dev/",
        "AhorroRD",
        "Offres et comparaison des prix des supermarchés"
      ],
      [
        "https://hablard.pages.dev/",
        "HablaRD",
        "Apprendre l’espagnol dominicain"
      ],
      [
        "https://transporterd.pages.dev/",
        "TransporteRD",
        "Transports publics en République dominicaine"
      ],
      [
        "https://aprenderd.pages.dev/",
        "AprendeRD",
        "Cours et formation"
      ],
      [
        "https://handyfix.pages.dev/",
        "HandyFix",
        "Conseils et aide pour smartphones"
      ],
      [
        "https://dateiwerk.pages.dev/",
        "DateiWerk",
        "Outils de fichiers dans le navigateur"
      ],
      [
        "https://voicefix.pages.dev/",
        "VoiceFix",
        "Aide pour le chat vocal de Valorant"
      ]
    ]
  },
  "ht": {
    "heading": "Pwojè nou yo",
    "description": "Piblisite pa nou · Lòt pwojè nan rezo nou an",
    "home": "IslaViva RD · Akèy",
    "footer": "Akèy",
    "cards": [
      [
        "https://comparanetrd.pages.dev/",
        "ComparaNet RD",
        "Konpare entènèt ak telefòn"
      ],
      [
        "https://vuelosrd.pages.dev/",
        "VuelosRD",
        "Ayewopò ak enfòmasyon sou vòl"
      ],
      [
        "https://oficiord.pages.dev/",
        "OficioRD",
        "Atizan ak sèvis"
      ],
      [
        "https://recarganet-rd.pages.dev/",
        "RecargaNet RD",
        "Rechaj prepeye – devlopman ak similasyon, pa gen acha"
      ],
      [
        "https://by-maria-beauty-store.pages.dev/",
        "By María Beauty &amp; Store",
        "Bote ak kwafur nan Higüey"
      ],
      [
        "https://gewinnradar.pages.dev/",
        "GewinnRadar",
        "Konkou ak kalandriye Lavan"
      ],
      [
        "https://demoradar.pages.dev/",
        "DemoRadar",
        "Kalandriye manifestasyon nan Almay"
      ],
      [
        "https://ahorrord.pages.dev/",
        "AhorroRD",
        "Òf makèt ak konparezon pri"
      ],
      [
        "https://hablard.pages.dev/",
        "HablaRD",
        "Aprann panyòl dominiken"
      ],
      [
        "https://transporterd.pages.dev/",
        "TransporteRD",
        "Transpò piblik nan Repiblik Dominikèn"
      ],
      [
        "https://aprenderd.pages.dev/",
        "AprendeRD",
        "Kou ak fòmasyon"
      ],
      [
        "https://handyfix.pages.dev/",
        "HandyFix",
        "Konsèy ak èd pou telefòn"
      ],
      [
        "https://dateiwerk.pages.dev/",
        "DateiWerk",
        "Zouti pou fichye nan navigatè"
      ],
      [
        "https://voicefix.pages.dev/",
        "VoiceFix",
        "Èd pou pwoblèm chat vwa Valorant"
      ]
    ]
  }
};
const partnerLangs=['es',...locales];
const partnerPath=l=>(l==='es'?'':l+'/')+'partners.html';
const partnerHome=l=>'/'+(l==='es'?'':l+'/');
const partnerBase='https://islaviva-rd.pages.dev/';
const partnerMap=readFileSync(join(root,'sitemap.xml'),'utf8');
for(const l of partnerLangs){
 const file=partnerPath(l),h=readFileSync(join(root,file),'utf8'),copy=partnerCopy[l],url=partnerBase+file;
 const check=(condition,message)=>{if(!condition)fail(file,message)};
 check(h.includes('<html lang="'+l+'">'),'wrong language');
 check(h.includes('<title>'+copy.heading+' | IslaViva RD</title>'),'wrong title');
 check(h.includes('<meta name="description" content="'+copy.description+'">'),'wrong description');
 check(!/noindex/i.test(h),'unexpected noindex');
 check(h.includes('<link rel="canonical" href="'+url+'">'),'wrong canonical');
 check(h.includes('<main><h1>'+copy.heading+'</h1><p>'+copy.description+'</p>'),'wrong localized introduction');
 check(h.includes('<header><a href="'+partnerHome(l)+'">'+copy.home+'</a>'),'wrong home navigation');
 check(h.includes('<footer><a href="'+partnerHome(l)+'">'+copy.footer+'</a>'),'wrong footer navigation');
 const cards=[...h.matchAll(/<li><a href="([^"]+)"><strong>([^<]+)<\/strong><span>([^<]+)<\/span><\/a><\/li>/g)].map(m=>m.slice(1));
 check(JSON.stringify(cards)===JSON.stringify(copy.cards),'wrong localized project cards');
 check(cards.length===14&&new Set(cards.map(c=>c[0])).size===14&&!cards.some(c=>c[0]===partnerBase),'wrong partner count or self link');
 const entries=partnerMap.split('<url>').filter(x=>x.includes('<loc>'+url+'</loc>'));
 check(entries.length===1,'missing or duplicate sitemap entry');
 for(const other of [...partnerLangs,'x-default']){
  const dest=partnerPath(other==='x-default'?'es':other);
  check(h.includes('<link rel="alternate" hreflang="'+other+'" href="'+partnerBase+dest+'">'),'wrong alternate '+other);
  check(entries[0]?.includes('<xhtml:link rel="alternate" hreflang="'+other+'" href="'+partnerBase+dest+'"/>'),'wrong sitemap alternate '+other);
  if(other!=='x-default')check(h.includes('<a hreflang="'+other+'" href="/'+dest+'"'+(other===l?' aria-current="page"':'')+'>'),'wrong language navigation '+other);
 }
 console.log('Checked '+file+': static localized project directory');
}
if(!names.length)fail('repository','No HTML guides discovered');
if(errors){console.error(errors+' localization/SEO problems');process.exit(1)}
console.log('OK: localized guide pages and SEO metadata checked.');
