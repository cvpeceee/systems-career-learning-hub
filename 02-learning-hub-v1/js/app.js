/**
 * SPA navigation + resource rendering
 */
(function () {
  function showView(id) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    const view = document.getElementById('view-' + id);
    const btn = document.querySelector(`.nav-btn[data-view="${id}"]`);
    if (view) view.classList.add('active');
    if (btn) btn.classList.add('active');
    history.replaceState(null, '', '#' + id);
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo(0, 0);
  }

  function renderResources() {
    const tbody = document.querySelector('#res-body');
    if (!tbody || !window.HUB_RESOURCES) return;
    const filter = document.getElementById('res-filter')?.value || 'ALL';
    tbody.innerHTML = '';
    HUB_RESOURCES.filter((r) => filter === 'ALL' || r.p === filter).forEach((r) => {
      const tr = document.createElement('tr');
      const badges = `<span class="badge ${r.p.toLowerCase()}">${r.p}</span>` +
        (r.gated ? '<span class="badge gated">gated</span>' : '<span class="badge free">free</span>');
      tr.innerHTML = `<td>${badges}</td><td><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></td><td>${r.note}</td>`;
      tbody.appendChild(tr);
    });
  }

  function initNav() {
    document.querySelectorAll('.nav-btn[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => showView(btn.getAttribute('data-view')));
    });
    document.querySelectorAll('[data-goto]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showView(el.getAttribute('data-goto'));
      });
    });
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });
    document.getElementById('res-filter')?.addEventListener('change', renderResources);

    // demo chips scroll
    document.querySelectorAll('.chip[data-scroll]').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.getElementById(chip.getAttribute('data-scroll'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const hash = (location.hash || '#home').slice(1);
    showView(document.getElementById('view-' + hash) ? hash : 'home');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    renderResources();
    HubProgress.bind();
    HubAnimations.initAll();
    HubTutorials.initAll();
  });
})();
