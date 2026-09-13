// Notifications are calculated from the current local CampusOS data.
(function (campus) {
  const notificationButton = document.querySelector('[data-notification-toggle]');
  let drawerWrap;
  let drawer;
  let notificationList;
  let unreadCount;
  let notifications = [];
  let readNotificationIds = loadReadNotificationIds();
  let lastNotificationTrigger = notificationButton;

  function loadReadNotificationIds() {
    const savedIds = localStorage.getItem(campus.storageKeys.notificationsRead);

    if (!savedIds) {
      return [];
    }

    try {
      const parsedIds = JSON.parse(savedIds);
      return Array.isArray(parsedIds) ? parsedIds : [];
    } catch (error) {
      return [];
    }
  }

  function saveReadNotificationIds() {
    localStorage.setItem(campus.storageKeys.notificationsRead, JSON.stringify(readNotificationIds));
    campus.utils.markLocalSave();
  }

  function getMinutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function createNotifications() {
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentMinutes = getMinutesSinceMidnight(now);
    const generatedNotifications = [];
    const nextClass = campus.data.schedule
      .filter((event) => event.dayIndex === currentDayIndex && event.startMinutes > currentMinutes)
      .sort((firstEvent, secondEvent) => firstEvent.startMinutes - secondEvent.startMinutes)[0];

    if (nextClass) {
      const course = campus.getCourseById(nextClass.courseId);
      const minutesUntilClass = nextClass.startMinutes - currentMinutes;

      if (minutesUntilClass <= 180) {
        generatedNotifications.push({
          id: `class-${campus.utils.getLocalDateKey()}-${nextClass.courseId}-${nextClass.startMinutes}`,
          title: `${course.title} begins in ${minutesUntilClass} minutes.`,
          detail: `${nextClass.start} · ${nextClass.room}`,
          group: 'TODAY',
          color: 'var(--violet-accent)',
          url: 'schedule.html'
        });
      }
    }

    campus.data.assessments.forEach((assessment) => {
      const dueDate = new Date(assessment.due);
      const hoursUntilDue = (dueDate - now) / 3600000;
      const course = campus.getCourseById(assessment.courseId);

      if (hoursUntilDue > 0 && hoursUntilDue <= 48) {
        const dueText = hoursUntilDue < 24 ? 'is due today.' : 'is due tomorrow.';
        generatedNotifications.push({
          id: `assessment-${assessment.id}`,
          title: `${assessment.title} ${dueText}`,
          detail: `${course.code} · ${campus.utils.formatCountdown(dueDate - now)}`,
          group: 'TODAY',
          color: assessment.priority === 'high' ? 'var(--danger)' : 'var(--warning)',
          url: 'index.html#events'
        });
      }
    });

    const atRiskCourse = campus.data.courses.find((course) => {
      const attendance = (course.attendance.attended / course.attendance.total) * 100;
      return attendance < 75;
    });

    if (atRiskCourse) {
      generatedNotifications.push({
        id: `attendance-${atRiskCourse.id}`,
        title: `Attendance in ${atRiskCourse.title} is below 75%.`,
        detail: `${atRiskCourse.attendance.attended} / ${atRiskCourse.attendance.total} classes · Review simulator`,
        group: 'EARLIER',
        color: 'var(--danger)',
        url: 'analytics.html#attendance-risk'
      });
    }

    const todayKey = campus.utils.getLocalDateKey();
    const focusSessionsToday = campus.getFocusSessions().filter((session) => {
      return session.completedAt && campus.utils.getLocalDateKey(new Date(session.completedAt)) === todayKey;
    });
    if (focusSessionsToday.length) {
      generatedNotifications.push({
        id: `focus-${campus.utils.getLocalDateKey()}`,
        title: `You completed ${focusSessionsToday.length} focus session${focusSessionsToday.length === 1 ? '' : 's'} today.`,
        detail: `${focusSessionsToday.reduce((total, session) => total + Number(session.minutes || 0), 0)} focused minutes logged locally`,
        group: 'TODAY',
        color: 'var(--success)',
        url: '#focus'
      });
    }

    return generatedNotifications;
  }

  function updateUnreadBadge() {
    const unreadNotifications = notifications.filter((notification) => !readNotificationIds.includes(notification.id));
    unreadCount.textContent = String(unreadNotifications.length);
    unreadCount.hidden = unreadNotifications.length === 0;
    notificationButton.setAttribute('aria-label', unreadNotifications.length
      ? `View notifications, ${unreadNotifications.length} unread`
      : 'View notifications');
  }

  function createNotificationItem(notification) {
    const item = document.createElement('button');
    item.className = 'notification-item';
    item.type = 'button';
    item.style.setProperty('--notification-color', notification.color);
    item.classList.toggle('is-unread', !readNotificationIds.includes(notification.id));
    item.innerHTML = '<span class="notification-item__title"></span><span class="notification-item__time"></span>';
    item.querySelector('.notification-item__title').textContent = notification.title;
    item.querySelector('.notification-item__time').textContent = notification.detail;
    item.addEventListener('click', () => {
      if (!readNotificationIds.includes(notification.id)) {
        readNotificationIds.push(notification.id);
        saveReadNotificationIds();
      }
      updateUnreadBadge();
      closeNotificationDrawer();
      if (notification.url === '#focus') {
        campus.openFocusMode?.();
      } else {
        window.location.href = notification.url;
      }
    });
    return item;
  }

  function renderNotifications() {
    notifications = createNotifications();
    notificationList.innerHTML = '';
    ['TODAY', 'EARLIER'].forEach((groupName) => {
      const groupNotifications = notifications.filter((notification) => notification.group === groupName);

      if (!groupNotifications.length) {
        return;
      }

      const group = document.createElement('section');
      group.className = 'notification-group';
      group.innerHTML = `<h3 class="notification-group__heading">${groupName}</h3>`;
      const list = document.createElement('div');
      list.className = 'notification-list';
      groupNotifications.forEach((notification) => list.appendChild(createNotificationItem(notification)));
      group.appendChild(list);
      notificationList.appendChild(group);
    });

    if (!notifications.length) {
      notificationList.innerHTML = '<p class="surface-empty-state"><strong>All clear</strong>No urgent local academic signals right now.</p>';
    }

    updateUnreadBadge();
  }

  function openNotificationDrawer() {
    lastNotificationTrigger = document.activeElement;
    renderNotifications();
    drawerWrap.hidden = false;
    drawerWrap.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    window.requestAnimationFrame(() => drawerWrap.classList.add('is-open'));
    drawer.querySelector('[data-notification-close]').focus();
  }

  function closeNotificationDrawer() {
    drawerWrap.classList.remove('is-open');
    drawerWrap.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    window.setTimeout(() => {
      if (!drawerWrap.classList.contains('is-open')) {
        drawerWrap.hidden = true;
      }
    }, 220);

    if (lastNotificationTrigger && typeof lastNotificationTrigger.focus === 'function') {
      lastNotificationTrigger.focus();
    }
  }

  function markAllAsRead() {
    readNotificationIds = notifications.map((notification) => notification.id);
    saveReadNotificationIds();
    renderNotifications();
  }

  function createNotificationDrawer() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="notification-drawer-wrap" data-notification-drawer hidden aria-hidden="true">
        <button class="drawer-scrim" data-notification-close type="button" aria-label="Close notifications"></button>
        <aside class="notification-drawer" role="dialog" aria-modal="true" aria-labelledby="notification-title">
          <div class="notification-drawer__header">
            <div><p class="advanced-kicker">CampusOS / Signals</p><h2 class="advanced-title" id="notification-title">Notification Center</h2></div>
            <button class="surface-close-button" data-notification-close type="button" aria-label="Close notifications">×</button>
          </div>
          <div class="notification-drawer__actions"><button class="notification-mark-read" data-mark-notifications-read type="button">Mark all as read</button></div>
          <div data-notification-list></div>
        </aside>
      </div>
    `);

    drawerWrap = document.querySelector('[data-notification-drawer]');
    drawer = drawerWrap.querySelector('.notification-drawer');
    notificationList = drawerWrap.querySelector('[data-notification-list]');
    drawerWrap.querySelector('[data-mark-notifications-read]').addEventListener('click', markAllAsRead);
    drawerWrap.querySelectorAll('[data-notification-close]').forEach((closeButton) => closeButton.addEventListener('click', closeNotificationDrawer));
    unreadCount = document.createElement('span');
    unreadCount.className = 'notification-count';
    unreadCount.dataset.notificationCount = '';
    unreadCount.hidden = true;
    notificationButton.appendChild(unreadCount);
    renderNotifications();
  }

  if (notificationButton) {
    createNotificationDrawer();
    notificationButton.addEventListener('click', openNotificationDrawer);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !drawerWrap.hidden) {
        closeNotificationDrawer();
      }
    });
    document.addEventListener('campus:focus-session-complete', renderNotifications);
  }
})(window.CampusOS || (window.CampusOS = {}));
