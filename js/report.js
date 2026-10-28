// ─────────────────────────────────────────────
// Report Screen — Summary, Readiness, Charts,
//                 Gaps, Comparison & Sharing
// ─────────────────────────────────────────────

let _charts = [];

function showReport() {
  STATE.screen = 'report';
  clearTimeout(_advanceTimer);
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('assessment').classList.add('hidden');

  _charts.forEach(c => c.destroy());
  _charts = [];

  const reportEl = document.getElementById('report');
  reportEl.classList.remove('hidden');
  reportEl.innerHTML = buildReportHTML();
  window.scrollTo(0, 0);

  setTimeout(() => {
    _charts = [
      renderRadar('chartCat1', reportAspectIds('1')),
      renderRadar('chartCat2', reportAspectIds('2')),
    ].filter(Boolean);
  }, 50);
}

/** Aspect ids of a category that have controls at the target level. */
function reportAspectIds(cat) {
  const used = new Set(getActiveControls().map(c => c.aspect));
  return Object.keys(ASPECTS).filter(a => ASPECTS[a].cat === cat && used.has(a));
}

function backToAssessment() {
  enterAssessment();
}

// ── HTML builders ──────────────────────────────

function buildReportHTML() {
  const controls = getActiveControls();
  const n        = countStatuses(controls);
  const score    = scoreOf(controls) ?? 0;
  const gaps     = getGaps(controls);
  const cmp      = compareWithBaseline(controls);

  return `
    ${buildBrandingHeader()}
    ${buildSharedBanner()}

    <div class="report-header">
      <h1>${t('reportTitle')}</h1>
      <p>${t('reportSub')}</p>
      <div class="report-meta">
        ${STATE.orgName ? `<span class="meta-tag">${t('metaOrg')}: <strong>${esc(STATE.orgName)}</strong></span>` : ''}
        <span class="meta-tag">${t('metaTarget')}: ${STATE.targetLevel}</span>
        <span class="meta-tag">${t('metaEvaluated')}: ${controls.length - n.unanswered} / ${controls.length}</span>
        <span class="meta-tag">${t('metaDate')}: ${formatDate(todayISO())}</span>
        ${cmp ? `<span class="meta-tag">${t('metaBaseline')}: ${formatDate(cmp.date) || '—'}</span>` : ''}
      </div>
    </div>

    ${buildToolbar()}
    ${buildExecutiveSummaryHTML()}
    ${buildReadiness()}
    ${buildScoreCards(score, n, cmp)}
    ${buildLevelBreakdown(controls)}

    <div class="charts-grid">
      <div class="chart-card">
        <h3>${t('cat1Title')}</h3>
        <div id="filterCat1" class="chart-filters"></div>
        <canvas id="chartCat1" height="260"></canvas>
      </div>
      <div class="chart-card">
        <h3>${t('cat2Title')}</h3>
        <div id="filterCat2" class="chart-filters"></div>
        <canvas id="chartCat2" height="260"></canvas>
      </div>
    </div>

    ${buildComparison(cmp)}
    ${buildGapsSection(gaps)}
    ${buildRemediationPlan(controls)}
    ${buildResultsTable(controls)}

    <p class="disclaimer">${t('disclaimer')}</p>
    <button class="btn-restart" onclick="restartAssessment()">${t('btnRestart')}</button>`;
}

function buildBrandingHeader() {
  const logo = BRANDING.logoUrl
    ? `<img src="${BRANDING.logoUrl}" class="report-brand-logo" alt="${BRANDING.companyName}">`
    : '';
  return `
    <div class="report-brand">
      ${logo}
      <span class="report-brand-name">${BRANDING.companyName}</span>
    </div>`;
}

/** Banner shown when the report was loaded from a shared URL. */
function buildSharedBanner() {
  if (STATE.isShared === 'readonly') {
    return `
      <div class="share-banner">
        <span class="share-badge">${t('sharedBadge')}</span>
        <p>${t('sharedBannerText')}</p>
      </div>`;
  }
  if (STATE.isShared === 'edit') {
    return `
      <div class="share-banner edit">
        <span class="share-badge">${t('editBadge')}</span>
        <p>${t('editBannerText')}</p>
      </div>`;
  }
  return '';
}

