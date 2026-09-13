// ========================
// Navigation and Mobile Drawer
// ========================

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

const sidebar = document.querySelector('[data-sidebar]');
const sidebarOpenButton = document.querySelector('[data-sidebar-open]');
const sidebarCloseButton = document.querySelector('[data-sidebar-close]');
const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

function openSidebar() {
  document.body.classList.add('sidebar-open');
  sidebarOpenButton.setAttribute('aria-expanded', 'true');
  sidebarOverlay.setAttribute('aria-hidden', 'false');
  sidebarOverlay.removeAttribute('tabindex');
  sidebarCloseButton.focus();
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  sidebarOpenButton.setAttribute('aria-expanded', 'false');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
  sidebarOverlay.setAttribute('tabindex', '-1');

  if (sidebar.contains(document.activeElement)) {
    sidebarOpenButton.focus();
  }
}

if (sidebar && sidebarOpenButton && sidebarCloseButton && sidebarOverlay) {
  sidebarOpenButton.addEventListener('click', openSidebar);
  sidebarCloseButton.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  pageLinks.forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });
}

