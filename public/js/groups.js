// public/js/groups.js
export function renderGroups() {
  const section = document.createElement('section');
  section.id = 'groups';
  section.className = 'section flex justify-center items-start min-h-screen py-8';

  section.innerHTML = `
    <div class="container mx-auto text-center">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Groups</h2>
        <button id="add-group-btn" class="p-2 rounded-full hover:bg-gray-700 transition">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <input id="search-input" type="text" placeholder="Search groups..." 
             class="w-full mb-4 p-2 rounded border border-gray-600 bg-secondary text-primary" />
      <div id="status-msg" class="mb-4 text-sm text-red-500 hidden"></div>
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto text-center mx-auto">
          <thead>
            <tr>
              <th class="px-4 py-2">Group Name</th>
              <th class="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody id="groups-tbody">
            <!-- rows loaded from API -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div id="group-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-secondary p-6 rounded-lg w-80 text-center">
        <h3 class="text-xl mb-4">Add New Group</h3>
        <input id="modal-name" type="text" placeholder="Group Name" 
               class="w-full mb-3 p-2 rounded border border-gray-600 bg-primary text-primary" />
        <input id="modal-score" type="number" placeholder="Initial Score (default 0)" 
               class="w-full mb-4 p-2 rounded border border-gray-600 bg-primary text-primary" />
        <div class="flex justify-center space-x-2">
          <button id="modal-cancel" class="px-4 py-2 rounded hover:bg-gray-700 transition">Cancel</button>
          <button id="modal-save" class="px-4 py-2 bg-accent-2 rounded hover:bg-green-400 transition">Save</button>
        </div>
        <div id="modal-error" class="text-sm text-red-500 mt-2 hidden"></div>
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
  const statusBox   = section.querySelector('#status-msg');
  const modalError  = section.querySelector('#modal-error');

  function showStatus(msg = '', isError = true) {
    statusBox.textContent = msg;
    statusBox.classList.toggle('hidden', !msg);
    statusBox.classList.toggle('text-red-500', isError);
    statusBox.classList.toggle('text-green-500', !isError);
  }

  function showModalError(msg = '') {
    modalError.textContent = msg;
    modalError.classList.toggle('hidden', !msg);
  }

  async function loadAndRender(filter = '') {
    showStatus('Loading groups...', false);
    try {
      const res = await fetch('/api/groups');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const groups = await res.json();
      if (!Array.isArray(groups)) throw new Error('Invalid JSON: expected array');

      tbody.innerHTML = '';
      groups
        .filter(g => g.name.toLowerCase().includes(filter.toLowerCase()))
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

      showStatus('', false);
    } catch (err) {
      console.error('loadAndRender error:', err);
      showStatus('Failed to load groups.', true);
    }
  }

  searchInput?.addEventListener('input', e => {
    loadAndRender(e.target.value.trim());
  });

  addBtn?.addEventListener('click', () => {
    nameInput.value = '';
    scoreInput.value = '';
    showModalError('');
    modal.classList.remove('hidden');
    nameInput.focus();
  });

  cancelBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  saveBtn?.addEventListener('click', async () => {
    const name  = nameInput.value.trim();
    const score = scoreInput.value.trim();
    if (!name) {
      showModalError('Group name is required');
      return;
    }

    saveBtn.disabled = true;
    showModalError('Saving...');

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
      showModalError('Could not save group. Please try again.');
    } finally {
      saveBtn.disabled = false;
    }
  });

  loadAndRender();

  return section;
}
