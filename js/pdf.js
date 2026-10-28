// ─────────────────────────────────────────────
// PDF Report — paginated, text-based A4 document
// built with jsPDF + AutoTable. Always rendered on
// a light palette regardless of the on-screen theme.
// ─────────────────────────────────────────────

const PDF = { W: 210, H: 297, M: 18, TOP: 24, BOTTOM: 278 };
PDF.CW = PDF.W - 2 * PDF.M;

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [1, 2, 3].map(i => parseInt(m[i], 16)) : [0, 0, 0];
}

const PDF_COLORS = {
  text:    [15, 23, 42],
  text2:   [71, 85, 105],
  text3:   [100, 116, 139],
  border:  [226, 231, 238],
  soft:    [244, 246, 249],
  primary: hexToRgb(BRANDING.colors.primary),
  success: hexToRgb(BRANDING.colors.success),
  warning: hexToRgb(BRANDING.colors.warning),
  danger:  hexToRgb(BRANDING.colors.danger),
};

// Darker variants of the status colors, readable as text on white.
const PDF_STATUS_TEXT = {
  in_place:     [15, 107, 74],
  partial:      [138, 83, 0],
  not_in_place: [163, 43, 43],
  na:           [71, 85, 105],
  unanswered:   [100, 116, 139],
};
const PDF_PRIORITY_TEXT = { high: [163, 43, 43], medium: [138, 83, 0], low: [71, 85, 105] };

/** Standard PDF fonts only cover Windows-1252: replace or drop what they cannot render. */
function pdfText(value) {
  return String(value ?? '')
    .replace(/→/g, '->').replace(/←/g, '<-').replace(/−/g, '-').replace(/Δ/g, 'Var.')
    .replace(/[^\x00-\xFF–—‘’“”•…€]/g, '');
}

// ── Drawing helpers ────────────────────────────

function pdfEnsureSpace(ctx, h) {
  if (ctx.y + h > PDF.BOTTOM) {
    ctx.doc.addPage();
    ctx.y = PDF.TOP;
  }
}

function pdfSectionTitle(ctx, text) {
  const { doc } = ctx;
  pdfEnsureSpace(ctx, 34);
  ctx.section++;
  ctx.y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(pdfText(`${ctx.section}. ${text}`), PDF.M, ctx.y);
  ctx.y += 2.5;
  doc.setDrawColor(...PDF_COLORS.primary);
  doc.setLineWidth(0.7);
  doc.line(PDF.M, ctx.y, PDF.M + 14, ctx.y);
  ctx.y += 7;
}

function pdfParagraph(ctx, text, { size = 9.5, color = PDF_COLORS.text, style = 'normal', gap = 2.5 } = {}) {
  const { doc } = ctx;
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lineH = size * 0.3528 * 1.5;
  doc.splitTextToSize(pdfText(text), PDF.CW).forEach(line => {
    pdfEnsureSpace(ctx, lineH);
    doc.text(line, PDF.M, ctx.y);
    ctx.y += lineH;
  });
  ctx.y += gap;
}

function pdfLabel(doc, text, x, y, opts = {}) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(opts.size || 6.5);
  doc.setTextColor(...(opts.color || PDF_COLORS.text3));
  doc.text(pdfText(text).toUpperCase(), x, y, { charSpace: opts.charSpace ?? 0.3, align: opts.align || 'left' });
}

function pdfTable(ctx, options) {
  const { doc } = ctx;
  doc.autoTable({
    startY: ctx.y,
    margin: { left: PDF.M, right: PDF.M, top: PDF.TOP + 2, bottom: PDF.H - PDF.BOTTOM + 4 },
    theme: 'plain',
    styles: {
      font: 'helvetica', fontSize: 8, textColor: PDF_COLORS.text2, overflow: 'linebreak',
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
      lineColor: PDF_COLORS.border, lineWidth: { bottom: 0.2 },
    },
    headStyles: { fillColor: PDF_COLORS.soft, textColor: PDF_COLORS.text3, fontStyle: 'bold', fontSize: 6.8 },
    ...options,
    head: options.head?.map(row => row.map(h => typeof h === 'string' ? pdfText(h).toUpperCase() : h)),
    body: options.body.map(row => row.map(cell =>
      cell && typeof cell === 'object' ? { ...cell, content: pdfText(cell.content) } : pdfText(cell))),
  });
  ctx.y = doc.lastAutoTable.finalY + 8;
}

