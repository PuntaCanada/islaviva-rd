// Read-only independent comparison of the deployed JS bytes against this checkout.
// Used in GitHub Actions after main updates. No secrets, keys or paid services.
import {readFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const url='https://islaviva-rd.pages.dev/assets/home-app.js';
const local=readFileSync('assets/home-app.js');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
let summary='### Cloudflare Production byte check\n\n';
let matched=false;
for(let attempt=1;attempt<=3;attempt++){
  try{
    const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error('HTTP '+response.status);
    const remote=Buffer.from(await response.arrayBuffer());
    const same=digest(local)===digest(remote);
    summary+=`- Attempt ${attempt}: HTTP ${response.status}, source SHA-256 \`${digest(local)}\`, delivered SHA-256 \`${digest(remote)}\`, **${same?'MATCH':'MISMATCH'}**.\n`;
    console.log('Production source:',url,'attempt:',attempt,'status:',response.status,'match:',same,'sourceSHA256:',digest(local),'deliveredSHA256:',digest(remote));
    if(same){matched=true;break;}
  }catch(e){
    console.error('Production read failed, attempt '+attempt+': '+e.message);
    summary+=`- Attempt ${attempt}: **unavailable**, ${String(e.message).slice(0,140)}.\n`;
  }
  if(attempt<3)await new Promise(resolve=>setTimeout(resolve,15000));
}
summary+='\nThis verifies one deployed JavaScript file only; it does not prove the RSS snapshot is identical or that the website has no runtime errors.\n';
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
if(!matched){console.error('Production JavaScript has not been independently verified against this main revision.');process.exitCode=1;}
