// Universal search searches the shared frontend data instead of making a network request.
(function (campus) {
  const topSearch = document.querySelector('[data-universal-search]');
  let searchOverlay;
  let searchInput;
  let resultContainer;
  let emptyState;
  let visibleResults = [];
  let selectedResultIndex = 0;
  let lastSearchTrigger = topSearch;
  let suppressTopSearchFocus = false;

  function getSearchIndex() {
    const courseResults = campus.data.courses.map((course) => ({
      type: 'Courses',
      icon: 'C',
      title: course.title,
      subtitle: `${course.code} · ${course.instructor}`,
      searchText: `${course.title} ${course.code} ${course.instructor}`,
      url: 'courses.html'
    }));
    const scheduleResults = campus.data.schedule.map((event) => {
      const course = campus.getCourseById(event.courseId);

      return {
        type: 'Schedule',
        icon: 'S',
        title: course.title,
        subtitle: `${event.day} · ${campus.utils.formatTimeMinutes(event.startMinutes)} · ${event.room}`,
        searchText: `${course.title} ${course.code} ${event.day} ${event.room}`,
        url: 'schedule.html'
      };
    });
    const taskResults = campus.getTasks().map((task) => ({
      type: 'Tasks',
      icon: 'T',
      title: task.title,
      subtitle: `${task.course} · Due ${task.deadline}`,
      searchText: `${task.title} ${task.course} ${task.deadline}`,
      url: 'tasks.html'
    }));
    const toolResults = [
      { title: 'GPA Forecast Simulator', subtitle: 'Analytics · Project grade scenarios', url: 'analytics.html#forecast' },
      { title: 'Attendance Risk Simulator', subtitle: 'Analytics · Simulate attendance outcomes', url: 'analytics.html#attendance-risk' },
      { title: 'Focus Mode', subtitle: 'CampusOS · Start a focused study session', url: '#focus' },
      { title: 'Academic Health Score', subtitle: 'Dashboard · Review your calculated status', url: 'index.html#control-center' }
    ].map((tool) => ({
      ...tool,
      type: 'Tools',
      icon: 'O',
      searchText: `${tool.title} ${tool.subtitle}`
    }));

    return [...courseResults, ...scheduleResults, ...taskResults, ...toolResults];
  }

  function highlightText(text, searchTerm) {
    const safeText = campus.utils.escapeHtml(text);
    const safeTerm = campus.utils.escapeHtml(searchTerm);

    if (!safeTerm) {
      return safeText;
    }

    return safeText.replace(new RegExp(`(${safeTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark class="search-highlight">$1</mark>');
  }

  function createResultButton(result, index, searchTerm) {
    const button = document.createElement('button');
    button.className = 'search-result-button';
    button.type = 'button';
    button.dataset.resultIndex = String(index);
    button.classList.toggle('is-selected', index === selectedResultIndex);
    button.setAttribute('aria-selected', String(index === selectedResultIndex));
    button.innerHTML = `
      <span class="search-result-button__mark" aria-hidden="true">${result.icon}</span>
      <span class="search-result-button__copy">
        <span class="search-result-button__title">${highlightText(result.title, searchTerm)}</span>
        <span class="search-result-button__subtitle">${highlightText(result.subtitle, searchTerm)}</span>
      </span>
      <span class="search-result-button__type">${result.type}</span>
    `;
    button.addEventListener('click', () => openResult(result));
    return button;
  }

  function renderResults() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const searchIndex = getSearchIndex();
    visibleResults = searchIndex.filter((result) => result.searchText.toLowerCase().includes(searchTerm));
    selectedResultIndex = Math.min(selectedResultIndex, Math.max(0, visibleResults.length - 1));
    resultContainer.innerHTML = '';
    emptyState.hidden = visibleResults.length !== 0;

    if (!visibleResults.length) {
      return;
    }

    const groupedResults = visibleResults.reduce((groups, result, index) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }

      groups[result.type].push({ result, index });
      return groups;
    }, {});

    Object.entries(groupedResults).forEach(([groupName, groupResults]) => {
      const group = document.createElement('section');
      group.className = 'search-result-group';
      group.innerHTML = `<h3 class="search-result-group__heading"><span>${groupName}</span><span>${groupResults.length}</span></h3>`;
      const list = document.createElement('div');
      list.className = 'search-result-list';
      groupResults.forEach(({ result, index }) => list.appendChild(createResultButton(result, index, searchTerm)));
      group.appendChild(list);
      resultContainer.appendChild(group);
    });
  }

  function openResult(result) {
    closeSearch();

    if (result.url === '#focus') {
      campus.openFocusMode?.();
      return;
    }

    window.location.href = result.url;
  }

  function openSearch(initialValue = '') {
    searchOverlay.hidden = false;
    searchOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-overlay-open');
    searchInput.value = initialValue;
    selectedResultIndex = 0;
    renderResults();
    searchInput.focus();
    searchInput.select();
  }

  function closeSearch() {
    searchOverlay.hidden = true;
    searchOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-overlay-open');

    if (lastSearchTrigger && typeof lastSearchTrigger.focus === 'function') {
      suppressTopSearchFocus = lastSearchTrigger === topSearch;
      lastSearchTrigger.focus();
    }
  }

  function handleSearchKeydown(event) {
    if (event.key === 'ArrowDown' && visibleResults.length) {
      event.preventDefault();
      selectedResultIndex = (selectedResultIndex + 1) % visibleResults.length;
      renderResults();
    }

    if (event.key === 'ArrowUp' && visibleResults.length) {
      event.preventDefault();
      selectedResultIndex = (selectedResultIndex - 1 + visibleResults.length) % visibleResults.length;
      renderResults();
    }

    if (event.key === 'Enter' && visibleResults[selectedResultIndex]) {
      event.preventDefault();
      openResult(visibleResults[selectedResultIndex]);
    }
  }

  function createSearchOverlay() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="universal-search" data-search-overlay hidden aria-hidden="true">
        <button class="drawer-scrim" data-search-close type="button" aria-label="Close universal search"></button>
        <section class="universal-search__dialog" role="dialog" aria-modal="true" aria-labelledby="universal-search-title">
          <div class="universal-search__header">
            <div>
              <p class="advanced-kicker">CampusOS / Universal Search</p>
              <h2 class="advanced-title" id="universal-search-title">Search the campus workspace</h2>
              <p class="advanced-description">Courses, instructors, rooms, tasks, events, and academic tools.</p>
            </div>
            <kbd>ESC</kbd>
          </div>
          <label class="universal-search__input-wrap">
            <span aria-hidden="true">/</span>
            <span class="visually-hidden">Search all CampusOS data</span>
            <input data-universal-search-input type="search" placeholder="Search CampusOS..." autocomplete="off">
          </label>
          <div class="universal-search__results" data-search-results role="listbox" aria-label="Universal search results"></div>
          <p class="surface-empty-state" data-search-empty hidden><strong>No matching campus data</strong>Try a course, room, task, or tool name.</p>
          <div class="universal-search__footer"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate &nbsp; <kbd>ENTER</kbd> Open</span><span>Local data index</span></div>
        </section>
      </div>
    `);

    searchOverlay = document.querySelector('[data-search-overlay]');
    searchInput = searchOverlay.querySelector('[data-universal-search-input]');
    resultContainer = searchOverlay.querySelector('[data-search-results]');
    emptyState = searchOverlay.querySelector('[data-search-empty]');
    searchInput.addEventListener('input', () => {
      selectedResultIndex = 0;
      if (topSearch) {
        topSearch.value = searchInput.value;
      }
      renderResults();
    });
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchOverlay.querySelector('[data-search-close]').addEventListener('click', closeSearch);
  }

  createSearchOverlay();
  campus.openSearch = openSearch;
  campus.closeSearch = closeSearch;

  if (topSearch) {
    topSearch.addEventListener('focus', () => {
      if (suppressTopSearchFocus) {
        suppressTopSearchFocus = false;
        return;
      }

      lastSearchTrigger = topSearch;
      openSearch(topSearch.value);
    });
    topSearch.addEventListener('input', () => openSearch(topSearch.value));
    topSearch.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        openSearch(topSearch.value);
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target.matches?.('input, textarea, select, [contenteditable="true"]');

    if (event.key === '/' && !isTyping && searchOverlay.hidden) {
      event.preventDefault();
      openSearch();
    }

    if (event.key === 'Escape' && !searchOverlay.hidden) {
      closeSearch();
    }
  });
})(window.CampusOS || (window.CampusOS = {}));