const pdfStatusCell = status => ({
  content: statusLabel(status), styles: { textColor: PDF_STATUS_TEXT[status], fontStyle: 'bold' },
});

const pdfPriorityCell = priority => ({
  content: t('priority_' + priority), styles: { textColor: PDF_PRIORITY_TEXT[priority], fontStyle: 'bold' },
});

/** Load an image URL as a PNG data URL (null if it cannot be loaded, e.g. CORS). */
function pdfLoadImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => resolve(null), 4000);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ data: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

/** Render a radar chart off-screen on the light palette and return it as a PNG data URL. */
function pdfRadarImage(aspectIds) {
  if (!aspectIds.length) return null;
  const canvas = document.createElement('canvas');
  canvas.width  = 900;
  canvas.height = 900;
  const config = buildRadarConfig(aspectIds, { ...CHART_THEMES.light, fontSize: 22 }, { legend: true });
  config.options.responsive       = false;
  config.options.animation        = false;
  config.options.devicePixelRatio = 1;
  // White background so the chart can be embedded as a (much smaller) JPEG.
  config.plugins = [{
    id: 'pdfBackground',
    beforeDraw: chart => {
      const c = chart.ctx;
      c.save();
      c.fillStyle = '#fff';
      c.fillRect(0, 0, chart.width, chart.height);
      c.restore();
    },
  }];
  const chart = new Chart(canvas, config);
  const data  = canvas.toDataURL('image/jpeg', 0.9);
  chart.destroy();
  return data;
}

// ── Sections ───────────────────────────────────