function buildToolbar() {
  const back = STATE.isShared === 'readonly'
    ? '<span></span>'
    : `<button class="btn-action btn-ghost" onclick="backToAssessment()">${t('btnBackToAssessment')}</button>`;
  const compare = STATE.baseline
    ? `<button class="btn-action btn-ghost" onclick="clearBaseline()">${t('btnClearCompare')}</button>`
    : `<button class="btn-action btn-ghost" onclick="loadBaseline()">${t('btnCompare')}</button>`;

  return `
    <div class="report-toolbar">
      ${back}
      <div class="tb-group">
        ${compare}
        <button class="btn-action" id="btnShare" onclick="shareReport()" title="${t('shareWarning')}">${t('btnShare')}</button>
        <div class="btn-segmented" role="group" aria-label="${t('exportLabel')}">
          <button class="btn-action" onclick="exportXLSX()">Excel</button>
          <button class="btn-action" onclick="exportCSV()">CSV</button>
          <button class="btn-action" onclick="exportJSON()">JSON</button>
        </div>
        <button class="btn-action btn-pdf" onclick="exportPDF()">${t('btnExport')}</button>
      </div>
    </div>`;
}

function buildExecutiveSummaryHTML() {
  return `
    <div class="report-section">
      <h2>${t('summaryTitle')}</h2>
      <div class="exec-summary">
        ${buildExecutiveSummary().map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
    </div>`;
}

function buildReadiness() {
  const r = computeReadiness();

  const levels = r.perLevel.map(l => `
    <div class="rl-row ${l.met ? 'met' : ''}">
      <span class="tag tag-level ${l.level}">${t('levelPrefix')} ${l.level}</span>
      <span class="rl-status">${l.met ? t('levelMet') : t('levelPending', { n: l.pending.length })}</span>
    </div>`).join('');

  const pending = r.next ? `
    <details class="pending-list">
      <summary>${t('pendingFor', { level: r.next.level })} (${r.next.pending.length})</summary>
      <ul>
        ${r.next.pending.map(c => {
          const s = statusOf(c.id);
          return `<li><span class="pl-id">${c.id}</span><span class="pl-name">${c.name}</span><span class="status-pill pill-${s}">${statusLabel(s)}</span></li>`;
        }).join('')}
      </ul>
    </details>` : '';

  return `
    <div class="report-section">
      <h2>${t('readinessTitle')}</h2>
      <div class="readiness-card ${r.achieved ? '' : 'none'}">
        <div class="readiness-main">
          <div class="readiness-label">${t('levelAchieved')}</div>
          <div class="readiness-value">${r.achieved ? `${t('levelPrefix')} ${r.achieved}` : t('noLevelAchieved')}</div>
          <div class="readiness-sub">${r.next
            ? t('readinessNext', { level: r.next.level, n: r.next.pending.length })
            : t('readinessAllMet', { level: STATE.targetLevel })}</div>
        </div>
        <div class="readiness-levels">${levels}</div>
      </div>
      ${pending}
      <p class="section-note">${t('readinessNote')}</p>
    </div>`;
}

function buildScoreCards(score, n, cmp) {
  const delta = cmp ? formatDelta(score, cmp.scoreBefore ?? 0) : '';
  const deltaClass = cmp && score > (cmp.scoreBefore ?? 0) ? 'up' : cmp && score < (cmp.scoreBefore ?? 0) ? 'down' : '';
  return `
    <div class="score-cards">
      <div class="score-card">
        <div class="big blue">${score}%</div><div class="lbl">${t('scoreGlobal')}</div>
        ${cmp ? `<div class="delta ${deltaClass}">${delta} <span>${t('vsBaseline')}</span></div>` : ''}
      </div>
      <div class="score-card"><div class="big green">${n.in_place}</div><div class="lbl">${t('scoreInPlace')}</div></div>
      <div class="score-card"><div class="big amber">${n.partial}</div><div class="lbl">${t('scorePartial')}</div></div>
      <div class="score-card"><div class="big red">${n.not_in_place}</div><div class="lbl">${t('scoreNotInPlace')}</div></div>
      <div class="score-card"><div class="big" style="color:var(--neutral)">${n.na}</div><div class="lbl">${t('scoreNA')}</div></div>
    </div>`;
}

