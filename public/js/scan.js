// scan.js
export function renderScan() {
  const el = document.createElement('section');
  el.id = 'scan';
  el.className = 'section';
  el.innerHTML = `
    <h2>بخش اسکن اطلاعات</h2>
    <!-- اینجا بعداً فرم یا نتیجه اسکن قرار می‌گیرد -->
  `;
  return el;
}
