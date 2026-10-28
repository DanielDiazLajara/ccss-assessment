// ─────────────────────────────────────────────
// Welcome Screen & Language Toggle
// ─────────────────────────────────────────────

function selectLevel(level) {
  STATE.targetLevel = level;
  document.querySelectorAll('.level-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.level === level);
  });
  document.getElementById('btnStart').disabled = false;
}

function startAssessment() {
  STATE.currentIndex = 0;
  STATE.answers      = {};
  STATE.notes        = {};
  STATE.evidence     = {};
  STATE.actions      = {};
  STATE.flags        = {};
  STATE.baseline     = null;
  STATE.orgName      = document.getElementById('orgName').value.trim();
  STATE.options      = {
    evidence:    document.getElementById('welcomeOptEvidence').checked,
    remediation: document.getElementById('welcomeOptRemediation').checked,
  };

  document.querySelector('.recover-banner')?.remove();
  saveToLocalStorage();
  enterAssessment();
}

/** Load a previously exported JSON and resume it (or open the report if it is complete). */
function importAssessment() {
  pickJsonFile()
    .then(payload => {
      applyPayload(payload);
      STATE.isShared = false;
      history.replaceState(null, '', location.pathname);
      document.querySelector('.recover-banner')?.remove();
      saveToLocalStorage();
      applyTranslations();

      const controls   = getActiveControls();
      const firstEmpty = controls.findIndex(c => !STATE.answers[c.id]);
      if (firstEmpty === -1) {
        STATE.currentIndex = 0;
        showReport();
      } else {
        STATE.currentIndex = firstEmpty;
        enterAssessment();
      }
    })
    .catch(err => { if (err !== 'cancelled') alert(t('importError')); });
}

function toggleLang() {
  STATE.lang = STATE.lang === 'es' ? 'en' : 'es';

  applyTranslations(); // updates data-i18n elements and the toggle label
  saveToLocalStorage();

  if (STATE.screen === 'assessment') {
    // Update level tag and re-render dynamic parts
    const tag = document.getElementById('levelTag');
    if (tag) tag.textContent = t('levelPrefix') + ' ' + STATE.targetLevel;
    renderSidebar();
    renderQuestion();
  } else if (STATE.screen === 'report') {
    showReport(); // full re-render (chart instances are rebuilt)
  }
}
