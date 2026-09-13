// CampusOS loads scripts with defer, so the DOM is ready when this file runs.
// The dashboard greeting lives here because the requested file structure has no dashboard.js.
function setDashboardGreeting() {
  const greeting = document.querySelector('[data-greeting]');

  if (!greeting) {
    return;
  }

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12
    ? 'Good Morning'
    : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  greeting.textContent = greetingText;
}

setDashboardGreeting();
