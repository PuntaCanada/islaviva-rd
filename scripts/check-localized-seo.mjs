// Check each localized guide, reciprocal hreflang and sitemap without dependencies.
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd(),base='https://islaviva-rd.pages.dev';
const languages=['es','de','en','fr','ht'],pages=['ofertas-supermercados-rd.html','apagones-higuey.html'];
let failures=0;const error=(file,reason)=>{failures++;console.error('FAIL',file,reason)};
const url=(lang,page)=>base+'/'+(lang==='es'?'':lang+'/')+page;
const path=(lang,page)=>join(root,lang==='es'?'':lang,page);
const sitemap=readFileSync(join(root,'sitemap.xml'),'utf8');
for(const page of pages)for(const lang of languages){
 const file=path(lang,page),publicUrl=url(lang,page);
 if(!existsSync(file)){error(file,'file missing');continue}
 const html=readFileSync(file,'utf8');
 if(!html.includes('<html lang="'+lang+'">'))error(file,'wrong document language');
 if(!html.includes('<link rel="canonical" href="'+publicUrl+'">'))error(file,'non-self canonical');
 if(!html.includes('name="robots" content="index,follow"'))error(file,'not indexable');
 if(!html.includes('id="guide-language"'))error(file,'missing language picker');
 if(!sitemap.includes('<loc>'+publicUrl+'</loc>'))error(file,'missing sitemap URL');
 for(const target of languages){
  const alt='<link rel="alternate" hreflang="'+target+'" href="'+url(target,page)+'">';
  if(!html.includes(alt))error(file,'missing alternate '+target);
  const inMap='<xhtml:link rel="alternate" hreflang="'+target+'" href="'+url(target,page)+'"/>';
  if(!sitemap.includes(inMap))error(file,'missing sitemap alternate '+target);
 }
 if(!html.includes('hreflang="x-default" href="'+url('es',page)+'"'))error(file,'missing x-default');
 if(lang==='es'&&!html.includes('src="/guide-i18n.js"'))error(file,'Spanish guide no shared translation script');
 if(lang!=='es'){
  if(html.includes('src="/guide-i18n.js"'))error(file,'localized page still uses client translation');
  if(!html.includes('select.value=\''+lang+'\''))error(file,'language picker does not select current language');
  if(html.includes('<html lang="es">'))error(file,'not localized');
  const other=pages.find(p=>p!==page);
  if(!html.includes('href="/'+lang+'/'+other+'"'))error(file,'cross-link points to wrong language');
 }
 const title=(html.match(/<title>([^<]+)<\/title>/)||[])[1];
 if(!title||title.length<15)error(file,'missing descriptive title');
 console.log('Checked',lang,page);
}

for(const lang of languages){
 const file=join(root,lang==='es'?'':lang,'index.html');
 const publicUrl=base+'/'+(lang==='es'?'':lang+'/');
 if(!existsSync(file)){error(file,'localized homepage missing');continue}
 const html=readFileSync(file,'utf8');
 if(!html.includes('<html lang="'+lang+'">'))error(file,'wrong homepage document language');
 if(!html.includes('<link rel="canonical" href="'+publicUrl+'">'))error(file,'homepage canonical is not self-referencing');
 if(!sitemap.includes('<loc>'+publicUrl+'</loc>'))error(file,'homepage missing from sitemap');
 if(!html.includes('id="language"'))error(file,'missing language picker');
 if(!html.includes('id="shopping-cards"'))error(file,'shopping section missing');
 if(lang!=='es'&&html.includes('./data/'))error(file,'relative dynamic data path would break in subfolder');
 if(lang!=='es'&&!html.includes("let lang='"+lang+"'"))error(file,'homepage does not initialize selected locale');
 if(lang!=='es'&&!html.includes('href="/'+lang+'/ofertas-supermercados-rd.html"'))error(file,'no localized shopping guide link');
 for(const target of languages){
  const url=base+'/'+(target==='es'?'':target+'/');
  if(!html.includes('hreflang="'+target+'" href="'+url+'"'))error(file,'missing homepage hreflang '+target);
  if(!sitemap.includes('<xhtml:link rel="alternate" hreflang="'+target+'" href="'+url+'"/>'))error(file,'missing sitemap homepage hreflang '+target);
 }
 if(!html.includes('hreflang="x-default" href="'+base+'/"'))error(file,'missing homepage x-default');
 if(!html.includes('meta name="description"'))error(file,'missing homepage description');
 // Prevent one language homepage from losing existing interactive sections.
 const spanishHome=readFileSync(join(root,'index.html'),'utf8');
 const ids=source=>new Set([...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 const spanishIds=ids(spanishHome),localizedIds=ids(html);
 for(const id of spanishIds)if(!localizedIds.has(id))error(file,'missing homepage element #'+id);

}
if(failures){console.error(failures+' localized SEO issues');process.exit(1)}
console.log('OK: 15 localized guide and homepage URLs, canonical, reciprocal hreflang and sitemap.');
