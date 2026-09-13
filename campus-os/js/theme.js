// ========================
// Theme Initialization
// ========================

const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeCampus = window.CampusOS || (window.CampusOS = {});
const themeStorageKey = themeCampus.storageKeys.theme;
const savedTheme = localStorage.getItem(themeStorageKey);

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

  localStorage.setItem(themeStorageKey, nextTheme);
  themeCampus.utils.markLocalSave();
  applyTheme(nextTheme);
});