async function pdfCover(ctx, data) {
  const { doc } = ctx;
  const { M, W } = PDF;

  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(0, 0, W, 4, 'F');

  // Brand
  let brandX = M;
  const logo = BRANDING.logoUrl ? await pdfLoadImage(BRANDING.logoUrl) : null;
  if (logo) {
    const h = 12, w = Math.min(50, h * logo.w / logo.h);
    doc.addImage(logo.data, 'PNG', M, 26, w, w * logo.h / logo.w);
    brandX = M + w + 5;
  } else {
    doc.setFillColor(...PDF_COLORS.primary);
    doc.roundedRect(M, 26, 12, 12, 2, 2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.9);
    doc.lines([[2.3, 2.3], [5, -5]], M + 3.4, 32.2);
    brandX = M + 17;
  }
  pdfLabel(doc, BRANDING.companyName, brandX, 33.5, { size: 8.5, color: PDF_COLORS.text2 });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...PDF_COLORS.text);
  const titleLines = doc.splitTextToSize(pdfText(t('reportTitle')), PDF.CW);
  doc.text(titleLines, M, 100);
  let y = 100 + titleLines.length * 11;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.text2);
  const subLines = doc.splitTextToSize(pdfText(t('reportSub')), PDF.CW);
  doc.text(subLines, M, y);
  y += subLines.length * 6 + 6;

  doc.setDrawColor(...PDF_COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(M, y, M + 30, y);

  // Organization
  if (STATE.orgName) {
    pdfLabel(doc, t('metaOrg'), M, 152);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(doc.splitTextToSize(pdfText(STATE.orgName), PDF.CW), M, 161);
  }

  // Key facts grid
  const facts = [
    [t('metaTarget'),    `${t('levelPrefix')} ${STATE.targetLevel}`],
    [t('levelAchieved'), data.readiness.achieved ? `${t('levelPrefix')} ${data.readiness.achieved}` : t('noLevelAchieved')],
    [t('scoreGlobal'),   `${data.score}%`],
    [t('metaDate'),      formatDate(todayISO())],
  ];
  const cellW = (PDF.CW - 8) / 2;
  facts.forEach(([label, value], i) => {
    const x  = M + (i % 2) * (cellW + 8);
    const fy = 192 + Math.floor(i / 2) * 24;
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(x, fy, x + cellW, fy);
    pdfLabel(doc, label, x, fy + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(pdfText(value), x, fy + 14);
  });

  // Disclaimer & footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.text3);
  const disclaimer = doc.splitTextToSize(pdfText(t('disclaimer')), PDF.CW);
  doc.text(disclaimer, M, 276 - disclaimer.length * 3.4);

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(M, 280, W - M, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.text3);
  doc.text(pdfText(t('pdfConfidential')), M, 285);
  doc.text(pdfText('CryptoCurrency Security Standard (CCSS) v9.0'), W - M, 285, { align: 'right' });
}

function pdfSummary(ctx, data) {
  const { doc } = ctx;
  pdfSectionTitle(ctx, t('summaryTitle'));
  buildExecutiveSummary().forEach(p => pdfParagraph(ctx, p));

  // KPI boxes
  ctx.y += 2;
  pdfEnsureSpace(ctx, 28);
  const kpis = [
    { label: t('scoreGlobal'),     value: `${data.score}%`,        color: PDF_COLORS.primary },
    { label: t('scoreInPlace'),    value: data.n.in_place,         color: PDF_COLORS.success },
    { label: t('scorePartial'),    value: data.n.partial,          color: PDF_COLORS.warning },
    { label: t('scoreNotInPlace'), value: data.n.not_in_place,     color: PDF_COLORS.danger  },
    { label: t('scoreNA'),         value: data.n.na,               color: PDF_COLORS.text3   },
  ];
  const gap = 3, w = (PDF.CW - gap * (kpis.length - 1)) / kpis.length, h = 22;
  kpis.forEach((k, i) => {
    const x = PDF.M + i * (w + gap);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(x, ctx.y, w, h, 'S');
    doc.setFillColor(...k.color);
    doc.rect(x, ctx.y, w, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...PDF_COLORS.text);
    doc.text(String(k.value), x + 4, ctx.y + 11.5);
    pdfLabel(doc, k.label, x + 4, ctx.y + 18, { size: 5.8, charSpace: 0.1 });
  });

  if (data.cmp) {
    const d = formatDelta(data.score, data.cmp.scoreBefore ?? 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...(data.score >= (data.cmp.scoreBefore ?? 0) ? PDF_STATUS_TEXT.in_place : PDF_STATUS_TEXT.not_in_place));
    doc.text(pdfText(d), PDF.M + w - 3, ctx.y + 6, { align: 'right' });
  }
  ctx.y += h + 10;
}

function pdfReadiness(ctx, data) {
  const { doc } = ctx;
  const r = data.readiness;
  pdfSectionTitle(ctx, t('readinessTitle'));
  pdfEnsureSpace(ctx, 34);

  const boxH = 10 + r.perLevel.length * 6 + 4;
  const h    = Math.max(28, boxH);
  doc.setFillColor(...PDF_COLORS.soft);
  doc.rect(PDF.M, ctx.y, PDF.CW, h, 'F');
  doc.setFillColor(...(r.achieved ? PDF_COLORS.success : PDF_COLORS.danger));
  doc.rect(PDF.M, ctx.y, 1.4, h, 'F');

  pdfLabel(doc, t('levelAchieved'), PDF.M + 6, ctx.y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(pdfText(r.achieved ? `${t('levelPrefix')} ${r.achieved}` : t('noLevelAchieved')), PDF.M + 6, ctx.y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.text2);
  doc.text(pdfText(r.next
    ? t('readinessNext', { level: r.next.level, n: r.next.pending.length })
    : t('readinessAllMet', { level: STATE.targetLevel })), PDF.M + 6, ctx.y + 22.5);

  // Per-level status on the right
  const right = PDF.W - PDF.M - 6;
  r.perLevel.forEach((l, i) => {
    const ly = ctx.y + 8 + i * 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...(l.met ? PDF_STATUS_TEXT.in_place : PDF_STATUS_TEXT.not_in_place));
    const status = pdfText(l.met ? t('levelMet') : t('levelPending', { n: l.pending.length }));
    doc.text(status, right, ly, { align: 'right' });
    doc.setTextColor(...PDF_COLORS.text2);
    doc.text(pdfText(`${t('levelPrefix')} ${l.level}`), right - doc.getTextWidth(status) - 4, ly, { align: 'right' });
  });
  ctx.y += h + 5;

  pdfParagraph(ctx, t('readinessNote'), { size: 7.5, color: PDF_COLORS.text3, style: 'italic', gap: 3 });

  if (r.next) {
    pdfParagraph(ctx, `${t('pendingFor', { level: r.next.level })} (${r.next.pending.length})`, { size: 9, style: 'bold', gap: 0 });
    pdfTable(ctx, {
      head: [['ID', t('tableControl'), t('tableLevel'), t('tableStatus')]],
      body: r.next.pending.map(c => [c.id, c.name, c.introducedAt, pdfStatusCell(statusOf(c.id))]),
      columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 14 }, 3: { cellWidth: 32 } },
    });
  }
}