function buildLevelBreakdown(controls) {
  if (STATE.targetLevel === 'I') return '';

  const levels = ['I', 'II', 'III'].slice(0, LEVEL_ORDER[STATE.targetLevel]);

  const rows = levels.map(lvl => {
    const lvlControls = controls.filter(c => c.introducedAt === lvl);
    const n           = countStatuses(lvlControls);
    const score       = scoreOf(lvlControls) ?? 0;

    return `
      <div class="lbr-row">
        <div class="lbr-label">
          <span class="tag tag-level ${lvl}">${t('levelPrefix')} ${lvl}</span>
          <span class="lbr-count">${lvlControls.length} ${t('controlsWord')}</span>
        </div>
        <div class="lbr-divider"></div>
        <div class="lbr-stats">
          <span class="lbr-score">${score}%</span>
          <div class="lbr-bar-wrap">
            <div class="lbr-bar-track">
              <div class="lbr-bar-fill" style="width:${score}%"></div>
            </div>
          </div>
          <span class="lbr-stat" title="${t('statusInPlace')}"><span class="status-dot in_place"></span><span class="n">${n.in_place}</span></span>
          <span class="lbr-stat" title="${t('statusPartial')}"><span class="status-dot partial"></span><span class="n">${n.partial}</span></span>
          <span class="lbr-stat" title="${t('statusNotInPlace')}"><span class="status-dot not_in_place"></span><span class="n">${n.not_in_place}</span></span>
          <span class="lbr-stat" title="${t('statusNA')}"><span class="status-dot na"></span><span class="n">${n.na}</span></span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="level-breakdown">
      <h2>${t('levelBreakdownTitle')}</h2>
      ${rows}
    </div>`;
}

function buildComparison(cmp) {
  if (!cmp) return '';

  const now        = aspectScores();
  const before     = cmp.scoreBefore ?? 0;
  const after      = cmp.scoreAfter ?? 0;
  const levelName  = lvl => lvl ? `${t('levelPrefix')} ${lvl}` : t('noLevelAchieved');
  const deltaClass = (a, b) => a > b ? 'up' : a < b ? 'down' : '';

  const aspectRows = Object.keys(now).map(id => {
    const b = cmp.aspectsBefore[id] ?? null, a = now[id];
    return `
      <tr>
        <td>${id}</td><td>${ASPECTS[id].name}</td>
        <td>${b === null ? '—' : b + '%'}</td><td>${a === null ? '—' : a + '%'}</td>
        <td><span class="delta ${deltaClass(a ?? 0, b ?? 0)}">${formatDelta(a, b)}</span></td>
      </tr>`;
  }).join('');

  const changeRows = cmp.changes.map(ch => `
    <tr>
      <td>${ch.control.id}</td><td>${ch.control.name}</td>
      <td><span class="status-pill pill-${ch.before}">${statusLabel(ch.before)}</span></td>
      <td><span class="status-pill pill-${ch.after}">${statusLabel(ch.after)}</span></td>
      <td><span class="trend trend-${ch.trend}">${t('trend_' + ch.trend)}</span></td>
    </tr>`).join('');

  return `
    <div class="report-section">
      <h2>${t('compareTitle')}</h2>
      <div class="compare-kpis">
        <div class="compare-kpi">
          <div class="lbl">${t('scoreGlobal')}</div>
          <div class="val">${before}% → ${after}% <span class="delta ${deltaClass(after, before)}">${formatDelta(after, before)}</span></div>
        </div>
        <div class="compare-kpi">
          <div class="lbl">${t('compareLevel')}</div>
          <div class="val">${levelName(cmp.achievedBefore)} → ${levelName(computeReadiness().achieved)}</div>
        </div>
        <div class="compare-kpi"><div class="lbl">${t('compareImproved')}</div><div class="val up">${cmp.improved}</div></div>
        <div class="compare-kpi"><div class="lbl">${t('compareWorsened')}</div><div class="val down">${cmp.worsened}</div></div>
      </div>

      <div class="results-table inner">
        <table>
          <thead><tr><th>ID</th><th>${t('tableAspect')}</th><th>${t('compareBefore')}</th><th>${t('compareAfter')}</th><th>Δ</th></tr></thead>
          <tbody>${aspectRows}</tbody>
        </table>
      </div>

      ${cmp.changes.length ? `
      <div class="results-table inner">
        <table>
          <thead><tr><th>ID</th><th>${t('tableControl')}</th><th>${t('compareBefore')}</th><th>${t('compareAfter')}</th><th>${t('tableTrend')}</th></tr></thead>
          <tbody>${changeRows}</tbody>
        </table>
      </div>` : `<p class="section-note">${t('noChanges')}</p>`}
    </div>`;
}

/** Evidence text, rendered as a link when it is an http(s) URL. */
function evidenceHtml(value) {
  const safe = esc(value);
  return /^https?:\/\//i.test(value) ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>` : safe;
}

function buildGapsSection(gaps) {
  if (gaps.length === 0) {
    return `<div class="gaps-section"><h2>${t('noGaps')}</h2></div>`;
  }

  const cards = gaps.map(c => {
    const isPartial = STATE.answers[c.id] === 'partial';
    const a         = getAction(c.id);
    const meta      = [];
    if (STATE.options.remediation) {
      const p = effectivePriority(c);
      meta.push(`<span class="priority priority-${p}">${t('priority_' + p)}</span>`);
      meta.push(`<span>${t('tableOwner')}: ${a.owner ? esc(a.owner) : `<em>${t('unassigned')}</em>`}</span>`);
      if (a.due) meta.push(`<span class="${isOverdue(a.due) ? 'overdue' : ''}">${t('tableDue')}: ${formatDate(a.due)}${isOverdue(a.due) ? ` (${t('overdue')})` : ''}</span>`);
    }
    return `
      <div class="gap-card ${isPartial ? 'partial' : ''}">
        <div class="gc-id">${c.id} — ${t('gapLevel')} ${c.introducedAt}${STATE.flags[c.id] ? ` <span class="gc-flag">${FLAG_ICON}</span>` : ''}</div>
        <div class="gc-name">${c.name}</div>
        <div class="gc-req">${getEffectiveRequirement(c)}</div>
        ${meta.length ? `<div class="gc-meta">${meta.join('')}</div>` : ''}
        ${STATE.options.evidence && STATE.evidence[c.id] ? `<div class="gc-note"><strong>${t('tableEvidence')}</strong>${evidenceHtml(STATE.evidence[c.id])}</div>` : ''}
        ${STATE.notes[c.id] ? `<div class="gc-note"><strong>${t('noteLabel')}</strong>${esc(STATE.notes[c.id])}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="gaps-section">
      <h2>${t('gapsTitle')} (${gaps.length})</h2>
      ${cards}
    </div>`;
}

function buildRemediationPlan(controls) {
  if (!STATE.options.remediation) return '';
  const plan = getRemediationPlan(controls);
  if (!plan.length) return '';

  const rows = plan.map(p => `
    <tr>
      <td><span class="priority priority-${p.priority}">${t('priority_' + p.priority)}</span></td>
      <td>${p.control.id}</td>
      <td style="color:var(--text)">${p.control.name}</td>
      <td><span class="status-pill pill-${p.status}">${statusLabel(p.status)}</span></td>
      <td>${p.owner ? esc(p.owner) : `<em class="muted">${t('unassigned')}</em>`}</td>
      <td class="${p.overdue ? 'overdue' : ''}">${p.due ? formatDate(p.due) : '—'}${p.overdue ? ` · ${t('overdue')}` : ''}</td>
    </tr>`).join('');

  return `
    <div class="report-section">
      <h2>${t('remediationPlanTitle')} (${plan.length})</h2>
      <div class="results-table inner">
        <table>
          <thead><tr>
            <th>${t('tablePriority')}</th><th>ID</th><th>${t('tableControl')}</th>
            <th>${t('tableStatus')}</th><th>${t('tableOwner')}</th><th>${t('tableDue')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function buildResultsTable(controls) {
  const showEvidence = STATE.options.evidence;

  const rows = controls.map(c => {
    const a = statusOf(c.id);
    return `
      <tr>
        <td>${c.id}${STATE.flags[c.id] ? ` <span class="gc-flag" title="${t('flagged')}">${FLAG_ICON}</span>` : ''}</td>
        <td style="max-width:280px;color:var(--text)">${c.name}</td>
        <td><span class="tag tag-aspect" style="font-size:.7rem">${ASPECTS[c.aspect].name}</span></td>
        <td><span class="tag tag-level ${c.introducedAt}">${c.introducedAt}</span></td>
        <td><span class="status-pill pill-${a}">${statusLabel(a)}</span></td>
        ${showEvidence ? `<td class="td-evidence">${evidenceHtml(STATE.evidence[c.id] || '')}</td>` : ''}
        <td style="max-width:180px;color:var(--text3);font-size:.78rem">${esc(STATE.notes[c.id])}</td>
      </tr>`;
  }).join('');

  return `
    <div class="results-table">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>${t('tableControl')}</th><th>${t('tableAspect')}</th>
            <th>${t('tableLevel')}</th><th>${t('tableStatus')}</th>
            ${showEvidence ? `<th>${t('tableEvidence')}</th>` : ''}<th>${t('tableNotes')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Charts ─────────────────────────────────────

const CHART_THEMES = {
  dark:  { grid: 'rgba(255,255,255,0.20)', tick: '#64748b', label: '#94a3b8', point: '#fff',    baseline: '#6b7686', fontSize: 10 },
  light: { grid: 'rgba(0,0,0,0.18)',       tick: '#475569', label: '#475569', point: '#1e293b', baseline: '#94a3b8', fontSize: 10 },
};

/** Datasets and Chart.js config for an aspect radar. Shared by the screen and the PDF. */
function buildRadarConfig(aspectIds, theme, { legend = false } = {}) {
  const LEVEL_CFG = {
    I:   { border: BRANDING.colors.primary, bg: hexToRgba(BRANDING.colors.primary, 0.12) },
    II:  { border: BRANDING.colors.success, bg: hexToRgba(BRANDING.colors.success, 0.12) },
    III: { border: '#7a5cc7',               bg: 'rgba(122,92,199,0.12)'                  },
  };

  const controls = getActiveControls();
  const levels   = ['I', 'II', 'III'].slice(0, LEVEL_ORDER[STATE.targetLevel]);
  const pointColor = v => v >= 80 ? BRANDING.colors.success : v >= 50 ? BRANDING.colors.warning : BRANDING.colors.danger;

  const levelDatasets = levels.map(lvl => {
    const raw = aspectIds.map(asp => {
      const lvlCtrl = controls.filter(c => c.aspect === asp && c.introducedAt === lvl);
      return lvlCtrl.length ? scoreOf(lvlCtrl) ?? 0 : null;
    });
    if (raw.every(v => v === null)) return null;
    const data = raw.map(v => v ?? 0);
    const cfg  = LEVEL_CFG[lvl];
    return {
      label:              `${t('levelPrefix')} ${lvl}`,
      data,
      backgroundColor:    cfg.bg,
      borderColor:        cfg.border,
      borderWidth:        2,
      pointBackgroundColor: data.map(pointColor),
      pointBorderColor:   theme.point,
      pointRadius:        4,
    };
  }).filter(Boolean);

  const scores = aspectScores(controls);

  const overallDataset = levelDatasets.length > 1 ? [{
    label:              t('chartGeneral'),
    data:               aspectIds.map(a => scores[a] ?? 0),
    backgroundColor:    'rgba(148,163,184,0.08)',
    borderColor:        '#94a3b8',
    borderWidth:        2,
    borderDash:         [5, 4],
    pointBackgroundColor: '#94a3b8',
    pointBorderColor:   theme.point,
    pointRadius:        3,
  }] : [];

  const before = STATE.baseline ? aspectScores(controls, STATE.baseline.answers) : null;
  const baselineDataset = before ? [{
    label:              t('chartBaseline'),
    data:               aspectIds.map(a => before[a] ?? 0),
    backgroundColor:    'transparent',
    borderColor:        theme.baseline,
    borderWidth:        1.5,
    borderDash:         [2, 3],
    pointBackgroundColor: theme.baseline,
    pointBorderColor:   theme.baseline,
    pointRadius:        2,
  }] : [];

  const datasets = [...baselineDataset, ...overallDataset, ...levelDatasets];
  const font     = { size: theme.fontSize };

  return {
    type: 'radar',
    data: {
      labels: aspectIds.map(a => ASPECTS[a].name.replace(/ /g, '\n')),
      datasets,
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0, max: 100,
          ticks:       { stepSize: 25, color: theme.tick, backdropColor: 'transparent', font },
          grid:        { color: theme.grid },
          angleLines:  { color: theme.grid },
          pointLabels: { color: theme.label, font },
        },
      },
      plugins: {
        legend:  { display: legend && datasets.length > 1, position: 'bottom', labels: { color: theme.label, font, boxWidth: theme.fontSize * 1.4 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.r}%` } },
      },
    },
  };
}

function renderRadar(canvasId, aspectIds) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || aspectIds.length === 0) return null;

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  const isLight = document.documentElement.classList.contains('theme-light');
  const config  = buildRadarConfig(aspectIds, CHART_THEMES[isLight ? 'light' : 'dark']);
  const chart   = new Chart(canvas, config);
  const datasets = config.data.datasets;

  if (datasets.length > 1) {
    const filterEl = document.getElementById(canvasId.replace('chart', 'filter'));
    if (filterEl) {
      datasets.forEach((ds, i) => {
        const btn = document.createElement('button');
        btn.className = 'chart-filter-btn';
        btn.textContent = ds.label;
        btn.style.borderColor = ds.borderColor;
        btn.style.color       = ds.borderColor;
        btn.style.background  = ds.borderColor + '22';
        btn.addEventListener('click', () => {
          const meta = chart.getDatasetMeta(i);
          meta.hidden = !meta.hidden;
          btn.style.background = meta.hidden ? 'transparent' : ds.borderColor + '22';
          btn.style.opacity    = meta.hidden ? '0.35' : '1';
          chart.update();
        });
        filterEl.appendChild(btn);
      });
    }
  }

  return chart;
}

