// ========================
// GPA and Attendance Calculators
// ========================

const analyticsPage = document.querySelector('[data-analytics-page]');
const analyticsCampus = window.CampusOS || (window.CampusOS = {});

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
  const forecastCourseList = analyticsPage.querySelector('[data-forecast-courses]');
  const forecastScenarioButtons = analyticsPage.querySelectorAll('[data-forecast-scenario]');
  const forecastCurrent = analyticsPage.querySelector('[data-forecast-current]');
  const forecastProjected = analyticsPage.querySelector('[data-forecast-projected]');
  const forecastChange = analyticsPage.querySelector('[data-forecast-change]');
  const forecastMarker = analyticsPage.querySelector('[data-forecast-marker]');
  const forecastMeterLabel = analyticsPage.querySelector('[data-forecast-meter-label]');
  const forecastMessage = analyticsPage.querySelector('[data-forecast-message]');
  const attendanceRiskList = analyticsPage.querySelector('[data-attendance-risk-list]');
  const skillCourseSelect = analyticsPage.querySelector('[data-skill-course-select]');
  const skillArea = analyticsPage.querySelector('[data-skill-area]');
  const skillList = analyticsPage.querySelector('[data-skill-list]');
  const degreeMatrix = analyticsPage.querySelector('[data-degree-matrix]');
  const forecastCourses = campusCoursesForForecast();
  let expectedGrades = {};
  let simulatedAttendance = {};
  let selectedSkillCourse = '';

  function campusCoursesForForecast() {
    return window.CampusOS?.data?.courses?.slice(0, 5) || [];
  }

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

  // ========================
  // GPA Forecast Simulator
  // ========================

  function getLowerGrade(grade) {
    const gradeOrder = Object.keys(gradePoints);
    const gradeIndex = gradeOrder.indexOf(grade);
    return gradeOrder[Math.min(gradeOrder.length - 1, gradeIndex + 1)];
  }

  function getScenarioGrades(scenario) {
    return forecastCourses.reduce((grades, course) => {
      grades[course.id] = scenario === 'best'
        ? 'A'
        : scenario === 'conservative'
          ? getLowerGrade(course.currentGrade)
          : course.currentGrade;
      return grades;
    }, {});
  }

  function calculateForecastGPA(grades) {
    let credits = 0;
    let qualityPoints = 0;

    forecastCourses.forEach((course) => {
      credits += course.credits;
      qualityPoints += (gradePoints[grades[course.id]] || 0) * course.credits;
    });

    return credits ? qualityPoints / credits : 0;
  }

  function renderForecastCourses() {
    forecastCourseList.innerHTML = '';

    forecastCourses.forEach((course) => {
      const row = document.createElement('div');
      const gradeSelect = document.createElement('select');
      row.className = 'forecast-course-row';
      gradeSelect.className = 'forecast-select';
      gradeSelect.dataset.forecastCourse = course.id;
      gradeSelect.setAttribute('aria-label', `Expected final grade for ${course.title}`);
      gradeSelect.innerHTML = createGradeOptions(expectedGrades[course.id]);
      row.innerHTML = `<div><strong class="forecast-course-row__title"></strong><span class="forecast-course-row__grade">Current grade: ${course.currentGrade}</span></div>`;
      row.appendChild(gradeSelect);
      row.querySelector('.forecast-course-row__title').textContent = course.title;
      gradeSelect.addEventListener('change', () => {
        expectedGrades[course.id] = gradeSelect.value;
        forecastScenarioButtons.forEach((button) => button.classList.remove('is-active'));
        updateForecastSummary();
      });
      forecastCourseList.appendChild(row);
    });
  }

  function updateForecastSummary() {
    const currentGpaValue = calculateForecastGPA(getScenarioGrades('expected'));
    const projectedGpaValue = calculateForecastGPA(expectedGrades);
    const changeValue = projectedGpaValue - currentGpaValue;
    const markerPosition = Math.min(100, Math.max(0, ((projectedGpaValue - 2.5) / 1.5) * 100));

    forecastCurrent.textContent = currentGpaValue.toFixed(2);
    forecastProjected.textContent = projectedGpaValue.toFixed(2);
    forecastChange.textContent = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}`;
    forecastMarker.style.setProperty('--forecast-position', `${markerPosition}%`);
    forecastMeterLabel.textContent = projectedGpaValue.toFixed(2);

    if (Math.abs(changeValue) < 0.005) {
      forecastMessage.textContent = 'If these grades are achieved, your semester GPA would remain stable.';
    } else if (changeValue > 0) {
      forecastMessage.textContent = `If these grades are achieved, your semester GPA would increase by approximately ${changeValue.toFixed(2)}.`;
    } else {
      forecastMessage.textContent = `If these grades are achieved, your semester GPA would decrease by approximately ${Math.abs(changeValue).toFixed(2)}.`;
    }
  }

  function applyForecastScenario(scenario) {
    expectedGrades = getScenarioGrades(scenario);
    forecastScenarioButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.forecastScenario === scenario));
    renderForecastCourses();
    updateForecastSummary();
  }

  // ========================
  // Attendance Risk Simulator
  // ========================

  function getAttendancePercentage(attended, total) {
    return total ? Math.min(100, (attended / total) * 100) : 0;
  }

  function getAttendanceStatus(percentage) {
    if (percentage >= 85) return { label: 'SAFE', className: 'safe' };
    if (percentage >= 75) return { label: 'WARNING', className: 'warning' };
    return { label: 'AT RISK', className: 'at-risk' };
  }

  function getAttendanceGuidance(course) {
    const percentage = getAttendancePercentage(course.attendance.attended, course.attendance.total);
    const requiredRatio = 0.75;

    if (percentage >= 75) {
      const safeToMiss = Math.max(0, Math.floor((course.attendance.attended / requiredRatio) - course.attendance.total + 0.000001));
      return `Safe to miss: ${safeToMiss} class${safeToMiss === 1 ? '' : 'es'}`;
    }

    const recoveryClasses = Math.max(1, Math.ceil(((requiredRatio * course.attendance.total) - course.attendance.attended) / (1 - requiredRatio)));
    return `Recovery: attend the next ${recoveryClasses} class${recoveryClasses === 1 ? '' : 'es'} to reach 75%`;
  }

  function createAttendanceRiskItem(course) {
    const currentPercentage = getAttendancePercentage(course.attendance.attended, course.attendance.total);
    const attendPercentage = getAttendancePercentage(course.attendance.attended + 1, course.attendance.total + 1);
    const missPercentage = getAttendancePercentage(course.attendance.attended, course.attendance.total + 1);
    const status = getAttendanceStatus(currentPercentage);
    const simulation = simulatedAttendance[course.id];
    const item = document.createElement('article');
    item.className = `attendance-risk-item risk-${status.className}`;
    item.innerHTML = `
      <div class="attendance-risk-item__heading"><strong></strong><span class="risk-status"></span></div>
      <div class="attendance-risk-item__metrics"><span>Current <strong>${currentPercentage.toFixed(1)}%</strong></span><span>If Attend <strong>${attendPercentage.toFixed(1)}%</strong></span><span>If Miss <strong>${missPercentage.toFixed(1)}%</strong></span></div>
      <div class="attendance-risk-item__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${currentPercentage.toFixed(1)}"><span style="--attendance-width: ${currentPercentage}%"></span></div>
      <div class="attendance-risk-item__actions"><button class="simulator-button" data-attendance-action="attend" data-course-id="${course.id}" type="button">Attend Next Class</button><button class="simulator-button" data-attendance-action="miss" data-course-id="${course.id}" type="button">Miss Next Class</button></div>
      <p class="attendance-risk-item__message"></p>
    `;
    item.querySelector('.attendance-risk-item__heading strong').textContent = course.title;
    item.querySelector('.risk-status').textContent = `${status.label} · ${course.attendance.attended} / ${course.attendance.total}`;
    item.querySelector('.attendance-risk-item__message').textContent = simulation === 'attend'
      ? `Simulation: attending next class raises attendance to ${attendPercentage.toFixed(1)}%.`
      : simulation === 'miss'
        ? `Simulation: missing next class lowers attendance to ${missPercentage.toFixed(1)}%.`
        : getAttendanceGuidance(course);
    item.querySelectorAll('[data-attendance-action]').forEach((button) => {
      button.addEventListener('click', () => {
        simulatedAttendance[button.dataset.courseId] = button.dataset.attendanceAction;
        renderAttendanceRisk();
      });
    });
    return item;
  }

  function renderAttendanceRisk() {
    attendanceRiskList.innerHTML = '';
    analyticsCampus.data.courses.forEach((course) => attendanceRiskList.appendChild(createAttendanceRiskItem(course)));
  }

  // ========================
  // Skill map and degree matrix
  // ========================

  function getSkillRadarPoints(values) {
    const center = 120;
    const radius = 85;
    const angles = [-90, -30, 30, 90, 150, 210];
    const skillNames = Object.keys(analyticsCampus.data.skillMap);

    return skillNames.map((skillName, index) => {
      const angle = angles[index] * (Math.PI / 180);
      const valueRadius = radius * ((values[skillName] || 0) / 100);
      return `${(center + Math.cos(angle) * valueRadius).toFixed(1)},${(center + Math.sin(angle) * valueRadius).toFixed(1)}`;
    }).join(' ');
  }

  function renderSkillMap() {
    const selectedCourse = analyticsCampus.getCourseById(selectedSkillCourse);
    const skillValues = { ...analyticsCampus.data.skillMap, ...(selectedCourse?.skills || {}) };
    skillArea.setAttribute('points', getSkillRadarPoints(skillValues));
    skillList.innerHTML = '';

    Object.entries(analyticsCampus.data.skillMap).forEach(([skillName, value]) => {
      const row = document.createElement('div');
      const courseContributes = Boolean(selectedCourse?.skills?.[skillName]);
      row.className = 'skill-list__row';
      row.classList.toggle('is-highlighted', courseContributes);
      row.innerHTML = `<span class="skill-list__label"></span><strong class="skill-list__value">${skillValues[skillName]}%</strong><span class="skill-list__track"><span style="--skill-width: ${skillValues[skillName]}%"></span></span>`;
      row.querySelector('.skill-list__label').textContent = skillName;
      skillList.appendChild(row);
    });
  }

  function renderDegreeMatrix() {
    degreeMatrix.innerHTML = '';
    analyticsCampus.data.degreeMatrix.forEach((item) => {
      const matrixItem = document.createElement(item.courseId ? 'button' : 'div');
      const stateSymbol = item.state === 'completed' ? '✓' : item.state === 'current' ? '◉' : '○';
      matrixItem.className = `degree-item is-${item.state}`;
      if (item.courseId) {
        matrixItem.type = 'button';
        matrixItem.dataset.courseId = item.courseId;
        matrixItem.addEventListener('click', () => {
          selectedSkillCourse = item.courseId;
          skillCourseSelect.value = item.courseId;
          renderSkillMap();
        });
      }
      matrixItem.innerHTML = `<span class="degree-item__state">${stateSymbol}</span><span></span>`;
      matrixItem.querySelector('span:last-child').textContent = item.title;
      degreeMatrix.appendChild(matrixItem);
    });
  }

  function initializeAdvancedAnalytics() {
    expectedGrades = getScenarioGrades('expected');
    const allSkillsOption = document.createElement('option');
    allSkillsOption.value = '';
    allSkillsOption.textContent = 'All skill areas';
    skillCourseSelect.appendChild(allSkillsOption);
    analyticsCampus.data.courses.forEach((course) => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = course.title;
      skillCourseSelect.appendChild(option);
    });
    skillCourseSelect.value = '';
    renderForecastCourses();
    updateForecastSummary();
    renderAttendanceRisk();
    renderSkillMap();
    renderDegreeMatrix();
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

  forecastScenarioButtons.forEach((button) => {
    button.addEventListener('click', () => applyForecastScenario(button.dataset.forecastScenario));
  });

  skillCourseSelect.addEventListener('change', () => {
    selectedSkillCourse = skillCourseSelect.value;
    renderSkillMap();
    document.dispatchEvent(new CustomEvent('campus:course-selected', { detail: { courseId: selectedSkillCourse } }));
  });

  [totalClassesInput, classesAttendedInput, requiredPercentageInput].forEach((input) => {
    input.addEventListener('input', calculateAttendance);
    input.addEventListener('change', calculateAttendance);
  });

  calculateGPA();
  calculateAttendance();
  initializeAdvancedAnalytics();

  window.addEventListener('campus:open-forecast', () => document.querySelector('#forecast')?.scrollIntoView({ behavior: 'smooth' }));
  window.addEventListener('campus:open-attendance-risk', () => document.querySelector('#attendance-risk')?.scrollIntoView({ behavior: 'smooth' }));
  document.addEventListener('campus:course-selected', (event) => {
    if (event.detail?.courseId && skillCourseSelect.value !== event.detail.courseId) {
      selectedSkillCourse = event.detail.courseId;
      skillCourseSelect.value = selectedSkillCourse;
      renderSkillMap();
    }
  });

  if (window.location.hash === '#forecast') {
    document.querySelector('#forecast')?.scrollIntoView({ behavior: 'smooth' });
  }
}

