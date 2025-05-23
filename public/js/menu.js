/**
 * اگر صفحه نیاز به ساخت هدر و سایدبار به‌صورت داینامیک دارد
 * از این تابع استفاده کن (مثلاً در group.html)
 */
export function renderHeaderAndSidebar() {
  const wrapper = document.getElementById('wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = `
    <!-- Header -->
    <header class="bg-secondary sticky top-0 z-30 shadow-md">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button id="menu-toggle"
                  class="hamburger flex flex-col justify-center items-center w-8 h-8 rounded-full hover:bg-gray-700 transition focus:outline-none">
            <span class="line block w-6 h-0.5 bg-white mb-1.5 transition"></span>
            <span class="line block w-6 h-0.5 bg-white mb-1.5 transition"></span>
            <span class="line block w-6 h-0.5 bg-white transition"></span>
          </button>
          <h1 class="text-xl font-bold">
            <span class="text-accent-1">Karsoogh</span><span class="text-accent-2">App</span>
          </h1>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside id="sidebar"
           class="sidebar fixed top-0 left-0 h-full w-64 bg-secondary shadow-lg transform -translate-x-full transition-transform duration-300 z-50">
      <div class="p-4 h-full flex flex-col">
        <div id="user-profile"
             class="flex items-center space-x-3 mb-8 p-3 rounded-lg bg-gray-800">
          <div id="user-avatar"
               class="w-10 h-10 rounded-full bg-gradient-to-r from-accent-1 to-accent-2 flex items-center justify-center">
            <span id="user-initials" class="font-bold text-sm"></span>
          </div>
          <div>
            <p id="profile-name" class="font-medium text-sm"></p>
            <p id="profile-role" class="text-xs text-secondary">کاربر</p>
          </div>
        </div>
        <nav class="flex-1 overflow-y-auto">
          <ul class="space-y-1">
            <li class="nav-item flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition cursor-pointer">
              <i class="fas fa-home w-5 text-accent-1"></i><a href="/" class="block">خانه</a>
            </li>
          </ul>
        </nav>
        <div class="mt-auto">
          <button id="logout" class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition">
            <i class="fas fa-sign-out-alt w-5 text-red-400"></i><span class="text-red-400">خروج</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div id="overlay"
         class="overlay fixed inset-0 bg-black bg-opacity-50 opacity-0 invisible transition-opacity duration-300 z-40"></div>
  `;

  initMenuEvents();
}

/**
 * در صفحات معمولی (مثل index.html) منطق کلیک را فعال می‌کند
 */
document.addEventListener('DOMContentLoaded', () => {
  initMenuEvents();

  // اگر اطلاعات کاربر موجود بود، نمایش بده (اینجا تستی هست)
  const profileNameEl  = document.getElementById('profile-name');
  const userInitialsEl = document.getElementById('user-initials');
  if (profileNameEl && userInitialsEl) {
    const user = { firstName: 'علی', lastName: 'رضایی' };
    profileNameEl.textContent = `${user.firstName} ${user.lastName}`;
    userInitialsEl.textContent = (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
});

/**
 * اتصال event ها به همبرگر منو و اورلی
 */
function initMenuEvents() {
  const toggleBtn = document.getElementById('menu-toggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');

  if (!toggleBtn || !sidebar || !overlay) return;

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('active');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    toggleBtn.classList.remove('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}
