// public/js/dashboard.js
export function renderDashboard() {
  const el = document.createElement('section');
  el.id = 'dashboard';
  el.className = 'section flex justify-center items-start';

  el.innerHTML = `
    <div class="container mx-auto text-center">
      <h2 class="text-2xl font-semibold mb-4">Dashboard</h2>
      <div id="dashboard-status" class="mb-4"></div>
      <div id="dashboard-content" class="mt-4">
        <!-- Dashboard is currently empty -->
        <p>No data to display.</p>
      </div>
    </div>
  `;

  return el;
}
