// ─────────────────────────────────────────────
// Internationalisation — ES / EN strings
// ─────────────────────────────────────────────

const STRINGS = {
  es: {
    // Welcome
    welcomeSub:   'Evalúa el nivel de cumplimiento de tu organización con el estándar CCSS v9.0 publicado por el CryptoCurrency Certification Consortium (C4).',
    level1Name:   'Nivel I — Fundacional',
    level1Desc:   'Controles básicos de seguridad para gestión de activos criptográficos.',
    level2Name:   'Nivel II — Avanzado',
    level2Desc:   'Controles adicionales con mayor rigor operativo y documentación.',
    level3Name:   'Nivel III — Experto',
    level3Desc:   'Máximo nivel de seguridad para entidades con operaciones de alto valor.',
    btnStart:     'Comenzar evaluación →',

    // Assessment – sidebar & topbar
    levelPrefix:     'Nivel',
    progressGlobal:  'Progreso global',
    btnReportTopbar: 'Ver informe →',

    // Assessment – status options
    statusInPlace:       'Implementado',
    statusInPlaceSub:    'El control está completamente en vigor',
    statusPartial:       'Parcialmente implementado',
    statusPartialSub:    'En proceso o cumplimiento incompleto',
    statusNotInPlace:    'No implementado',
    statusNotInPlaceSub: 'El control no está en vigor',
    statusNA:            'No aplica',
    statusNASub:         'Este control no es relevante para mi organización',

    // Assessment – question card
    reqToggleShow:    '▸ Ver requisito oficial (en inglés)',
    reqToggleHide:    '▾ Ocultar requisito oficial',
    notesLabel:       'Notas opcionales',
    noteLabel:        'Nota',
    notesPlaceholder: 'Añade contexto, evidencias o comentarios...',
    btnPrev:          '← Anterior',
    btnNext:          'Siguiente →',
    btnReportFinal:   'Ver informe →',

    // Report – header & meta
    reportTitle:    'Informe de Evaluación CCSS',
    reportSub:      'Resultados según el CryptoCurrency Security Standard v9.0',
    metaTarget:     'Nivel objetivo',
    metaEvaluated:  'Controles evaluados',
    metaDate:       'Fecha',

    // Report – score cards
    scoreGlobal:    'Puntuación global',
    scoreInPlace:   'Implementados',
    scorePartial:   'Parciales',
    scoreNotInPlace:'No implementados',
    scoreNA:        'No aplica',

    // Report – charts
    cat1Title:  'Categoría 1 — Gestión de Activos Criptográficos',
    cat2Title:  'Categoría 2 — Operaciones',
    btnExporting: 'Generando PDF…',
    chartLabel:   'Cumplimiento (%)',
    chartGeneral: 'General',

    // Report – level breakdown
    levelBreakdownTitle: 'Desglose por nivel',
    controlsWord:        'controles',

    // Report – gaps
    gapsTitle:  'Brechas identificadas',
    noGaps:     'Sin brechas: todos los controles están implementados',
    gapLevel:   'Nivel',

    // Report – table
    tableControl:    'Control',
    tableAspect:     'Aspecto',
    tableLevel:      'Nivel',
    tableStatus:     'Estado',
    tableNotes:      'Notas',
    pillInPlace:     'Implementado',
    pillPartial:     'Parcialmente',
    pillNotInPlace:  'No implementado',
    pillNA:          'No aplica',
    pillUnanswered:  'Sin respuesta',

    // Report – actions
    btnExport:        'Exportar PDF',
    btnShare:         'Copiar enlace para compartir',
    btnShareCopied:   'Enlace copiado',
    btnProgress:      'Copiar enlace de progreso',
    btnProgressCopied:'Enlace de progreso copiado',
    btnRestart:       '← Reiniciar evaluación',
    sharedBadge:      'Informe compartido',
    sharedBannerText: 'Estás viendo el informe de evaluación de <strong>otra organización</strong>. Los resultados son de solo lectura.',
    editBadge:        'Assessment compartido',
    editBannerText:   'Estás viendo un <strong>assessment en progreso compartido</strong>. Puedes continuar editando y guardar cambios.',

    // Recovery from localStorage
    recoverBadge:     'Assessment guardado',
    recoverBannerText:'Se encontró un assessment guardado. ¿Deseas continuarlo o comenzar uno nuevo?',
    btnRecover:       'Continuar',
    btnDiscardRecover:'Comenzar de nuevo',

    and: 'y',

    disclaimer:   'Herramienta no oficial, sin afiliación con el CryptoCurrency Certification Consortium (C4). Los resultados son orientativos: no sustituyen una auditoría ni constituyen una certificación CCSS.',
    shareWarning: 'El enlace contiene la evaluación completa (brechas, notas, evidencias y responsables). Compártelo solo por canales de confianza.',

    // Welcome – setup & import
    orgNameLabel:   'Organización (opcional)',
    orgNamePh:      'Nombre de la organización evaluada',
    modulesLabel:   'Módulos opcionales',
    optEvidence:    'Registrar evidencias por control',
    optRemediation: 'Plan de remediación (responsable, fecha y prioridad)',
    btnImport:      'o importar una evaluación guardada (.json)',
    importError:    'No se ha podido leer el archivo. Asegúrate de que es un JSON exportado por esta herramienta.',

    // Assessment – sidebar filters & modules
    filterAll:        'Todos',
    filterUnanswered: 'Sin responder',
    filterFlagged:    'Marcados',
    filterGaps:       'Brechas',
    filterEmpty:      'Ningún control coincide con este filtro.',
    modulesTitle:     'Módulos',
    optEvidenceShort: 'Evidencias',
    optRemediationShort: 'Plan de remediación',
    btnSaveJson:      'Guardar JSON',

    // Assessment – question card extras
    flag:             'Marcar para revisar',
    flagged:          'Marcado para revisar',
    remediationTitle: 'Plan de remediación',
    fieldOwner:       'Responsable',
    fieldOwnerPh:     'Persona o equipo',
    fieldDue:         'Fecha objetivo',
    fieldPriority:    'Prioridad',
    prioritySuggested: ({ p }) => `Sugerida: ${p}`,
    priority_high:    'Alta',
    priority_medium:  'Media',
    priority_low:     'Baja',
    fieldEvidence:    'Evidencia',
    fieldEvidencePh:  'Documento, URL o ticket que acredita el control',
    kbAnswer:         'responder',
    kbNav:            'navegar',
    kbFlag:           'marcar',
    kbReq:            'requisito',

    // Report – toolbar
    btnBackToAssessment: '← Volver a la evaluación',
    btnCompare:       'Comparar con evaluación anterior',
    btnClearCompare:  'Quitar comparación',
    exportLabel:      'Exportar',
    metaOrg:          'Organización',
    metaBaseline:     'Comparado con',

    // Report – executive summary
    summaryTitle:   'Resumen ejecutivo',
    sumIntro: ({ org, level, total, answered, score }) =>
      `${org || 'La organización'} ha evaluado ${answered} de ${total} controles aplicables al Nivel ${level} del CCSS v9.0, con una puntuación global de cumplimiento del ${score}%.`,
    sumAchieved:    ({ level }) => `Con las respuestas actuales se cumplen todos los requisitos del Nivel ${level}.`,
    sumNotAchieved: 'Con las respuestas actuales todavía no se cumplen todos los requisitos de ningún nivel de certificación.',
    sumNext: ({ level, pending, notInPlace, partial, unanswered }) => {
      const parts = [];
      if (notInPlace) parts.push(`${notInPlace} no ${notInPlace === 1 ? 'implementado' : 'implementados'}`);
      if (partial)    parts.push(`${partial} ${partial === 1 ? 'parcial' : 'parciales'}`);
      if (unanswered) parts.push(`${unanswered} sin responder`);
      return `Para alcanzar el Nivel ${level} ${pending === 1 ? 'queda 1 control' : `quedan ${pending} controles`} por cerrar: ${formatList(parts)}.`;
    },
    sumAllMet:      ({ level }) => `Se cumplen todos los controles exigidos para el nivel objetivo (Nivel ${level}).`,
    sumWeakest:     ({ list }) => `Aspectos con menor cumplimiento: ${list}.`,
    sumGaps:        ({ total, notInPlace, partial }) =>
      `Se han identificado ${total} brechas: ${notInPlace} controles no implementados y ${partial} parcialmente implementados.`,
    sumRemediation: ({ total, unassigned, overdue }) =>
      `El plan de remediación recoge ${total} acciones; ${unassigned} sin responsable asignado y ${overdue} con la fecha objetivo vencida.`,
    sumFlagged:     ({ n }) => n === 1 ? '1 control está marcado para revisión.' : `${n} controles están marcados para revisión.`,
    sumCompare:     ({ date, before, after, delta, improved, worsened }) =>
      `Respecto a la evaluación anterior${date ? ` (${date})` : ''}, la puntuación ha pasado del ${before}% al ${after}% (${delta}); ${improved} controles han mejorado y ${worsened} han empeorado.`,

    // Report – readiness
    readinessTitle:  'Nivel de certificación alcanzado',
    levelAchieved:   'Nivel alcanzado',
    noLevelAchieved: 'Ninguno',
    readinessNext:   ({ level, n }) => n === 1 ? `Falta 1 control para el Nivel ${level}` : `Faltan ${n} controles para el Nivel ${level}`,
    readinessAllMet: ({ level }) => `Nivel objetivo (${level}) cumplido`,
    levelMet:        'Cumplido',
    levelPending:    ({ n }) => n === 1 ? '1 pendiente' : `${n} pendientes`,
    pendingFor:      ({ level }) => `Controles pendientes para el Nivel ${level}`,
    readinessNote:   'La certificación CCSS es de todo o nada por nivel: un nivel solo se alcanza cuando todos sus controles están implementados o no aplican.',

    // Report – comparison
    compareTitle:   'Evolución respecto a la evaluación anterior',
    compareBefore:  'Anterior',
    compareAfter:   'Actual',
    compareImproved:'Controles que mejoran',
    compareWorsened:'Controles que empeoran',
    compareLevel:   'Nivel alcanzado',
    trend_improved: 'Mejora',
    trend_worsened: 'Empeora',
    trend_changed:  'Cambia',
    noChanges:      'No hay cambios de estado entre ambas evaluaciones.',
    chartBaseline:  'Anterior',
    vsBaseline:     'vs. evaluación anterior',

    // Report – remediation & table extras
    remediationPlanTitle: 'Plan de remediación',
    tablePriority:  'Prioridad',
    tableOwner:     'Responsable',
    tableDue:       'Fecha objetivo',
    tableEvidence:  'Evidencia',
    tableFlagged:   'Marcado',
    tableScore:     'Cumplimiento',
    tableControls:  'Controles',
    tableRequired:  'Controles requeridos',
    tablePending:   'Pendientes',
    tableTrend:     'Tendencia',
    tableRequirement: 'Requisito',
    unassigned:     'Sin asignar',
    overdue:        'Vencida',
    yes:            'Sí',

    // PDF & spreadsheet exports
    pdfConfidential: 'Documento confidencial — uso interno',
    pdfPage:         ({ i, n }) => `Página ${i} de ${n}`,
    pdfAspectsTitle: 'Cumplimiento por aspecto',
    pdfAnnexTitle:   'Anexo — Detalle de controles',
    pdfFlagNote:     '* Control marcado para revisión.',
    pdfError:        'No se ha podido generar el PDF.',
    sheetSummary:    'Resumen',
    sheetControls:   'Controles',
    sheetPlan:       'Plan de remediación',
    sheetChanges:    'Evolución',
    xlsxError:       'No se ha podido cargar la librería de Excel (vendor/xlsx.full.min.js).',
  },

  en: {
    // Welcome
    welcomeSub:   'Evaluate your organization\'s compliance with the CCSS v9.0 standard published by the CryptoCurrency Certification Consortium (C4).',
    level1Name:   'Level I — Foundational',
    level1Desc:   'Basic security controls for cryptographic asset management.',
    level2Name:   'Level II — Advanced',
    level2Desc:   'Additional controls with greater operational rigor and documentation.',
    level3Name:   'Level III — Expert',
    level3Desc:   'Maximum security level for entities with high-value operations.',
    btnStart:     'Start assessment →',

    // Assessment – sidebar & topbar
    levelPrefix:     'Level',
    progressGlobal:  'Overall progress',
    btnReportTopbar: 'View report →',

    // Assessment – status options
    statusInPlace:       'In Place',
    statusInPlaceSub:    'The control is fully implemented',
    statusPartial:       'Partially In Place',
    statusPartialSub:    'In progress or incomplete compliance',
    statusNotInPlace:    'Not In Place',
    statusNotInPlaceSub: 'The control is not implemented',
    statusNA:            'Not Applicable',
    statusNASub:         'This control is not relevant to my organization',

    // Assessment – question card
    reqToggleShow:    '▸ View official requirement',
    reqToggleHide:    '▾ Hide official requirement',
    notesLabel:       'Optional notes',
    noteLabel:        'Note',
    notesPlaceholder: 'Add context, evidence or comments...',
    btnPrev:          '← Previous',
    btnNext:          'Next →',
    btnReportFinal:   'View report →',

    // Report – header & meta
    reportTitle:    'CCSS Assessment Report',
    reportSub:      'Results according to the CryptoCurrency Security Standard v9.0',
    metaTarget:     'Target level',
    metaEvaluated:  'Controls evaluated',
    metaDate:       'Date',

    // Report – score cards
    scoreGlobal:    'Overall score',
    scoreInPlace:   'In Place',
    scorePartial:   'Partial',
    scoreNotInPlace:'Not In Place',
    scoreNA:        'Not Applicable',

    // Report – charts
    cat1Title:  'Category 1 — Cryptographic Asset Management',
    cat2Title:  'Category 2 — Operations',
    btnExporting: 'Generating PDF…',
    chartLabel:   'Compliance (%)',
    chartGeneral: 'Overall',

    // Report – level breakdown
    levelBreakdownTitle: 'Breakdown by level',
    controlsWord:        'controls',

    // Report – gaps
    gapsTitle:  'Identified gaps',
    noGaps:     'No gaps: all controls are implemented',
    gapLevel:   'Level',

    // Report – table
    tableControl:    'Control',
    tableAspect:     'Aspect',
    tableLevel:      'Level',
    tableStatus:     'Status',
    tableNotes:      'Notes',
    pillInPlace:     'In Place',
    pillPartial:     'Partial',
    pillNotInPlace:  'Not In Place',
    pillNA:          'Not Applicable',
    pillUnanswered:  'Unanswered',

    // Report – actions
    btnExport:        'Export PDF',
    btnShare:         'Copy share link',
    btnShareCopied:   'Link copied',
    btnProgress:      'Copy progress link',
    btnProgressCopied:'Progress link copied',
    btnRestart:       '← Restart assessment',
    sharedBadge:      'Shared report',
    sharedBannerText: 'You are viewing the assessment report of <strong>another organization</strong>. Results are read-only.',
    editBadge:        'Shared assessment',
    editBannerText:   'You are viewing a <strong>shared assessment in progress</strong>. You can continue editing and save changes.',

    // Recovery from localStorage
    recoverBadge:     'Saved assessment',
    recoverBannerText:'A saved assessment was found. Do you want to continue or start a new one?',
    btnRecover:       'Continue',
    btnDiscardRecover:'Start fresh',

    and: 'and',

    disclaimer:   'Unofficial tool, not affiliated with the CryptoCurrency Certification Consortium (C4). Results are indicative only: they do not replace an audit and do not constitute a CCSS certification.',
    shareWarning: 'The link contains the full assessment (gaps, notes, evidence and owners). Only share it through trusted channels.',

    // Welcome – setup & import
    orgNameLabel:   'Organization (optional)',
    orgNamePh:      'Name of the assessed organization',
    modulesLabel:   'Optional modules',
    optEvidence:    'Record evidence per control',
    optRemediation: 'Remediation plan (owner, due date and priority)',
    btnImport:      'or import a saved assessment (.json)',
    importError:    'The file could not be read. Make sure it is a JSON file exported by this tool.',

    // Assessment – sidebar filters & modules
    filterAll:        'All',
    filterUnanswered: 'Unanswered',
    filterFlagged:    'Flagged',
    filterGaps:       'Gaps',
    filterEmpty:      'No controls match this filter.',
    modulesTitle:     'Modules',
    optEvidenceShort: 'Evidence',
    optRemediationShort: 'Remediation plan',
    btnSaveJson:      'Save JSON',

    // Assessment – question card extras
    flag:             'Flag for review',
    flagged:          'Flagged for review',
    remediationTitle: 'Remediation plan',
    fieldOwner:       'Owner',
    fieldOwnerPh:     'Person or team',
    fieldDue:         'Due date',
    fieldPriority:    'Priority',
    prioritySuggested: ({ p }) => `Suggested: ${p}`,
    priority_high:    'High',
    priority_medium:  'Medium',
    priority_low:     'Low',
    fieldEvidence:    'Evidence',
    fieldEvidencePh:  'Document, URL or ticket that supports the control',
    kbAnswer:         'answer',
    kbNav:            'navigate',
    kbFlag:           'flag',
    kbReq:            'requirement',

    // Report – toolbar
    btnBackToAssessment: '← Back to assessment',
    btnCompare:       'Compare with previous assessment',
    btnClearCompare:  'Remove comparison',
    exportLabel:      'Export',
    metaOrg:          'Organization',
    metaBaseline:     'Compared with',

    // Report – executive summary
    summaryTitle:   'Executive summary',
    sumIntro: ({ org, level, total, answered, score }) =>
      `${org || 'The organization'} has assessed ${answered} of ${total} controls applicable to CCSS v9.0 Level ${level}, with an overall compliance score of ${score}%.`,
    sumAchieved:    ({ level }) => `Based on the current answers, all Level ${level} requirements are met.`,
    sumNotAchieved: 'Based on the current answers, the requirements of no certification level are fully met yet.',
    sumNext: ({ level, pending, notInPlace, partial, unanswered }) => {
      const parts = [];
      if (notInPlace) parts.push(`${notInPlace} not in place`);
      if (partial)    parts.push(`${partial} partial`);
      if (unanswered) parts.push(`${unanswered} unanswered`);
      return `To reach Level ${level}, ${pending === 1 ? '1 control remains' : `${pending} controls remain`} to be closed: ${formatList(parts)}.`;
    },
    sumAllMet:      ({ level }) => `All controls required for the target level (Level ${level}) are met.`,
    sumWeakest:     ({ list }) => `Aspects with the lowest compliance: ${list}.`,
    sumGaps:        ({ total, notInPlace, partial }) =>
      `${total} gaps have been identified: ${notInPlace} controls not in place and ${partial} partially in place.`,
    sumRemediation: ({ total, unassigned, overdue }) =>
      `The remediation plan contains ${total} actions; ${unassigned} without an owner and ${overdue} past their due date.`,
    sumFlagged:     ({ n }) => n === 1 ? '1 control is flagged for review.' : `${n} controls are flagged for review.`,
    sumCompare:     ({ date, before, after, delta, improved, worsened }) =>
      `Compared with the previous assessment${date ? ` (${date})` : ''}, the score went from ${before}% to ${after}% (${delta}); ${improved} controls improved and ${worsened} worsened.`,

    // Report – readiness
    readinessTitle:  'Certification level achieved',
    levelAchieved:   'Level achieved',
    noLevelAchieved: 'None',
    readinessNext:   ({ level, n }) => n === 1 ? `1 control missing for Level ${level}` : `${n} controls missing for Level ${level}`,
    readinessAllMet: ({ level }) => `Target level (${level}) met`,
    levelMet:        'Met',
    levelPending:    ({ n }) => `${n} pending`,
    pendingFor:      ({ level }) => `Pending controls for Level ${level}`,
    readinessNote:   'CCSS certification is all-or-nothing per level: a level is only achieved when all of its controls are in place or not applicable.',

    // Report – comparison
    compareTitle:   'Progress since the previous assessment',
    compareBefore:  'Previous',
    compareAfter:   'Current',
    compareImproved:'Controls improved',
    compareWorsened:'Controls worsened',
    compareLevel:   'Level achieved',
    trend_improved: 'Improved',
    trend_worsened: 'Worsened',
    trend_changed:  'Changed',
    noChanges:      'No status changes between both assessments.',
    chartBaseline:  'Previous',
    vsBaseline:     'vs. previous assessment',

    // Report – remediation & table extras
    remediationPlanTitle: 'Remediation plan',
    tablePriority:  'Priority',
    tableOwner:     'Owner',
    tableDue:       'Due date',
    tableEvidence:  'Evidence',
    tableFlagged:   'Flagged',
    tableScore:     'Compliance',
    tableControls:  'Controls',
    tableRequired:  'Required controls',
    tablePending:   'Pending',
    tableTrend:     'Trend',
    tableRequirement: 'Requirement',
    unassigned:     'Unassigned',
    overdue:        'Overdue',
    yes:            'Yes',

    // PDF & spreadsheet exports
    pdfConfidential: 'Confidential document — internal use',
    pdfPage:         ({ i, n }) => `Page ${i} of ${n}`,
    pdfAspectsTitle: 'Compliance by aspect',
    pdfAnnexTitle:   'Annex — Control details',
    pdfFlagNote:     '* Control flagged for review.',
    pdfError:        'The PDF could not be generated.',
    sheetSummary:    'Summary',
    sheetControls:   'Controls',
    sheetPlan:       'Remediation plan',
    sheetChanges:    'Progress',
    xlsxError:       'The Excel library could not be loaded (vendor/xlsx.full.min.js).',
  },
};

/** Return translated string for key, falling back to Spanish. Function entries receive `params`. */
function t(key, params) {
  const value = STRINGS[STATE.lang]?.[key] ?? STRINGS.es[key] ?? key;
  return typeof value === 'function' ? value(params || {}) : value;
}

/** "a, b y c" / "a, b and c". */
function formatList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${t('and')} ${items[items.length - 1]}`;
}

/** Update all elements with a data-i18n / data-i18n-placeholder attribute. */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = STATE.lang === 'es' ? 'EN' : 'ES';
}
