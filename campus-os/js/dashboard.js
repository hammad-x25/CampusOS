// Dashboard intelligence is deterministic: every value is calculated from local CampusOS data.
(function (campus) {
  const dashboardPage = document.querySelector('[data-dashboard-page]');

  if (!dashboardPage) {
    return;
  }

  const semester = campus.data.semester;
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function calculateDeadlineReadiness() {
    const now = new Date();
    const upcomingDeadlines = campus.data.assessments.filter((assessment) => new Date(assessment.due) > now);
    const urgentDeadlines = upcomingDeadlines.filter((assessment) => new Date(assessment.due) - now < 259200000);

    if (!upcomingDeadlines.length) {
      return 100;
    }

    // A busy three-day window lowers readiness, while clear space preserves it.
    return Math.max(0, 100 - ((urgentDeadlines.length / upcomingDeadlines.length) * 50));
  }

  function calculateAcademicHealth() {
    const tasks = campus.getTasks();
    const completedTaskPercentage = tasks.length ? (tasks.filter((task) => task.completed).length / tasks.length) * 100 : 0;
    const gpaScore = (semester.currentGpa / 4) * 35;
    const attendanceScore = semester.overallAttendance * 0.3;
    const workScore = completedTaskPercentage * 0.2;
    const deadlineReadinessScore = calculateDeadlineReadiness() * 0.15;
    const score = Math.round(gpaScore + attendanceScore + workScore + deadlineReadinessScore);

    return Math.min(100, Math.max(0, score));
  }

  function calculateAcademicRisk(score) {
    const hasAtRiskCourse = campus.data.courses.some((course) => {
      return (course.attendance.attended / course.attendance.total) * 100 < 75;
    });

    if (hasAtRiskCourse || score < 60) {
      return { label: 'HIGH', className: 'risk-high' };
    }

    if (score < 80) {
      return { label: 'MEDIUM', className: 'risk-medium' };
    }

    return { label: 'LOW', className: 'risk-low' };
  }

  function renderAcademicControlCenter() {
    const healthScore = calculateAcademicHealth();
    const risk = calculateAcademicRisk(healthScore);
    const scoreLabel = dashboardPage.querySelector('[data-academic-health-label]');
    const scoreValue = dashboardPage.querySelector('[data-academic-health]');
    const healthRing = dashboardPage.querySelector('[data-health-ring]');
    const statusLabel = dashboardPage.querySelector('[data-academic-status]');
    const riskLabel = dashboardPage.querySelector('[data-academic-risk]');
    const pendingTasks = campus.getTasks().filter((task) => !task.completed).length;

    scoreLabel.textContent = healthScore;
    scoreValue.textContent = healthScore;
    healthRing.style.setProperty('--health-progress', `${healthScore}%`);
    dashboardPage.querySelector('[data-health-gpa]').textContent = semester.currentGpa.toFixed(2);
    dashboardPage.querySelector('[data-health-attendance]').textContent = `${semester.overallAttendance}%`;
    dashboardPage.querySelector('[data-semester-completion]').textContent = `${semester.completion}%`;
    statusLabel.textContent = healthScore >= 80 ? 'ON TRACK' : healthScore >= 60 ? 'REVIEW' : 'AT RISK';
    riskLabel.textContent = risk.label;
    riskLabel.className = `control-center-item__value ${risk.className}`;
    dashboardPage.querySelector('[data-academic-load]').textContent = pendingTasks > 7 ? 'HIGH' : pendingTasks > 3 ? 'MODERATE' : 'LIGHT';
  }

  function getCurrentDaySchedule() {
    const currentDayIndex = new Date().getDay();

    return campus.data.schedule
      .filter((event) => event.dayIndex === currentDayIndex)
      .map((event) => ({ ...event, course: campus.getCourseById(event.courseId) }))
      .sort((firstEvent, secondEvent) => firstEvent.startMinutes - secondEvent.startMinutes);
  }

  function getLiveScheduleState(events) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentEvent = events.find((event) => currentMinutes >= event.startMinutes && currentMinutes < event.endMinutes);
    const nextEvent = events.find((event) => event.startMinutes > currentMinutes);

    return { currentMinutes, currentEvent, nextEvent };
  }

  function createTimelineItem(event, state) {
    const item = document.createElement('li');
    const isPast = state.currentMinutes >= event.endMinutes;
    const isCurrent = event === state.currentEvent;
    const isNext = event === state.nextEvent;
    item.className = 'timeline-item';
    item.classList.toggle('is-past', isPast && !isCurrent);
    item.classList.toggle('is-current', isCurrent);
    item.classList.toggle('is-next', isNext && !isCurrent);
    item.innerHTML = `
      <time class="timeline-time" datetime="${event.start}"></time>
      <span class="timeline-rail" aria-hidden="true"><span class="timeline-node"></span></span>
      <div class="timeline-event"><h3></h3><p>${event.room}</p></div>
    `;
    item.querySelector('.timeline-event h3').textContent = event.course.title;
    const timeText = campus.utils.formatTimeMinutes(event.startMinutes).split(' ');
    item.querySelector('.timeline-time').innerHTML = `${timeText[0]} <span>${timeText[1]}</span>`;
    return item;
  }

  function renderLiveTimeline() {
    const timeline = dashboardPage.querySelector('[data-live-timeline]');
    const nowLabel = dashboardPage.querySelector('[data-live-now]');
    const nextClassSummary = dashboardPage.querySelector('[data-next-class-summary]');
    const events = getCurrentDaySchedule();
    const state = getLiveScheduleState(events);
    const now = new Date();

    nowLabel.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    timeline.innerHTML = '';

    if (!events.length) {
      timeline.innerHTML = '<li class="timeline-free-period">FREE PERIOD · No scheduled classes today.</li>';
      nextClassSummary.textContent = 'Next class: check your weekly schedule.';
      return;
    }

    events.forEach((event) => timeline.appendChild(createTimelineItem(event, state)));

    if (state.currentEvent) {
      nextClassSummary.textContent = `NOW: ${state.currentEvent.course.title} · ${state.currentEvent.room}`;
    } else if (state.nextEvent) {
      const minutesUntil = state.nextEvent.startMinutes - state.currentMinutes;
      nextClassSummary.textContent = `Next class: ${state.nextEvent.course.title} starts in ${campus.utils.formatDuration(minutesUntil)}.`;
    } else {
      nextClassSummary.textContent = 'FREE PERIOD · No more classes today.';
    }
  }

  function getWeekStart() {
    const today = new Date();
    const dayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() + dayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function calculateWorkload() {
    const monday = getWeekStart();
    const workload = Array.from({ length: 7 }, (_, index) => ({
      dayIndex: index + 1 > 6 ? 0 : index + 1,
      label: dayLabels[index + 1 > 6 ? 0 : index + 1],
      classes: 0,
      assessments: 0,
      quizzes: 0,
      score: 0
    }));

    campus.data.schedule.forEach((event) => {
      const day = workload.find((workloadDay) => workloadDay.dayIndex === event.dayIndex);
      day.classes += 1;
      day.score += 2;
    });

    campus.data.assessments.forEach((assessment) => {
      const dueDate = new Date(assessment.due);
      const day = workload.find((workloadDay) => workloadDay.dayIndex === dueDate.getDay());

      if (day && dueDate >= monday) {
        day.assessments += 1;
        day.quizzes += assessment.type === 'Quiz' ? 1 : 0;
        day.score += assessment.type === 'Quiz' ? 3 : 4;
      }
    });

    return workload;
  }

  function renderWorkload() {
    const workloadList = dashboardPage.querySelector('[data-workload-list]');
    const workload = calculateWorkload();
    const maximumScore = Math.max(...workload.map((day) => day.score), 1);
    const heaviestDay = workload.reduce((heaviest, day) => day.score > heaviest.score ? day : heaviest, workload[0]);
    const lightestDay = workload.reduce((lightest, day) => day.score < lightest.score ? day : lightest, workload[0]);

    workloadList.innerHTML = '';
    workload.forEach((day) => {
      const row = document.createElement('div');
      row.className = 'workload-row';
      row.title = `${day.label}: ${day.classes} classes, ${day.assessments} assessment${day.assessments === 1 ? '' : 's'}`;
      row.innerHTML = `
        <span class="workload-row__day">${day.label}</span>
        <span class="workload-row__track"><span class="workload-row__fill" style="--workload-width: ${(day.score / maximumScore) * 100}%"></span></span>
        <strong class="workload-row__value">${day.score}</strong>
        <span class="workload-row__detail">${day.classes} classes · ${day.assessments} assessments</span>
      `;
      workloadList.appendChild(row);
    });

    dashboardPage.querySelector('[data-heaviest-day]').textContent = heaviestDay.label;
    dashboardPage.querySelector('[data-lightest-day]').textContent = lightestDay.label;
  }

  function getStudyMinutesForDate(date, rowIndex, dayIndex) {
    const baseMinutes = campus.data.studyActivity[rowIndex][dayIndex];
    const dateKey = campus.utils.getLocalDateKey(date);
    const focusMinutes = campus.getFocusSessions()
      .filter((session) => session.completedAt && campus.utils.getLocalDateKey(new Date(session.completedAt)) === dateKey)
      .reduce((total, session) => total + Number(session.minutes || 0), 0);

    return baseMinutes + focusMinutes;
  }

  function getHeatmapIntensity(minutes) {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 90) return 3;
    return 4;
  }

  function showHeatmapTooltip(date, minutes) {
    const tooltip = dashboardPage.querySelector('[data-heatmap-tooltip]');
    tooltip.innerHTML = `<strong>${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong> · ${minutes} focused minutes`;
  }

  function renderStudyHeatmap() {
    const heatmap = dashboardPage.querySelector('[data-study-heatmap]');
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 27);
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    heatmap.innerHTML = '<span></span>';
    dayNames.forEach((dayName) => {
      const label = document.createElement('span');
      label.className = 'heatmap-label heatmap-day-label';
      label.textContent = dayName;
      heatmap.appendChild(label);
    });

    for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
      const weekLabel = document.createElement('span');
      weekLabel.className = 'heatmap-label';
      weekLabel.textContent = `W${rowIndex + 1}`;
      heatmap.appendChild(weekLabel);

      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (rowIndex * 7) + dayIndex);
        const minutes = getStudyMinutesForDate(cellDate, rowIndex, dayIndex);
        const cell = document.createElement('button');
        cell.className = 'heatmap-cell';
        cell.type = 'button';
        cell.dataset.intensity = getHeatmapIntensity(minutes);
        cell.title = `${cellDate.toLocaleDateString()} · ${minutes} focused minutes`;
        cell.setAttribute('aria-label', `${cellDate.toLocaleDateString()} · ${minutes} focused minutes`);
        cell.addEventListener('click', () => showHeatmapTooltip(cellDate, minutes));
        cell.addEventListener('focus', () => showHeatmapTooltip(cellDate, minutes));
        heatmap.appendChild(cell);
      }
    }
  }

  function getEventStatus(milliseconds) {
    if (milliseconds < 86400000) return 'critical';
    if (milliseconds < 259200000) return 'warning';
    return 'normal';
  }

  function renderCriticalEvents() {
    const eventsList = dashboardPage.querySelector('[data-critical-events]');
    const now = new Date();
    const upcomingEvents = campus.data.assessments
      .map((assessment) => ({ ...assessment, date: new Date(assessment.due), course: campus.getCourseById(assessment.courseId) }))
      .filter((assessment) => assessment.date > now)
      .sort((firstEvent, secondEvent) => firstEvent.date - secondEvent.date);

    eventsList.innerHTML = '';
    upcomingEvents.forEach((event) => {
      const status = getEventStatus(event.date - now);
      const item = document.createElement('button');
      item.className = `critical-event event-${status}`;
      item.type = 'button';
      item.innerHTML = `<span class="critical-event__copy"><strong></strong><span></span></span><span class="critical-event__countdown"></span>`;
      item.querySelector('strong').textContent = event.title;
      item.querySelector('.critical-event__copy span').textContent = `${event.course.code} · ${event.type}`;
      item.querySelector('.critical-event__countdown').textContent = campus.utils.formatCountdown(event.date - now);
      item.addEventListener('click', () => { window.location.hash = 'events'; });
      eventsList.appendChild(item);
    });

    const criticalEvent = upcomingEvents[0];
    if (criticalEvent) {
      dashboardPage.querySelector('[data-critical-event]').textContent = criticalEvent.title;
      dashboardPage.querySelector('[data-critical-countdown]').textContent = campus.utils.formatCountdown(criticalEvent.date - now);
    } else {
      dashboardPage.querySelector('[data-critical-event]').textContent = 'No upcoming events';
      dashboardPage.querySelector('[data-critical-countdown]').textContent = 'Schedule is clear';
    }
  }

  function renderDashboard() {
    renderAcademicControlCenter();
    renderLiveTimeline();
    renderWorkload();
    renderStudyHeatmap();
    renderCriticalEvents();
  }

  renderDashboard();
  window.setInterval(() => {
    renderLiveTimeline();
    renderCriticalEvents();
  }, 60000);
  document.addEventListener('campus:focus-session-complete', renderDashboard);
})(window.CampusOS || (window.CampusOS = {}));
