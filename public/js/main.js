import { renderDashboard } from './dashboard.js';
import { renderGroups }    from './groups.js';
import { renderScan }      from './scan.js';

// المان‌های اصلی
const main           = document.getElementById('main-content');
const toggleBtn      = document.getElementById('menu-toggle');
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('overlay');
const navItems       = document.querySelectorAll('#sidebar .nav-item[data-section]');
const logoutBtn      = document.getElementById('logout');
const profileNameEl  = document.getElementById('profile-name');
const userInitialsEl = document.getElementById('user-initials');

/**
 * بارگذاری اطلاعات کاربر از سرور
 */
async function loadUser() {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const { firstName = '', lastName = '' } = data?.user || {};

    profileNameEl.textContent = `${firstName} ${lastName}`.trim() || 'کاربر';
    userInitialsEl.textContent = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();
  } catch (err) {
    console.error('خطا در بارگذاری اطلاعات کاربر:', err);
    profileNameEl.textContent = 'کاربر';
    userInitialsEl.textContent = '';
  }
}

/**
 * مدیریت باز/بسته شدن سایدبار
 */
function openSidebar() {
  sidebar?.classList.add('open');
  overlay?.classList.add('open');
  toggleBtn?.classList.add('active');
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
  toggleBtn?.classList.remove('active');
}

toggleBtn?.addEventListener('click', () => {
  sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay?.addEventListener('click', closeSidebar);

main?.addEventListener('click', e => {
  if (!sidebar?.contains(e.target)) closeSidebar();
});

/**
 * رندر و سویچ بخش‌ها
 */
const sections = {
  dashboard: renderDashboard(),
  groups:    renderGroups(),
  scan:      renderScan()
};

// append اولیه و پنهان سازی همه سکشن‌ها
Object.values(sections).forEach(sec => {
  sec.classList.add('section');
  main?.appendChild(sec);
});

function activateSection(key) {
  if (!sections[key]) return;

  // مخفی کردن تمام سکشن‌ها
  Object.values(sections).forEach(s => {
    s.classList.remove('active');
  });

  // نمایش سکشن فعال
  sections[key].classList.add('active');

  // هایلایت منو
  navItems.forEach(i => i.classList.remove('bg-gray-700'));
  document
    .querySelector(`#sidebar .nav-item[data-section="${key}"]`)
    ?.classList.add('bg-gray-700');

  // ذخیره در لوکال‌استوریج
  localStorage.setItem('activeSection', key);

  // بستن سایدبار
  closeSidebar();

  // پاک کردن پارامتر URL
  const url = new URL(window.location.href);
  if (url.searchParams.has('section')) {
    url.searchParams.delete('section');
    history.replaceState({}, '', url.toString());
  }

  // اسکرول به بالا
  window.scrollTo(0, 0);
}

navItems.forEach(item => {
  item.addEventListener('click', () => activateSection(item.dataset.section));
});

/**
 * منطق خروج از حساب
 */
logoutBtn?.addEventListener('click', () => {
  window.location.href = '/logout';
});

// مقداردهی اولیه
loadUser();
const urlParams       = new URLSearchParams(window.location.search);
const initialSection  = urlParams.get('section') || localStorage.getItem('activeSection') || 'dashboard';
activateSection(initialSection);
