const { chromium } = require('/workspace/tutorial-review/tools/node_modules/playwright-core');
const R='/workspace/chandra-learning-repo/04-interactive-tutorial/Improved_Interactive_Tutorial_with_Tesla_Track.html', S='/workspace/interview-prep-screenshots/jargon-audit/phase2/';
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const errs=[];
 const p=await (await b.newContext({viewport:{width:1366,height:900}})).newPage(); p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+R); await p.waitForTimeout(600); await p.locator('.chapter-row').nth(0).click(); await p.waitForTimeout(700);
 for(const k of [1,2,0,1,0]){ await p.locator('.stage-nav button').nth(k).click(); await p.waitForTimeout(500);}
 const st=await p.evaluate(()=>{const hid=[...document.querySelectorAll('[data-jg-split="1"]')]; return {steps:document.querySelectorAll('.jg-steps').length, hidden:hid.length, stale:hid.filter(e=>{const n=e.nextElementSibling;return !n||!n.classList.contains('jg-steps')}).length, boxOpen:document.querySelector('.jg-words')&&document.querySelector('.jg-words').open};});
 console.log(JSON.stringify(st),'errors',errs.length);
 await p.evaluate(()=>document.querySelector('.jg-steps').scrollIntoView({block:'center'})); await p.waitForTimeout(200); await p.screenshot({path:S+'01-steps-and-collapsed-words.png'});
 const q=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); q.on('pageerror',e=>errs.push(e.message)); await q.goto('file://'+R); await q.waitForTimeout(600);
 await q.locator('.chapter-row').nth(9).click(); await q.waitForTimeout(600); await q.locator('.stage-nav button').nth(1).click(); await q.waitForTimeout(700);
 const has=await q.evaluate(()=>{const d=document.querySelector('.jg-lines'); if(d) d.previousElementSibling.scrollIntoView({block:'start'}); return !!d;}); await q.waitForTimeout(200);
 console.log('lineguide',has,'errors',errs.length); await q.screenshot({path:S+'02-phone-code-line-guide.png'}); await b.close();})();
