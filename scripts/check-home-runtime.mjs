// Catch regressions in the real inline homepage JavaScript, including broken
// initialization, while keeping the original dynamic weather and news features.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const locales=['es','de','en','fr','ht'];
let failures=0;
const fail=(file,reason)=>{failures++;console.error('FAIL',file,reason)};
for(const lang of locales){
 const file=lang==='es'?'index.html':lang+'/index.html';
 const html=readFileSync(file,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(m=>m[1]).filter(s=>s.trim()&&!s.trim().startsWith('{'));
 if(!scripts.length)fail(file,'missing executable scripts');
 for(const [i,script] of scripts.entries()){
  try{new vm.Script(script,{filename:file+'#script'+i})}
  catch(e){fail(file,'JavaScript syntax error: '+e.message)}
 }
 const js=scripts.join('\n');
 if(!js.includes("let lang='"+lang+"'"))fail(file,'wrong homepage language initialization');
 if(!/\nlet city=localStorage\.getItem\('islaviva-city'\)/.test(js))fail(file,'city initialization missing or commented out');
 if(!js.includes('function renderIslandWeather()'))fail(file,'weather rendering missing');
 if(!js.includes('function loadIslandWeather()'))fail(file,'weather fetching missing');
 if(!js.includes('loadIslandWeather();'))fail(file,'weather fetching never started');
 if(!html.includes('id="weather-temp"'))fail(file,'temperature display element missing');
 if(!js.includes("fetch('/data/weather.json'")&&!js.includes("fetch('./data/weather.json'"))fail(file,'weather data path missing');
 if(lang!=='es'&&js.includes("fetch('./data/weather.json'"))fail(file,'relative weather path invalid for localized page');
 for(const id of ['city','language','weather-summary','weather-icon','weather-details']){
  if(!html.includes('id="'+id+'"'))fail(file,'required weather or language control missing: '+id);
 }
 console.log('Checked '+file+': inline JS syntax, city initialization, weather data path and DOM nodes');
}
const weather=JSON.parse(readFileSync('data/weather.json','utf8'));
if(!weather.cities||!weather.cities['Higüey'])fail('data/weather.json','Higüey weather source missing');
if(failures)process.exit(1);
console.log('OK: homepage scripts and weather integration are structurally valid.');
