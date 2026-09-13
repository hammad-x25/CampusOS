// ========================
// Weekly Schedule and Class Modal
// ========================

const schedulePage = document.querySelector('[data-schedule-page]');
const scheduleCampus = window.CampusOS || (window.CampusOS = {});

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
    weekLabel.textContent = `${formatDate(monday)} - ${formatDate(friday, true)}`;
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
    const sharedCourse = scheduleCampus.data.courses.find((course) => course.code === classTrigger.dataset.classCode);

    modalTitle.textContent = sharedCourse?.title || classTrigger.dataset.classTitle;
    modalCode.textContent = sharedCourse?.code || classTrigger.dataset.classCode;
    modalTime.textContent = classTrigger.dataset.classTime;
    modalRoom.textContent = classTrigger.dataset.classRoom;
    modalInstructor.textContent = sharedCourse?.instructor || classTrigger.dataset.classInstructor;
    modalTopic.textContent = classTrigger.dataset.classTopic;
    modalAttendance.textContent = sharedCourse
      ? `${sharedCourse.attendance.attended} / ${sharedCourse.attendance.total} classes`
      : classTrigger.dataset.classAttendance;

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

