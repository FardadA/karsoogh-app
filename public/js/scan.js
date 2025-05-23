// public/js/scan.js
export function renderScan() {
  const section = document.createElement('section');
  section.id = 'scan';
  section.className = 'section flex justify-center items-start';

  section.innerHTML = `
    <div class="container mx-auto text-center">
      <h2 class="text-2xl font-semibold mb-4">Scan Information</h2>
      <div id="scan-content" class="bg-secondary p-4 rounded shadow">
        <!-- Form or scan results will appear here -->
        <p class="text-sm text-gray-400">No content available.</p>
      </div>
    </div>
  `;

  return section;
}
