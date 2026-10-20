const { chromium } = require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const INT = '/workspace/tutorial-review/Improved_Interactive_Tutorial_with_Tesla_Track.html', D = '/workspace/interview-prep-screenshots/oct20/';
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  const page = async (vp, url) => { const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: 1 })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto(url || 'file://' + INT); await p.waitForTimeout(600); return p; };
  const open = async (p, re) => { const rows = p.locator('.chapter-row'); const n = await rows.count(); for (let i = 0; i < n; i++) if (re.test(await rows.nth(i).innerText())) { await rows.nth(i).click(); break; } await p.waitForTimeout(300); };
  const lesson = async (p, k) => { await p.locator('.stage-nav button').nth(k).click(); await p.waitForTimeout(300); };
  let p = await page({ width: 1366, height: 900 });
  const rows = p.locator('.chapter-row'); await rows.nth(40).scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
  await p.screenshot({ path: D + '01_chapter_list_ch37-41.png' });
  await open(p, /Linux Platform Engineering/); await lesson(p, 2);
  const sim = p.locator('.sim-card').first(); await sim.scrollIntoViewIfNeeded(); await sim.screenshot({ path: D + '02_ch38_sensor_content_sim.png' });
  p = await page({ width: 390, height: 844 }); await open(p, /Embedded Navigation/); await lesson(p, 2);
  await p.locator('.sim-card').first().scrollIntoViewIfNeeded(); await p.screenshot({ path: D + '03_mobile_ch41_mcdc_sim.png' });
  p = await page({ width: 1366, height: 900 }, 'file:///workspace/ip/site/index.html#companies'); await p.waitForTimeout(500);
  await p.locator('text=Companies from the Oct 20 job alerts').scrollIntoViewIfNeeded(); await p.screenshot({ path: D + '04_06_company_pages_oct20.png' });
  console.log('errors', errs.length, errs.slice(0, 3)); await b.close();
})();
