// Build all localized homepage HTML from the single Spanish source of truth.
// Usage: node scripts/build-homepages.mjs [--check]
// No dependencies; generated files retain static localized SEO text.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const source=readFileSync(join(root,'index.html'),'utf8');
const cfg=JSON.parse(readFileSync(join(root,'home-locales.json'),'utf8'));
const locales=['de','en','fr','ht'];
const textPattern=/<([a-z][\w-]*)\b([^>]*\bdata-t(?:-html)?="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi;
const htmlSourceKeys=[...source.matchAll(textPattern)].map(m=>m[3]);
const headPatterns={
 title:/<title>[^<]*<\/title>/,
 description:/<meta name="description" content="[^"]*">/,
 canonical:/<link rel="canonical" href="[^"]*">/,
 ogLocale:/<meta property="og:locale" content="[^"]*">/,
 ogTitle:/<meta property="og:title" content="[^"]*">/,
 ogDescription:/<meta property="og:description" content="[^"]*">/,
 ogUrl:/<meta property="og:url" content="[^"]*">/
};
function build(language){
 const data=cfg.locales?.[language];
 if(!data)throw Error('Missing locale configuration: '+language);
 for(const key of htmlSourceKeys)if(!Object.hasOwn(data.text,key))throw Error('Missing '+language+' homepage translation: '+key);
 let html=source.replace('<html lang="es">','<html lang="'+language+'">');
 if(html===source)throw Error('Spanish template has no <html lang="es">');
 for(const [key,pattern] of Object.entries(headPatterns)){
  if(!html.match(pattern)||!data.head[key])throw Error('Missing '+language+' metadata: '+key);
  html=html.replace(pattern,data.head[key]);
 }
 html=html.replace(textPattern,(full,tag,attrs,key)=>
  '<'+tag+attrs+'>'+data.text[key]+'</'+tag+'>');
 for(const page of ['ofertas-supermercados-rd','apagones-higuey']){
  html=html.replaceAll('href="/'+page+'.html"','href="/'+language+'/'+page+'.html"');
 }
 html=html.replaceAll('href="/descubre/"','href="/'+language+'/descubre/"');
 html=html.replace('href="/partners.html">Nuestros proyectos','href="/'+language+'/partners.html">'+({de:'Unsere Projekte',en:'Our projects',fr:'Nos projets',ht:'Pwojè nou yo'})[language]);
 return html;
}
let failures=0;
for(const lang of locales){
 const path=join(root,lang,'index.html');
 const generated=build(lang);
 if(process.argv.includes('--check')){
  let actual;
  try{actual=readFileSync(path,'utf8')}catch(e){actual=''}
  if(actual!==generated){failures++;console.error('OUT OF DATE: '+lang+'/index.html — run node scripts/build-homepages.mjs')}
  else console.log('OK: '+lang+'/index.html matches the shared source');
 }else{writeFileSync(path,generated,'utf8');console.log('Generated '+lang+'/index.html')}
}
if(failures)process.exit(1);
