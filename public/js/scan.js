export function renderScan() {
  const section = document.createElement('section');
  section.id = 'scan';
  section.className = 'section';

  section.innerHTML = `
    <h2 class="text-2xl font-semibold mb-4">بخش اسکن اطلاعات</h2>
    <div id="scan-content" class="bg-secondary p-4 rounded shadow">
      <!-- اینجا فرم یا نتیجه اسکن قرار می‌گیرد -->
      <p class="text-sm text-gray-400">در حال حاضر محتوایی وجود ندارد.</p>
    </div>
  `;

  return section;
}
