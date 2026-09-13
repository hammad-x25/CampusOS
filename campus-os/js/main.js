// Global initialization shared by every CampusOS page.
(function (campus) {
  function setDashboardGreeting() {
    const greeting = document.querySelector('[data-greeting]');

    if (!greeting) {
      return;
    }

    const currentHour = new Date().getHours();
    const greetingText = currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
        ? 'Good Afternoon'
        : 'Good Evening';

    greeting.textContent = greetingText;
  }

  function createSystemStatusBar() {
    const appFrame = document.querySelector('.app-frame');
    const topbar = appFrame?.querySelector('.topbar');

    if (!appFrame || !topbar || appFrame.querySelector('[data-system-status-bar]')) {
      return null;
    }

    const statusBar = document.createElement('div');
    statusBar.className = 'system-status-bar';
    statusBar.setAttribute('data-system-status-bar', '');
    statusBar.innerHTML = `
      <div class="system-status-bar__group">
        <span class="system-status-bar__online" aria-hidden="true"></span>
        <span class="system-status-bar__label">CAMPUS.OS ONLINE</span>
      </div>
      <div class="system-status-bar__metrics">
        <span class="system-status-bar__metric"><strong>Semester ${campus.data.semester.number}</strong><span>Week ${campus.data.semester.currentWeek} / ${campus.data.semester.totalWeeks}</span></span>
        <span class="system-status-bar__metric"><strong>${campus.data.semester.completion}%</strong><span>Complete</span></span>
        <span class="system-status-bar__metric"><span class="system-status-bar__saved" aria-hidden="true"></span><strong>LOCAL DATA</strong><span>SAVED</span></span>
        <span class="system-status-bar__metric"><span>Last local save:</span><strong data-last-local-save>Not saved yet</strong></span>
      </div>
    `;

    appFrame.insertBefore(statusBar, topbar.nextSibling);
    return statusBar;
  }

  function updateLocalSaveTime(timestamp) {
    const saveLabel = document.querySelector('[data-last-local-save]');

    if (saveLabel) {
      saveLabel.textContent = campus.utils.formatLastSave(timestamp);
    }
  }

  setDashboardGreeting();
  const statusBar = createSystemStatusBar();
  const initialSave = campus.utils.ensureLocalSaveTimestamp();

  if (statusBar) {
    updateLocalSaveTime(initialSave);
  }

  document.addEventListener('campus:local-save', (event) => {
    updateLocalSaveTime(event.detail?.timestamp || localStorage.getItem(campus.storageKeys.lastLocalSave));
  });

  campus.setDashboardGreeting = setDashboardGreeting;
  campus.updateLocalSaveTime = updateLocalSaveTime;
})(window.CampusOS || (window.CampusOS = {}));
