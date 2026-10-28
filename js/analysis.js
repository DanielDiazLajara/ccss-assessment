// ─────────────────────────────────────────────
// Analysis — Scores, Readiness, Gaps & Comparison
// Shared by the on-screen report, the PDF and the exports.
// ─────────────────────────────────────────────

const STATUS_POINTS  = { in_place: 2, partial: 1, not_in_place: 0 };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const GAP_STATUSES   = ['not_in_place', 'partial'];

/** Status of a control, 'unanswered' when there is no valid answer. */
function statusOf(id, answers = STATE.answers) {
  const a = answers[id];
  return a === 'in_place' || a === 'partial' || a === 'not_in_place' || a === 'na' ? a : 'unanswered';
}

/** Compliance % (N/A excluded, unanswered counts as 0). Null when nothing is applicable. */
function scoreOf(controls, answers = STATE.answers) {
  const applicable = controls.filter(c => answers[c.id] !== 'na');
  if (!applicable.length) return null;
  const pts = applicable.reduce((acc, c) => acc + (STATUS_POINTS[answers[c.id]] ?? 0), 0);
  return Math.round(pts / (applicable.length * 2) * 100);
}

function countStatuses(controls, answers = STATE.answers) {
  const n = { in_place: 0, partial: 0, not_in_place: 0, na: 0, unanswered: 0 };
  controls.forEach(c => { n[statusOf(c.id, answers)]++; });
  return n;
}

/** aspectId → compliance % for the aspects that have active controls. */
function aspectScores(controls = getActiveControls(), answers = STATE.answers) {
  const out = {};
  Object.keys(ASPECTS).forEach(asp => {
    const aspControls = controls.filter(c => c.aspect === asp);
    if (aspControls.length) out[asp] = scoreOf(aspControls, answers);
  });
  return out;
}

/**
 * CCSS certification is all-or-nothing per level: a level is achieved only when every
 * control required at that level is In Place (or N/A). Answers are given against the
 * target level's requirement, so lower levels are judged with the same answers.
 */
function computeReadiness(answers = STATE.answers, targetLevel = STATE.targetLevel) {
  const levels = ['I', 'II', 'III'].slice(0, LEVEL_ORDER[targetLevel] || 0);
  const perLevel = levels.map(level => {
    const required = CONTROLS.filter(c => LEVEL_ORDER[c.introducedAt] <= LEVEL_ORDER[level]);
    const pending  = required.filter(c => !['in_place', 'na'].includes(answers[c.id]));
    return { level, required: required.length, pending, met: pending.length === 0 };
  });
  const achieved = [...perLevel].reverse().find(l => l.met)?.level || null;
  const next     = perLevel.find(l => !l.met) || null;
  return { achieved, perLevel, next };
}

/** Partial / not-in-place controls, not-in-place first. */
function getGaps(controls = getActiveControls()) {
  return controls
    .filter(c => GAP_STATUSES.includes(STATE.answers[c.id]))
    .sort((a, b) => GAP_STATUSES.indexOf(STATE.answers[a.id]) - GAP_STATUSES.indexOf(STATE.answers[b.id]));
}

/** Default priority when the user has not set one: missing controls first, then partial ones. */
function suggestedPriority(control) {
  const a = STATE.answers[control.id];
  if (a === 'not_in_place') return 'high';
  if (a === 'partial')      return 'medium';
  return 'low';
}

function getAction(id) {
  return STATE.actions[id] || {};
}

function effectivePriority(control) {
  return getAction(control.id).priority || suggestedPriority(control);
}

function isOverdue(due) {
  return !!due && due < todayISO();
}

