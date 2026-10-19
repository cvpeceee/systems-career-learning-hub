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
   if(r.dur>100&&r.w===854&&!r.t.startsWith('0 /'))vidOK++;else if(!(r.dur>100&&r.w===854))issues.push(id+' video '+JSON.stringify(r));else vidOK++;res[id]=r;}
 // screenshots desktop
 const shot=async(h,f,prep)=>{await go(h);if(prep)await pg.evaluate(prep);await new Promise(r=>setTimeout(r,250));await pg.screenshot({path:SS+'/'+f});};
 await shot('#coding','01-coding-list-desktop.png');
 await shot('#p/p07-validate-bst','02-exec-visualizer-validate-bst.png',()=>{document.querySelector('[data-tab=exec]').click();for(let k=0;k<9;k++)document.querySelector('[data-a=next]').click();document.querySelector('[data-a=cap]').scrollIntoView();});
 await shot('#p/p12-network-delay','03-anim-dijkstra.png',()=>{document.querySelector('[data-tab=anim]').click();for(let k=0;k<4;k++)document.querySelector('[data-a=next]').click();document.querySelector('[data-a=cap]').scrollIntoView();});
 await shot('#d/sd3','04-design-llm-serving-arch.png',()=>{document.querySelector('#arch').scrollIntoView();document.querySelector('#arch [data-node="dec"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await shot('#c/c06-recursion-call-stack','05-concept-video-recursion.png',()=>{document.querySelector('#cseek').value=420;document.querySelector('#cseek').dispatchEvent(new Event('input'));document.querySelector('#cv').scrollIntoView();});
 // mobile
 const m=await page({width:390,height:844,isMobile:true,deviceScaleFactor:2,hasTouch:true});
 const mgo=async h=>{await m.evaluate(h=>{location.hash=h;},h);await new Promise(r=>setTimeout(r,250));};
 await mgo('#p/p17-subsets');await m.evaluate(()=>{localStorage.removeItem('ip:rev:p17-subsets');});await mgo('#home');await mgo('#p/p17-subsets');await m.screenshot({path:SS+'/06-mobile-practice-locked.png'});
 await m.evaluate(()=>{document.querySelector('[data-reveal]').click();document.querySelector('[data-tab=exec]').click();for(let k=0;k<12;k++)document.querySelector('[data-a=next]').click();document.querySelector('[data-a=frames]').scrollIntoView();});await new Promise(r=>setTimeout(r,250));await m.screenshot({path:SS+'/07-mobile-exec-subsets-callstack.png'});
 const overflow=await m.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 await mgo('#mock');await m.screenshot({path:SS+'/08-mobile-mock-interview.png'});
 console.log(JSON.stringify({problems:D.p.length,animOK,execOK,designs:D.d.length,videos:D.c.length,vidOK,consoleErrors:errs,externalRequests:ext,mobileHorizontalOverflow:overflow,issues},null,1));
 await b.close();})();
