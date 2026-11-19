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
 page.on('pageerror',e=>errors.push(e.message));
 try{
  const response=await page.goto(home(lang),{waitUntil:'domcontentloaded',timeout:35000});
  await page.locator('#city-welcome:not([hidden])').waitFor({timeout:10000});
  if((await page.locator('#city-welcome-options button').count())!==7)throw Error('Expected seven first-visit city choices');
  await page.locator('#city-welcome-options [data-city-choice="Higüey"]').click();
  await page.locator('#city-welcome[hidden]').waitFor();
  const savedCity=await page.evaluate(()=>localStorage.getItem('islaviva-city'));
  if(savedCity!=='Higüey')throw Error('Initial city choice was not saved');
  if(response?.status()!==200)throw Error('Homepage returned HTTP '+response?.status());
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
  await page.locator('#city').selectOption('Punta Cana');
  await page.waitForFunction(()=>document.querySelector('#city-status')?.textContent==='Punta Cana');
  await page.waitForFunction(()=>document.querySelector('#regional-sources-grid')?.textContent?.includes('') && [...document.querySelectorAll('#regional-sources-grid a')].some(a=>a.href.includes('avpc.gob.do')));
  if((await page.locator('#regional-sources-grid .regional-source-card').count())!==5)throw Error('Punta Cana should display two local and three national sources');
  if((await page.locator('#regional-sources-grid a[href*="ayuntamientohiguey.gob.do"]').count())!==0)throw Error('Higüey-only authority shown for Punta Cana');
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
 }catch(e){failures++;console.error('FAIL',lang,e.message)}
 finally{await context.close()}
}
for(const lang of languages)await verify(lang);
await browser.close();
console.log('Browser results: '+(languages.length-failures)+'/'+languages.length+' language homepages passed');
if(failures)process.exitCode=1;
