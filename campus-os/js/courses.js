// ========================
// Course Search, Filters, and Modal
// ========================

const courseCommandCenter = document.querySelector('[data-course-page]');
const courseCampus = window.CampusOS || (window.CampusOS = {});

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
  const modalAttendance = courseModal.querySelector('[data-modal-attendance]');
  const modalNext = courseModal.querySelector('[data-modal-next]');
  const modalAssessment = courseModal.querySelector('[data-modal-assessment]');
  const modalAssessmentWeight = courseModal.querySelector('[data-modal-assessment-weight]');
  const modalStanding = courseModal.querySelector('[data-modal-standing]');
  const modalOutlook = courseModal.querySelector('[data-modal-outlook]');
  const modalPerformance = courseModal.querySelector('[data-modal-performance]');
  let activeFilter = 'all';
  let lastCourseTrigger = null;

  function syncCourseCardsWithSharedData() {
    courseCards.forEach((card) => {
      const course = courseCampus.getCourseById(card.dataset.courseId);

      if (!course) {
        return;
      }

      const nextClass = `${course.nextClass.day} · ${courseCampus.utils.formatTimeMinutes(course.nextClass.startMinutes)}`;
      const categoryLabel = course.category.charAt(0).toUpperCase() + course.category.slice(1);
      card.dataset.category = course.category;
      card.dataset.search = `${course.code} ${course.title} ${course.instructor} ${course.category}`.toLowerCase();
      card.querySelector('.course-code').textContent = course.code;
      card.querySelector('.course-title').textContent = course.title;
      card.querySelector('.course-instructor').textContent = course.instructor;
      card.querySelector('.course-category').textContent = categoryLabel;
      card.querySelector('.course-meta strong').textContent = `${course.progress}% COMPLETE`;
      card.querySelector('.course-progress-bar').setAttribute('aria-valuenow', course.progress);
      card.querySelector('.course-progress-bar > span').style.width = `${course.progress}%`;
      card.querySelector('.course-next strong').textContent = nextClass;

      const courseTrigger = card.querySelector('[data-course-open]');
      courseTrigger.dataset.courseTitle = course.title;
      courseTrigger.dataset.courseCode = course.code;
      courseTrigger.dataset.courseInstructor = course.instructor;
      courseTrigger.dataset.courseCredits = `${course.credits} Credit Hours`;
      courseTrigger.dataset.courseRoom = course.room;
      courseTrigger.dataset.courseProgress = `${course.progress}%`;
      courseTrigger.dataset.courseNext = nextClass;
      courseTrigger.dataset.courseAssessment = course.assessment.title;
    });
  }

  function renderCourseIntelligence(courseId) {
    const course = courseCampus.getCourseById(courseId);

    if (!course) {
      return;
    }

    const performanceValues = Object.values(course.performance);
    const averagePerformance = performanceValues.reduce((total, value) => total + value, 0) / performanceValues.length;
    const attendancePercentage = (course.attendance.attended / course.attendance.total) * 100;
    const standing = averagePerformance >= 85 && attendancePercentage >= 85 ? 'STRONG' : averagePerformance >= 75 && attendancePercentage >= 75 ? 'STABLE' : 'NEEDS ATTENTION';
    const outlook = standing === 'STRONG' ? 'GOOD STANDING' : standing === 'STABLE' ? 'STEADY OUTLOOK' : 'REVIEW REQUIRED';

    modalStanding.textContent = standing;
    modalAttendance.textContent = `${Math.round(attendancePercentage)}%`;
    modalOutlook.textContent = outlook;
    modalOutlook.className = `course-outlook__result outlook-${standing.toLowerCase().replace(' ', '-')}`;
    modalPerformance.innerHTML = '';

    Object.entries(course.performance).forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'course-performance-row';
      row.innerHTML = `<div><span></span><strong>${value}%</strong></div><div class="course-performance-track"><span style="width: ${value}%"></span></div>`;
      row.querySelector('span').textContent = label;
      modalPerformance.appendChild(row);
    });
  }

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

  syncCourseCardsWithSharedData();
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
    const selectedCourse = courseCampus.getCourseById(courseTrigger.dataset.courseId);
    modalAssessmentWeight.textContent = selectedCourse
      ? `${selectedCourse.assessment.weight}% assessment weight`
      : 'Assessment weight not available';
    renderCourseIntelligence(courseTrigger.dataset.courseId);

    courseModal.hidden = false;
    courseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    courseModal.querySelector('.modal-close').focus();
    document.dispatchEvent(new CustomEvent('campus:course-selected', { detail: { courseId: courseTrigger.dataset.courseId } }));
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

