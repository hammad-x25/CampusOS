// ========================
// GPA and Attendance Calculators
// ========================

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

