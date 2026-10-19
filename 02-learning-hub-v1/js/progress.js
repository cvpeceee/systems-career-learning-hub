/**
 * Progress persistence via localStorage
 */
(function (global) {
  const KEY = 'chandra-learning-hub-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function get(id) {
    return !!load()[id];
  }

  function set(id, val) {
    const d = load();
    d[id] = !!val;
    save(d);
    updateUI();
  }

  function allIds() {
    return Array.from(document.querySelectorAll('[data-progress-id]')).map(
      (el) => el.getAttribute('data-progress-id')
    );
  }

  function updateUI() {
    const ids = allIds();
    const data = load();
    let done = 0;
    ids.forEach((id) => {
      const el = document.querySelector(`[data-progress-id="${id}"]`);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!data[id];
        if (data[id]) done++;
      }
    });
    const total = ids.length || 1;
    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${done}/${total} checks · ${pct}%`;
  }

  function bind() {
    document.querySelectorAll('[data-progress-id]').forEach((el) => {
      if (el.type === 'checkbox') {
        el.checked = get(el.getAttribute('data-progress-id'));
        el.addEventListener('change', () => {
          set(el.getAttribute('data-progress-id'), el.checked);
        });
      }
    });
    updateUI();
  }

  global.HubProgress = { load, save, get, set, bind, updateUI };
})(window);
