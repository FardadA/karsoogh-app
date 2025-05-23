// public/js/groupDetail.js
import { renderHeaderAndSidebar } from './menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAndSidebar();

  const params      = new URLSearchParams(window.location.search);
  const groupId     = params.get('id');
  const nameInput   = document.getElementById('edit-name');
  const scoreInput  = document.getElementById('edit-score');
  const backBtn     = document.getElementById('back-btn');
  const saveBtn     = document.getElementById('save-btn');
  const statusBox   = document.getElementById('status-msg');

  if (!groupId || !nameInput || !scoreInput || !saveBtn || !backBtn) {
    console.error('Edit group: required elements not found');
    return;
  }

  async function loadGroup() {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const g = await res.json();
      nameInput.value  = g.name ?? '';
      scoreInput.value = g.score ?? '';
    } catch (err) {
      console.error('loadGroup error:', err);
      showStatus('Failed to load group data', 'error');
    }
  }

  backBtn.addEventListener('click', () => {
    window.location.href = '/?section=groups';
  });

  saveBtn.addEventListener('click', async () => {
    const name  = nameInput.value.trim();
    const score = scoreInput.value.trim();

    if (!name) {
      alert('Group name cannot be empty');
      return;
    }

    saveBtn.disabled = true;
    showStatus('Saving...', 'info');

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: score || 0 })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      window.location.href = '/?section=groups';
    } catch (err) {
      console.error('saveGroup error:', err);
      showStatus('Save failed. Please try again.', 'error');
      saveBtn.disabled = false;
    }
  });

  function showStatus(msg, type = 'info') {
    if (!statusBox) return;
    statusBox.textContent = msg;
    statusBox.className = '';
    statusBox.classList.add('mt-2', 'text-sm', 'text-center');
    if (type === 'error') {
      statusBox.classList.add('text-red-600');
    } else {
      statusBox.classList.add('text-gray-600');
    }
  }

  loadGroup();
});
