(()=>{
"use strict";
const lang=document.documentElement.lang.split("-")[0];
const labels={
es:["Avisos de electricidad","Buscar localidad, barrio o circuito","No hay avisos coincidentes. No significa que haya electricidad.","Publicaciones, no estado en vivo","Planes oficiales","Última actualización","No se pudieron cargar los datos"],
de:["Strommeldungen","Ort, Stadtviertel oder Stromkreis suchen","Keine passenden Meldungen. Das bedeutet nicht, dass Strom verfügbar ist.","Veröffentlichte Meldungen, kein Live-Status","Offizielle Wartungspläne","Letzte Aktualisierung","Daten konnten nicht geladen werden"],
en:["Electricity notices","Search town, neighborhood or circuit","No matching notices. This does not mean power is available.","Published notices, not live status","Official maintenance plans","Last update","Could not load data"],
fr:["Avis électriques","Rechercher ville, quartier ou circuit","Aucun avis correspondant. Cela ne signifie pas que le courant est disponible.","Avis publiés, pas de statut en direct","Plans de maintenance officiels","Dernière mise à jour","Impossible de charger les données"],
ht:["Avi sou elektrisite","Chèche vil, katye oswa sikwi","Pa gen avi ki koresponn. Sa pa vle di gen kouran.","Avi pibliye, se pa eta an dirèk","Plan antretyen ofisyèl","Dènye mizajou","Done yo pa disponib"]
}[lang]||[];
if(!labels.length)return;
const main=document.querySelector("main");if(!main)return;
const el=(tag,t)=>{const e=document.createElement(tag);if(t)e.textContent=t;return e};
const section=el("section");section.className="card";section.append(el("h2",labels[0]),el("p",labels[3]));
const input=el("input");input.type="search";input.placeholder=labels[1];input.setAttribute("aria-label",labels[1]);input.style.cssText="width:100%;padding:12px;font:inherit;box-sizing:border-box";
const stamp=el("p"),results=el("div"),plans=el("div"),scheduled=el("div");results.setAttribute("aria-live","polite");section.append(input,stamp,scheduled,results,el("h2",labels[4]),plans);main.insertBefore(section,main.querySelector(".cols")||null);
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function link(row,title){const p=el("p");let u;try{u=new URL(row.url)}catch{return p}if(u.protocol!=="https:")return p;const a=el("a",title);a.href=u.href;a.rel="noopener noreferrer";a.target="_blank";a.style.overflowWrap="anywhere";p.append(a);return p}
fetch("/data/local_notices.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{
stamp.textContent=labels[5]+": "+(d.updated||"—");
const rows=(d.items||[]).filter(x=>x.kind==="power"&&x.status==="published_unverified"&&Date.now()-Date.parse(x.published)>=0&&Date.now()-Date.parse(x.published)<=7*86400000);
const render=()=>{results.replaceChildren();scheduled.replaceChildren();const q=norm(input.value).trim();const scheduleLabel={es:"Cortes programados",de:"Geplante Abschaltungen",en:"Scheduled outages",fr:"Coupures programmées",ht:"Koupe kouran planifye"}[lang];scheduled.append(el("h2",scheduleLabel));const entries=((d.power_plans||{}).schedules||[]).filter(x=>x.status==="scheduled_not_live"&&Date.parse(x.date+"T"+x.end+":00-04:00")>Date.now()&&norm([x.area,x.circuit,x.source].join(" ")).includes(q)).sort((a,b)=>Number(norm(b.area).includes("higuey"))-Number(norm(a.area).includes("higuey"))||a.date.localeCompare(b.date));for(const x of entries)scheduled.append(link(x,x.area+" · "+x.circuit),el("p",x.date+" · "+x.start+"–"+x.end+" (UTC−4) · "+x.source));if(!entries.length)scheduled.append(el("p",labels[2]));const matches=rows.filter(x=>norm([x.title,x.preview,x.regions,x.source].join(" ")).includes(q)).sort((a,b)=>Number(norm([b.title,b.preview,b.regions].join(" ")).includes("higuey"))-Number(norm([a.title,a.preview,a.regions].join(" ")).includes("higuey")));if(!matches.length)results.append(el("p",labels[2]));for(const x of matches){results.append(link(x,(x.translations||{})[lang]||x.title),el("p",x.source+" · "+x.published));}};
input.addEventListener("input",render);render();
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santo_Domingo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
for(const x of (d.power_plans||{}).items||[]){if(x.status==="plan_reference_not_live"&&x.end_date>=today)plans.append(link(x,x.source+" · "+x.start_date+" – "+x.end_date))}
if(!plans.childElementCount)plans.append(el("p",labels[2]));
}).catch(()=>{results.textContent=labels[6]});
})();