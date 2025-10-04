// Page script: Global Stats
// - Fetches /api/pollofficestats/ periodically and renders stats UI

(function () {
  function log(...args) { console.log('[GlobalStats]', ...args); }

  function fmtHour(value) { const d = (value instanceof Date) ? value : new Date(value); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function animateNumber($el, to, duration = 600) {
    const from = 0; const start = performance.now();
    function step(now) { const t = Math.min(1, (now - start) / duration); const val = Math.round(from + (to - from) * t); $el.text(val.toString()); if (t < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  function renderStats($root, data, { showTotalOffices = true, showCoveredOffices = true } = {}) {
    const totals = (data && data.totals) || {};
    const lastVote = (data && (data.last_vote || data.lastVote)) || {};

    const $container = $('<div class="container-xxl"></div>');
    const $clock = $('<div class="clock-bar py-2 px-3 d-flex align-items-center gap-2"><span aria-hidden="true">🕒</span><span class="clock-text" id="clock-text">--:--</span></div>');
    $container.append($clock);
    startClock($clock.find('#clock-text'));

    const $row = $('<div class="row g-0"></div>');
    const $side = $('<div class="col-12 col-lg-4 stats-side p-3"></div>');
    $side.append('<h5 class="mb-3">Totals</h5>');
    const metric = (label, value) => (`<div class="d-flex justify-content-between align-items-center py-2"><div>${label}</div><div class="fw-semibold" data-animate-number="${value || 0}">0</div></div>`);
    if (showTotalOffices) $side.append(metric('Total Poll Offices', totals.total_poll_offices));
    if (showCoveredOffices) $side.append(metric('Covered Poll Offices', totals.covered_poll_offices));
    $side.append(metric('Total Sources', totals.total_sources));
    $side.append(metric('Votes', totals.votes));
    $side.append(metric('Male', totals.male));
    $side.append(metric('Female', totals.female));
    $side.append(metric('&lt; 30', totals.less_30));
    $side.append(metric('&lt; 60', totals.less_60));
    $side.append(metric('&gt; 60', totals.more_60));
    $side.append(metric('Has Torn', totals.has_torn));

    const firstEntry = Object.values(lastVote)[0];
    const indexLabel = firstEntry ? firstEntry.index : '';
    const $tableWrap = $('<div class="col-12 col-lg-8 p-3 border-start ps-3"></div>');
    $tableWrap.append(`<h5 class="mb-3">Last Vote - ${indexLabel || ''}</h5>`);
    const $table = $('<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Source</th><th>Gender</th><th>Age</th><th>Torn</th><th>Hour</th></tr></thead><tbody></tbody></table></div>');
    Object.entries(lastVote).forEach(([source, entry]) => {
      let rowClass = '';
      if (source === 'Accepted') rowClass = 'row-accepted';
      else if (source === 'Verified') rowClass = 'row-verified';

      const gender = (entry && entry.gender != null && entry.gender !== '') ? entry.gender : '-';
      const age = (entry && (entry.age || entry.age === 0)) ? entry.age : '-';

      let tornIcon = '-';
      if (entry && typeof entry.has_torn === 'boolean') {
        tornIcon = entry.has_torn ? '<span class="text-success">✔</span>' : '<span class="text-danger">✖</span>';
      }

      const ts = entry && (entry.created_at || entry.timestamp);
      const hour = ts ? fmtHour(ts) : '-';

      $table.find('tbody').append(`<tr class="${rowClass}"><td>${source}</td><td>${gender}</td><td>${age}</td><td>${tornIcon}</td><td>${hour}</td></tr>`);
    });
    $row.append($side);
    $tableWrap.append($table);
    $row.append($tableWrap);
    $container.append($row);
    $root.empty().append($container);
    $root.find('[data-animate-number]').each(function () { const to = parseInt(this.getAttribute('data-animate-number') || '0', 10); animateNumber($(this), isNaN(to) ? 0 : to); });
  }

  let clockTimer = null;
  function startClock($el) {
    function tick() {
      const now = new Date();
      const formatted = now.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' • ' + fmtHour(now) + ':' + now.toLocaleTimeString([], { second: '2-digit' }).split(':').pop();
      $el.text(formatted);
    }
    tick(); if (clockTimer) clearInterval(clockTimer); clockTimer = setInterval(tick, 1000);
  }

  $(function () {
    const $root = $('#page-root');
    function load() {
      $.ajax({ url: '/api/pollofficestats/', method: 'GET', dataType: 'json' })
        .done(data => { renderStats($root, data, { showTotalOffices: true, showCoveredOffices: true }); })
        .fail(err => { $root.html(`<div class="alert alert-danger">Failed to load stats: ${err.status} ${err.statusText}</div>`); log('Stats load failed', err); });
    }
    load(); setInterval(load, 60 * 1000);
  });
})();
