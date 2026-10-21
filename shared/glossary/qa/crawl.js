// Crawl every lesson/page of each course; dump visible text per unit (excluding the Words-to-know box) + terms the helper chipped.
const { chromium } = require('/workspace/tutorial-review/tools/node_modules/playwright-core');
const fs=require('fs'); const R='/workspace/chandra-learning-repo/'; const out=[]; const errs=[]; const ONLY=process.argv[2]||'';
const grab=async(p,file,unit,sel)=>{ await p.waitForTimeout(450); const r=await p.evaluate((sel)=>{ const roots=[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null||e===document.body);
  return roots.map(r=>{ const w=r.querySelector(':scope > .jg-words'); let t=r.innerText||''; if(w) t=t.replace(w.innerText,''); return {text:t, chips:w?[...w.querySelectorAll('li b')].map(b=>b.textContent):[]}; }); },sel);
  r.forEach((x,i)=>out.push({file,unit:unit+(r.length>1?' #'+i:''),...x})); };
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const page=async(f)=>{const p=await (await b.newContext({viewport:{width:1366,height:900}})).newPage(); p.on('pageerror',e=>errs.push(f+': '+e.message)); await p.goto('file://'+R+f); await p.waitForTimeout(700); return p;};
  console.log('start');for (const f of ONLY?[]:['04-interactive-tutorial/Improved_Interactive_Tutorial_with_Tesla_Track.html','05-tesla-track/Tesla_FSD_AI_Optimus_Track.html']){
    console.log(f);const p=await page(f); const tabs=await p.locator('.track-tabs button').count()||1;
    for(let t=0;t<tabs;t++){ if(tabs>1){await p.locator('.track-tabs button').nth(t).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(300);}
      const n=await p.locator('.chapter-row').count();
      for(let i=0;i<n;i++){ await p.goto('file://'+R+f); await p.waitForTimeout(400); if(tabs>1){await p.locator('.track-tabs button').nth(t).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(250);} const row=p.locator('.chapter-row').nth(i); const name=(await row.innerText({timeout:3000}).catch(()=>'?')).split('\n').slice(0,2).join(' '); await row.click().catch(()=>{}); await p.waitForTimeout(250);
        const L=await p.locator('.stage-nav button').count();
        for(let k=0;k<L;k++){ await p.locator('.stage-nav button').nth(k).click().catch(()=>{}); await grab(p,f,`tab${t} ch${i+1} ${name} | L${k+1}`,'.lesson-article,.sim-card'); }
      }
    }
  }
  { const f='06-leetcode-interview-prep/index.html'; const p=await page(f);
    const hashes=await p.evaluate(()=>{const D=window.DATA,h=['#home'];for(const k of Object.keys(D)){ if(Array.isArray(D[k])&&['companies','problems','designs','lessons'].includes(k)) D[k].forEach(x=>{ if(x&&!x.id&&x.meta) x={id:x.meta.id}; if(x&&x.id) h.push('#'+({companies:'co',problems:'p',designs:'d',lessons:'c'}[k]||k)+'/'+x.id);});} return h;});
    for(const h of hashes){ await p.evaluate(h=>location.hash=h,h); await grab(p,f,h,'#app'); }
  }
  { const f='02-learning-hub-v1/index.html'; const p=await page(f);
    for(const v of ['home','demos','tutorials','resources','projects','gym','jobs']){ await p.locator(`[data-view="${v}"]`).first().click().catch(()=>{}); await grab(p,f,'view '+v,'.view.active'); } }
  { const f='03-skills-academy/index.html'; const p=await page(f); await grab(p,f,'start','#main');
    const items=p.locator('#side a, #side li, #side button'); const n=await items.count();
    for(let i=0;i<n;i++){ const t=(await items.nth(i).innerText().catch(()=>'' )).slice(0,40); await items.nth(i).click().catch(()=>{}); await grab(p,f,'side '+i+' '+t,'#main'); } }
  let all=out; if(ONLY){ const old=JSON.parse(fs.readFileSync(R+'shared/glossary/qa/crawl.json','utf8')); const fs2=new Set(out.map(x=>x.file)); all=old.filter(x=>!fs2.has(x.file)).concat(out);} fs.writeFileSync(R+'shared/glossary/qa/crawl.json',JSON.stringify(all)); console.log('units',out.length,'errors',errs.length,errs.slice(0,5)); await b.close();
})();
