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
const fixture={updated:new Date().toISOString(),source_status:'partial',items:[
  {title:'Hospital de Higüey amplía atención médica',source:'Diario Libre',url,
   category:'Salud',regions:['Higüey'],published:now,image:'',preview:'Se amplía la atención médica en la ciudad.',
   translations:{de:'Krankenhaus in Higüey erweitert medizinische Versorgung'}},
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
   ensure(await cards.count()===4,'expected four fixture news cards');
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
   await page.locator('#news-tabs [data-scope="all"]').click();
   ensure(await cards.count()===4,'return to all news failed');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
   ensure(!overflow,'horizontal viewport overflow on '+test.name);
   ensure(runtimeErrors.length===0,'browser JS errors: '+runtimeErrors.join('; '));
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