// ── Comparison with a previous assessment ──────

function loadBaseline() {
  pickJsonFile()
    .then(p => {
      STATE.baseline = {
        answers:     p.answers,
        targetLevel: p.targetLevel,
        orgName:     p.orgName || '',
        date:        p.updatedAt || p.exportedAt || null,
      };
      saveToLocalStorage();
      showReport();
    })
    .catch(err => { if (err !== 'cancelled') alert(t('importError')); });
}

function clearBaseline() {
  STATE.baseline = null;
  saveToLocalStorage();
  showReport();
}

// ── Share via URL hash ─────────────────────────

function encodePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function shareProgress() {
  const url = `${location.origin}${location.pathname}#edit=${encodePayload(serializeState())}`;
  copyToClipboard(url, 'btnProgress');
}

function shareReport() {
  const url = `${location.origin}${location.pathname}#share=${encodePayload(serializeState({ includeLang: false }))}`;
  copyToClipboard(url, 'btnShare');
}

function copyToClipboard(url, btnId) {
  const btn = document.getElementById(btnId);
  const copyPromise = navigator.clipboard
    ? navigator.clipboard.writeText(url)
    : Promise.reject('no-clipboard-api');

  copyPromise
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    })
    .then(() => {
      btn.classList.add('copied');
      const origText = btn.textContent;
      btn.textContent = btnId === 'btnProgress' ? t('btnProgressCopied') : t('btnShareCopied');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.textContent = origText;
      }, 2500);
    });
}

