// Headless Chrome QA: every lesson + every tab at desktop and 390px; widget interactions; console errors; overflow; screenshots.
const { chromium } = require('/workspace/qa-tools/node_modules/playwright-core');
const F='file:///workspace/chandra-learning-repo/08-agentic-ai-engineer/index.html', S='/workspace/interview-prep-screenshots/agentic/';
(async()=>{ const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); let bad=0;
 for(const vp of [{width:1366,height:900},{width:390,height:844}]){
  const ctx=await b.newContext({viewport:vp,hasTouch:vp.width<500}); const p=await ctx.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push('pageerror '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_FILE_NOT_FOUND|Not allowed to load local resource|Unsafe attempt|CORS|cross-origin|origin 'null'/i.test(m.text()))errs.push('console '+m.text())});
  await p.goto(F); await p.waitForTimeout(500);
  const n=await p.evaluate(()=>D.lessons.length); let over=[],nochips=[];
  for(let i=0;i<n;i++){ await p.evaluate(i=>lesson(i),i); await p.waitForTimeout(120);
    const r=await p.evaluate(()=>({ow:document.documentElement.scrollWidth>innerWidth+2,chips:document.querySelectorAll('#body .chip').length,widok:document.querySelector('#wid')?document.querySelector('#wid').innerHTML.length>50:true}));
    if(r.ow) over.push(i+1); if(!r.chips) nochips.push(i+1); if(!r.widok){errs.push('widget empty lesson '+(i+1))}
    const btns=await p.$$('#wid button'); for(const bt of btns.slice(0,6)){ try{await bt.click({timeout:500}); await p.waitForTimeout(60);}catch(e){} }
    const ins=await p.$$('#wid input[type=range]'); for(const x of ins.slice(0,3)){ try{await x.fill('0.5')}catch(e){} }
    const ow2=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2); if(ow2&&!r.ow) over.push((i+1)+'w');
    const opts=await p.$$('.quiz .qq .opt'); if(opts.length){ await opts[0].click(); }
    const ex=await p.evaluate(()=>[...document.querySelectorAll('.quiz .qq.done .ex')].every(e=>e.textContent.length>10)); if(!ex) errs.push('quiz explanation missing '+(i+1));
    const ch=await p.$('#body .chip'); if(ch){ await ch.click(); const ok=await p.evaluate(()=>!!document.querySelector('.chipx')); if(!ok) errs.push('chip popup fail '+(i+1)); }
  }
  for(const v of ['home','lessons','labs','videos','plan','skills','glossary']){ await p.evaluate(v=>go(v),v); await p.waitForTimeout(150); const ow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2); if(ow) over.push(v); }
  await p.evaluate(()=>go('skills')); const la=await p.$('#app a[data-l]'); if(la){await la.click(); await p.waitForTimeout(100); const t=await p.evaluate(()=>cur); if(t<0) errs.push('skills link did not open lesson');}
  await p.evaluate(()=>go('videos')); await p.evaluate(()=>document.querySelectorAll('video').forEach(v=>{v.preload='metadata';v.load()})); await p.waitForTimeout(2500);
  const vs=await p.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({d:v.duration,t:v.textTracks.length})));
  const vbad=vs.filter(v=>!(v.d>60)||!v.t).length; console.log(vp.width,'videos',vs.length,'loaded',vs.length-vbad); if(vbad) errs.push(vbad+' videos failed to load');
  console.log(vp.width,'lessons',n,'overflow',JSON.stringify(over),'no-chips',JSON.stringify(nochips),'errors',errs.length); errs.slice(0,12).forEach(e=>console.log('  ',e)); if(errs.length||over.length) bad++;
  await ctx.close(); }
 if(process.env.NOSHOT){await b.close(); console.log('BAD',bad); process.exit(bad?1:0);}
 const shot=async(vp,hash,name,fn)=>{const c=await b.newContext({viewport:vp,hasTouch:vp.width<500,deviceScaleFactor:vp.width<500?2:1}); const p=await c.newPage(); await p.goto(F+hash); await p.waitForTimeout(500); if(fn) await fn(p); await p.screenshot({path:S+name}); await c.close();};
 const D={width:1366,height:900},M={width:390,height:844};
 const sv=async p=>p.evaluate(()=>document.querySelector('#wid').scrollIntoView());
 await shot(D,'','01-desktop-home.png');
 await shot(M,'','02-phone-home.png');
 await shot(D,'#l3','03-desktop-nexttoken-lesson.png',async p=>{await sv(p); await p.click('#wid #s'); await p.waitForTimeout(900); await p.click('#wid #s'); await p.waitForTimeout(900);});
 await shot(M,'#l3','04-phone-token-widget.png',async p=>{await sv(p); await p.click('#wid #s'); await p.waitForTimeout(900);});
 await shot(M,'#l5','05-phone-embedding-space.png',async p=>{await sv(p); await p.locator('#wid circle').nth(1).click(); await p.waitForTimeout(300);});
 await shot(D,'#l11','06-desktop-agent-loop.png',async p=>{await sv(p); for(let i=0;i<3;i++){await p.click('#wid #an'); await p.waitForTimeout(150);} });
 await shot(M,'#l10','07-phone-words-to-know-and-chip.png',async p=>{await p.click('.jar summary'); await p.click('#body .chip'); await p.waitForTimeout(200);});
 await shot(D,'#l15','08-desktop-hybrid-rrf.png',sv);
 await shot(M,'#l17','09-phone-mcp-sequence.png',async p=>{await sv(p); for(let i=0;i<4;i++){await p.click('#wid #mn');} await p.waitForTimeout(200);});
 await shot(M,'#l26','10-phone-injection-widget.png',sv);
 await shot(D,'#l23','11-desktop-eval-gate.png',sv);
 await shot(M,'#l20','12-phone-quiz.png',async p=>{await p.evaluate(()=>document.querySelector('.quiz').scrollIntoView()); await p.locator('.quiz .opt').nth(1).click(); await p.waitForTimeout(150);});
 await shot(M,'#glossary','13-phone-glossary.png',async p=>{await p.fill('#gs','MCP'); await p.waitForTimeout(150);});
 await shot(D,'#skills','14-desktop-skills-map.png');
 await shot(M,'#l11','15-phone-chapter-drawer.png',async p=>{await p.click('#menu'); await p.waitForTimeout(350);});
 await shot(D,'#videos','16-desktop-videos.png');
 await shot(M,'#labs','17-phone-labs.png');
 await shot(M,'#l10','18-phone-lesson-video.png',async p=>{await p.evaluate(()=>{const v=document.querySelector('.vid video'); v.scrollIntoView(); v.currentTime=60;}); await p.waitForTimeout(1200);});
 await b.close(); console.log('BAD',bad); process.exit(bad?1:0); })();
