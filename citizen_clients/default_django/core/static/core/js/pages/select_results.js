// Page script: Select Poll Office (Results)
// - Uses Select2 with remote search to /api/polloffices/?search=...
// - Navigates to poll-office-results with selected id

(function () {
  function log(...args) { console.log('[SelectResults]', ...args); }

  $(function () {
    const $select = $('#office-select');
    const $info = $('#office-info');
    const $button = $('#open-button');
    let selected = null;

    function saveSelectedToStorage(office) {
      try {
        if (!office || office.id == null) return;
        const key = `pollOffice:${office.id}`;
        localStorage.setItem(key, JSON.stringify(office));
        localStorage.setItem('pollOffice:lastSelectedId', String(office.id));
      } catch (e) {
        console.warn('[SelectResults] Failed to save to localStorage', e);
      }
    }

    function renderInfo() {
      if (!selected) { $info.empty(); $button.prop('disabled', true); return; }
      $button.prop('disabled', false);
      const o = selected;
      const item = (label, value) => (value !== undefined && value !== null && value !== '')
        ? `<div class="row small py-1"><div class="col-4 text-muted">${label}</div><div class="col-8">${value}</div></div>`
        : '';
      $info.html(`
        <div class="border rounded p-3">
          <div class="fw-semibold mb-2">${o.name || o.identifier || ('Office ' + o.id)}</div>
          ${item('Identifier', o.identifier)}
          ${item('ID', o.id)}
          ${item('Voters', o.voters_count)}
          ${item('Country', o.country)}
          ${item('State', o.state)}
          ${item('Region', o.region)}
          ${item('City', o.city)}
          ${item('County', o.county)}
          ${item('District', o.district)}
        </div>`);
    }

    if (!$.fn.select2) {
      console.error('Select2 not loaded');
      return;
    }

    $select.select2({
      width: '100%',
      placeholder: 'Type at least 3 characters to search',
      minimumInputLength: 3,
      ajax: {
        url: '/api/polloffices/',
        dataType: 'json',
        delay: 250,
        data: params => ({ search: params.term }),
        processResults: (data) => {
          const results = (data && data.results) || [];
          return {
            results: results.map(o => ({ id: o.id, text: o.name || o.identifier || (`Office ${o.id}`), raw: o }))
          };
        },
        cache: true,
      },
      templateResult: (item) => {
        if (item.loading) return item.text;
        const o = item.raw || {}; const idf = o.identifier ? ` (${o.identifier})` : '';
        return $(`<div>${item.text}${idf}</div>`);
      },
      templateSelection: (item) => item.text || item.id,
    });

    $select.on('select2:select', (e) => {
      const data = e.params.data; selected = data && (data.raw || null);
      log('Selected', selected);
      // Persist selection so other pages can show the name without re-fetching
      if (selected) saveSelectedToStorage(selected);
      renderInfo();
    });

    $button.on('click', () => {
      if (!selected) return;
      const resultsBase = document.body.getAttribute('data-url-poll-results') || '/poll-office-results/';
      const href = `${resultsBase}?id=${encodeURIComponent(selected.id)}`;
      log('Navigate to', href);
      window.location.href = href;
    });
  });
})();
