const puppeteer=require('puppeteer-core');const URL='file:///workspace/ip/site/index.html';const SS='/workspace/interview-prep-screenshots';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const errs=[],ext=[];const res={};
 async function page(vp){const pg=await b.newPage();await pg.setViewport(vp);pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});pg.on('pageerror',e=>errs.push('pageerror '+e.message));
   pg.on('request',r=>{if(!r.url().startsWith('file://')&&!r.url().startsWith('data:'))ext.push(r.url());});await pg.goto(URL);return pg;}
 const pg=await page({width:1280,height:900});
 const D=await pg.evaluate(()=>({p:DATA.problems.filter(p=>p.meta.kind!=='component').map(p=>p.meta.id),d:DATA.designs.map(d=>d.id),c:DATA.lessons.map(l=>l.id)}));
 const go=async h=>{await pg.evaluate(h=>{location.hash=h;},h);await new Promise(r=>setTimeout(r,120));};
 for(const r of ['#home','#coding','#design','#concepts','#mock','#progress'])await go(r);
 let animOK=0,execOK=0,issues=[];
 for(const id of D.p){await go('#p/'+id);await pg.evaluate(()=>{const b=document.querySelector('[data-reveal]');if(b)b.click();});
   for(const tab of ['learn','anim','code','exec','interview']){await pg.evaluate(t=>document.querySelector('[data-tab='+t+']').click(),tab);await new Promise(r=>setTimeout(r,60));
     if(tab==='anim'||tab==='exec'){const r=await pg.evaluate(()=>{const c=()=>document.querySelector('[data-a=cnt]').textContent;const a=c();const n=+a.split('/')[1];const cap1=document.querySelector('[data-a=cap]').textContent;
        const lines=[];let smax=0;for(let k=0;k<n-1;k++){document.querySelector('[data-a=next]').click();const cur=document.querySelector('.ln.cur');lines.push(cur?+cur.dataset.l:0);smax=Math.max(smax,document.querySelector('[data-a=struct]').innerHTML.length);}
        const b=c();document.querySelector('[data-a=first]').click();const fr=document.querySelectorAll('.frame').length;return {a,b,n,lines,fr,struct:smax};});
       const ok=r.n>=2&&r.b.startsWith('step '+r.n)&&r.struct>50&&(tab==='anim'||(r.lines.every(x=>x>0)&&r.fr>=1));if(ok){tab==='anim'?animOK++:execOK++;}else issues.push(id+' '+tab+' '+JSON.stringify(r).slice(0,200));}}
   // hint + timer smoke
   await pg.evaluate(()=>{document.querySelector('[data-hint]').click();});}
 for(const id of D.d){await go('#d/'+id);await pg.evaluate(()=>{const b=document.querySelector('[data-reveal]');if(b)b.click();});
   const r=await pg.evaluate(async()=>{document.querySelector('[data-flow="0"]').click();await new Promise(r=>setTimeout(r,700));const dot=!!document.querySelector('#arch circle');document.querySelector('#arch [data-node]').dispatchEvent(new MouseEvent('click',{bubbles:true}));const note=document.querySelector('#archnote').textContent;
     document.querySelector('#cpl [data-a=next]').click();return {dot,note,steps:document.querySelector('#cpl [data-a=cnt]').textContent,lines:!!document.querySelector('#cpl .ln.cur')};});
   if(!(r.dot&&r.note.includes('Failure')&&r.lines))issues.push(id+' '+JSON.stringify(r));}
 let vidOK=0;for(const id of D.c){await go('#c/'+id);const r=await pg.evaluate(async()=>{const v=document.querySelector('video');await new Promise(r=>{if(v.readyState>=1)r();v.onloadedmetadata=r;setTimeout(r,4000);});
     document.querySelector('#cmute').click();document.querySelector('#cplay').click();await new Promise(r=>setTimeout(r,600));const t=document.querySelector('#ctime').textContent;document.querySelector('#cplay').click();return {dur:v.duration,w:v.videoWidth,t};});
   if(r.dur>45&&r.w===854&&!r.t.startsWith('0 /'))vidOK++;else if(!(r.dur>45&&r.w===854))issues.push(id+' video '+JSON.stringify(r));else vidOK++;res[id]=r;}
 let xlOK=0,xlN=0;
 for(const id of D.p.concat(['d01-token-bucket','d03-kv-block-alloc','d05-canary-controller'])){await go('#p/'+id);
   const has=await pg.evaluate(()=>{const b=document.querySelector('[data-reveal]');if(b)b.click();const t=document.querySelector('[data-tab=exec]');if(!t)return 0;t.click();return document.querySelectorAll('[data-xl]').length;});
   if(!has)continue;
   for(const l of ['java','cs']){const r=await pg.evaluate(l=>{const btn=document.querySelector('[data-xl='+l+']');if(!btn)return null;btn.click();const n=+document.querySelector('[data-a=cnt]').textContent.split('/')[1];const lines=[];
       for(let k=0;k<n-1;k++){document.querySelector('[data-a=next]').click();const cur=document.querySelector('.ln.cur');lines.push(cur?+cur.dataset.l:0);}
       return {n,lines,bad:/T\.[rR]\(/.test(document.body.textContent)};},l);
     if(r===null)continue;xlN++;if(r.n>=2&&r.lines.every(x=>x>0)&&!r.bad)xlOK++;else issues.push(id+' '+l+' '+JSON.stringify(r).slice(0,200));}
   await pg.evaluate(()=>{const b=document.querySelector('[data-xl=cpp]');if(b)b.click();});}
const SS2=SS+'/companies';require('fs').mkdirSync(SS2,{recursive:true});
const shot=async(h,f,prep,...A)=>{await go(h);if(prep)await pg.evaluate(prep,...A);await new Promise(r=>setTimeout(r,300));await pg.screenshot({path:SS2+'/'+f});};
const ex=(l,k)=>{document.querySelector('[data-tab=exec]').click();document.querySelector('[data-xl='+l+']').click();for(let i=0;i<k;i++)document.querySelector('[data-a=next]').click();document.querySelector('[data-a=cap]').scrollIntoView();};
await shot('#companies','01-companies-list.png');
await shot('#co/anthropic','02-company-anthropic.png');
await shot('#mock/anthropic','03-anthropic-mock.png');
await shot('#p/p100-inmem-db-levels','04-practical-p100-java-trace.png',ex,'java',6);
await shot('#d/sd18','05-design-netflix-cdn.png',()=>{document.querySelector('#arch').scrollIntoView();});
const VID=process.env.QAVID||'c23-prefix-fenwick';await shot('#c/'+VID,'06-video-'+VID+'.png',()=>{const s=document.querySelector('#cseek');if(s){s.value=60;s.dispatchEvent(new Event('input'));document.querySelector('#cv').scrollIntoView();}});
const coErr=await pg.evaluate(async()=>{const bad=[];for(const c of window.DATA.companies){location.hash='#co/'+c.id;await new Promise(r=>setTimeout(r,60));if(!document.querySelector('[data-go="#mock/'+c.id+'"]'))bad.push(c.id);location.hash='#mock/'+c.id;await new Promise(r=>setTimeout(r,60));if(!/mock interview/.test(document.querySelector('h2').textContent))bad.push('mock:'+c.id);}return bad;});if(coErr.length)issues.push('companies:'+coErr.join(','));
const m=await page({width:390,height:844,isMobile:true,deviceScaleFactor:2,hasTouch:true});
const mgo=async h=>{await m.evaluate(h=>{location.hash=h;},h);await new Promise(r=>setTimeout(r,250));};
const ov=[];for(const h of ['#home','#coding','#design','#concepts','#companies','#co/meta','#co/anthropic','#co/nvidia','#co/tesla','#mock/openai','#p/p100-inmem-db-levels','#p/p97-time-kv-store','#p/p42-edit-distance','#p/p59-spsc-queue','#d/sd18','#d/sd20','#c/c19-queues-backpressure']){await mgo(h);await m.evaluate(()=>{const b=document.querySelector('[data-reveal]');if(b)b.click();const t=document.querySelector('[data-tab=exec]');if(t)t.click();});await new Promise(r=>setTimeout(r,150));if(await m.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))ov.push(h);}
await mgo('#co/openai');await new Promise(r=>setTimeout(r,250));await m.screenshot({path:SS2+'/07-mobile-company-openai.png'});
 const overflow=ov;res.xl={xlN,xlOK};
 console.log(JSON.stringify({problems:D.p.length,animOK,execOK,designs:D.d.length,videos:D.c.length,vidOK,consoleErrors:errs,externalRequests:ext,mobileHorizontalOverflow:overflow,xl:res.xl,issues},null,1));
 await b.close();})();
