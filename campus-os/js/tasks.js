// ========================
// Task State, Rendering, and Form Events
// ========================

const taskPage = document.querySelector('[data-task-page]');
const taskCampus = window.CampusOS || (window.CampusOS = {});

if (taskPage) {
  const TASKS_STORAGE_KEY = taskCampus.storageKeys.tasks;
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
    taskCampus.utils.markLocalSave();
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

  function createTaskCard(task) {
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

    return taskCard;
  }

  function updateTaskSummary(visibleTaskCount) {
    const remainingTasks = tasks.filter((task) => !task.completed).length;
    const highPriorityTasks = tasks.filter((task) => !task.completed && task.priority === 'high').length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    remainingSummary.textContent = remainingTasks;
    highSummary.textContent = highPriorityTasks;
    completedSummary.textContent = completedTasks;
    taskResult.textContent = `Showing ${visibleTaskCount} task${visibleTaskCount === 1 ? '' : 's'}`;
    taskEmpty.hidden = visibleTaskCount !== 0;
  }

  function renderTasks() {
    const visibleTasks = filterTasks();

    taskList.innerHTML = '';
    visibleTasks.forEach((task) => taskList.appendChild(createTaskCard(task)));
    updateTaskSummary(visibleTasks.length);
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
