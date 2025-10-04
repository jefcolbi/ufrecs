// Page script: Global Results
// - Fetches candidate parties (paged) and results periodically

(function () {
  function log(...args) { console.log('[GlobalResults]', ...args); }
  function fmtHour(value) { const d = (value instanceof Date) ? value : new Date(value); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  function animateNumber($el, to, duration = 600) { const from = 0; const start = performance.now(); function step(now) { const t = Math.min(1, (now - start) / duration); const val = Math.round(from + (to - from) * t); $el.text(val.toString()); if (t < 1) requestAnimationFrame(step); } requestAnimationFrame(step); }

  function renderResults($root, resultsResponse, partyById) {
    const data = resultsResponse || {};
    const totals = data.totals || { total_ballots: data.totalBallots, total_sources: data.totalSources } || {};
    const results = data.results || [];
    const lastPaper = data.last_paper || data.lastPaper || {};

    const $container = $('<div class="container-xxl"></div>');
    const $row = $('<div class="row"></div>');

    const $left = $('<div class="col-12 col-lg-6 p-3"></div>');
    const $list = $('<ul class="list-group"></ul>');
    const totalItem = $(`<li class="list-group-item d-flex justify-content-between align-items-center"><div>Total Ballots</div><div class="fw-semibold" data-animate-number="${totals.total_ballots || data.totalBallots || 0}">0</div></li>`);
    const sourceItem = $(`<li class="list-group-item d-flex justify-content-between align-items-center"><div>Total Sources</div><div class="fw-semibold" data-animate-number="${totals.total_sources || data.totalSources || 0}">0</div></li>`);
    $list.append(totalItem, sourceItem);
    results.forEach(item => {
      const id = item.party_id || item.partyId;
      const p = partyById[id];
      let display = id;
      if (p) {
        if (p.candidate_name && p.party_name) display = `${p.candidate_name} — ${p.party_name}`;
        else if (p.candidate_name) display = p.candidate_name;
        else if (p.party_name) display = p.party_name;
      }
      const share = item.share || 0; const ballots = item.ballots || 0;
      const $li = $(`<li class="list-group-item">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width:32px;height:32px;">${(display||'?')[0]}</div>
            <div class="fw-semibold">${display}</div>
          </div>
          <div class="text-end"><div data-animate-number="${ballots}">0</div><div>${(share * 100).toFixed(1)}%</div></div>
        </div>
        <div class="progress mt-2" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(share*100).toFixed(1)}"><div class="progress-bar" style="width:${(share * 100).toFixed(1)}%"></div></div>
      </li>`);
      $list.append($li);
    });
    $left.append($list);

    const $right = $('<div class="col-12 col-lg-6 p-3"></div>');
    $right.append('<h5 class="mb-3">Last Paper</h5>');
    const $table = $('<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Source</th><th>Party</th></tr></thead><tbody></tbody></table></div>');
    Object.entries(lastPaper).forEach(([source, entry]) => {
      const isAccepted = source === 'Accepted';
      const id = entry.party_id || entry.partyId; const p = partyById[id]; let display = id;
      if (p) { if (p.candidate_name && p.party_name) display = `${p.candidate_name} — ${p.party_name}`; else if (p.candidate_name) display = p.candidate_name; else if (p.party_name) display = p.party_name; }
      $table.find('tbody').append(`<tr class="${isAccepted ? 'row-accepted' : ''}"><td>${source}</td><td>${display}</td></tr>`);
    });
    $right.append($table);

    $row.append($left).append($right);
    $container.append($row);
    $root.empty().append($container);
    $root.find('[data-animate-number]').each(function () { const to = parseInt(this.getAttribute('data-animate-number') || '0', 10); animateNumber($(this), isNaN(to) ? 0 : to); });
  }

  async function loadCandidatePartiesAll() {
    const limit = 100; let offset = 0; const out = [];
    while (true) {
      try {
        const data = await $.ajax({ url: '/api/candidateparties/', method: 'GET', dataType: 'json', data: { limit, offset } });
        const results = (data && data.results) || [];
        out.push(...results);
        if (results.length < limit) break;
        offset += results.length;
      } catch (err) { break; }
    }
    return out;
  }

  $(async function () {
    const $root = $('#page-root');
    let partyById = {};
    try {
      const parties = await loadCandidatePartiesAll();
      parties.forEach(p => { const id = p.identifier || p.id; if (id != null) partyById[id] = p; });
      log('Loaded candidate parties', parties.length);
    } catch (err) { log('Failed loading candidate parties', err); }

    async function load() {
      try {
        const data = await $.ajax({ url: '/api/pollofficeresults/', method: 'GET', dataType: 'json' });
        renderResults($root, data, partyById);
      } catch (err) {
        $root.html(`<div class="alert alert-danger">Failed to load results.</div>`);
        log('Results load failed', err);
      }
    }

    load(); setInterval(load, 60 * 1000);
  });
})();

