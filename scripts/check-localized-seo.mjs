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
if(failures){console.error(failures+' localized SEO issues');process.exit(1)}
console.log('OK: 10 guide URLs, canonical, reciprocal hreflang and sitemap.');
