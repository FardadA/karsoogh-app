// public/js/groups.js
export function renderGroups() {
  const section = document.createElement('section');
  section.id = 'groups';
  section.className = 'section';

  section.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">گروه‌ها</h2>
      <button id="add-group-btn" class="p-2 rounded-full hover:bg-gray-700 transition">
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <input id="search-input" type="text" placeholder="جستجوی گروه…" 
           class="w-full mb-4 p-2 rounded border border-gray-600 bg-secondary text-primary" />
    <div class="overflow-x-auto">
      <table class="min-w-full table-auto text-left">
        <thead>
          <tr>
            <th class="px-4 py-2">نام گروه</th>
            <th class="px-4 py-2">امتیاز</th>
          </tr>
        </thead>
        <tbody id="groups-tbody">
          <!-- ردیف‌ها از API بارگذاری می‌شوند -->
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div id="group-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-secondary p-6 rounded-lg w-80">
        <h3 class="text-xl mb-4">افزودن گروه جدید</h3>
        <input id="modal-name" type="text" placeholder="نام گروه" 
               class="w-full mb-3 p-2 rounded border border-gray-600 bg-primary text-primary" />
        <input id="modal-score" type="number" placeholder="امتیاز اولیه (پیش‌فرض ۰)" 
               class="w-full mb-4 p-2 rounded border border-gray-600 bg-primary text-primary" />
        <div class="flex justify-end space-x-2">
          <button id="modal-cancel" class="px-4 py-2 rounded hover:bg-gray-700 transition">انصراف</button>
          <button id="modal-save" class="px-4 py-2 bg-accent-2 rounded hover:bg-green-400 transition">ثبت</button>
        </div>
      </div>
    </div>
  `;

  const tbody       = section.querySelector('#groups-tbody');
  const searchInput = section.querySelector('#search-input');
  const addBtn      = section.querySelector('#add-group-btn');
  const modal       = section.querySelector('#group-modal');
  const nameInput   = section.querySelector('#modal-name');
  const scoreInput  = section.querySelector('#modal-score');
  const cancelBtn   = section.querySelector('#modal-cancel');
  const saveBtn     = section.querySelector('#modal-save');

  // بارگذاری و نمایش گروه‌ها
  async function loadAndRender(filter = '') {
    try {
      const res = await fetch('/api/groups');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const groups = await res.json();
      if (!Array.isArray(groups)) {
        throw new Error('Invalid JSON: expected array');
      }
      tbody.innerHTML = '';
      groups
        .filter(g => g.name.includes(filter))
        .forEach(g => {
          const tr = document.createElement('tr');
          tr.className = 'cursor-pointer hover:bg-gray-800';
          tr.innerHTML = `
            <td class="px-4 py-2">${g.name}</td>
            <td class="px-4 py-2">${g.score}</td>
          `;
          tr.addEventListener('click', () => {
            window.location.href = `/group.html?id=${g.id}`;
          });
          tbody.appendChild(tr);
        });
    } catch (err) {
      console.error('loadAndRender error:', err);
    }
  }

  // فیلتر جستجو
  searchInput.addEventListener('input', e => {
    loadAndRender(e.target.value.trim());
  });

  // باز/بسته کردن مودال
  addBtn.addEventListener('click', () => {
    nameInput.value = '';
    scoreInput.value = '';
    modal.classList.remove('hidden');
    nameInput.focus();
  });
  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // ذخیره گروه جدید
  saveBtn.addEventListener('click', async () => {
    const name  = nameInput.value.trim();
    const score = scoreInput.value.trim();
    if (!name) {
      alert('نام گروه الزامی است');
      return;
    }
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: score || 0 })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      modal.classList.add('hidden');
      loadAndRender(searchInput.value.trim());
    } catch (err) {
      console.error('Error saving group:', err);
    }
  });

  // بارگذاری اولیه
  loadAndRender();

  return section;
}
