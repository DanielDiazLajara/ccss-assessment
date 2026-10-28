// ─────────────────────────────────────────────
// Application State & Core Helpers
// ─────────────────────────────────────────────

const STATE = {
  screen:       'welcome',  // 'welcome' | 'assessment' | 'report'
  targetLevel:  null,       // 'I' | 'II' | 'III'
  currentIndex: 0,
  answers:  {},             // controlId → 'in_place' | 'partial' | 'not_in_place' | 'na'
  notes:    {},             // controlId → string
  evidence: {},             // controlId → string (optional module)
  actions:  {},             // controlId → { owner, due, priority } (optional module)
  flags:    {},             // controlId → true when marked for review
  options:  { evidence: false, remediation: false },
  orgName:  '',
  baseline: null,           // previous assessment for comparison: { answers, targetLevel, orgName, date }
  showReq:  {},             // controlId → bool
  sidebarFilter: 'all',     // 'all' | 'unanswered' | 'flagged' | 'gaps'
  lang:     'es',           // 'es' | 'en'
  isShared: false,
};

const LEVEL_ORDER = { I: 1, II: 2, III: 3 };

const STORAGE_KEY = 'ccss_assessment_state';
const THEME_KEY = 'ccss_theme';

/** Plain-object snapshot of the assessment, used by localStorage, share links and JSON export. */
function serializeState({ includeBaseline = false, includeLang = true } = {}) {
  const payload = {
    targetLevel: STATE.targetLevel,
    orgName:     STATE.orgName,
    options:     STATE.options,
    answers:     STATE.answers,
    notes:       STATE.notes,
    evidence:    STATE.evidence,
    actions:     STATE.actions,
    flags:       STATE.flags,
    updatedAt:   new Date().toISOString(),
  };
  if (includeLang) payload.lang = STATE.lang;
  if (includeBaseline && STATE.baseline) payload.baseline = STATE.baseline;
  return payload;
}

/** True when the object looks like a serialized assessment. */
function isValidPayload(p) {
  return !!(p && LEVEL_ORDER[p.targetLevel] && p.answers && typeof p.answers === 'object');
}

/** Load a serialized assessment into STATE. */
function applyPayload(p) {
  STATE.targetLevel = p.targetLevel;
  STATE.orgName     = p.orgName  || '';
  STATE.options     = { evidence: false, remediation: false, ...(p.options || {}) };
  STATE.answers     = p.answers  || {};
  STATE.notes       = p.notes    || {};
  STATE.evidence    = p.evidence || {};
  STATE.actions     = p.actions  || {};
  STATE.flags       = p.flags    || {};
  STATE.baseline    = p.baseline || null;
  if (p.lang) STATE.lang = p.lang;
}

/** Save current state to localStorage. */
function saveToLocalStorage() {
  // A read-only shared report belongs to someone else: never overwrite the user's own work with it.
  if (STATE.isShared === 'readonly' || !STATE.targetLevel) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState({ includeBaseline: true })));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

/** Load state from localStorage. Returns null if not found or invalid. */
function loadFromLocalStorage() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const payload = JSON.parse(json);
    return isValidPayload(payload) ? payload : null;
  } catch (e) {
    return null;
  }
}

/** Escape user-provided text before inserting it into HTML. */
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/** Today as YYYY-MM-DD (local time). */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Format an ISO date (YYYY-MM-DD or full timestamp) for the current language. */
function formatDate(iso) {
  if (!iso) return '';
  const d = iso.length === 10 ? new Date(iso + 'T00:00:00') : new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(STATE.lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Clear localStorage state. */
function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
}

/** Get current theme. */
function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

/** Save theme to localStorage and apply it. */
function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('Could not save theme:', e);
  }
  applyTheme(theme);
}

/** Apply theme to DOM. */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('theme-light');
  } else {
    document.documentElement.classList.remove('theme-light');
  }
}

const THEME_ICONS = {
  dark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};

/** Toggle between light and dark themes. */
function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = THEME_ICONS[next];
}

/** Initialize theme on page load. */
function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = THEME_ICONS[theme];
}

/** Controls applicable for the selected target level. */
function getActiveControls() {
  const lvl = LEVEL_ORDER[STATE.targetLevel];
  return CONTROLS.filter(c => LEVEL_ORDER[c.introducedAt] <= lvl);
}

/** Highest non-null requirement text at or below the target level. */
function getEffectiveRequirement(control) {
  const order  = LEVEL_ORDER[STATE.targetLevel];
  const levels = ['I', 'II', 'III'].slice(0, order);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (control.requirements[levels[i]]) return control.requirements[levels[i]];
  }
  return '';
}

/** Question text most appropriate for the target level and current language. */
function getEffectiveQuestion(control) {
  const qMap   = STATE.lang === 'en' ? (control.questions_en || control.questions) : control.questions;
  const order  = LEVEL_ORDER[STATE.targetLevel];
  const levels = ['I', 'II', 'III'].slice(0, order);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (qMap[levels[i]]) return qMap[levels[i]];
  }
  return qMap['I'] || '';
}

/** Hints array for the current language. */
function getEffectiveHints(control) {
  return (STATE.lang === 'en' ? control.hints_en : null) || control.hints || [];
}
