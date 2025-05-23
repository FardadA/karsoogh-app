import { renderHeaderAndSidebar } from './menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAndSidebar();

  const params       = new URLSearchParams(window.location.search);
  const groupId      = params.get('id');
  const nameInput    = document.getElementById('edit-name');
  const scoreInput   = document.getElementById('edit-score');
  const backBtn      = document.getElementById('back-btn');
  const saveBtn      = document.getElementById('save-btn');
  const statusBox    = document.getElementById('status-msg');

  if (!groupId || !nameInput || !scoreInput || !saveBtn || !backBtn) {
    console.error('Edit group: عناصر مورد نیاز یافت نشدند');
    return;
  }

  async function loadGroup() {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const g = await res.json();
      nameInput.value  = g.name ?? '';
      scoreInput.value = g.score ?? '';
    } catch (err) {
      console.error('loadGroup error:', err);
      showStatus('خطا در بارگذاری اطلاعات گروه', 'error');
    }
  }

  backBtn.addEventListener('click', () => {
    window.location.href = '/?section=groups';
  });

  saveBtn.addEventListener('click', async () => {
    const name  = nameInput.value.trim();
    const score = scoreInput.value.trim();

    if (!name) {
      alert('نام گروه نمی‌تواند خالی باشد');
      return;
    }

    saveBtn.disabled = true;
    showStatus('در حال ذخیره‌سازی...', 'info');

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: score || 0 })
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      window.location.href = '/?section=groups';
    } catch (err) {
      console.error('saveGroup error:', err);
      showStatus('ذخیره‌سازی انجام نشد. لطفاً دوباره تلاش کنید.', 'error');
      saveBtn.disabled = false;
    }
  });

  function showStatus(msg, type = 'info') {
    if (!statusBox) return;
    statusBox.textContent = msg;
    statusBox.className = '';
    statusBox.classList.add('mt-2', 'text-sm');
    if (type === 'error') {
      statusBox.classList.add('text-red-600');
    } else {
      statusBox.classList.add('text-gray-600');
    }
  }

  loadGroup();
});
