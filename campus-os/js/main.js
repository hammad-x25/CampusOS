const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const savedTheme = localStorage.getItem('campus-theme');

function applyTheme(theme) {
  const isLightTheme = theme === 'light';

  root.dataset.theme = isLightTheme ? 'light' : 'dark';
  themeToggle.setAttribute('aria-pressed', String(isLightTheme));
  themeToggle.setAttribute('aria-label', `Switch to ${isLightTheme ? 'dark' : 'light'} theme`);
  themeLabel.textContent = isLightTheme ? 'Light mode' : 'Dark mode';
}

applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';

  localStorage.setItem('campus-theme', nextTheme);
  applyTheme(nextTheme);
});

const currentPage = document.body.dataset.page;
const pageLinks = document.querySelectorAll('[data-page-link]');
const pageLabel = document.querySelector('[data-page-label]');

pageLinks.forEach((link) => {
  const isCurrentPage = link.dataset.pageLink === currentPage;

  link.classList.toggle('is-active', isCurrentPage);

  if (isCurrentPage) {
    link.setAttribute('aria-current', 'page');
    pageLabel.textContent = link.textContent.trim();
  }
});

const greeting = document.querySelector('[data-greeting]');

if (greeting) {
  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12
    ? 'Good Morning'
    : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  greeting.textContent = greetingText;
}

const courseCommandCenter = document.querySelector('[data-course-page]');

if (courseCommandCenter) {
  const courseSearch = courseCommandCenter.querySelector('[data-course-search]');
  const filterButtons = courseCommandCenter.querySelectorAll('[data-category-filter]');
  const courseCards = courseCommandCenter.querySelectorAll('[data-course-card]');
  const resultSummary = courseCommandCenter.querySelector('[data-course-result]');
  const noResults = courseCommandCenter.querySelector('[data-no-results]');
  const courseModal = courseCommandCenter.querySelector('[data-course-modal]');
  const modalCloseButtons = courseModal.querySelectorAll('[data-modal-close]');
  const modalTitle = courseModal.querySelector('[data-modal-title]');
  const modalCode = courseModal.querySelector('[data-modal-code]');
  const modalInstructor = courseModal.querySelector('[data-modal-instructor]');
  const modalCredits = courseModal.querySelector('[data-modal-credits]');
  const modalRoom = courseModal.querySelector('[data-modal-room]');
  const modalProgress = courseModal.querySelector('[data-modal-progress]');
  const modalNext = courseModal.querySelector('[data-modal-next]');
  const modalAssessment = courseModal.querySelector('[data-modal-assessment]');
  let activeFilter = 'all';
  let lastCourseTrigger = null;

  function renderCourses() {
    const searchTerm = courseSearch.value.trim().toLowerCase();
    let visibleCourses = 0;

    courseCards.forEach((card) => {
      const matchesSearch = card.dataset.search.includes(searchTerm);
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const isVisible = matchesSearch && matchesFilter;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCourses += 1;
      }
    });

    resultSummary.textContent = `Showing ${visibleCourses} course${visibleCourses === 1 ? '' : 's'}`;
    noResults.hidden = visibleCourses !== 0;
  }

  courseSearch.addEventListener('input', renderCourses);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.categoryFilter;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;

        filterButton.classList.toggle('is-active', isActive);
        filterButton.setAttribute('aria-pressed', String(isActive));
      });

      renderCourses();
    });
  });

  function openCourseModal(courseTrigger) {
    lastCourseTrigger = courseTrigger;
    modalCode.textContent = courseTrigger.dataset.courseCode;
    modalTitle.textContent = courseTrigger.dataset.courseTitle;
    modalInstructor.textContent = courseTrigger.dataset.courseInstructor;
    modalCredits.textContent = courseTrigger.dataset.courseCredits;
    modalRoom.textContent = courseTrigger.dataset.courseRoom;
    modalProgress.textContent = courseTrigger.dataset.courseProgress;
    modalNext.textContent = courseTrigger.dataset.courseNext;
    modalAssessment.textContent = courseTrigger.dataset.courseAssessment;

    courseModal.hidden = false;
    courseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    courseModal.querySelector('.modal-close').focus();
  }

  function closeCourseModal() {
    courseModal.hidden = true;
    courseModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastCourseTrigger) {
      lastCourseTrigger.focus();
    }
  }

  courseCommandCenter.querySelectorAll('[data-course-open]').forEach((courseTrigger) => {
    courseTrigger.addEventListener('click', () => openCourseModal(courseTrigger));
  });

  modalCloseButtons.forEach((closeButton) => {
    closeButton.addEventListener('click', closeCourseModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !courseModal.hidden) {
      closeCourseModal();
    }
  });

  renderCourses();
}

const schedulePage = document.querySelector('[data-schedule-page]');

