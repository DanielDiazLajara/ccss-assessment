// ─────────────────────────────────────────────
// Exports — JSON (save / import), CSV & Excel
// ─────────────────────────────────────────────

const EXPORT_SCHEMA = 'ccss-assessment';

/** Base file name: ccss-assessment[-org]-levelX-YYYY-MM-DD */
function exportFileName() {
  const org = STATE.orgName
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `ccss-assessment${org ? '-' + org : ''}-level${STATE.targetLevel}-${todayISO()}`;
}

function downloadFile(filename, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a   = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── JSON ───────────────────────────────────────

function exportJSON() {
  const activeNote = document.querySelector('.notes-area');
  if (activeNote) activeNote.dispatchEvent(new Event('change'));   // flush the note being typed

  const payload = { schema: EXPORT_SCHEMA, version: 1, ...serializeState({ includeLang: false }) };
  downloadFile(`${exportFileName()}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

/** Ask the user for a JSON file and resolve with a validated assessment payload. */
function pickJsonFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('cancel', () => reject('cancelled'));
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) { reject('cancelled'); return; }
      file.text()
        .then(text => {
          const payload = JSON.parse(text);
          if (!isValidPayload(payload)) throw new Error('invalid payload');
          resolve(payload);
        })
        .catch(reject);
    });
    input.click();
  });
}

// ── Tabular data (shared by CSV and Excel) ─────

function statusLabel(status) {
  return {
    in_place:     t('pillInPlace'),
    partial:      t('pillPartial'),
    not_in_place: t('pillNotInPlace'),
    na:           t('pillNA'),
    unanswered:   t('pillUnanswered'),
  }[status];
}

/** One row per active control, columns depending on the enabled modules. */
function buildControlRows() {
  const header = ['ID', t('tableControl'), t('tableAspect'), t('tableLevel'), t('tableStatus'), t('tableNotes')];
  if (STATE.options.evidence)    header.push(t('tableEvidence'));
  if (STATE.options.remediation) header.push(t('tablePriority'), t('tableOwner'), t('tableDue'));
  header.push(t('tableFlagged'));

  const rows = getActiveControls().map(c => {
    const status = statusOf(c.id);
    const row = [c.id, c.name, `${c.aspect} ${ASPECTS[c.aspect].name}`, c.introducedAt, statusLabel(status), STATE.notes[c.id] || ''];
    if (STATE.options.evidence) row.push(STATE.evidence[c.id] || '');
    if (STATE.options.remediation) {
      const isGap = GAP_STATUSES.includes(status);
      const a     = getAction(c.id);
      row.push(isGap ? t('priority_' + effectivePriority(c)) : '', isGap ? a.owner || '' : '', isGap ? a.due || '' : '');
    }
    row.push(STATE.flags[c.id] ? t('yes') : '');
    return row;
  });

  return [header, ...rows];
}

function toCsv(rows) {
  const cell = v => {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map(r => r.map(cell).join(',')).join('\r\n');
}

function exportCSV() {
  // BOM so Excel opens accented characters correctly.
  downloadFile(`${exportFileName()}.csv`, '﻿' + toCsv(buildControlRows()), 'text/csv;charset=utf-8');
}

// ── Excel ──────────────────────────────────────

function sheetFrom(rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = widths.map(wch => ({ wch }));
  return ws;
}

function exportXLSX() {
  if (!window.XLSX) { alert(t('xlsxError')); return; }

  const controls  = getActiveControls();
  const n         = countStatuses(controls);
  const readiness = computeReadiness();
  const cmp       = compareWithBaseline(controls);
  const wb        = XLSX.utils.book_new();

  // Summary
  const summary = [
    [t('reportTitle')],
    [],
    [t('metaOrg'),        STATE.orgName || '—'],
    [t('metaTarget'),     `${t('levelPrefix')} ${STATE.targetLevel}`],
    [t('levelAchieved'),  readiness.achieved ? `${t('levelPrefix')} ${readiness.achieved}` : t('noLevelAchieved')],
    [t('scoreGlobal'),    `${scoreOf(controls) ?? 0}%`],
    [t('metaDate'),       formatDate(todayISO())],
    [],
    [t('scoreInPlace'),    n.in_place],
    [t('scorePartial'),    n.partial],
    [t('scoreNotInPlace'), n.not_in_place],
    [t('scoreNA'),         n.na],
    [t('pillUnanswered'),  n.unanswered],
    [],
    [t('pdfAspectsTitle')],
    ['ID', t('tableAspect'), t('tableScore')],
    ...Object.entries(aspectScores(controls)).map(([id, v]) => [id, ASPECTS[id].name, v === null ? '—' : `${v}%`]),
    [],
    [t('summaryTitle')],
    ...buildExecutiveSummary().map(p => [p]),
  ];
  XLSX.utils.book_append_sheet(wb, sheetFrom(summary, [28, 40, 14]), t('sheetSummary'));

  // Controls
  const controlRows = buildControlRows();
  XLSX.utils.book_append_sheet(wb, sheetFrom(controlRows, controlRows[0].map((_, i) => [12, 42, 32, 7, 20][i] || 28)), t('sheetControls'));

  // Remediation plan
  if (STATE.options.remediation) {
    const plan = [
      [t('tablePriority'), 'ID', t('tableControl'), t('tableStatus'), t('tableOwner'), t('tableDue'), t('overdue')],
      ...getRemediationPlan(controls).map(p => [
        t('priority_' + p.priority), p.control.id, p.control.name, statusLabel(p.status),
        p.owner, p.due, p.overdue ? t('yes') : '',
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, sheetFrom(plan, [10, 12, 42, 20, 24, 14, 10]), t('sheetPlan'));
  }

  // Progress vs previous assessment
  if (cmp) {
    const changes = [
      ['ID', t('tableControl'), t('compareBefore'), t('compareAfter'), t('tableTrend')],
      ...cmp.changes.map(ch => [
        ch.control.id, ch.control.name, statusLabel(ch.before), statusLabel(ch.after), t('trend_' + ch.trend),
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, sheetFrom(changes, [12, 42, 20, 20, 12]), t('sheetChanges'));
  }

  XLSX.writeFile(wb, `${exportFileName()}.xlsx`);
}
