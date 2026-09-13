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

const sidebar = document.querySelector('[data-sidebar]');
const sidebarOpenButton = document.querySelector('[data-sidebar-open]');
const sidebarCloseButton = document.querySelector('[data-sidebar-close]');
const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

function openSidebar() {
  document.body.classList.add('sidebar-open');
  sidebarOpenButton.setAttribute('aria-expanded', 'true');
  sidebarOverlay.setAttribute('aria-hidden', 'false');
  sidebarOverlay.removeAttribute('tabindex');
  sidebarCloseButton.focus();
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  sidebarOpenButton.setAttribute('aria-expanded', 'false');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
  sidebarOverlay.setAttribute('tabindex', '-1');

  if (sidebar.contains(document.activeElement)) {
    sidebarOpenButton.focus();
  }
}

if (sidebar && sidebarOpenButton && sidebarCloseButton && sidebarOverlay) {
  sidebarOpenButton.addEventListener('click', openSidebar);
  sidebarCloseButton.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  pageLinks.forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });
}

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

const taskPage = document.querySelector('[data-task-page]');

if (taskPage) {
  const TASKS_STORAGE_KEY = 'campus-tasks';
  const defaultTasks = [
    {
      id: 1,
      title: 'Web Technologies Assignment',
      course: 'Web Technologies',
      deadline: '2026-09-14',
      priority: 'high',
      description: 'Build the responsive CampusOS interface using semantic HTML, CSS, and JavaScript.',
      completed: false
    },
    {
      id: 2,
      title: 'AI Quiz Preparation',
      course: 'Artificial Intelligence',
      deadline: '2026-09-16',
      priority: 'high',
      description: 'Review heuristic search, knowledge representation, and the weekly lecture notes.',
      completed: false
    },
    {
      id: 3,
      title: 'Database Project Schema',
      course: 'Database Systems',
      deadline: '2026-09-20',
      priority: 'medium',
      description: 'Finalize the entity relationship model and prepare the normalized schema.',
      completed: false
    },
    {
      id: 4,
      title: 'HCI Wireframe Review',
      course: 'Human Computer Interaction',
      deadline: '2026-09-21',
      priority: 'low',
      description: 'Review the mobile wireframes and record usability improvements for the next critique.',
      completed: false
    },
    {
      id: 5,
      title: 'Operating Systems Process Lab',
      course: 'Operating Systems',
      deadline: '2026-09-23',
      priority: 'medium',
      description: 'Complete the process scheduling experiment and submit the lab observations.',
      completed: false
    },
    {
      id: 6,
      title: 'Software Engineering Sprint Notes',
      course: 'Software Engineering',
      deadline: '2026-09-25',
      priority: 'low',
      description: 'Summarize sprint progress, blockers, and the next set of implementation goals.',
      completed: false
    },
    {
      id: 7,
      title: 'Read DOM Events Chapter',
      course: 'Web Technologies',
      deadline: '2026-09-08',
      priority: 'low',
      description: 'Review event bubbling, delegation, and listener patterns before the next workshop.',
      completed: true
    },
    {
      id: 8,
      title: 'Practice SQL Joins',
      course: 'Database Systems',
      deadline: '2026-09-09',
      priority: 'medium',
      description: 'Complete the practice set covering inner, outer, and self joins.',
      completed: true
    },
    {
      id: 9,
      title: 'Revise Search Algorithms',
      course: 'Artificial Intelligence',
      deadline: '2026-09-10',
      priority: 'low',
      description: 'Summarize breadth-first, depth-first, and heuristic search from the lecture deck.',
      completed: true
    },
    {
      id: 10,
      title: 'Submit User Persona Report',
      course: 'Human Computer Interaction',
      deadline: '2026-09-11',
      priority: 'low',
      description: 'Submit the final user persona report after incorporating peer feedback.',
      completed: true
    }
  ];

  const taskSearch = taskPage.querySelector('[data-task-search]');
  const taskFilters = taskPage.querySelectorAll('[data-task-filter]');
  const taskList = taskPage.querySelector('[data-task-list]');
  const taskEmpty = taskPage.querySelector('[data-task-empty]');
  const taskResult = taskPage.querySelector('[data-task-result]');
  const remainingSummary = taskPage.querySelector('[data-summary-remaining]');
  const highSummary = taskPage.querySelector('[data-summary-high]');
  const completedSummary = taskPage.querySelector('[data-summary-completed]');
  const newTaskButton = taskPage.querySelector('[data-open-task-modal]');
  const taskModal = taskPage.querySelector('[data-task-modal]');
  const taskModalCloseButtons = taskModal.querySelectorAll('[data-task-modal-close]');
  const taskForm = taskPage.querySelector('[data-task-form]');
  const taskIdInput = taskPage.querySelector('[data-task-id]');
  const taskTitleInput = taskPage.querySelector('[data-task-title]');
  const taskCourseInput = taskPage.querySelector('[data-task-course]');
  const taskDeadlineInput = taskPage.querySelector('[data-task-deadline]');
  const taskPriorityInput = taskPage.querySelector('[data-task-priority]');
  const taskDescriptionInput = taskPage.querySelector('[data-task-description]');
  const taskModalHeading = taskPage.querySelector('[data-task-modal-heading]');
  const taskSubmitButton = taskPage.querySelector('[data-task-submit]');
  let tasks = loadTasks();
  let activeTaskFilter = 'all';
  let lastTaskTrigger = null;

  function loadTasks() {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    if (!savedTasks) {
      return defaultTasks.map((task) => ({ ...task }));
    }

    try {
      const parsedTasks = JSON.parse(savedTasks);
      return Array.isArray(parsedTasks) ? parsedTasks : defaultTasks.map((task) => ({ ...task }));
    } catch (error) {
      return defaultTasks.map((task) => ({ ...task }));
    }
  }

  function saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }

  function formatDeadline(deadline) {
    const date = new Date(`${deadline}T00:00:00`);

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  function filterTasks() {
    const searchTerm = taskSearch.value.trim().toLowerCase();

    return tasks.filter((task) => {
      const searchableText = `${task.title} ${task.course}`.toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm);
      const matchesFilter = activeTaskFilter === 'all'
        || (activeTaskFilter === 'pending' && !task.completed)
        || (activeTaskFilter === 'completed' && task.completed)
        || (activeTaskFilter === 'high' && task.priority === 'high');

      return matchesSearch && matchesFilter;
    });
  }

  function renderTasks() {
    const visibleTasks = filterTasks();

    taskList.innerHTML = '';

    visibleTasks.forEach((task) => {
      const taskCard = document.createElement('article');
      taskCard.className = 'task-card';
      taskCard.dataset.taskId = task.id;
      taskCard.classList.toggle('is-completed', task.completed);
      taskCard.classList.add(`task-priority-${task.priority}`);
      taskCard.innerHTML = `
        <div class="task-card-header">
          <p class="task-course" data-render-course></p>
          <span class="task-priority-badge" data-render-priority></span>
        </div>
        <h3 class="task-card-title" data-render-title></h3>
        <p class="task-description" data-render-description></p>
        <div class="task-card-meta">
          <span>Due <strong data-render-deadline></strong></span>
        </div>
        <div class="task-card-footer">
          <span class="task-status-badge" data-render-status></span>
          <div class="task-card-actions">
            <button class="task-card-button" data-task-action="toggle" data-task-id="${task.id}" type="button"></button>
            <button class="task-card-button" data-task-action="edit" data-task-id="${task.id}" type="button">Edit</button>
            <button class="task-card-button task-delete" data-task-action="delete" data-task-id="${task.id}" type="button">Delete</button>
          </div>
        </div>
      `;

      taskCard.querySelector('[data-render-course]').textContent = task.course;
      taskCard.querySelector('[data-render-priority]').textContent = formatPriority(task.priority);
      taskCard.querySelector('[data-render-priority]').classList.add(`priority-${task.priority}`);
      taskCard.querySelector('[data-render-title]').textContent = task.title;
      taskCard.querySelector('[data-render-description]').textContent = task.description || 'No description added.';
      taskCard.querySelector('[data-render-deadline]').textContent = formatDeadline(task.deadline);

      const statusBadge = taskCard.querySelector('[data-render-status]');
      statusBadge.textContent = task.completed ? 'Completed' : 'Pending';
      statusBadge.classList.add(task.completed ? 'status-completed' : 'status-pending');

      const toggleButton = taskCard.querySelector('[data-task-action="toggle"]');
      toggleButton.textContent = task.completed ? 'Reopen' : 'Complete';
      taskList.appendChild(taskCard);
    });

    const remainingTasks = tasks.filter((task) => !task.completed).length;
    const highPriorityTasks = tasks.filter((task) => !task.completed && task.priority === 'high').length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    remainingSummary.textContent = remainingTasks;
    highSummary.textContent = highPriorityTasks;
    completedSummary.textContent = completedTasks;
    taskResult.textContent = `Showing ${visibleTasks.length} task${visibleTasks.length === 1 ? '' : 's'}`;
    taskEmpty.hidden = visibleTasks.length !== 0;
  }

  function addTask(task) {
    tasks.push(task);
    saveTasks();
    renderTasks();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
  }

  function toggleTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);

    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  function editTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskCourseInput.value = task.course;
    taskDeadlineInput.value = task.deadline;
    taskPriorityInput.value = task.priority;
    taskDescriptionInput.value = task.description || '';
    taskModalHeading.textContent = 'Edit Task';
    taskSubmitButton.textContent = 'Save Changes';
    clearFormErrors();
    taskModal.hidden = false;
    taskModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    taskTitleInput.focus();
  }

  function clearFormErrors() {
    taskPage.querySelectorAll('.form-error').forEach((errorMessage) => {
      errorMessage.textContent = '';
    });
  }

  function showFormError(fieldName, message) {
    const errorMessage = taskPage.querySelector(`[data-error-for="${fieldName}"]`);
    errorMessage.textContent = message;
  }

  function validateTaskForm() {
    clearFormErrors();

    const formValues = {
      title: taskTitleInput.value.trim(),
      course: taskCourseInput.value,
      deadline: taskDeadlineInput.value,
      priority: taskPriorityInput.value,
      description: taskDescriptionInput.value.trim()
    };
    let isValid = true;

    if (!formValues.title) {
      showFormError('title', 'Enter a task title.');
      isValid = false;
    }

    if (!formValues.course) {
      showFormError('course', 'Select a course.');
      isValid = false;
    }

    if (!formValues.deadline) {
      showFormError('deadline', 'Choose a deadline.');
      isValid = false;
    }

    if (!formValues.priority) {
      showFormError('priority', 'Select a priority.');
      isValid = false;
    }

    if (!isValid) {
      const firstInvalidField = !formValues.title
        ? taskTitleInput
        : !formValues.course
          ? taskCourseInput
          : !formValues.deadline
            ? taskDeadlineInput
            : taskPriorityInput;

      firstInvalidField.focus();
      return null;
    }

    return formValues;
  }

  function openNewTaskModal() {
    taskForm.reset();
    taskIdInput.value = '';
    taskModalHeading.textContent = 'New Task';
    taskSubmitButton.textContent = 'Add Task';
    clearFormErrors();
    lastTaskTrigger = newTaskButton;
    taskModal.hidden = false;
    taskModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    taskTitleInput.focus();
  }

  function closeTaskModal() {
    taskModal.hidden = true;
    taskModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastTaskTrigger && typeof lastTaskTrigger.focus === 'function') {
      lastTaskTrigger.focus();
    } else {
      newTaskButton.focus();
    }
  }

  taskSearch.addEventListener('input', renderTasks);

  taskFilters.forEach((filterButton) => {
    filterButton.addEventListener('click', () => {
      activeTaskFilter = filterButton.dataset.taskFilter;

      taskFilters.forEach((button) => {
        const isActive = button === filterButton;

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      renderTasks();
    });
  });

  taskList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-task-action]');

    if (!actionButton) {
      return;
    }

    const taskId = Number(actionButton.dataset.taskId);
    lastTaskTrigger = actionButton;

    if (actionButton.dataset.taskAction === 'toggle') {
      toggleTask(taskId);
    }

    if (actionButton.dataset.taskAction === 'delete') {
      deleteTask(taskId);
    }

    if (actionButton.dataset.taskAction === 'edit') {
      editTask(taskId);
    }
  });

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formValues = validateTaskForm();

    if (!formValues) {
      return;
    }

    const existingTaskId = Number(taskIdInput.value);

    if (existingTaskId) {
      const taskIndex = tasks.findIndex((task) => task.id === existingTaskId);

      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...formValues };
      }

      saveTasks();
      renderTasks();
    } else {
      addTask({ ...formValues, id: Date.now(), completed: false });
    }

    closeTaskModal();
  });

  [taskTitleInput, taskCourseInput, taskDeadlineInput, taskPriorityInput].forEach((field) => {
    field.addEventListener('input', clearFormErrors);
    field.addEventListener('change', clearFormErrors);
  });

  newTaskButton.addEventListener('click', openNewTaskModal);

  taskModalCloseButtons.forEach((closeButton) => {
    closeButton.addEventListener('click', closeTaskModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !taskModal.hidden) {
      closeTaskModal();
    }
  });

  renderTasks();
}

