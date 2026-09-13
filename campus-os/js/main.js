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
