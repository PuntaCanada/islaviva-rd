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
 const errors=[];
 let stage='loading';
 page.on('pageerror',e=>errors.push(e.message));
 try{
  stage="loading homepage";
  const response=await page.goto(home(lang),{waitUntil:'domcontentloaded',timeout:35000});
  if(await page.locator('#city-welcome').count())throw Error('Unexpected blocking city welcome modal');
  const quick=page.locator('#city-quick-select');
  await quick.waitFor({timeout:10000});
  const quickLabel=await quick.innerText();
  if(!quickLabel.includes('📍'))throw Error('No optional city shortcut in header');
  stage="clicking city shortcut";
  await quick.click();
  await page.waitForTimeout(500);
  const focusDetails=await page.evaluate(()=>({active:document.activeElement?.id||'',cityExists:!!document.getElementById('city'),lang:document.documentElement.lang,pathname:location.pathname}));
  if(focusDetails.active!=='city')throw Error('City shortcut focus failed: '+JSON.stringify(focusDetails)+'; page errors: '+errors.join('; '));
  if((await page.evaluate(()=>localStorage.getItem('islaviva-city')))!==null)throw Error('Browsing without city choice should not store a preference');
  stage="choosing Higüey";
  await page.locator('#city').selectOption('Higüey');
  if((await page.evaluate(()=>localStorage.getItem('islaviva-city')))!=='Higüey')throw Error('Chosen city was not saved');
  if(response?.status()!==200)throw Error('Homepage returned HTTP '+response?.status());
  stage="waiting for weather";
  await page.waitForFunction(()=>document.querySelector('#weather-temp')?.textContent?.includes('°C')||document.querySelector('#weather-temp')?.textContent?.includes('°F'),{timeout:20000});
  const temp=await page.locator('#weather-temp').innerText();
  const renderedLang=await page.locator('html').getAttribute('lang');
  if(renderedLang!==lang)throw Error('Wrong rendered language '+renderedLang);
  if((await page.locator('#news-grid .story').count())<1)throw Error('News cards missing (neither preview nor live entries)');
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
   await page.locator('#language').selectOption('de');
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
 try{
  await page.goto(BASE+'/fr/',{waitUntil:'domcontentloaded',timeout:35000});
  if(new URL(page.url()).pathname!=='/fr/'||(await page.locator('html').getAttribute('lang'))!=='fr')throw Error('Direct French link was overridden');
  console.log('OK direct /fr/ link retains French despite saved English and German browser');
 }catch(e){failures++;console.error('FAIL direct locale: '+e.message)}
 finally{await context.close()}
}
await browser.close();
console.log('Browser regression failures: '+failures+' (five homepage checks and eight language routing checks)');
if(failures)process.exitCode=1;