const analyticsPage = document.querySelector('[data-analytics-page]');

if (analyticsPage) {
  const gradePoints = {
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    D: 1.0,
    F: 0.0
  };

  const gpaRowsBody = analyticsPage.querySelector('[data-gpa-rows]');
  const addCourseButton = analyticsPage.querySelector('[data-add-course]');
  const currentGpa = analyticsPage.querySelector('[data-current-gpa]');
  const totalCourses = analyticsPage.querySelector('[data-total-courses]');
  const totalCredits = analyticsPage.querySelector('[data-total-credits]');
  const totalQualityPoints = analyticsPage.querySelector('[data-total-quality-points]');
  const totalClassesInput = analyticsPage.querySelector('[data-total-classes]');
  const classesAttendedInput = analyticsPage.querySelector('[data-classes-attended]');
  const requiredPercentageInput = analyticsPage.querySelector('[data-required-percentage]');
  const attendancePercentage = analyticsPage.querySelector('[data-attendance-percentage]');
  const attendanceStatus = analyticsPage.querySelector('[data-attendance-status]');
  const attendanceMessage = analyticsPage.querySelector('[data-attendance-message]');

  function calculateGPA() {
    const rows = analyticsPage.querySelectorAll('[data-gpa-row]');
    let creditHours = 0;
    let qualityPoints = 0;
    let courseCount = 0;

    rows.forEach((row) => {
      const credits = Number(row.querySelector('[data-credit-hours]').value);
      const grade = row.querySelector('[data-grade]').value;
      const points = gradePoints[grade] ?? 0;

      row.querySelector('[data-grade-points]').textContent = points.toFixed(2);

      if (credits > 0) {
        courseCount += 1;
        creditHours += credits;
        qualityPoints += points * credits;
      }
    });

    const gpa = creditHours > 0 ? qualityPoints / creditHours : 0;
    currentGpa.textContent = gpa.toFixed(2);
    totalCourses.textContent = courseCount;
    totalCredits.textContent = creditHours;
    totalQualityPoints.textContent = qualityPoints.toFixed(2);
  }

  function createGradeOptions(selectedGrade = 'B') {
    return Object.keys(gradePoints)
      .map((grade) => `<option value="${grade}"${grade === selectedGrade ? ' selected' : ''}>${grade}</option>`)
      .join('');
  }

  function addCourseRow() {
    const row = document.createElement('tr');
    const rowId = Date.now();
    row.setAttribute('data-gpa-row', '');
    row.innerHTML = `
      <td>
        <label class="visually-hidden" for="new-course-${rowId}">Course name</label>
        <input class="gpa-course-input" id="new-course-${rowId}" data-course-name type="text" placeholder="Course name">
      </td>
      <td>
        <label class="visually-hidden" for="new-credits-${rowId}">Credit hours</label>
        <input class="gpa-credit-input" id="new-credits-${rowId}" data-credit-hours type="number" min="1" step="1" value="3">
      </td>
      <td>
        <label class="visually-hidden" for="new-grade-${rowId}">Grade</label>
        <select id="new-grade-${rowId}" data-grade>${createGradeOptions()}</select>
      </td>
      <td><span class="grade-points" data-grade-points>3.00</span></td>
      <td><button class="remove-course-button" data-remove-course type="button" aria-label="Remove course">Remove</button></td>
    `;
    gpaRowsBody.appendChild(row);
    calculateGPA();
    row.querySelector('[data-course-name]').focus();
  }

  function removeCourseRow(row) {
    if (row) {
      row.remove();
      calculateGPA();
    }
  }

  function calculateAttendance() {
    const totalClassesValue = Math.max(0, Number(totalClassesInput.value) || 0);
    const classesAttendedValue = Math.max(0, Number(classesAttendedInput.value) || 0);
    const requiredValue = Math.min(100, Math.max(0, Number(requiredPercentageInput.value) || 0));
    const percentage = totalClassesValue > 0
      ? Math.min(100, (classesAttendedValue / totalClassesValue) * 100)
      : 0;

    let status = 'AT RISK';
    if (percentage >= requiredValue) {
      status = 'SAFE';
    } else if (percentage >= requiredValue - 10) {
      status = 'WARNING';
    }

    attendancePercentage.textContent = `${percentage.toFixed(2)}%`;
    attendanceStatus.textContent = status;
    attendanceStatus.className = `attendance-status status-${status.toLowerCase().replace(' ', '-')}`;

    if (totalClassesValue === 0) {
      attendanceMessage.textContent = 'Enter your total classes to see attendance guidance.';
      return;
    }

    if (requiredValue === 0) {
      attendanceMessage.textContent = 'No minimum attendance percentage is currently set.';
      return;
    }

    const requiredRatio = requiredValue / 100;
    if (percentage >= requiredValue) {
      const possibleMisses = Math.max(0, Math.floor((classesAttendedValue / requiredRatio) - totalClassesValue + 0.000001));
      const classLabel = possibleMisses === 1 ? 'class' : 'classes';
      attendanceMessage.textContent = `You can miss ${possibleMisses} more ${classLabel} before falling below ${requiredValue}%.`;
    } else if (requiredValue < 100) {
      const neededClasses = Math.ceil(((requiredRatio * totalClassesValue) - classesAttendedValue) / (1 - requiredRatio));
      const classLabel = neededClasses === 1 ? 'class' : 'classes';
      attendanceMessage.textContent = `You need to attend the next ${Math.max(1, neededClasses)} ${classLabel} to reach ${requiredValue}%.`;
    } else {
      attendanceMessage.textContent = 'You need to attend every future class to reach 100%.';
    }
  }

  gpaRowsBody.addEventListener('input', calculateGPA);
  gpaRowsBody.addEventListener('change', calculateGPA);
  gpaRowsBody.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-course]');
    if (removeButton) {
      removeCourseRow(removeButton.closest('[data-gpa-row]'));
    }
  });
  addCourseButton.addEventListener('click', addCourseRow);

  [totalClassesInput, classesAttendedInput, requiredPercentageInput].forEach((input) => {
    input.addEventListener('input', calculateAttendance);
    input.addEventListener('change', calculateAttendance);
  });

  calculateGPA();
  calculateAttendance();
}
