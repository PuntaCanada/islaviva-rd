// Real-browser regression test of the deployed multilingual portal.
// Requires Playwright Chromium, installed in the dedicated GitHub workflow.
import {chromium} from 'playwright';
const BASE='https://islaviva-rd.pages.dev';
const languages=['es','de','en','fr','ht'];
const home=lang=>BASE+'/'+(lang==='es'?'':lang+'/');
let failures=0;
const browser=await chromium.launch({headless:true});
async function verify(lang){
 const context=await browser.newContext({locale:lang==='ht'?'fr-FR':lang==='es'?'es-DO':lang==='en'?'en-US':lang==='de'?'de-DE':'fr-FR'});
 const page=await context.newPage();
 page.setDefaultTimeout(8000);
 const errors=[];
 let stage='loading';
 page.on('pageerror',e=>errors.push(e.message));
 try{
  stage="loading homepage";
  const response=await page.goto(home(lang),{waitUntil:'domcontentloaded',timeout:35000});
  if(await page.locator('#city-welcome').count())throw Error('Unexpected blocking city welcome modal');
  // Direct flag buttons plus three languages in the secondary picker.
  if((await page.locator('[data-set-language="es"]').count())!==1||(await page.locator('[data-set-language="en"]').count())!==1)throw Error('Missing visible Spanish/English flag shortcuts');
  if((await page.locator('#language .language-more-list [data-set-language]').count())!==3)throw Error('Additional language menu must contain exactly three languages');
  for(const language of ['de','fr','ht'])if((await page.locator('#language [data-set-language="'+language+'"] img[src="/assets/flags/'+language+'.svg"]').count())!==1)throw Error('Missing menu flag '+language);
  await page.waitForFunction(()=>[...document.querySelectorAll('.language-flag')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000});
  const quick=page.locator('#city-quick-select');
  await quick.waitFor({timeout:10000});
  await quick.click();
  await page.locator('#city-chooser:not([hidden])').waitFor({timeout:8000});
  if((await page.locator('#city-chooser-grid [data-choose-city]').count())!==7)throw Error('City dialog must show seven supported cities');
  if((await page.evaluate(()=>localStorage.getItem('islaviva-city')))!==null)throw Error('Opening city dialog must not store a city');
  await page.locator('#city-chooser-grid [data-choose-city="Higüey"]').click();
  await page.locator('#city-chooser').waitFor({state:'hidden'});
  if((await page.evaluate(()=>localStorage.getItem('islaviva-city')))!=='Higüey')throw Error('Chosen city must be saved');
  await page.locator('#weather-city-change').click();
  await page.locator('#city-chooser:not([hidden])').waitFor();
  await page.locator('#city-chooser-grid [data-choose-city="Punta Cana"]').click();
  await page.waitForFunction(()=>document.querySelector('#city-status')?.textContent==='Punta Cana',null,{timeout:8000});
  await page.locator('#weather-city-change').click();
  await page.locator('#city-chooser-grid [data-choose-city="Higüey"]').click();
  if(response?.status()!==200)throw Error('Homepage returned HTTP '+response?.status());
  stage="waiting for weather";
  const weatherState=await page.evaluate(async()=>{
    const response=await fetch('/data/weather.json',{cache:'no-store'});
    const forecast=await response.json();
    const record=forecast.cities?.['Higüey'];
    const age=Date.now()-Date.parse(record?.updated||'');
    return {fresh:response.ok && Number.isFinite(age) && age<=6*3600000 && age>=-1800000 && Number.isFinite(Number(record?.temperature_c)),ageHours:Math.round(age/3600000)};
  });
  if(weatherState.fresh){
    await page.waitForFunction(()=>document.querySelector('#weather-temp')?.textContent?.includes('°C')||document.querySelector('#weather-temp')?.textContent?.includes('°F'),null,{timeout:8000});
  }else{
    await page.waitForFunction(()=>document.querySelector('#weather-temp')?.textContent==='--°',null,{timeout:8000});
    console.warn('WARN',lang,'weather source is stale ('+weatherState.ageHours+'h); UI correctly hides stale reading');
  }
  const temp=await page.locator('#weather-temp').innerText();
  const renderedLang=await page.locator('html').getAttribute('lang');
  if(renderedLang!==lang)throw Error('Wrong rendered language '+renderedLang);
  if((await page.locator('#news-grid .story').count())<1)throw Error('News cards missing (neither preview nor live entries)');
  await page.locator('#news-personalize-button').click();
  const gamingInterest=page.locator('#news-preferences-choices [data-interest="gaming"]');
  if((await gamingInterest.count())!==1)throw Error('Gaming & Tech news interest missing');
  if(!(await gamingInterest.isChecked()))throw Error('Gaming & Tech should be enabled by default');
  for(const topic of ['health','science','education','safety','traffic']){
   const checkbox=page.locator('#news-preferences-choices [data-interest="'+topic+'"]');
   if((await checkbox.count())!==1)throw Error('Missing new news interest '+topic);
   if(!(await checkbox.isChecked()))throw Error('New interest '+topic+' should be enabled by default');
  }
  // User-selected preferences must be saved and respected.
  const healthCheckbox=page.locator('#news-preferences-choices [data-interest="health"]');
  await healthCheckbox.uncheck();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('islaviva-news-interests-v3')||'null'));
  if(!Array.isArray(stored)||stored.includes('health')||!stored.includes('science'))throw Error('New interests are not saved correctly');
  await healthCheckbox.check();

  await page.locator('#news-personalize-button').click();
  const gta=page.locator('#news-grid .story').filter({hasText:'GTA VI'});
  if(await gta.count()){
   const actual=await gta.first().innerText();
   const expected={es:'Gaming y tecnología',de:'Gaming & Technik',en:'Gaming & Tech',fr:'Jeux vidéo & tech',ht:'Jwèt videyo & teknoloji'}[lang];
   if(!actual.includes(expected))throw Error('GTA VI should appear under '+expected);
  }

  if((await page.locator('#compras .iv-brand').count())!==3)throw Error('Expected exactly three merchant cards');
  // Local links must reflect the selected municipality, with no invented live status.
  await page.waitForFunction(()=>document.querySelectorAll('#regional-sources-grid .regional-source-card').length>=3);
  if(!(await page.locator('#regional-sources-grid').innerHTML()).includes('ayuntamientohiguey.gob.do'))throw Error('Missing Higüey municipal sources');
  if((await page.locator('#regional-sources-grid .regional-source-card').count())!==5)throw Error('Higüey should display two local and three national sources');
  stage="selecting Punta Cana";
  await page.locator('#city').selectOption('Punta Cana');
  await page.waitForFunction(()=>document.querySelector('#city-status')?.textContent==='Punta Cana');
  await page.waitForFunction(()=>document.querySelector('#regional-sources-grid')?.textContent?.includes('') && [...document.querySelectorAll('#regional-sources-grid a')].some(a=>a.href.includes('avpc.gob.do')));
  if((await page.locator('#regional-sources-grid .regional-source-card').count())!==5)throw Error('Punta Cana should display two local and three national sources');
  if((await page.locator('#regional-sources-grid a[href*="ayuntamientohiguey.gob.do"]').count())!==0)throw Error('Higüey-only authority shown for Punta Cana');
  stage="selecting Santiago";
  await page.locator('#city').selectOption('Santiago');
  await page.waitForFunction(()=>document.querySelector('#city-status')?.textContent==='Santiago');
  if((await page.locator('#regional-sources-grid .regional-source-card').count())!==3)throw Error('Other cities should only display national authority links');
  await page.locator('#city').selectOption('Punta Cana');
  await page.waitForFunction(()=>document.querySelector('#weather-temp')?.textContent?.includes('°'));
  if(!(await page.locator('#shopping-guide-link').getAttribute('href'))?.includes((lang==='es'?'/':'/'+lang+'/')+'ofertas-supermercados-rd.html'))throw Error('Wrong localized shopping link');
  if(errors.length)throw Error('Uncaught browser errors: '+errors.slice(0,3).join('; '));
  console.log('OK',lang,'weather',temp,'news, merchant cards, city choice, guide link');
  if(lang==='es'){
   await page.locator('[data-set-language="en"]').click();
   await page.waitForURL(BASE+'/en/',{timeout:15000});
   if((await page.locator('html').getAttribute('lang'))!=='en')throw Error('Direct English flag failed');
   await page.locator('[data-set-language="es"]').click();
   await page.waitForURL(BASE+'/',{timeout:15000});
   await page.locator('#language summary').click();
   await page.locator('#language [data-set-language="de"]').click();
   await page.waitForURL(BASE+'/de/',{timeout:15000});
   if((await page.locator('html').getAttribute('lang'))!=='de')throw Error('Language switch did not preserve German');
   console.log('OK language navigation es → de');
  }
 }catch(e){
  failures++;
  const snapshot=await page.evaluate(()=>({
    path:location.pathname,
    city:document.querySelector('#city-status')?.textContent,
    temperature:document.querySelector('#weather-temp')?.textContent,
    regionalCards:document.querySelectorAll('#regional-sources-grid .regional-source-card').length,
    newsCards:document.querySelectorAll('#news-grid .story').length
  })).catch(()=>({}));
  console.error('FAIL',lang,'stage='+stage,e.message,'state='+JSON.stringify(snapshot),'browserErrors='+errors.join('; '));
 }
 finally{await context.close()}
}
for(const lang of languages)await verify(lang);
async function checkHomeLanguage(locale, choice, expected){
 const context=await browser.newContext({locale});
 if(choice){
  await context.addInitScript(value=>localStorage.setItem('islaviva-language-choice',value),choice);
 }
 const page=await context.newPage();
 page.setDefaultTimeout(8000);
 try{
  const navigated=await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:35000});
  await page.waitForURL(home(expected),{timeout:15000});
  if((await page.locator('html').getAttribute('lang'))!==expected)throw Error('Wrong language after redirect');
  console.log('OK root browser locale='+locale+', chosen='+(choice||'none')+' => '+expected);
 }catch(e){failures++;console.error('FAIL root locale '+locale+' preference '+(choice||'none')+': '+e.message)}
 finally{await context.close()}
}
await checkHomeLanguage('de-DE',null,'de');
await checkHomeLanguage('en-US',null,'en');
await checkHomeLanguage('fr-FR',null,'fr');
await checkHomeLanguage('es-DO',null,'es');
await checkHomeLanguage('it-IT',null,'es');
await checkHomeLanguage('de-DE','fr','fr');
await checkHomeLanguage('en-US','es','es');
// Explicit locale links must override browser language and saved choices.
{
 const context=await browser.newContext({locale:'de-DE'});
 await context.addInitScript(()=>localStorage.setItem('islaviva-language-choice','en'));
 const page=await context.newPage();
 page.setDefaultTimeout(8000);
 try{
  await page.goto(BASE+'/fr/',{waitUntil:'domcontentloaded',timeout:35000});
  if(new URL(page.url()).pathname!=='/fr/'||(await page.locator('html').getAttribute('lang'))!=='fr')throw Error('Direct French link was overridden');
  console.log('OK direct /fr/ link retains French despite saved English and German browser');
 }catch(e){failures++;console.error('FAIL direct locale: '+e.message)}
 finally{await context.close()}
}
// Compact mobile navigation must keep flags, language menu and city changer usable.
for(const width of [375,320]){
 const context=await browser.newContext({locale:'es-DO',viewport:{width,height:740},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 try{
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:35000});
  const ids=['[data-set-language="es"]','[data-set-language="en"]','#language summary','#city-quick-select'];
  for(const selector of ids){
   const rect=await page.locator(selector).boundingBox();
   if(!rect||rect.x<0||rect.x+rect.width>width+3)throw Error(selector+' is outside '+width+'px viewport: '+JSON.stringify(rect));
  }
  await page.locator('#city-quick-select').click();
  await page.locator('#city-chooser:not([hidden])').waitFor({timeout:8000});
  await page.locator('#city-chooser-grid [data-choose-city="Punta Cana"]').click();
  await page.waitForFunction(()=>document.querySelector('#city-status')?.textContent==='Punta Cana',null,{timeout:8000});
  console.log('OK mobile '+width+'px: visible flags, language menu, city choice');
 }catch(e){failures++;console.error('FAIL mobile '+width+'px:',e.message)}
 finally{await context.close()}
}
await browser.close();
console.log('Browser regression failures: '+failures+' (five homepage checks and eight language routing checks)');
if(failures)process.exitCode=1;
