// dashboard.js
export function renderDashboard() {
  const el = document.createElement('section');
  el.id = 'dashboard';
  el.className = 'section';
  el.innerHTML = `
    <h2>بخش داشبورد</h2>
    <div id="dashboard-status" style="margin-top: 1rem;"></div>
    <div id="dashboard-content" class="mt-4 hidden">
      <!-- اینجا بعداً اطلاعات داشبورد بارگذاری می‌شود -->
    </div>
  `;

  loadDashboardData(el);

  return el;
}

async function loadDashboardData(container) {
  const statusBox = container.querySelector('#dashboard-status');
  const contentBox = container.querySelector('#dashboard-content');

  if (!statusBox || !contentBox) return;

  statusBox.textContent = 'در حال بارگذاری اطلاعات...';

  try {
    const res = await fetch('/api/dashboard', { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();

    // اعتبارسنجی ساده روی داده
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid dashboard data');
    }

    // داده را رندر کن (در نسخه‌های بعدی این قسمت جایگزین می‌شود)
    contentBox.innerHTML = `
      <p>اطلاعات با موفقیت بارگذاری شد.</p>
      <!-- داده‌ها در اینجا نمایش داده خواهند شد -->
    `;
    statusBox.textContent = '';
    contentBox.classList.remove('hidden');

  } catch (err) {
    console.error('Dashboard load error:', err);
    statusBox.textContent = 'خطا در بارگذاری داشبورد. لطفاً بعداً دوباره تلاش کنید.';
  }
}
