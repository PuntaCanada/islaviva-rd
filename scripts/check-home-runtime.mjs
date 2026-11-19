// Shared-homepage runtime regression tests, no extra dependencies.
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const languages=['es','de','en','fr','ht'];
let errors=0;
function fail(subject,message){errors++;console.error('FAIL '+subject+': '+message)}
function load(path){if(!existsSync(path)){fail(path,'missing file');return ''}return readFileSync(path,'utf8')}
const js=load('assets/home-app.js');
const css=load('assets/home.css');
const languageRouter=load('assets/language-home.js');
try{new vm.Script(languageRouter,{filename:'assets/language-home.js'})}catch(e){fail('assets/language-home.js','syntax: '+e.message)}
if(!languageRouter.includes("islaviva-language-choice"))fail('language routing','user preference not checked');
if(!languageRouter.includes('navigator.languages'))fail('language routing','browser languages ignored');
if(!languageRouter.includes("location.pathname!=='/'"))fail('language routing','missing root-only redirect guard');
if(js.includes("localStorage.setItem('islaviva-language',lang)"))fail('language routing','opening a page overwrites explicit language choice');

if(js){try{new vm.Script(js,{filename:'assets/home-app.js'})}catch(e){fail('assets/home-app.js','syntax: '+e.message)}}
if(!css.includes('.statusbar'))fail('assets/home.css','weather bar styling missing');
if(!js.includes("let lang=document.documentElement.lang||'es'"))fail('shared runtime','page locale initialization missing');
if(!js.includes('function renderIslandWeather()')||!js.includes('function loadIslandWeather()'))fail('shared runtime','weather loading/rendering missing');
if(!js.includes('loadIslandWeather();')||!js.includes('setInterval(loadIslandWeather,30*60*1000)'))fail('shared runtime','weather loading or refresh missing');
if(!js.includes("if(!validCities.includes(city))"))fail('shared runtime','invalid saved city not handled');
const requiredModules=['loadAutoNews();','loadFuelPrices();','loadLocalBulletins();','loadRoadNotices();','renderShopping();','renderWaze();'];
for(const marker of requiredModules)if(!js.includes(marker))fail('shared runtime','missing '+marker);
const fetchPaths=[...js.matchAll(/fetch\(\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
for(const url of fetchPaths)if(!url.startsWith('/')&&!/^https?:\/\//.test(url))fail('shared runtime','relative fetch breaks localized homepages: '+url);
const originalIds=new Set();
for(const locale of languages){
 const path=locale==='es'?'index.html':locale+'/index.html';
 const html=load(path);
 if(!html.includes('<html lang="'+locale+'">'))fail(path,'incorrect language');
 if(!html.includes('href="/assets/home.css"'))fail(path,'shared CSS not loaded');
 if(!html.includes('src="/assets/language-home.js"'))fail(path,'language routing script missing');
 if(!html.includes('src="/assets/home-app.js"'))fail(path,'shared JS not loaded');
 if(/<script>([\s\S]*?)<\/script>/i.test(html))fail(path,'unexpected inline app script');
 if(/<style>([\s\S]*?)<\/style>/i.test(html))fail(path,'unexpected inline style');
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 if(locale==='es')for(const id of ids)originalIds.add(id);
 else for(const id of originalIds)if(!ids.has(id))fail(path,'missing interactive DOM element #'+id);
 for(const id of ['weather-temp','weather-summary','weather-icon','weather-details','city','language','shopping-cards'])if(!ids.has(id))fail(path,'required element missing #'+id);
 console.log('Checked '+path+': shared assets, locale, UI elements');
}
const weather=JSON.parse(load('data/weather.json')||'{}');
if(!weather.cities?.['Higüey']||!Number.isFinite(Number(weather.cities['Higüey'].temperature_c)))fail('weather data','Higüey reading missing');
if(errors){console.error(errors+' homepage regression errors');process.exit(1)}
console.log('OK: all five homepages share one tested CSS and JS runtime.');