function pdfAspects(ctx, data) {
  const { doc } = ctx;
  pdfSectionTitle(ctx, t('pdfAspectsTitle'));

  const scores  = aspectScores(data.controls);
  const before  = data.cmp ? data.cmp.aspectsBefore : null;
  const head    = ['ID', t('tableAspect'), t('tableControls'), t('tableScore'), ''];
  if (before) head.push(t('compareBefore'), 'Var.');
  const barCol  = 4;

  pdfTable(ctx, {
    head: [head],
    body: Object.keys(scores).map(id => {
      const v   = scores[id];
      const row = [id, ASPECTS[id].name, data.controls.filter(c => c.aspect === id).length, v === null ? '—' : `${v}%`, ''];
      if (before) row.push(before[id] == null ? '—' : `${before[id]}%`, formatDelta(v, before[id] ?? null));
      return row;
    }),
    columnStyles: { 0: { cellWidth: 14 }, 2: { cellWidth: 20, halign: 'right' }, 3: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.text }, [barCol]: { cellWidth: 36 } },
    didDrawCell: hook => {
      if (hook.section !== 'body' || hook.column.index !== barCol) return;
      const v = scores[Object.keys(scores)[hook.row.index]];
      if (v === null || v === undefined) return;
      const { cell } = hook;
      const x = cell.x + 2, y = cell.y + cell.height / 2 - 1, w = cell.width - 4;
      doc.setFillColor(...PDF_COLORS.border);
      doc.rect(x, y, w, 2, 'F');
      doc.setFillColor(...(v >= 80 ? PDF_COLORS.success : v >= 50 ? PDF_COLORS.warning : PDF_COLORS.danger));
      if (v > 0) doc.rect(x, y, w * v / 100, 2, 'F');
    },
  });

  // Radar charts side by side
  const charts = [
    { title: t('cat1Title'), img: pdfRadarImage(reportAspectIds('1')) },
    { title: t('cat2Title'), img: pdfRadarImage(reportAspectIds('2')) },
  ].filter(c => c.img);
  if (!charts.length) return;

  const size = (PDF.CW - 8) / 2;
  pdfEnsureSpace(ctx, size + 14);
  charts.forEach((c, i) => {
    const x = PDF.M + i * (size + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.text2);
    doc.text(doc.splitTextToSize(pdfText(c.title), size), x, ctx.y);
    doc.addImage(c.img, 'JPEG', x, ctx.y + 5, size, size);
  });
  ctx.y += size + 12;
}

function pdfLevelBreakdown(ctx, data) {
  if (STATE.targetLevel === 'I') return;
  pdfSectionTitle(ctx, t('levelBreakdownTitle'));

  const levels = ['I', 'II', 'III'].slice(0, LEVEL_ORDER[STATE.targetLevel]);
  pdfTable(ctx, {
    head: [[t('tableLevel'), t('tableControls'), t('tableScore'), t('scoreInPlace'), t('scorePartial'), t('scoreNotInPlace'), t('scoreNA')]],
    body: levels.map(lvl => {
      const lc = data.controls.filter(c => c.introducedAt === lvl);
      const n  = countStatuses(lc);
      return [`${t('levelPrefix')} ${lvl}`, lc.length, `${scoreOf(lc) ?? 0}%`, n.in_place, n.partial, n.not_in_place, n.na];
    }),
    columnStyles: { 0: { fontStyle: 'bold', textColor: PDF_COLORS.text } },
  });
}

