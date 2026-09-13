// ========================
// Course Search, Filters, and Modal
// ========================

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

