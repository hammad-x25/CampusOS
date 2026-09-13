// Global command palette for keyboard-first navigation.
(function (campus) {
  const commands = [
    { id: 'dashboard', title: 'Go to Dashboard', description: 'Open the academic overview', keywords: 'dashboard overview home', shortcut: 'G D', action: () => navigateTo('index.html') },
    { id: 'courses', title: 'Go to Courses', description: 'Open the course command center', keywords: 'courses classes modules', shortcut: 'G C', action: () => navigateTo('courses.html') },
    { id: 'schedule', title: 'Go to Schedule', description: 'View the weekly academic timeline', keywords: 'schedule calendar classes', shortcut: 'G S', action: () => navigateTo('schedule.html') },
    { id: 'tasks', title: 'Go to Tasks', description: 'Open the academic action queue', keywords: 'tasks assignments work', shortcut: 'G T', action: () => navigateTo('tasks.html') },
    { id: 'analytics', title: 'Go to Analytics', description: 'Open academic calculators and insights', keywords: 'analytics gpa attendance performance', shortcut: 'G A', action: () => navigateTo('analytics.html') },
    { id: 'search', title: 'Open Universal Search', description: 'Search courses, events, tasks, and tools', keywords: 'search find lookup', action: () => campus.openSearch?.() },
    { id: 'gpa', title: 'Open GPA Simulator', description: 'Explore projected grade scenarios', keywords: 'gpa forecast simulator grades what if', action: () => openAnalyticsTool('forecast') },
    { id: 'attendance', title: 'Open Attendance Simulator', description: 'Simulate attending or missing a class', keywords: 'attendance risk safety simulator', action: () => openAnalyticsTool('attendance-risk') },
    { id: 'focus', title: 'Start Focus Mode', description: 'Begin a distraction-free study session', keywords: 'focus timer study pomodoro', shortcut: 'F', action: () => campus.openFocusMode?.() },
    { id: 'theme', title: 'Toggle Theme', description: 'Switch between dark and light themes', keywords: 'theme dark light appearance', action: () => document.querySelector('[data-theme-toggle]')?.click() }
  ];

  let commandPalette;
  let commandInput;
  let commandList;
  let shortcutView;
  let selectedIndex = 0;
  let filteredCommands = commands;
  let lastCommandTrigger = null;

  function navigateTo(url) {
    window.location.href = url;
  }

  function openAnalyticsTool(hash) {
    if (document.body.dataset.page === 'analytics') {
      window.location.hash = hash;
      window.dispatchEvent(new CustomEvent(`campus:open-${hash}`));
      return;
    }

    navigateTo(`analytics.html#${hash}`);
  }

  function createCommandItem(command, index) {
    const item = document.createElement('button');
    item.className = 'command-item';
    item.type = 'button';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(index === selectedIndex));
    item.classList.toggle('is-selected', index === selectedIndex);
    item.innerHTML = `
      <span class="command-item__mark" aria-hidden="true">${command.title.charAt(0)}</span>
      <span class="command-item__copy">
        <span class="command-item__title"></span>
        <span class="command-item__description"></span>
      </span>
      ${command.shortcut ? `<kbd class="command-item__shortcut">${command.shortcut}</kbd>` : ''}
    `;
    item.querySelector('.command-item__title').textContent = command.title;
    item.querySelector('.command-item__description').textContent = command.description;
    item.addEventListener('click', () => {
      command.action();
      closeCommandPalette();
    });
    return item;
  }

  function renderCommands() {
    const searchTerm = commandInput.value.trim().toLowerCase();
    filteredCommands = commands.filter((command) => {
      const searchableText = `${command.title} ${command.description} ${command.keywords}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
    selectedIndex = Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1));
    commandList.innerHTML = '';

    if (!filteredCommands.length) {
      commandList.innerHTML = '<p class="surface-empty-state"><strong>No commands found</strong>Try a page name or tool such as “focus”.</p>';
      return;
    }

    filteredCommands.forEach((command, index) => {
      commandList.appendChild(createCommandItem(command, index));
    });
  }

  function showShortcutView() {
    commandList.hidden = true;
    shortcutView.hidden = false;
    shortcutView.querySelector('button').focus();
  }

  function hideShortcutView() {
    shortcutView.hidden = true;
    commandList.hidden = false;
    commandInput.focus();
  }

  function openCommandPalette() {
    lastCommandTrigger = document.activeElement;
    commandPalette.hidden = false;
    commandPalette.setAttribute('aria-hidden', 'false');
    document.body.classList.add('command-palette-open');
    shortcutView.hidden = true;
    commandList.hidden = false;
    commandInput.value = '';
    selectedIndex = 0;
    renderCommands();
    commandInput.focus();
  }

  function closeCommandPalette() {
    commandPalette.hidden = true;
    commandPalette.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('command-palette-open');

    if (lastCommandTrigger && !lastCommandTrigger.closest('[data-command-palette]') && !lastCommandTrigger.matches('[data-universal-search]') && typeof lastCommandTrigger.focus === 'function') {
      lastCommandTrigger.focus();
    }
  }

  function handleCommandKeydown(event) {
    if (event.key === 'ArrowDown' && filteredCommands.length) {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % filteredCommands.length;
      renderCommands();
    }

    if (event.key === 'ArrowUp' && filteredCommands.length) {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
      renderCommands();
    }

    if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault();
      filteredCommands[selectedIndex].action();
      closeCommandPalette();
    }
  }

  function createCommandPalette() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="command-palette" data-command-palette hidden aria-hidden="true">
        <button class="drawer-scrim" data-command-close type="button" aria-label="Close command palette"></button>
        <section class="command-palette__dialog" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
          <div class="command-palette__header">
            <div>
              <p class="advanced-kicker">CampusOS / Commands</p>
              <h2 class="advanced-title" id="command-palette-title">Command Palette</h2>
            </div>
            <kbd>ESC</kbd>
          </div>
          <label class="command-palette__search">
            <span aria-hidden="true">&gt;</span>
            <span class="visually-hidden">Type a command</span>
            <input data-command-input type="search" placeholder="Type a command..." autocomplete="off">
          </label>
          <div class="command-palette__list" data-command-list role="listbox" aria-label="CampusOS commands"></div>
          <div class="shortcuts-view" data-shortcut-view hidden>
            <div class="shortcuts-view__heading"><strong>Keyboard Shortcuts</strong><span>Fast navigation for CampusOS</span></div>
            <div class="shortcuts-view__list">
              <div><span>Command Palette</span><kbd>Ctrl / Cmd + K</kbd></div>
              <div><span>Universal Search</span><kbd>/</kbd></div>
              <div><span>Focus Mode</span><kbd>F</kbd></div>
              <div><span>Close open surface</span><kbd>ESC</kbd></div>
            </div>
            <button class="command-shortcuts-button" data-shortcuts-back type="button">Back to commands</button>
          </div>
          <div class="command-palette__footer">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate &nbsp; <kbd>ENTER</kbd> Select</span>
            <button class="command-shortcuts-button" data-shortcuts-open type="button">Keyboard Shortcuts</button>
          </div>
        </section>
      </div>
    `);

    commandPalette = document.querySelector('[data-command-palette]');
    commandInput = commandPalette.querySelector('[data-command-input]');
    commandList = commandPalette.querySelector('[data-command-list]');
    shortcutView = commandPalette.querySelector('[data-shortcut-view]');
    commandInput.addEventListener('input', () => {
      selectedIndex = 0;
      renderCommands();
    });
    commandInput.addEventListener('keydown', handleCommandKeydown);
    commandPalette.querySelector('[data-command-close]').addEventListener('click', closeCommandPalette);
    commandPalette.querySelector('[data-shortcuts-open]').addEventListener('click', showShortcutView);
    commandPalette.querySelector('[data-shortcuts-back]').addEventListener('click', hideShortcutView);
  }

  createCommandPalette();
  campus.openCommandPalette = openCommandPalette;
  campus.closeCommandPalette = closeCommandPalette;

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (commandPalette.hidden) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
    }

    if (event.key === 'Escape' && !commandPalette.hidden) {
      closeCommandPalette();
    }
  });

  document.addEventListener('click', (event) => {
    const commandTrigger = event.target.closest('[data-command-open]');

    if (commandTrigger) {
      openCommandPalette();
    }
  });
})(window.CampusOS || (window.CampusOS = {}));