function pdfComparison(ctx, data) {
  const cmp = data.cmp;
  if (!cmp) return;
  pdfSectionTitle(ctx, t('compareTitle'));

  const levelName = lvl => lvl ? `${t('levelPrefix')} ${lvl}` : t('noLevelAchieved');
  pdfTable(ctx, {
    head: [['', t('compareBefore'), t('compareAfter')]],
    body: [
      [t('metaDate'),      formatDate(cmp.date) || '—', formatDate(todayISO())],
      [t('scoreGlobal'),   `${cmp.scoreBefore ?? 0}%`, `${cmp.scoreAfter ?? 0}%  (${formatDelta(cmp.scoreAfter ?? 0, cmp.scoreBefore ?? 0)})`],
      [t('compareLevel'),  levelName(cmp.achievedBefore), levelName(data.readiness.achieved)],
    ],
    columnStyles: { 0: { fontStyle: 'bold', textColor: PDF_COLORS.text, cellWidth: 50 } },
  });

  pdfParagraph(ctx, `${t('compareImproved')}: ${cmp.improved}   ·   ${t('compareWorsened')}: ${cmp.worsened}`, { size: 9, style: 'bold' });

  if (!cmp.changes.length) {
    pdfParagraph(ctx, t('noChanges'), { color: PDF_COLORS.text2 });
    return;
  }
  const trendColor = { improved: PDF_STATUS_TEXT.in_place, worsened: PDF_STATUS_TEXT.not_in_place, changed: PDF_COLORS.text2 };
  pdfTable(ctx, {
    head: [['ID', t('tableControl'), t('compareBefore'), t('compareAfter'), t('tableTrend')]],
    body: cmp.changes.map(ch => [
      ch.control.id, ch.control.name, pdfStatusCell(ch.before), pdfStatusCell(ch.after),
      { content: t('trend_' + ch.trend), styles: { textColor: trendColor[ch.trend], fontStyle: 'bold' } },
    ]),
    columnStyles: { 0: { cellWidth: 20 }, 2: { cellWidth: 28 }, 3: { cellWidth: 28 }, 4: { cellWidth: 20 } },
  });
}

function pdfGaps(ctx, data) {
  pdfSectionTitle(ctx, `${t('gapsTitle')} (${data.gaps.length})`);
  if (!data.gaps.length) {
    pdfParagraph(ctx, t('noGaps'), { color: PDF_COLORS.text2 });
    return;
  }

  pdfTable(ctx, {
    head: [['ID', t('tableControl'), t('tableLevel'), t('tableStatus'), t('tableRequirement')]],
    body: data.gaps.map(c => {
      const extra = [];
      if (STATE.options.evidence && STATE.evidence[c.id]) extra.push(`${t('tableEvidence')}: ${STATE.evidence[c.id]}`);
      if (STATE.notes[c.id]) extra.push(`${t('noteLabel')}: ${STATE.notes[c.id]}`);
      return [
        c.id, c.name, c.introducedAt, pdfStatusCell(STATE.answers[c.id]),
        [getEffectiveRequirement(c), ...extra].join('\n'),
      ];
    }),
    columnStyles: {
      0: { cellWidth: 19 }, 1: { cellWidth: 36, textColor: PDF_COLORS.text, fontStyle: 'bold' },
      2: { cellWidth: 11, halign: 'center' }, 3: { cellWidth: 28 }, 4: { fontSize: 7.5 },
    },
  });
}

function pdfRemediation(ctx, data) {
  if (!STATE.options.remediation) return;
  const plan = getRemediationPlan(data.controls);
  if (!plan.length) return;
  pdfSectionTitle(ctx, `${t('remediationPlanTitle')} (${plan.length})`);

  pdfTable(ctx, {
    head: [[t('tablePriority'), 'ID', t('tableControl'), t('tableStatus'), t('tableOwner'), t('tableDue')]],
    body: plan.map(p => [
      pdfPriorityCell(p.priority), p.control.id, p.control.name, pdfStatusCell(p.status),
      p.owner ? p.owner : { content: t('unassigned'), styles: { fontStyle: 'italic', textColor: PDF_COLORS.text3 } },
      p.due
        ? { content: formatDate(p.due) + (p.overdue ? ` (${t('overdue')})` : ''), styles: p.overdue ? { textColor: PDF_STATUS_TEXT.not_in_place, fontStyle: 'bold' } : {} }
        : '—',
    ]),
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 19 }, 3: { cellWidth: 28 }, 4: { cellWidth: 30 }, 5: { cellWidth: 26 } },
  });
}

