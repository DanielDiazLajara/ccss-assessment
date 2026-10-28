// ─────────────────────────────────────────────
// Assessment Screen — Sidebar & Question Card
// ─────────────────────────────────────────────

const FLAG_ICON = '<svg class="flag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';

const SIDEBAR_FILTERS = {
  all:        () => true,
  unanswered: c => !STATE.answers[c.id],
  flagged:    c => !!STATE.flags[c.id],
  gaps:       c => GAP_STATUSES.includes(STATE.answers[c.id]),
};

let _advanceTimer = null;

/** Show the assessment screen at STATE.currentIndex (used by start, import, recovery and "back"). */
function enterAssessment() {
  STATE.screen = 'assessment';
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('report').classList.add('hidden');
  document.getElementById('assessment').classList.remove('hidden');

  const tag = document.getElementById('levelTag');
  tag.className   = 'level-tag ' + STATE.targetLevel;
  tag.textContent = t('levelPrefix') + ' ' + STATE.targetLevel;

  renderSidebar();
  renderQuestion();
}

// ── Sidebar ────────────────────────────────────

function renderSidebar() {
  const controls = getActiveControls();
  const current  = controls[STATE.currentIndex];
  const filter   = SIDEBAR_FILTERS[STATE.sidebarFilter] ? STATE.sidebarFilter : 'all';

  const filterLabels = {
    all: t('filterAll'), unanswered: t('filterUnanswered'), flagged: t('filterFlagged'), gaps: t('filterGaps'),
  };
  document.getElementById('sidebarFilters').innerHTML = Object.keys(SIDEBAR_FILTERS).map(f => `
    <button class="filter-chip ${f === filter ? 'active' : ''}" onclick="setSidebarFilter('${f}')">
      ${filterLabels[f]}${f === 'all' ? '' : ` <span class="count">${controls.filter(SIDEBAR_FILTERS[f]).length}</span>`}
    </button>`).join('');

  let html;
  if (filter === 'all') {
    const aspects = [...new Set(controls.map(c => c.aspect))];
    html = aspects.map(asp => {
      const aspControls = controls.filter(c => c.aspect === asp);
      const answered    = aspControls.filter(c => STATE.answers[c.id]).length;
      const total       = aspControls.length;
      const flagged     = aspControls.filter(c => STATE.flags[c.id]).length;
      const dotClass    = answered === total && total > 0 ? 'done' : answered > 0 ? 'partial' : '';

      return `
        <div class="aspect-group">
          <div class="aspect-label ${asp === current?.aspect ? 'active' : ''}" onclick="jumpToAspect('${asp}')">
            <div>
              <div>${ASPECTS[asp].name}</div>
              <div class="aspect-id">${asp}</div>
            </div>
            <div class="aspect-progress">
              ${flagged ? `<span class="aspect-flags" title="${t('filterFlagged')}">${FLAG_ICON}${flagged}</span>` : ''}
              <span>${answered}/${total}</span>
              <div class="dot ${dotClass}"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  } else {
    const matches = controls.filter(SIDEBAR_FILTERS[filter]);
    html = matches.length
      ? matches.map(c => `
        <div class="control-item ${c === current ? 'active' : ''}" onclick="jumpToControl('${c.id}')">
          <span class="status-dot ${STATE.answers[c.id] || 'none'}"></span>
          <div class="control-item-text">
            <div class="control-item-name">${c.name}</div>
            <div class="aspect-id">${c.id}</div>
          </div>
          ${STATE.flags[c.id] ? `<span class="control-item-flag">${FLAG_ICON}</span>` : ''}
        </div>`).join('')
      : `<div class="sidebar-empty">${t('filterEmpty')}</div>`;
  }

  document.getElementById('sidebarScroll').innerHTML = html;
  document.getElementById('optEvidence').checked    = !!STATE.options.evidence;
  document.getElementById('optRemediation').checked = !!STATE.options.remediation;

  const answered = controls.filter(c => STATE.answers[c.id]).length;
  const total    = controls.length;
  document.getElementById('progressLabel').textContent = `${answered} / ${total}`;
  document.getElementById('overallBar').style.width    = total > 0 ? `${(answered / total * 100).toFixed(0)}%` : '0%';
  document.getElementById('btnReport').disabled        = answered < total;
  document.getElementById('btnReport').textContent     = t('btnReportTopbar');

  // Update progress label translation
  const progLabel = document.querySelector('.overall-label span:first-child');
  if (progLabel) progLabel.textContent = t('progressGlobal');
}

function setSidebarFilter(filter) {
  STATE.sidebarFilter = filter;
  renderSidebar();
}

function setOption(key, value) {
  STATE.options[key] = value;
  saveToLocalStorage();
  renderQuestion();
}

function jumpToAspect(asp) {
  const idx = getActiveControls().findIndex(c => c.aspect === asp);
  if (idx >= 0) {
    STATE.currentIndex = idx;
    renderQuestion();
  }
}

function jumpToControl(id) {
  const idx = getActiveControls().findIndex(c => c.id === id);
  if (idx >= 0) {
    STATE.currentIndex = idx;
    renderQuestion();
  }
}

// ── Question Card ──────────────────────────────

function renderQuestion() {
  const controls = getActiveControls();
  const c        = controls[STATE.currentIndex];
  const asp      = ASPECTS[c.aspect];
  const answer   = STATE.answers[c.id] || null;
  const showReq  = STATE.showReq[c.id] || false;
  const flagged  = !!STATE.flags[c.id];

  document.getElementById('topbarCrumb').innerHTML =
    `<strong>${asp.name}</strong> › ${c.name}`;

  const statusOptions = [
    { val: 'in_place',     label: t('statusInPlace'),    sub: t('statusInPlaceSub') },
    { val: 'partial',      label: t('statusPartial'),    sub: t('statusPartialSub') },
    { val: 'not_in_place', label: t('statusNotInPlace'), sub: t('statusNotInPlaceSub') },
    { val: 'na',           label: t('statusNA'),         sub: t('statusNASub') },
  ];

  const statusHtml = statusOptions.map((o, i) => `
    <button class="status-btn ${answer === o.val ? 'selected-' + o.val : ''}"
            onclick="setAnswer('${c.id}', '${o.val}')">
      <span class="status-dot ${o.val}"></span>
      <div>
        <div class="status-label">${o.label}</div>
        <div class="status-sub">${o.sub}</div>
      </div>
      <kbd class="status-kbd">${i + 1}</kbd>
    </button>`).join('');

  const hintsHtml = getEffectiveHints(c)
    .map(h => `<div class="hint-item">${h}</div>`)
    .join('');

  const isLast = STATE.currentIndex === controls.length - 1;

  const card = document.getElementById('questionCard');
  card.className = 'question-card fade-in';
  card.innerHTML = `
    <div class="control-meta">
      <span class="tag tag-id">${c.id}</span>
      <span class="tag tag-level ${c.introducedAt}">${t('levelPrefix')} ${c.introducedAt}</span>
      <span class="tag tag-aspect">${asp.name}</span>
      <button class="flag-btn ${flagged ? 'active' : ''}" onclick="toggleFlag('${c.id}')" title="M">
        ${FLAG_ICON}<span>${flagged ? t('flagged') : t('flag')}</span>
      </button>
    </div>

    <div class="question-text">${getEffectiveQuestion(c)}</div>

    ${hintsHtml ? `<div class="hints-list">${hintsHtml}</div>` : ''}

    <button class="req-toggle" onclick="toggleReq('${c.id}')">
      ${showReq ? t('reqToggleHide') : t('reqToggleShow')}
    </button>
    ${showReq ? `<div class="req-box">${getEffectiveRequirement(c)}</div>` : ''}

    <div class="status-grid">${statusHtml}</div>

    ${buildRemediationFields(c)}
    ${buildEvidenceField(c)}

    <div class="notes-label">${t('notesLabel')}</div>
    <textarea class="notes-area" id="notes-${c.id}"
              placeholder="${t('notesPlaceholder')}"
              onchange="saveNote('${c.id}')">${esc(STATE.notes[c.id])}</textarea>

    <div class="nav-buttons">
      <button class="btn-nav btn-prev" ${STATE.currentIndex === 0 ? 'disabled' : ''} onclick="navigate(-1)">${t('btnPrev')}</button>
      <span class="progress-fraction">${STATE.currentIndex + 1} / ${controls.length}</span>
      <button class="btn-nav btn-next" onclick="navigate(1)">${isLast ? t('btnReportFinal') : t('btnNext')}</button>
    </div>

    <div class="shortcuts-hint">
      <span><kbd>1</kbd>–<kbd>4</kbd> ${t('kbAnswer')}</span>
      <span><kbd>←</kbd><kbd>→</kbd> ${t('kbNav')}</span>
      <span><kbd>M</kbd> ${t('kbFlag')}</span>
      <span><kbd>R</kbd> ${t('kbReq')}</span>
    </div>`;

  renderSidebar();
}

/** Owner / due date / priority — only for gaps and only when the remediation module is on. */
function buildRemediationFields(c) {
  if (!STATE.options.remediation || !GAP_STATUSES.includes(STATE.answers[c.id])) return '';
  const a = getAction(c.id);
  const priorityOptions = ['high', 'medium', 'low']
    .map(p => `<option value="${p}" ${a.priority === p ? 'selected' : ''}>${t('priority_' + p)}</option>`)
    .join('');

  return `
    <div class="extra-fields">
      <div class="extra-title">${t('remediationTitle')}</div>
      <div class="field-row">
        <label class="field">
          <span>${t('fieldOwner')}</span>
          <input type="text" value="${esc(a.owner)}" placeholder="${t('fieldOwnerPh')}"
                 onchange="setAction('${c.id}', 'owner', this.value)">
        </label>
        <label class="field">
          <span>${t('fieldDue')}</span>
          <input type="date" value="${esc(a.due)}" onchange="setAction('${c.id}', 'due', this.value)">
        </label>
        <label class="field">
          <span>${t('fieldPriority')}</span>
          <select onchange="setAction('${c.id}', 'priority', this.value)">
            <option value="">${t('prioritySuggested', { p: t('priority_' + suggestedPriority(c)) })}</option>
            ${priorityOptions}
          </select>
        </label>
      </div>
    </div>`;
}

function buildEvidenceField(c) {
  if (!STATE.options.evidence) return '';
  return `
    <label class="field field-evidence">
      <span>${t('fieldEvidence')}</span>
      <input type="text" value="${esc(STATE.evidence[c.id])}" placeholder="${t('fieldEvidencePh')}"
             onchange="setEvidence('${c.id}', this.value)">
    </label>`;
}

function toggleReq(id) {
  STATE.showReq[id] = !STATE.showReq[id];
  renderQuestion();
}

function toggleFlag(id) {
  if (STATE.flags[id]) delete STATE.flags[id];
  else STATE.flags[id] = true;
  saveToLocalStorage();
  renderQuestion();
}

function setAnswer(id, val) {
  STATE.answers[id] = val;
  saveToLocalStorage();
  renderQuestion();

  // Stay on the card when the remediation fields just appeared so they can be filled in.
  clearTimeout(_advanceTimer);
  if (STATE.options.remediation && GAP_STATUSES.includes(val)) return;

  const index = STATE.currentIndex;
  _advanceTimer = setTimeout(() => {
    if (STATE.screen !== 'assessment' || STATE.currentIndex !== index) return;
    const controls = getActiveControls();
    if (STATE.currentIndex < controls.length - 1) {
      navigate(1);
    } else {
      renderSidebar();
    }
  }, 350);
}

function setAction(id, field, value) {
  const action = { ...getAction(id), [field]: value.trim() };
  if (!action[field]) delete action[field];
  if (Object.keys(action).length) STATE.actions[id] = action;
  else delete STATE.actions[id];
  saveToLocalStorage();
}

function setEvidence(id, value) {
  if (value.trim()) STATE.evidence[id] = value.trim();
  else delete STATE.evidence[id];
  saveToLocalStorage();
}

function saveNote(id) {
  const el = document.getElementById(`notes-${id}`);
  if (el) {
    STATE.notes[id] = el.value;
    saveToLocalStorage();
  }
}

function navigate(dir) {
  const controls = getActiveControls();
  saveNote(controls[STATE.currentIndex].id);
  clearTimeout(_advanceTimer);

  const next = STATE.currentIndex + dir;
  if (next < 0) return;
  if (next >= controls.length) { showReport(); return; }

  STATE.currentIndex = next;

  const card = document.getElementById('questionCard');
  card.style.opacity   = '0';
  card.style.transform = 'translateY(8px)';
  setTimeout(() => {
    renderQuestion();
    const nc = document.getElementById('questionCard');
    nc.style.transition = 'opacity .2s, transform .2s';
    nc.style.opacity    = '1';
    nc.style.transform  = 'translateY(0)';
  }, 150);
}

// ── Keyboard shortcuts ─────────────────────────

const SHORTCUT_ANSWERS = { 1: 'in_place', 2: 'partial', 3: 'not_in_place', 4: 'na' };

document.addEventListener('keydown', e => {
  if (STATE.screen !== 'assessment' || e.ctrlKey || e.metaKey || e.altKey) return;

  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }

  const c = getActiveControls()[STATE.currentIndex];
  if (!c) return;

  const key = e.key.toLowerCase();
  if (SHORTCUT_ANSWERS[key])     setAnswer(c.id, SHORTCUT_ANSWERS[key]);
  else if (key === 'arrowright') navigate(1);
  else if (key === 'arrowleft')  navigate(-1);
  else if (key === 'm')          toggleFlag(c.id);
  else if (key === 'r')          toggleReq(c.id);
  else return;

  e.preventDefault();
});