// ── Load from shared URL ───────────────────────

function loadFromHash() {
  const match = /^#(edit|share)=(.+)$/.exec(location.hash);
  if (!match) return false;

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(match[2]))));
    if (!isValidPayload(payload)) return false;
    applyPayload(payload);
    STATE.isShared = match[1] === 'edit' ? 'edit' : 'readonly';
    return true;
  } catch {
    return false;
  }
}

// ── Restart ────────────────────────────────────

function restartAssessment() {
  history.replaceState(null, '', location.pathname);
  clearLocalStorage();
  Object.assign(STATE, {
    screen: 'welcome', targetLevel: null, isShared: false,
    currentIndex: 0, answers: {}, notes: {}, evidence: {}, actions: {}, flags: {},
    options: { evidence: false, remediation: false }, orgName: '', baseline: null,
    showReq: {}, sidebarFilter: 'all',
  });

  _charts.forEach(c => c.destroy());
  _charts = [];
  document.getElementById('report').classList.add('hidden');
  document.getElementById('report').innerHTML = '';
  document.getElementById('welcome').classList.remove('hidden');
  document.querySelectorAll('.level-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('btnStart').disabled = true;
  document.getElementById('orgName').value = '';
  document.getElementById('welcomeOptEvidence').checked    = false;
  document.getElementById('welcomeOptRemediation').checked = false;
  applyTranslations();
}

// ── Branding UI (DOM updates after parse) ──────

function applyBrandingUI() {
  document.title = `${BRANDING.companyName} — Self-Assessment Tool`;

  const logoSpan = document.querySelector('.welcome-logo span');
  if (logoSpan) logoSpan.textContent = BRANDING.companyName;

  if (BRANDING.logoUrl) {
    const svg = document.querySelector('.welcome-logo svg');
    if (svg) {
      const img = document.createElement('img');
      img.src = BRANDING.logoUrl;
      img.className = 'welcome-logo-img';
      img.alt = BRANDING.companyName;
      svg.replaceWith(img);
    }
  }

  const sidebarTitle = document.querySelector('.sidebar-header h2');
  if (sidebarTitle) sidebarTitle.textContent = BRANDING.companyName;
}

// ── Init: detect shared URL and recover from storage ───

window.addEventListener('DOMContentLoaded', () => {
  applyBrandingUI();
  initTheme();

  if (loadFromHash()) {
    applyTranslations();
    showReport();
  } else {
    applyTranslations();
    const saved = loadFromLocalStorage();
    if (saved) {
      showRecoveryBanner(saved);
    }
  }
});

function showRecoveryBanner(saved) {
  const banner = document.createElement('div');
  banner.className = 'recover-banner';
  banner.innerHTML = `
    <span class="recover-badge">${t('recoverBadge')}</span>
    <p>${t('recoverBannerText')}</p>
    <div style="display:flex; gap:.5rem; margin-top:.75rem;">
      <button class="btn-recover-action" onclick="continueFromSaved()">${t('btnRecover')}</button>
      <button class="btn-recover-secondary" onclick="discardSavedState()">${t('btnDiscardRecover')}</button>
    </div>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
}

function continueFromSaved() {
  const saved = loadFromLocalStorage();
  if (saved) {
    applyPayload(saved);
    document.querySelector('.recover-banner')?.remove();
    applyTranslations();
    const firstEmpty = getActiveControls().findIndex(c => !STATE.answers[c.id]);
    STATE.currentIndex = Math.max(firstEmpty, 0);
    enterAssessment();
  }
}

function discardSavedState() {
  clearLocalStorage();
  document.querySelector('.recover-banner')?.remove();
}
