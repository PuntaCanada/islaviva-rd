// Zero-dependency quality check for IslaViva RD's five-language guides.
// A new content page must be localized before it can pass CI.
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const locales=['de','en','fr','ht'];
const source=readFileSync(join(root,'guide-i18n.js'),'utf8');
const match=source.match(/const dictionary=(\{.*?\});\s*const labels=/s);
if(!match){console.error('Cannot load guide translation dictionary');process.exit(1)}
const dict=JSON.parse(match[1]);
const exempt=new Set(['index.html','404.html']);
const names=readdirSync(root).filter(f=>f.endsWith('.html')&&!exempt.has(f)&&!/^google[a-z0-9]+\.html$/i.test(f));
let errors=0;
function fail(file,msg){errors++;console.error('FAIL '+file+': '+msg)}
for(const name of names){
 const html=readFileSync(join(root,name),'utf8');
 if(!/<main[\s>]/i.test(html))continue; // only actual guide/content pages
 if(!html.includes('id="guide-language"'))fail(name,'missing language selector');
 if(!html.includes('src="/guide-i18n.js"'))fail(name,'missing shared translation script');
 if(!html.includes('rel="canonical"'))fail(name,'missing canonical URL');
 if(!html.includes('name="robots" content="index,follow"'))fail(name,'missing indexability tag');
 if(!html.includes('href="/"'))fail(name,'missing home navigation');
 const body=(html.split('<body>')[1]||'').split('</body>')[0]
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 const textNodes=[...body.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim()).filter(x=>x&&/[a-záéíóú¿]/i.test(x));
 const exemptText=new Set(['✺ IslaViva RD','IslaViva RD','Sirena','Jumbo','Uber','Eats','INAPA','Idioma / Language','🇩🇴 Español','🇩🇪 Deutsch','🇬🇧 English','🇫🇷 Français','🇭🇹 Kreyòl ayisyen']);
 for(const value of textNodes){
  if(exemptText.has(value))continue;
  const entry=dict[value];
  if(!entry){fail(name,'untranslated source text: '+value.slice(0,95));continue}
  for(const locale of locales)if(!entry[locale]||!entry[locale].trim())fail(name,'missing '+locale+' translation for: '+value.slice(0,65));
 }
 console.log('Checked '+name+': '+textNodes.length+' visible text fragments');
}
if(!names.length)fail('repository','No HTML guides discovered');
if(errors){console.error(errors+' localization/SEO problems');process.exit(1)}
console.log('OK: localized guide pages and SEO metadata checked.');
