// Root-homepage language preference. Keep real, crawlable HTML on every locale URL.
// Only / auto-selects; explicit /de/, /en/, /fr/, /ht/ never redirect.
(function(){
  if(location.pathname!=='/' && location.pathname!=='/index.html')return;
  // Search crawlers must be able to index the Spanish canonical homepage.
  const agent=navigator.userAgent||'';
  if(/(?:bot|crawler|spider|slurp|google-inspectiontool|lighthouse|pagespeed|facebookexternalhit|twitterbot|linkedinbot)/i.test(agent))return;
  const supported=new Set(['es','de','en','fr','ht']);
  let preferred='';
  try{
    const choice=localStorage.getItem('islaviva-language-choice');
    if(supported.has(choice))preferred=choice;
  }catch(e){}
  if(!preferred){
    const candidates=Array.isArray(navigator.languages)&&navigator.languages.length
      ?navigator.languages:[navigator.language||''];
    for(const candidate of candidates){
      const code=String(candidate).toLowerCase().split(/[-_]/)[0];
      if(supported.has(code)){preferred=code;break}
    }
  }
  if(!preferred||preferred==='es')return;
  const destination='/'+preferred+'/'+location.search+location.hash;
  location.replace(destination);
})();
