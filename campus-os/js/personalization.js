// Lightweight local personalization for accent, density, and motion preferences.
(function (campus) {
  const root = document.documentElement;
  const settingsButton = document.querySelector('[data-settings-open]');
  const accentOptions = {
    cyan: { cyan: '#43d9ff', violet: '#9b7bff' },
    violet: { cyan: '#a78bfa', violet: '#43d9ff' },
    blue: { cyan: '#72b5ff', violet: '#8c9cff' }
  };
  const defaultPreferences = { accent: 'cyan', density: 'comfortable', motion: 'full' };
  let preferences = loadPreferences();
  let panelWrap;
  let lastSettingsTrigger = settingsButton;

  function loadPreferences() {
    const savedPreferences = localStorage.getItem(campus.storageKeys.preferences);

    if (!savedPreferences) {
      return { ...defaultPreferences };
    }

    try {
      return { ...defaultPreferences, ...JSON.parse(savedPreferences) };
    } catch (error) {
      return { ...defaultPreferences };
    }
  }

  function savePreferences() {
    localStorage.setItem(campus.storageKeys.preferences, JSON.stringify(preferences));
    campus.utils.markLocalSave();
  }

  function applyPreferences() {
    const accent = accentOptions[preferences.accent] || accentOptions.cyan;

    root.style.setProperty('--cyan-accent', accent.cyan);
    root.style.setProperty('--violet-accent', accent.violet);
    root.dataset.density = preferences.density;
    root.dataset.motion = preferences.motion;

    panelWrap?.querySelectorAll('[data-preference]').forEach((option) => {
      const isSelected = preferences[option.dataset.preference] === option.dataset.value;
      option.classList.toggle('is-selected', isSelected);
      option.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function selectPreference(preference, value) {
    preferences[preference] = value;
    applyPreferences();
    savePreferences();
  }

  function openPersonalization() {
    lastSettingsTrigger = document.activeElement;
    panelWrap.hidden = false;
    panelWrap.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    window.requestAnimationFrame(() => panelWrap.classList.add('is-open'));
    panelWrap.querySelector('[data-personalization-close]').focus();
  }

  function closePersonalization() {
    panelWrap.classList.remove('is-open');
    panelWrap.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    window.setTimeout(() => {
      if (!panelWrap.classList.contains('is-open')) {
        panelWrap.hidden = true;
      }
    }, 220);

    if (lastSettingsTrigger && typeof lastSettingsTrigger.focus === 'function') {
      lastSettingsTrigger.focus();
    }
  }

  function createPersonalizationPanel() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="personalization-panel-wrap" data-personalization-panel hidden aria-hidden="true">
        <button class="drawer-scrim" data-personalization-close type="button" aria-label="Close personalization"></button>
        <aside class="personalization-panel" role="dialog" aria-modal="true" aria-labelledby="personalization-title">
          <div class="personalization-panel__header">
            <div><p class="advanced-kicker">CampusOS / Preferences</p><h2 class="advanced-title" id="personalization-title">Personalize workspace</h2></div>
            <button class="surface-close-button" data-personalization-close type="button" aria-label="Close personalization">×</button>
          </div>
          <section class="personalization-section">
            <h3 class="personalization-section__heading">Accent</h3>
            <div class="personalization-options">
              <button class="personalization-option" data-preference="accent" data-value="cyan" type="button" aria-pressed="false">Cyan</button>
              <button class="personalization-option" data-preference="accent" data-value="violet" type="button" aria-pressed="false">Violet</button>
              <button class="personalization-option" data-preference="accent" data-value="blue" type="button" aria-pressed="false">Blue</button>
            </div>
          </section>
          <section class="personalization-section">
            <h3 class="personalization-section__heading">Density</h3>
            <div class="personalization-options">
              <button class="personalization-option" data-preference="density" data-value="comfortable" type="button" aria-pressed="false">Comfortable</button>
              <button class="personalization-option" data-preference="density" data-value="compact" type="button" aria-pressed="false">Compact</button>
            </div>
          </section>
          <section class="personalization-section">
            <h3 class="personalization-section__heading">Motion</h3>
            <div class="personalization-options">
              <button class="personalization-option" data-preference="motion" data-value="full" type="button" aria-pressed="false">Full</button>
              <button class="personalization-option" data-preference="motion" data-value="reduced" type="button" aria-pressed="false">Reduced</button>
            </div>
          </section>
          <p class="personalization-note">Preferences are saved only in this browser. CampusOS does not send them to a server.</p>
        </aside>
      </div>
    `);

    panelWrap = document.querySelector('[data-personalization-panel]');
    panelWrap.querySelectorAll('[data-preference]').forEach((option) => {
      option.addEventListener('click', () => selectPreference(option.dataset.preference, option.dataset.value));
    });
    panelWrap.querySelectorAll('[data-personalization-close]').forEach((closeButton) => closeButton.addEventListener('click', closePersonalization));
    applyPreferences();
  }

  createPersonalizationPanel();
  campus.openPersonalization = openPersonalization;
  campus.closePersonalization = closePersonalization;

  if (settingsButton) {
    settingsButton.addEventListener('click', openPersonalization);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panelWrap && !panelWrap.hidden) {
      closePersonalization();
    }
  });
})(window.CampusOS || (window.CampusOS = {}));
