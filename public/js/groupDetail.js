import { renderHeaderAndSidebar } from './menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAndSidebar();

  const params       = new URLSearchParams(window.location.search);
  const groupId      = params.get('id');
  const nameInput    = document.getElementById('edit-name');
  const scoreInput   = document.getElementById('edit-score');
  const backBtn      = document.getElementById('back-btn');
  const saveBtn      = document.getElementById('save-btn');

  async function loadGroup() {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const g = await res.json();
      nameInput.value  = g.name;
      scoreInput.value = g.score;
    } catch (err) {
      console.error('loadGroup error:', err);
    }
  }

  backBtn?.addEventListener('click', () => {
    window.location.href = '/?section=groups';
  });

  saveBtn?.addEventListener('click', async () => {
    const name  = nameInput.value.trim();
    const score = scoreInput.value.trim();
    if (!name) return alert('نام گروه نمی‌تواند خالی باشد');
    await fetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: score || 0 })
    });
    window.location.href = '/?section=groups';
  });

  loadGroup();
});