if (schedulePage) {
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayTabs = schedulePage.querySelectorAll('[data-day-tab]');
  const dayHeadings = schedulePage.querySelectorAll('[data-day-heading]');
  const dayColumns = schedulePage.querySelectorAll('[data-day-column]');
  const dayDateLabels = schedulePage.querySelectorAll('[data-day-date]');
  const weekButtons = schedulePage.querySelectorAll('[data-week-change]');
  const weekLabel = schedulePage.querySelector('[data-week-label]');
  const weekState = schedulePage.querySelector('[data-week-state]');
  const classTriggers = schedulePage.querySelectorAll('[data-class-open]');
  const scheduleModal = schedulePage.querySelector('[data-schedule-modal]');
  const modalCloseButtons = scheduleModal.querySelectorAll('[data-schedule-modal-close]');
  const modalTitle = scheduleModal.querySelector('[data-class-modal-title]');
  const modalCode = scheduleModal.querySelector('[data-class-modal-code]');
  const modalTime = scheduleModal.querySelector('[data-class-modal-time]');
  const modalRoom = scheduleModal.querySelector('[data-class-modal-room]');
  const modalInstructor = scheduleModal.querySelector('[data-class-modal-instructor]');
  const modalTopic = scheduleModal.querySelector('[data-class-modal-topic]');
  const modalAttendance = scheduleModal.querySelector('[data-class-modal-attendance]');
  let selectedDay = 'monday';
  let weekOffset = 0;
  let lastClassTrigger = null;

  function getMonday(date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNumber = monday.getDay();
    const daysFromMonday = dayNumber === 0 ? -6 : 1 - dayNumber;

    monday.setDate(monday.getDate() + daysFromMonday);
    return monday;
  }

  function formatDate(date, includeYear = false) {
    return date.toLocaleDateString(undefined, includeYear
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric' });
  }

  function renderWeek() {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + (weekOffset * 7));

    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    weekLabel.textContent = `${formatDate(monday)} – ${formatDate(friday, true)}`;
    weekState.textContent = weekOffset === 0
      ? 'Current Week'
      : weekOffset < 0
        ? 'Previous Week'
        : 'Next Week';

    dayDateLabels.forEach((dateLabel, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(dayDate.getDate() + index);
      dateLabel.textContent = formatDate(dayDate);
    });
  }

  function selectDay(dayName) {
    selectedDay = dayName;

    dayTabs.forEach((tab) => {
      const isSelected = tab.dataset.dayTab === selectedDay;

      tab.classList.toggle('is-selected', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
    });

    dayHeadings.forEach((heading) => {
      heading.classList.toggle('is-selected', heading.dataset.dayHeading === selectedDay);
    });

    dayColumns.forEach((column) => {
      column.classList.toggle('is-selected', column.dataset.dayColumn === selectedDay);
    });
  }

  const todayNumber = new Date().getDay();
  const currentDay = todayNumber >= 1 && todayNumber <= 5 ? dayNames[todayNumber - 1] : null;

  if (currentDay) {
    selectedDay = currentDay;
  }

  dayTabs.forEach((tab) => {
    tab.classList.toggle('is-today', tab.dataset.dayTab === currentDay);
    tab.addEventListener('click', () => selectDay(tab.dataset.dayTab));
  });

  dayHeadings.forEach((heading) => {
    heading.classList.toggle('is-today', heading.dataset.dayHeading === currentDay);
  });

  dayColumns.forEach((column) => {
    column.classList.toggle('is-today', column.dataset.dayColumn === currentDay);
  });

  weekButtons.forEach((button) => {
    button.addEventListener('click', () => {
      weekOffset += Number(button.dataset.weekChange);
      renderWeek();
    });
  });

  function openScheduleModal(classTrigger) {
    lastClassTrigger = classTrigger;
    modalTitle.textContent = classTrigger.dataset.classTitle;
    modalCode.textContent = classTrigger.dataset.classCode;
    modalTime.textContent = classTrigger.dataset.classTime;
    modalRoom.textContent = classTrigger.dataset.classRoom;
    modalInstructor.textContent = classTrigger.dataset.classInstructor;
    modalTopic.textContent = classTrigger.dataset.classTopic;
    modalAttendance.textContent = classTrigger.dataset.classAttendance;

    scheduleModal.hidden = false;
    scheduleModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    scheduleModal.querySelector('.schedule-modal-close').focus();
  }

  function closeScheduleModal() {
    scheduleModal.hidden = true;
    scheduleModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastClassTrigger) {
      lastClassTrigger.focus();
    }
  }

  classTriggers.forEach((classTrigger) => {
    classTrigger.addEventListener('click', () => openScheduleModal(classTrigger));
  });

  modalCloseButtons.forEach((closeButton) => {
    closeButton.addEventListener('click', closeScheduleModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !scheduleModal.hidden) {
      closeScheduleModal();
    }
  });

  renderWeek();
  selectDay(selectedDay);
}
