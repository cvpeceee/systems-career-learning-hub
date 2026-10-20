// Phone-like load timing: 390x844 viewport, 4x CPU throttle; time until the chapter list renders, and opening a new chapter.
const { chromium } = require('/workspace/tutorial-review/tools/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const f of process.argv.slice(2)) {
    const ts = [], open = [];
    for (let r = 0; r < 5; r++) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
      const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const t0 = Date.now(); await p.goto('file://' + f); await p.locator('.chapter-row').first().waitFor(); ts.push(Date.now() - t0);
      const rows = p.locator('.chapter-row'); const n = await rows.count();
      const t1 = Date.now(); await rows.nth(n - 1).click(); await p.locator('.lesson-article h2').first().waitFor(); open.push(Date.now() - t1);
      await ctx.close();
    }
    const med = (a) => a.sort((x, y) => x - y)[2];
    console.log(`${f.split('/').slice(-2).join('/')}: load median ${med(ts)} ms [${ts}] ; open last chapter median ${med(open)} ms`);
  }
  await b.close();
})();
