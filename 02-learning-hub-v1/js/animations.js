/**
 * Interactive offline demos for Chandra Vig Learning Hub
 * All canvas/SVG — no network required.
 */
(function (global) {
  const demos = {};

  function fitCanvas(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ========== A) SoC Factory Floor ========== */
  demos.soc = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 380;
    const ctx = fitCanvas(canvas, W, H);
    const nodes = [
      { id: 'cpu', x: 160, y: 90, w: 120, h: 56, label: 'CPU', sub: 'Foreman', color: '#3d9cf0',
        role: 'CPU (foreman): schedules work, runs drivers in process context, decides who moves when. Not every byte should go through the foreman.' },
      { id: 'dma', x: 380, y: 90, w: 120, h: 56, label: 'DMA', sub: 'Forklifts', color: '#5ce1b0',
        role: 'DMA (forklifts): moves buffers CPU↔device↔DRAM without CPU copying each byte. You program descriptors; hardware hauls the cargo.' },
      { id: 'irq', x: 600, y: 50, w: 120, h: 48, label: 'IRQ', sub: 'Alarm bells', color: '#f0a33d',
        role: 'IRQ (alarm bells): device says “done / error / data ready.” ISR should be short; wake a thread for heavy work.' },
      { id: 'drv', x: 160, y: 220, w: 120, h: 56, label: 'Driver', sub: 'Shift boss', color: '#c084fc',
        role: 'Driver (shift supervisor): translates open/read/ioctl into register pokes, DMA setup, and IRQ handling. Owns the contract with hardware.' },
      { id: 'dram', x: 380, y: 240, w: 130, h: 56, label: 'DRAM', sub: 'Warehouse', color: '#8b9bb0',
        role: 'DRAM (warehouse): large shared buffers for frames, descriptors, ring buffers. Coherent vs non-coherent caches matter for DMA.' },
      { id: 'isp', x: 620, y: 200, w: 140, h: 64, label: 'ISP/Cam', sub: 'Production line', color: '#f07178',
        role: 'ISP/camera path: sensor → MIPI → ISP → DRAM. Poly/Ambarella/QC story lives here — latency budget from photon to processed frame.' },
    ];
    let selected = null;
    const packets = [];
    let t = 0;
    let running = true;

    function spawn() {
      const paths = [
        ['cpu', 'dma', 'dram'],
        ['isp', 'dma', 'dram'],
        ['dram', 'dma', 'cpu'],
        ['isp', 'irq', 'drv', 'cpu'],
      ];
      const path = paths[Math.floor(Math.random() * paths.length)];
      packets.push({ path, i: 0, prog: 0, hue: Math.random() * 60 + 160 });
    }

    function nodeCenter(id) {
      const n = nodes.find((x) => x.id === id);
      return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
    }

    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const y = ((e.clientY - r.top) / r.height) * H;
      selected = null;
      for (const n of nodes) {
        if (x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h) {
          selected = n;
          aside.innerHTML = `<strong>${n.label}</strong> — ${n.role}`;
          break;
        }
      }
      if (!selected) aside.innerHTML = 'Click a node to see its role on the factory floor.';
    });

    root.querySelector('[data-act=pause]')?.addEventListener('click', () => {
      running = !running;
      root.querySelector('[data-act=pause]').textContent = running ? 'Pause' : 'Resume';
    });
    root.querySelector('[data-act=burst]')?.addEventListener('click', () => {
      for (let i = 0; i < 5; i++) spawn();
    });

    function draw() {
      t++;
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);
      // connections
      ctx.strokeStyle = 'rgba(61,156,240,0.2)';
      ctx.lineWidth = 2;
      const links = [['cpu','dma'],['dma','dram'],['isp','dma'],['irq','drv'],['drv','cpu'],['isp','irq']];
      links.forEach(([a,b]) => {
        const A = nodeCenter(a), B = nodeCenter(b);
        ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();
      });
      // packets
      if (running && t % 40 === 0) spawn();
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        if (running) p.prog += 0.018;
        if (p.prog >= 1) { p.i++; p.prog = 0; }
        if (p.i >= p.path.length - 1) { packets.splice(i, 1); continue; }
        const A = nodeCenter(p.path[p.i]), B = nodeCenter(p.path[p.i + 1]);
        const x = A.x + (B.x - A.x) * p.prog;
        const y = A.y + (B.y - A.y) * p.prog;
        ctx.fillStyle = `hsl(${p.hue},70%,60%)`;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      }
      // nodes
      nodes.forEach((n) => {
        const hi = selected === n;
        ctx.fillStyle = hi ? n.color : 'rgba(22,30,41,0.95)';
        ctx.strokeStyle = n.color;
        ctx.lineWidth = hi ? 2.5 : 1.5;
        roundRect(ctx, n.x, n.y, n.w, n.h, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = hi ? '#0b0f14' : '#e8eef6';
        ctx.font = '600 14px IBM Plex Sans, sans-serif';
        ctx.fillText(n.label, n.x + 12, n.y + 24);
        ctx.fillStyle = hi ? 'rgba(11,15,20,0.75)' : '#8b9bb0';
        ctx.font = '12px IBM Plex Sans, sans-serif';
        ctx.fillText(n.sub, n.x + 12, n.y + 42);
      });
      ctx.fillStyle = '#5e6e82';
      ctx.font = '12px IBM Plex Sans, sans-serif';
      ctx.fillText('SoC Factory Floor — packets = data / IRQs in flight', 16, H - 14);
      requestAnimationFrame(draw);
    }
    draw();
    aside.innerHTML = 'Click a node to see its role. Use <strong>Burst</strong> to flood the bus.';
  };

  /* ========== B) Device Tree Binding ========== */
  demos.dt = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 360;
    const ctx = fitCanvas(canvas, W, H);
    const steps = [
      { title: '1. Board description (.dts)', detail: 'You describe hardware: compatible, reg, interrupts, clocks — not driver code.', highlight: 'dts' },
      { title: '2. Kernel builds device nodes', detail: 'OF/DT core creates platform devices from the tree at boot.', highlight: 'kernel' },
      { title: '3. Match compatible string', detail: 'Driver table: { .compatible = "acme,fake-i2c-sensor" } matches the node.', highlight: 'match' },
      { title: '4. Driver probe()', detail: 'probe() gets resources (reg, irq), maps MMIO, requests IRQ, registers cdev.', highlight: 'probe' },
      { title: '5. Userspace sees /dev', detail: 'App open/read/ioctl — same mental model as any char device.', highlight: 'user' },
    ];
    let step = 0;

    function render() {
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);
      const boxes = [
        { id: 'dts', x: 40, y: 80, w: 150, h: 80, label: '.dts / board' },
        { id: 'kernel', x: 240, y: 80, w: 150, h: 80, label: 'Kernel OF' },
        { id: 'match', x: 440, y: 80, w: 150, h: 80, label: 'compatible?' },
        { id: 'probe', x: 640, y: 80, w: 150, h: 80, label: 'probe()' },
        { id: 'user', x: 440, y: 220, w: 150, h: 70, label: '/dev + app' },
      ];
      // arrows
      ctx.strokeStyle = 'rgba(92,225,176,0.35)';
      ctx.lineWidth = 2;
      [[115,160,240,120],[390,120,440,120],[590,120,640,120],[715,160,590,240]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      const hi = steps[step].highlight;
      boxes.forEach((b) => {
        const on = b.id === hi;
        ctx.fillStyle = on ? 'rgba(61,156,240,0.25)' : 'rgba(22,30,41,0.95)';
        ctx.strokeStyle = on ? '#3d9cf0' : '#243041';
        ctx.lineWidth = on ? 2.5 : 1;
        roundRect(ctx, b.x, b.y, b.w, b.h, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e8eef6';
        ctx.font = '600 14px IBM Plex Sans, sans-serif';
        ctx.fillText(b.label, b.x + 14, b.y + b.h / 2 + 5);
      });
      // sample DT snippet
      ctx.fillStyle = '#121821';
      roundRect(ctx, 40, 200, 280, 120, 8);
      ctx.fill();
      ctx.fillStyle = '#5ce1b0';
      ctx.font = '12px IBM Plex Mono, monospace';
      const lines = [
        'sensor@1a {',
        '  compatible = "acme,fake-i2c-sensor";',
        '  reg = <0x1a>;',
        '  interrupts = <GIC 42>;',
        '};',
      ];
      lines.forEach((ln, i) => ctx.fillText(ln, 52, 224 + i * 18));

      aside.innerHTML = `<strong>${steps[step].title}</strong> — ${steps[step].detail}`;
    }

    root.querySelector('[data-act=next]')?.addEventListener('click', () => {
      step = Math.min(steps.length - 1, step + 1);
      render();
    });
    root.querySelector('[data-act=back]')?.addEventListener('click', () => {
      step = Math.max(0, step - 1);
      render();
    });
    root.querySelector('[data-act=reset]')?.addEventListener('click', () => {
      step = 0; render();
    });
    render();
  };

  /* ========== C) Interrupt vs Polling ========== */
  demos.irqpoll = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 340;
    const ctx = fitCanvas(canvas, W, H);
    let mode = 'irq'; // irq | poll
    let irqRate = 8; // events/sec visual
    let t = 0;
    let cpuBusy = 0, latencySum = 0, eventCount = 0, latAvg = 0;
    const events = [];

    const rateSlider = root.querySelector('[data-param=rate]');
    rateSlider?.addEventListener('input', () => {
      irqRate = +rateSlider.value;
      root.querySelector('[data-val=rate]').textContent = irqRate;
    });
    root.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.getAttribute('data-mode');
        root.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('primary', b === btn));
        cpuBusy = 0; latencySum = 0; eventCount = 0; latAvg = 0; events.length = 0;
      });
    });

    function draw() {
      t++;
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);

      // CPU bar
      const busyTarget = mode === 'poll' ? 0.75 + irqRate * 0.02 : 0.08 + irqRate * 0.01;
      cpuBusy += (Math.min(0.98, busyTarget) - cpuBusy) * 0.08;

      // spawn device events
      if (Math.random() < irqRate / 60) {
        const birth = t;
        events.push({ birth, handled: false, lat: mode === 'irq' ? 4 + Math.random() * 6 : 15 + Math.random() * 40 });
      }

      // handle
      events.forEach((ev) => {
        if (!ev.handled && t - ev.birth >= ev.lat) {
          ev.handled = true;
          latencySum += ev.lat;
          eventCount++;
          latAvg = latencySum / eventCount;
        }
      });
      while (events.length && events[0].handled && t - events[0].birth > 120) events.shift();

      // device
      roundRect(ctx, 60, 120, 100, 70, 10);
      ctx.fillStyle = '#161e29'; ctx.fill();
      ctx.strokeStyle = '#f0a33d'; ctx.stroke();
      ctx.fillStyle = '#e8eef6';
      ctx.font = '600 13px sans-serif';
      ctx.fillText('Device', 85, 160);

      // CPU
      roundRect(ctx, 700, 100, 140, 110, 10);
      ctx.fillStyle = '#161e29'; ctx.fill();
      ctx.strokeStyle = '#3d9cf0'; ctx.stroke();
      ctx.fillStyle = '#e8eef6';
      ctx.fillText('CPU', 752, 130);
      // busy meter
      ctx.fillStyle = '#243041';
      ctx.fillRect(720, 150, 100, 14);
      ctx.fillStyle = mode === 'poll' ? '#f07178' : '#5ce1b0';
      ctx.fillRect(720, 150, 100 * cpuBusy, 14);
      ctx.fillStyle = '#8b9bb0';
      ctx.font = '11px sans-serif';
      ctx.fillText('busy ' + Math.round(cpuBusy * 100) + '%', 720, 182);

      // events as dots traveling
      events.forEach((ev) => {
        const p = Math.min(1, (t - ev.birth) / Math.max(1, ev.lat));
        const x = 160 + p * 540;
        const y = 150 + Math.sin((t + ev.birth) * 0.2) * 8;
        ctx.fillStyle = ev.handled ? '#5ce1b0' : '#f0a33d';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      });

      // mode label
      ctx.fillStyle = '#e8eef6';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(mode === 'irq' ? 'Mode: INTERRUPT' : 'Mode: POLLING', 60, 40);
      ctx.fillStyle = '#8b9bb0';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Avg latency (sim units): ${latAvg.toFixed(1)}  ·  Event rate: ${irqRate}/s`, 60, 60);
      ctx.fillText(mode === 'irq'
        ? 'CPU sleeps until bell rings — low busy, low latency if ISR is lean.'
        : 'CPU spins checking status — high busy; latency depends on poll period.', 60, 300);

      aside.innerHTML = mode === 'irq'
        ? '<strong>Interrupt:</strong> device rings; CPU reacts. Great for sparse events. Watch busy stay low.'
        : '<strong>Polling:</strong> CPU keeps asking “ready?” High load; sometimes OK for tight realtime loops.';
      requestAnimationFrame(draw);
    }
    draw();
  };

  /* ========== D) PID Control Lab ========== */
  demos.pid = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 360;
    const ctx = fitCanvas(canvas, W, H);
    let kp = 1.2, ki = 0.4, kd = 0.15;
    let setpoint = 1.0;
    let y = 0, dy = 0, integ = 0, prevErr = 0;
    const hist = [];
    const MAX = 280;

    function bindSlider(name, setter, fmt) {
      const el = root.querySelector(`[data-param=${name}]`);
      const lab = root.querySelector(`[data-val=${name}]`);
      el?.addEventListener('input', () => {
        setter(+el.value);
        if (lab) lab.textContent = fmt(+el.value);
      });
    }
    bindSlider('kp', (v) => (kp = v), (v) => v.toFixed(2));
    bindSlider('ki', (v) => (ki = v), (v) => v.toFixed(2));
    bindSlider('kd', (v) => (kd = v), (v) => v.toFixed(2));
    bindSlider('sp', (v) => (setpoint = v), (v) => v.toFixed(2));

    root.querySelector('[data-act=step]')?.addEventListener('click', () => {
      setpoint = setpoint < 0.5 ? 1.0 : 0.2;
      const el = root.querySelector('[data-param=sp]');
      if (el) { el.value = setpoint; root.querySelector('[data-val=sp]').textContent = setpoint.toFixed(2); }
    });
    root.querySelector('[data-act=reset-pid]')?.addEventListener('click', () => {
      y = 0; dy = 0; integ = 0; prevErr = 0; hist.length = 0;
    });

    function stepSim() {
      const dt = 0.05;
      const err = setpoint - y;
      integ += err * dt;
      integ = Math.max(-3, Math.min(3, integ));
      const deriv = (err - prevErr) / dt;
      prevErr = err;
      const u = kp * err + ki * integ + kd * deriv;
      // simple 2nd-order plant (mass-spring-ish joint)
      const acc = u - 0.35 * dy - 0.15 * y;
      dy += acc * dt;
      y += dy * dt;
      hist.push({ y, sp: setpoint });
      if (hist.length > MAX) hist.shift();
    }

    function draw() {
      for (let i = 0; i < 2; i++) stepSim();
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = 'rgba(36,48,65,0.8)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const yy = 40 + i * 60;
        ctx.beginPath(); ctx.moveTo(40, yy); ctx.lineTo(W - 20, yy); ctx.stroke();
      }
      const x0 = 40, x1 = W - 20, yMid = 180, scale = 100;
      function X(i) { return x0 + (i / MAX) * (x1 - x0); }
      function Y(v) { return yMid - v * scale; }

      // setpoint
      ctx.strokeStyle = '#f0a33d';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      hist.forEach((h, i) => { const x = X(i), yy = Y(h.sp); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
      ctx.stroke();
      ctx.setLineDash([]);

      // output
      ctx.strokeStyle = '#3d9cf0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      hist.forEach((h, i) => { const x = X(i), yy = Y(h.y); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
      ctx.stroke();

      ctx.fillStyle = '#8b9bb0';
      ctx.font = '12px sans-serif';
      ctx.fillText('orange = setpoint (dashed) · blue = joint position', 40, H - 16);
      ctx.fillText(`y=${y.toFixed(2)}  e=${(setpoint - y).toFixed(2)}`, 620, 28);

      // overshoot / settle hint
      const last = hist.slice(-80);
      let peak = 0;
      last.forEach((h) => { peak = Math.max(peak, h.y); });
      const overshoot = Math.max(0, peak - setpoint);
      aside.innerHTML = `<strong>PID lab</strong> — cruise control / robot joint. Overshoot≈${overshoot.toFixed(2)}. Raise Kd to damp; Ki kills steady-state error; too much Kp → oscillation.`;
      requestAnimationFrame(draw);
    }
    draw();
  };

  /* ========== E) ROS 2 Message Bus ========== */
  demos.ros = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 360;
    const ctx = fitCanvas(canvas, W, H);
    const nodes = [
      { id: 'cam', x: 80, y: 140, label: 'camera_node', topic: '/image' },
      { id: 'det', x: 360, y: 80, label: 'detector', topic: '/dets' },
      { id: 'ctl', x: 360, y: 220, label: 'controller', topic: '/cmd_vel' },
      { id: 'viz', x: 640, y: 140, label: 'visualizer', topic: null },
    ];
    const msgs = [];
    let t = 0;
    let latBudget = 50; // ms visual
    const budgetEl = root.querySelector('[data-param=budget]');
    budgetEl?.addEventListener('input', () => {
      latBudget = +budgetEl.value;
      root.querySelector('[data-val=budget]').textContent = latBudget + ' ms';
    });

    function publish(from, to, topic, color) {
      msgs.push({ from, to, topic, color, p: 0, cost: 8 + Math.random() * 20 });
    }

    function draw() {
      t++;
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);

      if (t % 45 === 0) publish('cam', 'det', '/image', '#3d9cf0');
      if (t % 55 === 0) publish('det', 'ctl', '/dets', '#5ce1b0');
      if (t % 55 === 10) publish('ctl', 'viz', '/cmd_vel', '#c084fc');

      // topic "radio" channels as dashed lines
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(139,155,176,0.35)';
      [[80+50,140+20,360+50,80+20],[360+50,80+40,360+50,220],[360+50,220+20,640+40,140+20]].forEach(([a,b,c,d]) => {
        ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.stroke();
      });
      ctx.setLineDash([]);

      nodes.forEach((n) => {
        roundRect(ctx, n.x, n.y, 120, 56, 10);
        ctx.fillStyle = '#161e29'; ctx.fill();
        ctx.strokeStyle = '#3d9cf0'; ctx.stroke();
        ctx.fillStyle = '#e8eef6';
        ctx.font = '600 12px sans-serif';
        ctx.fillText(n.label, n.x + 12, n.y + 24);
        if (n.topic) {
          ctx.fillStyle = '#5ce1b0';
          ctx.font = '11px IBM Plex Mono, monospace';
          ctx.fillText('pub ' + n.topic, n.x + 12, n.y + 42);
        }
      });

      let pipelineMs = 0;
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        m.p += 0.02;
        const a = nodes.find((n) => n.id === m.from);
        const b = nodes.find((n) => n.id === m.to);
        if (!a || !b || m.p >= 1) {
          if (m.p >= 1) pipelineMs += m.cost;
          msgs.splice(i, 1);
          continue;
        }
        const x = a.x + 60 + (b.x + 60 - a.x - 60) * m.p;
        const y = a.y + 28 + (b.y + 28 - a.y - 28) * m.p;
        ctx.fillStyle = m.color;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        pipelineMs += m.cost * 0.15;
      }

      // latency budget bar
      const used = Math.min(latBudget, 12 + msgs.length * 9 + (t % 30));
      ctx.fillStyle = '#243041';
      ctx.fillRect(80, 310, 400, 16);
      const ok = used <= latBudget * 0.85;
      ctx.fillStyle = ok ? '#5ce1b0' : '#f07178';
      ctx.fillRect(80, 310, 400 * (used / latBudget), 16);
      ctx.fillStyle = '#8b9bb0';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Latency budget camera→cmd: ${used.toFixed(0)} / ${latBudget} ms`, 80, 300);

      aside.innerHTML = '<strong>ROS 2 mental model:</strong> nodes = workers; topics = radio channels (pub/sub). Keep the camera→detect→cmd path under your budget.';
      requestAnimationFrame(draw);
    }
    draw();
  };

  /* ========== F) Memory Hierarchy ========== */
  demos.mem = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 360;
    const ctx = fitCanvas(canvas, W, H);
    const levels = [
      { name: 'L1', lat: 1, color: '#5ce1b0', y: 60, hit: 0.85 },
      { name: 'L2', lat: 4, color: '#3d9cf0', y: 120, hit: 0.7 },
      { name: 'DRAM', lat: 60, color: '#f0a33d', y: 180, hit: 0.95 },
      { name: 'Disk', lat: 1e5, color: '#f07178', y: 240, hit: 1 },
    ];
    let anim = null;
    let stats = { hits: 0, misses: 0, cost: 0 };

    root.querySelector('[data-act=access]')?.addEventListener('click', () => {
      if (anim) return;
      let level = 0;
      const roll = Math.random();
      if (roll < 0.55) level = 0;
      else if (roll < 0.8) level = 1;
      else if (roll < 0.97) level = 2;
      else level = 3;
      anim = { level, p: 0, checking: 0 };
    });

    function draw() {
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e8eef6';
      ctx.font = '600 14px sans-serif';
      ctx.fillText('CPU', 80, 40);

      levels.forEach((lv, i) => {
        const w = 200 + i * 80;
        roundRect(ctx, 200, lv.y, w, 44, 8);
        ctx.fillStyle = '#161e29'; ctx.fill();
        ctx.strokeStyle = lv.color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#e8eef6';
        ctx.font = '600 13px sans-serif';
        ctx.fillText(`${lv.name}  ·  ~${lv.lat < 1000 ? lv.lat + ' cycle' : 'ms+'}`, 214, lv.y + 28);
      });

      if (anim) {
        anim.p += 0.03;
        const lv = levels[Math.min(anim.checking, anim.level)];
        const x = 120;
        const y = 30 + anim.checking * 60 + Math.min(1, anim.p) * 40;
        ctx.fillStyle = '#c084fc';
        ctx.beginPath(); ctx.arc(x, Math.min(y, levels[anim.checking].y + 22), 8, 0, Math.PI * 2); ctx.fill();
        if (anim.p >= 1) {
          if (anim.checking < anim.level) {
            anim.checking++;
            anim.p = 0;
            stats.misses++;
          } else {
            stats.hits++;
            stats.cost += levels[anim.level].lat;
            aside.innerHTML = `<strong>${anim.level === 0 ? 'HIT L1' : 'Served from ' + levels[anim.level].name}</strong> — cost ~${levels[anim.level].lat} cycles. Hits=${stats.hits}, walk-downs=${stats.misses}, Σcost≈${stats.cost}.`;
            anim = null;
          }
        }
      } else {
        aside.innerHTML = '<strong>Memory hierarchy:</strong> click Access. Watch the request walk L1→L2→DRAM→Disk on misses. Latency compounds fast.';
      }

      ctx.fillStyle = '#8b9bb0';
      ctx.font = '12px sans-serif';
      ctx.fillText('Rule of thumb: keep hot paths in cache; DMA targets often bypass cache → sync carefully.', 40, H - 16);
      requestAnimationFrame(draw);
    }
    draw();
  };

  /* ========== G) PCIe / DMA Host Path ========== */
  demos.pcie = function (root) {
    const canvas = root.querySelector('canvas');
    const aside = root.querySelector('.demo-aside');
    const W = 900, H = 340;
    const ctx = fitCanvas(canvas, W, H);
    let phase = 0; // 0 cpu, 1 bar, 2 dma, 3 done
    let p = 0;
    let auto = true;

    root.querySelector('[data-act=step-pcie]')?.addEventListener('click', () => {
      auto = false;
      phase = Math.min(3, phase + 1);
      p = 0;
      updateAside();
    });
    root.querySelector('[data-act=auto-pcie]')?.addEventListener('click', () => {
      auto = true; phase = 0; p = 0;
    });

    function updateAside() {
      const texts = [
        '<strong>1. Host CPU</strong> writes device registers through mapped BARs (MMIO) to set up the transfer.',
        '<strong>2. BAR / registers</strong> hold descriptor addresses, lengths, doorbell — the control plane.',
        '<strong>3. DMA engine</strong> moves payload host memory ↔ device memory without CPU byte-copy.',
        '<strong>4. Completion</strong> IRQ or polling tells the driver the transfer finished — OpenAI Host / robot compute story.',
      ];
      aside.innerHTML = texts[phase];
    }

    function draw() {
      if (auto) {
        p += 0.012;
        if (p >= 1) { p = 0; phase = (phase + 1) % 4; updateAside(); }
      }
      ctx.fillStyle = '#080c12';
      ctx.fillRect(0, 0, W, H);

      const boxes = [
        { x: 40, y: 120, w: 140, h: 70, label: 'Host CPU' },
        { x: 260, y: 120, w: 150, h: 70, label: 'BAR / MMIO' },
        { x: 500, y: 60, w: 150, h: 60, label: 'DMA engine' },
        { x: 500, y: 200, w: 150, h: 60, label: 'Dev memory' },
        { x: 720, y: 120, w: 130, h: 70, label: 'Host DRAM' },
      ];
      boxes.forEach((b, i) => {
        const on = (phase === 0 && i === 0) || (phase === 1 && i === 1) || (phase === 2 && (i === 2 || i === 3 || i === 4)) || (phase === 3 && i === 0);
        ctx.fillStyle = on ? 'rgba(61,156,240,0.22)' : '#161e29';
        roundRect(ctx, b.x, b.y, b.w, b.h, 10);
        ctx.fill();
        ctx.strokeStyle = on ? '#3d9cf0' : '#243041';
        ctx.lineWidth = on ? 2.5 : 1;
        ctx.stroke();
        ctx.fillStyle = '#e8eef6';
        ctx.font = '600 13px sans-serif';
        ctx.fillText(b.label, b.x + 16, b.y + b.h / 2 + 5);
      });

      // animated packet for DMA phase
      if (phase === 2) {
        const x = 650 + Math.sin(p * Math.PI) * 60;
        const y = 160;
        ctx.fillStyle = '#5ce1b0';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8b9bb0';
        ctx.font = '11px sans-serif';
        ctx.fillText('payload', x - 18, y - 14);
      }
      if (phase === 1) {
        ctx.strokeStyle = '#f0a33d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(180, 155);
        ctx.lineTo(180 + p * 80, 155);
        ctx.stroke();
      }

      ctx.fillStyle = '#5e6e82';
      ctx.font = '12px sans-serif';
      ctx.fillText('PCIe/DMA host path — control via BAR, bulk via DMA (Host Systems roles)', 40, H - 16);
      requestAnimationFrame(draw);
    }
    updateAside();
    draw();
  };

  function initAll() {
    document.querySelectorAll('[data-demo]').forEach((root) => {
      const name = root.getAttribute('data-demo');
      if (demos[name]) demos[name](root);
    });
  }

  global.HubAnimations = { initAll, demos };
})(window);