/** Remediation items for every gap, sorted by priority, then due date (undated last). */
function getRemediationPlan(controls = getActiveControls()) {
  return getGaps(controls)
    .map(c => {
      const a = getAction(c.id);
      return {
        control:  c,
        status:   STATE.answers[c.id],
        priority: effectivePriority(c),
        owner:    a.owner || '',
        due:      a.due || '',
        overdue:  isOverdue(a.due),
      };
    })
    .sort((a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      (a.due || '9999').localeCompare(b.due || '9999') ||
      a.control.id.localeCompare(b.control.id));
}

/** Differences against STATE.baseline, measured on the current target level's controls. */
function compareWithBaseline(controls = getActiveControls()) {
  const base = STATE.baseline;
  if (!base) return null;

  const changes = controls.map(c => {
    const before = statusOf(c.id, base.answers);
    const after  = statusOf(c.id, STATE.answers);
    if (before === after) return null;
    const pb = STATUS_POINTS[before], pa = STATUS_POINTS[after];
    const trend = pb === undefined || pa === undefined ? 'changed' : pa > pb ? 'improved' : pa < pb ? 'worsened' : 'changed';
    return { control: c, before, after, trend };
  }).filter(Boolean);

  return {
    date:           base.date,
    scoreBefore:    scoreOf(controls, base.answers),
    scoreAfter:     scoreOf(controls),
    aspectsBefore:  aspectScores(controls, base.answers),
    achievedBefore: computeReadiness(base.answers).achieved,
    changes,
    improved: changes.filter(ch => ch.trend === 'improved').length,
    worsened: changes.filter(ch => ch.trend === 'worsened').length,
  };
}

/** Signed difference in percentage points, e.g. "+12 pp". */
function formatDelta(after, before) {
  if (after === null || before === null) return '';
  const d = after - before;
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} pp`;
}

/** Executive summary as plain-text paragraphs (rendered by both the report and the PDF). */
function buildExecutiveSummary() {
  const controls  = getActiveControls();
  const n         = countStatuses(controls);
  const score     = scoreOf(controls) ?? 0;
  const readiness = computeReadiness();
  const cmp       = compareWithBaseline(controls);
  const paras     = [];

  paras.push(t('sumIntro', {
    org: STATE.orgName, level: STATE.targetLevel, total: controls.length,
    answered: controls.length - n.unanswered, score,
  }));

  paras.push(readiness.achieved ? t('sumAchieved', { level: readiness.achieved }) : t('sumNotAchieved'));

  if (readiness.next) {
    const pend = countStatuses(readiness.next.pending);
    paras.push(t('sumNext', {
      level: readiness.next.level, pending: readiness.next.pending.length,
      notInPlace: pend.not_in_place, partial: pend.partial, unanswered: pend.unanswered,
    }));
  } else {
    paras.push(t('sumAllMet', { level: STATE.targetLevel }));
  }

  const weakest = Object.entries(aspectScores(controls))
    .filter(([, v]) => v !== null && v < 100)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([id, v]) => `${ASPECTS[id].name} (${v}%)`);
  if (weakest.length) paras.push(t('sumWeakest', { list: formatList(weakest) }));

  if (n.not_in_place + n.partial > 0) {
    paras.push(t('sumGaps', { total: n.not_in_place + n.partial, notInPlace: n.not_in_place, partial: n.partial }));
  }

  if (STATE.options.remediation) {
    const plan       = getRemediationPlan(controls);
    const unassigned = plan.filter(p => !p.owner).length;
    const overdue    = plan.filter(p => p.overdue).length;
    if (plan.length) paras.push(t('sumRemediation', { total: plan.length, unassigned, overdue }));
  }

  const flagged = controls.filter(c => STATE.flags[c.id]).length;
  if (flagged) paras.push(t('sumFlagged', { n: flagged }));

  if (cmp) {
    paras.push(t('sumCompare', {
      date: formatDate(cmp.date), before: cmp.scoreBefore ?? 0, after: cmp.scoreAfter ?? 0,
      delta: formatDelta(cmp.scoreAfter ?? 0, cmp.scoreBefore ?? 0),
      improved: cmp.improved, worsened: cmp.worsened,
    }));
  }

  return paras;
}
