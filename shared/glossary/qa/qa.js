const { chromium } = require('/workspace/tutorial-review/tools/node_modules/playwright-core');
const R='/workspace/chandra-learning-repo/', S='/workspace/interview-prep-screenshots/jargon-audit/';
const F=['02-learning-hub-v1/index.html','03-skills-academy/index.html','04-interactive-tutorial/Improved_Interactive_Tutorial_with_Tesla_Track.html','04-interactive-tutorial/Improved_Interactive_Tutorial.html','05-tesla-track/Tesla_FSD_AI_Optimus_Track.html','06-leetcode-interview-prep/index.html','04-interactive-tutorial/videos/oct20/index.html'];
(async()=>{ const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); let bad=0;
  for(const vp of [{width:1366,height:900},{width:390,height:844}]) for(const f of F){ const p=await (await b.newContext({viewport:vp})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+R+f); await p.waitForTimeout(800);
    if(/Tutorial|Tesla/.test(f)){ await p.locator('.chapter-row').nth(2).click().catch(()=>{}); await p.waitForTimeout(700); }
    if(/06-/.test(f)){ await p.evaluate(()=>location.hash='#p/p01-two-sum'); await p.waitForTimeout(700); }
    const r=await p.evaluate(()=>({hl:CSS.highlights.get('jg')?CSS.highlights.get('jg').size:0,box:document.querySelectorAll('.jg-words').length,btn:!!document.getElementById('jg-btn'),ow:document.documentElement.scrollWidth>innerWidth+2}));
    console.log(vp.width,f,JSON.stringify(r),'errors',errs.length); if(errs.length||!r.btn) bad++; await p.close(); }
  // screenshots
  let p=await (await b.newContext({viewport:{width:1366,height:900}})).newPage(); await p.goto('file://'+R+F[2]); await p.waitForTimeout(800);
  await p.locator('.chapter-row').nth(14).click(); await p.waitForTimeout(800); await p.locator('.lesson-article').scrollIntoViewIfNeeded().then(()=>p.evaluate(()=>document.querySelector('.lesson-article').scrollIntoView())).then(()=>p.screenshot({path:S+'01-tutorial-words-to-know.png'})).catch(e=>console.log(e.message));
  await p.click('#jg-btn'); await p.fill('#jg-modal input','DMA'); await p.waitForTimeout(300); await p.screenshot({path:S+'03-glossary-modal.png'});
  p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true})).newPage(); await p.goto('file://'+R+F[5]+'#co/nvidia'); await p.waitForTimeout(1000);
  const pt=await p.evaluate(()=>{const h=[...CSS.highlights.get('jg')][1]; if(!h) return null; h.startContainer.parentElement.scrollIntoView({block:'center'}); const r=h.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  if(pt){ const pt2=await p.evaluate(()=>{const r=[...CSS.highlights.get('jg')][1].getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};}); await p.mouse.click(pt2.x,pt2.y); await p.waitForTimeout(300); }
  console.log('popover', await p.locator('.jg-pop').count()); await p.screenshot({path:S+'02-phone-term-popover.png'});
  await b.close(); console.log('BAD',bad); })();
