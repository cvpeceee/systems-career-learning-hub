// Loads each file, opens every chapter of the new pack, and counts any non-file/data/blob network request.
const { chromium } = require('/workspace/tutorial-review/tools/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const f of process.argv.slice(2)) {
    const p = await (await b.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
    const ext = [], errs = [];
    p.on('request', (r) => { if (!/^(file|data|blob|about):/.test(r.url())) ext.push(r.url()); });
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + f); await p.waitForTimeout(500);
    const rows = p.locator('.chapter-row'); const n = await rows.count();
    for (let i = 0; i < n; i++) { const t = await rows.nth(i).innerText(); if (/AI Cluster|Performance Engineering|Arm Platform|Virtual Platforms|Infotainment|Robot-as-a-Service|HW\/SW Co-Design|AI Inference Serving|Distributed Services in Go|Data Infrastructure|Cluster Machine|Source Control Clients|Frontier Training Infrastructure|GPU Fleet Platform|Engineering Acceleration|Automotive Telematics Platform|Robotics Platform|High-Profile Role Playbooks/.test(t)) { await rows.nth(i).click(); await p.waitForTimeout(150); const tabs = p.locator('.stage-nav button'); const k = await tabs.count(); for (let j = 0; j < k; j++) { await tabs.nth(j).click(); await p.waitForTimeout(60); } await p.goBack().catch(() => {}); await p.goto('file://' + f); await p.waitForTimeout(300); } }
    console.log(`${f.split('/').pop()}: chapters=${n} external_requests=${ext.length} errors=${errs.length}`, ext.slice(0, 3), errs.slice(0, 3));
  }
  await b.close();
})();
