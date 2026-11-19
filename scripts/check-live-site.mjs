// Live deployment smoke test for IslaViva RD.
// Runs against Cloudflare Pages, not the GitHub source tree. No dependencies.
const BASE='https://islaviva-rd.pages.dev';
const languages=['es','de','en','fr','ht'];
const guides=['ofertas-supermercados-rd.html','apagones-higuey.html'];
const url=(language,page='')=>BASE+'/'+(language==='es'?'':language+'/')+page;
let failures=0,warnings=0;
function fail(message){failures++;console.error('FAIL:',message)}
function warn(message){warnings++;console.warn('WARN:',message)}
async function fetchText(path){
 const target=BASE+path;
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(target,{redirect:'follow',signal:controller.signal,headers:{'Accept':'text/html,application/json,application/xml,text/css,*/*'}});
  const content=await response.text();
  if(!response.ok)fail(path+' returned HTTP '+response.status);
  if(!response.url.startsWith(BASE+'/'))fail(path+' redirected offsite');
  if(!content.trim())fail(path+' returned empty body');
  return response.ok?content:'';
 }catch(error){fail(path+' could not be loaded: '+error.message);return ''}
 finally{clearTimeout(timeout)}
}
function metadata(html,language,path){
 if(!html)return;
 const full=url(language,path);
 const htmlLang=html.match(/<html\s+lang="([^"]+)"/i)?.[1];
 if(htmlLang!==language)fail(full+' html language is '+htmlLang);
 if(!html.includes('<link rel="canonical" href="'+full+'">'))fail(full+' canonical mismatch');
 for(const alternate of languages){
  if(!html.includes('hreflang="'+alternate+'" href="'+url(alternate,path)+'"'))fail(full+' missing '+alternate+' alternate');
 }
 if(!html.includes('hreflang="x-default" href="'+url('es',path)+'"'))fail(full+' missing default alternate');
 const title=html.match(/<title>([^<]*)<\/title>/i)?.[1];
 if(!title||title.length<20)fail(full+' has missing/short title');
}
for(const language of languages){
 const home=await fetchText('/'+(language==='es'?'':language+'/'));
 metadata(home,language,'');
 if(home){
  for(const id of ['weather-temp','weather-summary','city','language','news-grid','shopping-guide-link']){
   if(!home.includes('id="'+id+'"'))fail(language+' homepage missing #'+id);
  }
  if(!home.includes('src="/assets/home-app.js"'))fail(language+' missing shared app');
  if(!home.includes('href="/assets/home.css"'))fail(language+' missing shared CSS');
  if(!home.includes('href="/'+(language==='es'?'':language+'/')+'ofertas-supermercados-rd.html"'))fail(language+' links to wrong offers guide');
  if(!home.includes('href="/'+(language==='es'?'':language+'/')+'apagones-higuey.html"'))fail(language+' links to wrong outage guide');
 }
 for(const guide of guides){
  const html=await fetchText('/'+(language==='es'?'':language+'/')+guide);
  metadata(html,language,guide);
  if(html&&!html.includes('id="guide-language"'))fail(language+' '+guide+' has no language picker');
 }
}
const app=await fetchText('/assets/home-app.js');
if(app&&!app.includes('function loadIslandWeather()'))fail('Shared runtime lacks weather loading');
const css=await fetchText('/assets/home.css');
if(css&&!css.includes('.statusbar'))fail('Shared CSS lacks status bar');
const sm=await fetchText('/sitemap.xml');
if(sm){for(const language of languages){for(const g of ['',...guides]){if(!sm.includes('<loc>'+url(language,g)+'</loc>'))fail('Sitemap missing '+url(language,g))}}}
const weather=await fetchText('/data/weather.json');
if(weather){try{const obj=JSON.parse(weather);if(!Number.isFinite(Number(obj?.cities?.['Higüey']?.temperature_c)))fail('Weather JSON has no numeric Higüey temperature');const age=Date.now()-Date.parse(obj.updated||'');if(!Number.isFinite(age))fail('Weather timestamp invalid');else if(age>24*3600*1000)warn('Weather snapshot older than 24 hours');}catch(e){fail('Weather JSON invalid: '+e.message)}}
const news=await fetchText('/data/news.json');
if(news){try{const feed=JSON.parse(news);if(!Array.isArray(feed.items))fail('News JSON does not contain items array');else if(!feed.items.length)warn('News feed has zero items');}catch(e){fail('News JSON invalid: '+e.message)}}
console.log('Checked 15 public pages, shared assets, sitemap, weather and news.');
console.log('Failures:',failures,'Warnings:',warnings);
if(failures)process.exitCode=1;
