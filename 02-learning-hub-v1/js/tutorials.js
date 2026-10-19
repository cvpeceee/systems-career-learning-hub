/**
 * Guided multi-step tutorials with quiz checks
 */
(function (global) {
  const TUTORIALS = {
    char: {
      title: 'Linux char driver mental model',
      steps: [
        {
          html: `<p><strong>Analogy:</strong> A character driver is a <em>shift supervisor</em> standing between userspace (the warehouse clerk) and hardware (the machines).</p>
          <p>Userspace calls <code>open/read/write/ioctl</code> on a file under <code>/dev</code>. VFS routes those to your <code>file_operations</code>.</p>
          <ul><li><code>open</code> — prepare device, refcount</li><li><code>read/write</code> — move data (often via copy_to/from_user or mmap)</li><li><code>ioctl</code> — control knobs that aren't pure data streams</li><li><code>release</code> — cleanup</li></ul>`,
          quiz: { q: 'What userspace call typically maps to custom device control (not bulk data)?', options: ['read()', 'ioctl()', 'malloc()'], answer: 1 }
        },
        {
          html: `<p><strong>file_operations → hardware</strong></p>
          <p>Inside those callbacks you: map registers (ioremap / regmap), kick DMA, wait on waitqueues woken by IRQs, enforce locking.</p>
          <p>Process context (read/write) can sleep. SoftIRQ/ISR context cannot — keep ISRs short; defer to threaded IRQ or workqueue.</p>`,
          quiz: { q: 'Can a hard IRQ handler safely call mutex_lock and sleep?', options: ['Yes, always', 'No — IRQs must not sleep', 'Only on PREEMPT_RT'], answer: 1 }
        },
        {
          html: `<p><strong>Try this (mental):</strong> Trace one <code>read()</code> from app → VFS → <code>cdev</code> → your <code>.read</code> → DMA complete wait → copy_to_user.</p>
          <p>Then open pet project <code>projects/01-char-driver-lab/userspace_mock/</code> and step the same flow in the C++ simulator.</p>`,
          quiz: { q: 'Where should heavy frame processing usually run?', options: ['Hard IRQ', 'Thread / process context woken by IRQ', 'Inside spinlock with IRQs off forever'], answer: 1 }
        }
      ]
    },
    bringup: {
      title: 'Bring-up checklist',
      steps: [
        {
          html: `<p>Order matters. Power → clocks/resets → pinmux → Device Tree → driver probe → userspace test.</p>
          <ol><li>Rails within spec? Sequenced?</li><li>Clocks enabled at expected rates?</li><li>DT <code>compatible</code>, <code>reg</code>, <code>interrupts</code>, supplies correct?</li><li>Does <code>probe()</code> succeed? Check dmesg.</li><li>Can userspace open and talk?</li></ol>`,
          quiz: { q: 'You see probe deferred forever. First place to look?', options: ['Rewrite the app in Rust', 'Missing regulator/clock/GPIO dependency in DT', 'Buy a new laptop'], answer: 1 }
        },
        {
          html: `<p><strong>Cross-layer debug:</strong> When video doesn't appear, don't only blame the ISP driver. Check sensor I2C, MIPI lanes, DT endpoint links, IOMMU, CMA pool size.</p>
          <p>Poly habit: write one short design/debug note per sticky bug — that's interview gold later.</p>`,
          quiz: { q: 'Device Tree primarily describes…', options: ['Userspace APIs', 'Board hardware topology & resources', 'Git branching strategy'], answer: 1 }
        },
        {
          html: `<p>Use <code>projects/02-dt-bringup/</code> — sample DTS + validator + checklist markdown. Practice explaining a bring-up failure in 90 seconds.</p>`,
          quiz: null
        }
      ]
    },
    vision: {
      title: 'Edge vision pipeline budget',
      steps: [
        {
          html: `<p><strong>Path:</strong> Sensor → MIPI → ISP → DRAM → encode/infer → host/robot.</p>
          <p>Your Ambarella CV7 / Qualcomm story is exactly this factory line. Every stage has latency + memory + power cost.</p>`,
          quiz: { q: 'Why does DRAM bandwidth matter in multi-camera SoCs?', options: ["It doesn't", 'Multiple writers (ISP, encoders, CPUs) contend for the warehouse', 'Only for gaming PCs'], answer: 1 }
        },
        {
          html: `<p>Budget example (illustrative): capture 8ms + ISP 10ms + infer 15ms + post 5ms = 38ms → ~26 FPS headroom before control loop.</p>
          <p>Measure end-to-end, not just model FPS. Dropped frames and queueing often dominate.</p>`,
          quiz: { q: 'Best first metric for a robot perception loop?', options: ['Only peak TOPS', 'End-to-end latency + jitter + drop rate', 'Lines of Python'], answer: 1 }
        },
        {
          html: `<p>Build <code>projects/03-edge-perception/</code> — OpenCV pipeline with latency histogram. Document how you'd map stages to Ambarella/QC blocks in an interview.</p>`,
          quiz: null
        }
      ]
    },
    story: {
      title: 'Systems interview story template',
      steps: [
        {
          html: `<p>Use <strong>SCCR</strong>:</p>
          <ul><li><strong>Situation</strong> — product, constraint (FPS, thermal, bring-up deadline)</li>
          <li><strong>Constraint</strong> — what made it hard (cross-layer, intermittent, field-only)</li>
          <li><strong>Cross-layer debug</strong> — what you measured, hypotheses, tools</li>
          <li><strong>Result</strong> — quantified outcome + what you'd reuse</li></ul>`,
          quiz: { q: 'What should the Result emphasize?', options: ['That you typed fast', 'Quantified impact + transferable judgment', 'Blaming a vendor silently'], answer: 1 }
        },
        {
          html: `<p>Practice with <code>projects/06-host-io-stories/</code> case studies (DMA stuck, IRQ storm, DT mismatch). Timebox 2 minutes aloud.</p>`,
          quiz: null
        }
      ]
    },
    coding: {
      title: 'Interview coding warm-up rules',
      steps: [
        {
          html: `<p><strong>Rules that build real skill:</strong></p>
          <ol><li>Timer on (45–60 min session).</li>
          <li><strong>No AI during the attempt</strong> — struggle is the workout.</li>
          <li>After: review NeetCode/editorial; rewrite a clean solution.</li>
          <li>Say complexity out loud; test edge cases.</li>
          <li>Prefer C++ STL fluency for systems roles.</li></ol>`,
          quiz: { q: 'When is AI allowed in this gym?', options: ['During the timed attempt', 'Only after your own attempt, for review', 'Always'], answer: 1 }
        },
        {
          html: `<p>Track progress in <code>projects/07-interview-gym/</code> and the hub Job/Gym page. Target 4–5 problems/week in M1–3.</p>`,
          quiz: null
        }
      ]
    }
  };

  function mount(containerId, key) {
    const tut = TUTORIALS[key];
    const root = document.getElementById(containerId);
    if (!tut || !root) return;
    let step = 0;
    const progressKey = 'tut-' + key;

    function render() {
      const s = tut.steps[step];
      const dots = tut.steps.map((_, i) =>
        `<button type="button" class="step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}" data-jump="${i}">${i + 1}</button>`
      ).join('');
      let quizHtml = '';
      if (s.quiz) {
        quizHtml = `<div class="quiz"><strong>${s.quiz.q}</strong>` +
          s.quiz.options.map((o, i) =>
            `<label><input type="radio" name="q-${key}" value="${i}"> ${o}</label>`
          ).join('') +
          `<button type="button" class="btn primary" data-check>Check</button><div class="feedback" data-fb></div></div>`;
      }
      root.innerHTML = `
        <h3 style="margin-top:0">${tut.title}</h3>
        <div class="stepper">${dots}</div>
        <div class="step-body">${s.html}${quizHtml}</div>
        <div class="step-nav">
          <button type="button" class="btn" data-back ${step === 0 ? 'disabled' : ''}>Back</button>
          <span style="color:var(--text-dim);font-size:0.8rem">Step ${step + 1}/${tut.steps.length}</span>
          <button type="button" class="btn primary" data-next>${step === tut.steps.length - 1 ? 'Done' : 'Next'}</button>
        </div>`;

      root.querySelectorAll('[data-jump]').forEach((b) =>
        b.addEventListener('click', () => { step = +b.getAttribute('data-jump'); render(); })
      );
      root.querySelector('[data-back]')?.addEventListener('click', () => { step--; render(); });
      root.querySelector('[data-next]')?.addEventListener('click', () => {
        if (step < tut.steps.length - 1) { step++; render(); }
        else {
          const cb = document.querySelector(`[data-progress-id="${progressKey}"]`);
          if (cb && !cb.checked) { cb.checked = true; HubProgress.set(progressKey, true); }
        }
      });
      root.querySelector('[data-check]')?.addEventListener('click', () => {
        const sel = root.querySelector(`input[name="q-${key}"]:checked`);
        const fb = root.querySelector('[data-fb]');
        if (!sel) { fb.textContent = 'Pick an answer.'; fb.className = 'feedback bad'; return; }
        if (+sel.value === s.quiz.answer) {
          fb.textContent = 'Correct — solid systems instinct.';
          fb.className = 'feedback ok';
        } else {
          fb.textContent = 'Not quite — re-read the step, then retry.';
          fb.className = 'feedback bad';
        }
      });
    }
    render();
  }

  function initAll() {
    Object.keys(TUTORIALS).forEach((key) => {
      const el = document.getElementById('tutorial-' + key);
      if (el) mount('tutorial-' + key, key);
    });
  }

  global.HubTutorials = { initAll, TUTORIALS, mount };
})(window);
