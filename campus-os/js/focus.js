// Focus Mode uses timestamps so the countdown remains accurate between interval ticks.
(function (campus) {
  const FOCUS_CIRCUMFERENCE = 691;
  const focusDurations = [25, 45, 60];
  let focusOverlay;
  let timeLabel;
  let stateLabel;
  let progressCircle;
  let courseSelect;
  let goalInput;
  let completeMessage;
  let todayMinutesLabel;
  let sessionCountLabel;
  let selectedDuration = 25;
  let remainingSeconds = selectedDuration * 60;
  let startedAt = null;
  let timerInterval = null;
  let isRunning = false;
  let lastFocusTrigger = null;

  function getTodaySessions() {
    const todayKey = campus.utils.getLocalDateKey();

    return campus.getFocusSessions().filter((session) => {
      return session.completedAt && campus.utils.getLocalDateKey(new Date(session.completedAt)) === todayKey;
    });
  }

  function updateFocusStats() {
    const todaySessions = getTodaySessions();
    const todayMinutes = todaySessions.reduce((total, session) => total + Number(session.minutes || 0), 0);

    todayMinutesLabel.textContent = `${todayMinutes} min`;
    sessionCountLabel.textContent = String(todaySessions.length);
  }

  function getRemainingSeconds() {
    if (!isRunning || !startedAt) {
      return remainingSeconds;
    }

    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, selectedDuration * 60 - elapsedSeconds);
  }

  function updateTimerDisplay() {
    remainingSeconds = getRemainingSeconds();
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const elapsedRatio = 1 - (remainingSeconds / (selectedDuration * 60));

    timeLabel.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    progressCircle.style.setProperty('--focus-offset', String(FOCUS_CIRCUMFERENCE * (1 - elapsedRatio)));

    if (remainingSeconds === 0 && isRunning) {
      completeFocusSession();
    }
  }

  function setRunningState() {
    stateLabel.textContent = 'Session running';
    focusOverlay.querySelector('[data-focus-start]').textContent = 'Pause';
    focusOverlay.querySelector('[data-focus-start]').classList.add('primary');
  }

  function setPausedState() {
    stateLabel.textContent = remainingSeconds === selectedDuration * 60 ? 'Ready when you are' : 'Session paused';
    focusOverlay.querySelector('[data-focus-start]').textContent = 'Start';
  }

  function startFocusTimer() {
    if (isRunning) {
      pauseFocusTimer();
      return;
    }

    if (remainingSeconds === 0) {
      resetFocusTimer();
    }

    startedAt = Date.now() - ((selectedDuration * 60 - remainingSeconds) * 1000);
    isRunning = true;
    completeMessage.hidden = true;
    focusOverlay.querySelector('.focus-mode__dialog').classList.remove('is-complete');
    setRunningState();
    updateTimerDisplay();
    timerInterval = window.setInterval(updateTimerDisplay, 250);
  }

  function pauseFocusTimer() {
    remainingSeconds = getRemainingSeconds();
    isRunning = false;
    startedAt = null;
    window.clearInterval(timerInterval);
    timerInterval = null;
    setPausedState();
    updateTimerDisplay();
  }

  function resetFocusTimer() {
    isRunning = false;
    startedAt = null;
    remainingSeconds = selectedDuration * 60;
    window.clearInterval(timerInterval);
    timerInterval = null;
    completeMessage.hidden = true;
    focusOverlay.querySelector('.focus-mode__dialog').classList.remove('is-complete');
    setPausedState();
    updateTimerDisplay();
  }

  function saveFocusSession() {
    const sessions = campus.getFocusSessions();
    sessions.push({
      id: Date.now(),
      courseId: courseSelect.value,
      minutes: selectedDuration,
      goal: goalInput.value.trim(),
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(campus.storageKeys.focusSessions, JSON.stringify(sessions));
    campus.utils.markLocalSave();
    updateFocusStats();
    document.dispatchEvent(new CustomEvent('campus:focus-session-complete'));
  }

  function completeFocusSession() {
    window.clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    startedAt = null;
    remainingSeconds = 0;
    stateLabel.textContent = 'Session complete';
    focusOverlay.querySelector('[data-focus-start]').textContent = 'Start Again';
    focusOverlay.querySelector('.focus-mode__dialog').classList.add('is-complete');
    completeMessage.textContent = `SESSION COMPLETE · +${selectedDuration} focused minutes`;
    completeMessage.hidden = false;
    saveFocusSession();
    updateTimerDisplay();
  }

  function selectDuration(duration) {
    if (isRunning) {
      return;
    }

    selectedDuration = duration;
    remainingSeconds = duration * 60;
    focusOverlay.querySelectorAll('[data-focus-duration]').forEach((button) => {
      button.classList.toggle('is-active', Number(button.dataset.focusDuration) === duration);
    });
    resetFocusTimer();
  }

  function openFocusMode() {
    lastFocusTrigger = document.activeElement;
    if (lastFocusTrigger?.closest('[data-command-palette], [data-search-overlay], [data-notification-drawer]')) {
      lastFocusTrigger = null;
    }
    focusOverlay.hidden = false;
    focusOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('focus-mode-open');
    updateFocusStats();
    focusOverlay.querySelector('[data-focus-close]').focus();
  }

  function closeFocusMode() {
    if (isRunning) {
      pauseFocusTimer();
    }

    focusOverlay.hidden = true;
    focusOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('focus-mode-open');

    if (lastFocusTrigger && typeof lastFocusTrigger.focus === 'function') {
      lastFocusTrigger.focus();
    }
  }

  function createFocusOverlay() {
    const durationButtons = focusDurations.map((duration) => `<button class="focus-preset${duration === 25 ? ' is-active' : ''}" data-focus-duration="${duration}" type="button">${duration} min</button>`).join('');
    const courseOptions = campus.data.courses.map((course) => `<option value="${course.id}">${course.title}</option>`).join('');

    document.body.insertAdjacentHTML('beforeend', `
      <div class="focus-mode" data-focus-overlay hidden aria-hidden="true">
        <section class="focus-mode__dialog" role="dialog" aria-modal="true" aria-labelledby="focus-mode-title">
          <div class="focus-mode__header">
            <div>
              <p class="advanced-kicker">CampusOS / Study productivity</p>
              <h2 class="advanced-title" id="focus-mode-title">FOCUS SESSION</h2>
            </div>
            <button class="surface-close-button" data-focus-close type="button" aria-label="Close focus mode">×</button>
          </div>
          <div class="focus-mode__body">
            <div class="focus-timer" aria-live="polite">
              <svg viewBox="0 0 240 240" aria-hidden="true">
                <circle class="focus-timer__track" cx="120" cy="120" r="110"></circle>
                <circle class="focus-timer__progress" data-focus-progress cx="120" cy="120" r="110"></circle>
              </svg>
              <div class="focus-timer__content"><strong class="focus-timer__value" data-focus-time>25:00</strong><span class="focus-timer__state" data-focus-state>Ready when you are</span></div>
            </div>
            <div>
              <div class="focus-form">
                <label>Current subject<select data-focus-course>${courseOptions}</select></label>
                <label>Session goal<input data-focus-goal type="text" placeholder="e.g. Complete DOM revision" autocomplete="off"></label>
              </div>
              <div class="focus-controls">
                <button class="focus-control-button primary" data-focus-start type="button">Start</button>
                <button class="focus-control-button" data-focus-reset type="button">Reset</button>
              </div>
              <div class="focus-presets" aria-label="Focus duration presets">${durationButtons}</div>
              <div class="focus-stats"><div class="focus-stat"><span>Focus today</span><strong data-focus-today>0 min</strong></div><div class="focus-stat"><span>Sessions</span><strong data-focus-sessions>0</strong></div></div>
              <p class="focus-complete-message" data-focus-complete hidden></p>
            </div>
          </div>
        </section>
      </div>
    `);

    focusOverlay = document.querySelector('[data-focus-overlay]');
    timeLabel = focusOverlay.querySelector('[data-focus-time]');
    stateLabel = focusOverlay.querySelector('[data-focus-state]');
    progressCircle = focusOverlay.querySelector('[data-focus-progress]');
    courseSelect = focusOverlay.querySelector('[data-focus-course]');
    goalInput = focusOverlay.querySelector('[data-focus-goal]');
    completeMessage = focusOverlay.querySelector('[data-focus-complete]');
    todayMinutesLabel = focusOverlay.querySelector('[data-focus-today]');
    sessionCountLabel = focusOverlay.querySelector('[data-focus-sessions]');
    focusOverlay.querySelector('[data-focus-start]').addEventListener('click', startFocusTimer);
    focusOverlay.querySelector('[data-focus-reset]').addEventListener('click', resetFocusTimer);
    focusOverlay.querySelector('[data-focus-close]').addEventListener('click', closeFocusMode);
    focusOverlay.querySelectorAll('[data-focus-duration]').forEach((button) => {
      button.addEventListener('click', () => selectDuration(Number(button.dataset.focusDuration)));
    });
    progressCircle.style.setProperty('--focus-offset', '0');
  }

  createFocusOverlay();
  campus.openFocusMode = openFocusMode;
  campus.closeFocusMode = closeFocusMode;

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-focus-open]')) {
      openFocusMode();
    }
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target.matches?.('input, textarea, select, [contenteditable="true"]');

    if (event.key.toLowerCase() === 'f' && !isTyping && focusOverlay.hidden) {
      event.preventDefault();
      openFocusMode();
    }

    if (event.key === 'Escape' && !focusOverlay.hidden) {
      closeFocusMode();
    }
  });
})(window.CampusOS || (window.CampusOS = {}));
