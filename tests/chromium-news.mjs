/**
 * Real Chromium smoke/regression tests for IslaViva.
 * Uses synthetic, explicitly labeled fixture headlines; never writes them
 * to data/news.json or exposes them to the public website.
 */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const base='http://127.0.0.1:8765';
const cases=[
  {name:'desktop',viewport:{width:1440,height:900},isMobile:false},
  {name:'phone',viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2,hasTouch:true}
];
const now=new Date(Date.now()-10*60*1000).toISOString();
const url='https://www.diariolibre.com/pruebas/islaviva-demo';
const fixture={updated:new Date().toISOString(),source_status:'partial',source_diagnostics:{feeds_successful:3,feeds_configured:4,publishers:{'Diario Libre':1,'El Día':1,'Noticias SIN':1,'AlMomento':1},with_image_url:0,with_region:2},failed_feeds:[{source:'Hoy',url:'https://hoy.com.do/feed/',reason:'HTTPError'}],items:[
  {title:'Hospital de Higüey amplía atención médica',source:'Diario Libre',url,
   category:'Salud',regions:['Higüey'],published:now,image:'',preview:'Se amplía la atención médica en la ciudad.',
   translations:{de:'Krankenhaus in Higüey erweitert medizinische Versorgung',en:'Hospital expands medical services'},
   preview_translations:{de:'Die medizinische Versorgung wird ausgeweitet.',en:'Hospital is undergoing expansion.'}},
  {title:'Turismo en Punta Cana impulsa la economía',source:'El Día',
   url:'https://eldia.com.do/pruebas/turismo-isla',category:'Turismo',regions:['Punta Cana'],
   published:now,image:'',preview:'El turismo crece en la región.'},
  {title:'Los equipos preparan un partido de béisbol',source:'Noticias SIN',
   url:'https://noticiassin.com/pruebas/deportes-isla',category:'Deportes',regions:[],
   published:now,image:'',preview:'Los equipos deportivos preparan el encuentro.'},
  {title:'El comercio informa nuevas medidas nacionales',source:'AlMomento',
   url:'https://almomento.net/pruebas/economia-isla',category:'Economía',regions:[],
   published:now,image:'',preview:'Una medida nacional afecta al comercio.'}
]};
function ensure(ok,message){if(!ok)throw new Error(message);}
await mkdir('artifacts/chromium',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failures=0;
try{
 for(const test of cases){
  const context=await browser.newContext({...test,locale:'es-DO',timezoneId:'America/Santo_Domingo'});
  const page=await context.newPage();
  const runtimeErrors=[];
  page.on('pageerror',error=>runtimeErrors.push(error.message));
  await page.route('**/*',async route=>{
    const requested=route.request().url();
    if(requested.includes('/data/news.json')){
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)});return;
    }
    if(requested.startsWith(base)){await route.continue();return;}
    await route.abort();
  });
  try{
   await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
   let cards=page.locator('#news-grid a.story');
   const actualCount=await cards.count();
   if(actualCount!==4){
     console.error('DEBUG '+test.name+' visible='+actualCount+' titles='+JSON.stringify(await cards.locator('h3').allTextContents()));
     console.error('DEBUG newsGrid='+String(await page.locator('#news-grid').innerText()).slice(0,1200));
   }
   ensure(actualCount===4,'expected four fixture news cards, got '+actualCount);
   const health=page.locator('#news-feed-health');
   ensure(await health.count()===1,'RSS health panel missing');
   ensure(await health.getAttribute('data-status')==='partial','RSS partial status hidden');
   ensure((await health.innerText()).includes('3/4') && (await health.innerText()).includes('Hoy'),'RSS counts or failed publisher missing');
   ensure(await health.getAttribute('role')==='status','RSS source status inaccessible');
   ensure(await page.locator('#news-grid time[datetime]').count()===4,'accessible publication timestamps missing');
   ensure(await page.locator('#news-grid .news-illustration svg').count()===4,'licensed-free SVG fallback missing');
   ensure(await page.locator('#news-grid img').count()===0,'unlicensed publisher images were shown');
   const svgIds=await page.locator('#news-grid svg defs [id]').evaluateAll(nodes=>nodes.map(n=>n.id));
   ensure(svgIds.length>0 && new Set(svgIds).size===svgIds.length,'duplicate SVG resource IDs');
   ensure((await page.locator('#news-grid a.story').first().getAttribute('href'))===url,'news article does not link to original');
   await page.locator('#news-category').selectOption('Salud');
   ensure(await cards.count()===1,'news topic filter failed');
   await page.locator('#news-category').selectOption('all');
   await page.locator('#news-source').selectOption('El Día');
   ensure(await cards.count()===1,'publisher filter failed');
   await page.locator('#news-source').selectOption('all');
   await page.locator('#news-tabs [data-scope="local"]').click();
   ensure(await cards.count()===1,'Higüey local-only filter failed');
   ensure((await cards.first().innerText()).includes('Higüey'),'wrong city shown in local-only filter');
   // Real keyboard navigation must activate a filter without a mouse.
   await page.locator('#news-tabs [data-scope="all"]').focus();
   await page.keyboard.press('Enter');
   ensure(await cards.count()===4,'keyboard activation of all-news tab failed');
   ensure(await page.locator('main').count()===1,'page landmark is missing');
   ensure(await page.locator('html').getAttribute('lang')==='es','Spanish locale is missing');
   // The German homepage reuses the same fixture but must present its translated
   // content and retain accessible source links.
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
   ensure(await page.locator('html').getAttribute('lang')==='de','German locale is missing');
   ensure((await page.locator('#news-grid').innerText()).includes('Krankenhaus in Higüey'),'German translated headline missing');
   ensure((await page.locator('#news-grid').innerText()).includes('Die medizinische Versorgung wird ausgeweitet.'),'Valid German teaser missing');
   ensure((await page.locator('#news-feed-health').innerText()).includes('teilweise'),'German RSS health text missing');
   ensure(await page.locator('#news-grid time[datetime]').count()===4,'German article publication timestamp missing');
   for(const locale of ['en','fr','ht']){
     await page.goto(base+'/'+locale+'/',{waitUntil:'domcontentloaded'});
     await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
     ensure(await page.locator('html').getAttribute('lang')===locale,'wrong document locale '+locale);
     ensure(await page.locator('#news-grid a.story').count()===4,'news cards missing in '+locale);
     if(locale==='en'){
       const text=await page.locator('#news-grid').innerText();
       ensure(text.includes('Hospital de Higüey amplía atención médica'),'Broken English translation losing Higüey was incorrectly accepted');
       ensure(!text.includes('Hospital is undergoing expansion.'),'English teaser shown under an untrusted translation');
     }
     ensure(await page.locator('#news-feed-health').getAttribute('data-status')==='partial','feed-health missing in '+locale);
     ensure((await page.locator('#news-feed-health').innerText()).includes('3/4'),'feed statistics missing in '+locale);
     ensure(await page.locator('#news-category').getAttribute('aria-label')!==null,'topic filter lacks accessible label');
     ensure(await page.locator('#news-source').getAttribute('aria-label')!==null,'source filter lacks accessible label');
   }
   // Simulate an interrupted updater without altering any on-disk news data.
   fixture.updated=new Date(Date.now()-8*3600000).toISOString();
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-feed-health').waitFor();
   await page.waitForFunction(()=>document.querySelector('#news-feed-health')?.dataset.status==='stale');
   ensure((await page.locator('#news-feed-health').innerText()).includes('verspätet'),'old RSS snapshot not flagged in German');
   fixture.updated=new Date().toISOString();
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
   ensure(await page.locator('#news-feed-health').getAttribute('data-status')==='partial','fresh RSS status did not recover');
   // Reproduce a valid import where every original report has aged out.
   // Stale content must NOT remain on screen when the JSON refreshes.
   const originalDates=fixture.items.map(item=>item.published);
   for(const item of fixture.items)item.published=new Date(Date.now()-49*3600000).toISOString();
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid .news-empty').waitFor({timeout:20000});
   ensure(await page.locator('#news-grid a.story').count()===0,'expired reports remained visible');
   fixture.items.forEach((item,index)=>{item.published=originalDates[index]});
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
   ensure(await page.locator('#news-grid a.story').count()===4,'headlines did not recover after fresh import');
   // A successful HTTP 200 RSS response with zero items must clear old cards.
   // This differs from an unavailable RSS endpoint, which is an error.
   const savedItems=fixture.items;
   fixture.items=[];
   fixture.source_status='no_recent_articles';
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid .news-empty').waitFor({timeout:20000});
   ensure(await page.locator('#news-grid a.story').count()===0,'valid zero-item RSS left stale news visible');
   ensure(await page.locator('#news-controls').isHidden(),'zero-item RSS left irrelevant filters visible');
   fixture.items=savedItems;
   fixture.source_status='partial';
   await page.goto(base+'/de/',{waitUntil:'domcontentloaded'});
   await page.locator('#news-grid a.story').first().waitFor({timeout:20000});
   ensure(await page.locator('#news-grid a.story').count()===4,'zero-item RSS recovery failed');
   const links=await page.locator('#news-grid a.story').evaluateAll(nodes=>nodes.map(x=>({
      target:x.getAttribute('target'),rel:x.getAttribute('rel'),href:x.href
   })));
   ensure(links.every(x=>x.target==='_blank'&&x.rel.includes('noopener')&&x.rel.includes('noreferrer')),'source link safety attributes missing');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
   ensure(!overflow,'horizontal viewport overflow on '+test.name);
   ensure(runtimeErrors.length===0,'browser JS errors: '+runtimeErrors.join('; '));
   const timings=await page.evaluate(()=>{const p=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:Math.round(p?.domContentLoadedEventEnd||0),bodyScrollWidth:document.body.scrollWidth,viewportWidth:innerWidth};});
   console.log('METRICS '+test.name+' '+JSON.stringify(timings));
   await page.screenshot({path:'artifacts/chromium/'+test.name+'-news.png',fullPage:true,animations:'disabled'});
   console.log('PASS '+test.name+': news cards, illustrations, filters, local order, timestamps, viewport and JS errors');
  }catch(e){
   failures++;
   console.error('FAIL '+test.name+': '+e.message);
   await page.screenshot({path:'artifacts/chromium/'+test.name+'-failure.png',fullPage:true}).catch(()=>{});
  }finally{await context.close();}
 }
}finally{await browser.close();}
if(failures)process.exit(1);