function pdfAnnex(ctx, data) {
  ctx.doc.addPage();
  ctx.y = PDF.TOP;
  pdfSectionTitle(ctx, t('pdfAnnexTitle'));

  const showEvidence = STATE.options.evidence;
  const head = ['ID', t('tableControl'), t('tableAspect'), t('tableLevel'), t('tableStatus'), t('tableNotes')];
  if (showEvidence) head.push(t('tableEvidence'));

  pdfTable(ctx, {
    head: [head],
    body: data.controls.map(c => {
      const row = [
        c.id + (STATE.flags[c.id] ? ' *' : ''), c.name, ASPECTS[c.aspect].name, c.introducedAt,
        pdfStatusCell(statusOf(c.id)), STATE.notes[c.id] || '',
      ];
      if (showEvidence) row.push(STATE.evidence[c.id] || '');
      return row;
    }),
    styles: {
      font: 'helvetica', fontSize: 7.3, textColor: PDF_COLORS.text2, overflow: 'linebreak',
      cellPadding: { top: 1.6, bottom: 1.6, left: 1.6, right: 1.6 },
      lineColor: PDF_COLORS.border, lineWidth: { bottom: 0.2 },
    },
    columnStyles: {
      0: { cellWidth: 19 }, 1: { cellWidth: showEvidence ? 32 : 40, textColor: PDF_COLORS.text },
      2: { cellWidth: 26 }, 3: { cellWidth: 10, halign: 'center' }, 4: { cellWidth: 26 },
    },
  });

  if (data.controls.some(c => STATE.flags[c.id])) {
    pdfParagraph(ctx, t('pdfFlagNote'), { size: 7.5, color: PDF_COLORS.text3, style: 'italic' });
  }
}

/** Running header and footer on every page except the cover. */
function pdfHeadersFooters(doc) {
  const total = doc.getNumberOfPages();
  const right = [t('reportTitle'), STATE.orgName].filter(Boolean).join(' · ');
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    pdfLabel(doc, BRANDING.companyName, PDF.M, 13, { size: 6.5 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.text3);
    doc.text(pdfText(right), PDF.W - PDF.M, 13, { align: 'right' });
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(PDF.M, 16, PDF.W - PDF.M, 16);

    doc.line(PDF.M, 284, PDF.W - PDF.M, 284);
    doc.text(pdfText(t('pdfConfidential')), PDF.M, 289);
    doc.text(pdfText(formatDate(todayISO())), PDF.W / 2, 289, { align: 'center' });
    doc.text(pdfText(t('pdfPage', { i, n: total })), PDF.W - PDF.M, 289, { align: 'right' });
  }
}

// ── Entry point ────────────────────────────────

async function exportPDF() {
  const btn = document.querySelector('.btn-pdf');
  const origLabel = btn.textContent;
  btn.textContent = t('btnExporting');
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setProperties({ title: t('reportTitle'), subject: 'CCSS v9.0', creator: BRANDING.companyName });

    const controls = getActiveControls();
    const data = {
      controls,
      n:         countStatuses(controls),
      score:     scoreOf(controls) ?? 0,
      readiness: computeReadiness(),
      gaps:      getGaps(controls),
      cmp:       compareWithBaseline(controls),
    };
    const ctx = { doc, y: PDF.TOP, section: 0 };

    await pdfCover(ctx, data);
    doc.addPage();
    ctx.y = PDF.TOP;

    pdfSummary(ctx, data);
    pdfReadiness(ctx, data);
    pdfAspects(ctx, data);
    pdfLevelBreakdown(ctx, data);
    pdfComparison(ctx, data);
    pdfGaps(ctx, data);
    pdfRemediation(ctx, data);
    pdfAnnex(ctx, data);
    pdfHeadersFooters(doc);

    doc.save(`${exportFileName()}.pdf`);
  } catch (e) {
    console.error(e);
    alert(t('pdfError'));
  } finally {
    btn.textContent = origLabel;
    btn.disabled = false;
  }
}
