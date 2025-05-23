export function renderDashboard() {
  const section = document.createElement('section');
  section.id = 'dashboard';
  section.className = 'section flex justify-center items-start min-h-screen py-8';

  section.innerHTML = `
    <div class="container mx-auto text-center">
      <h2 class="text-2xl font-semibold mb-4">Dashboard</h2>
      <div id="dashboard-status" class="mb-4"></div>
      <div id="dashboard-content" class="mt-4">
        <!-- Dashboard is currently empty -->
        <p>No data to display.</p>
      </div>
    </div>
  `;

  return section;
}
