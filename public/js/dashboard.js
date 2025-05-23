// dashboard.js
export function renderDashboard() {
  const el = document.createElement('section');
  el.id = 'dashboard';
  el.className = 'section';
  el.innerHTML = `
    <h2>بخش داشبورد</h2>
    <!-- اینجا بعداً اطلاعات داشبورد بارگذاری می‌شود -->
  `;
  return el;
}
