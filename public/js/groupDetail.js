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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

  // ============================
  // Student section starts here
  // ============================
  const studentsTableBody = document.querySelector('#students-table tbody');
  const addBtn            = document.getElementById('add-student-btn');
  const modal             = document.getElementById('student-modal');
  const closeModal        = document.getElementById('close-modal');
  const cancelBtn         = document.getElementById('cancel-btn');
  const qrReaderElem      = document.getElementById('qr-reader');
  const qrStatus          = document.getElementById('qr-status');
  const resetScanBtn      = document.getElementById('reset-scan-btn');
  const qrInput           = document.getElementById('qrIdentifier');
  const hiddenGroupInput  = document.getElementById('groupId');
  const form              = document.getElementById('student-form');
  let html5QrCode, lastResult = '';

  async function loadStudents() {
    try {
      const res = await fetch(`/api/groups/${groupId}/students`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      studentsTableBody.innerHTML = '';
      data.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="p-2 border-b">${s.firstName} ${s.lastName}</td>`;
        studentsTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('loadStudents error:', err);
    }
  }

  addBtn.addEventListener('click', () => {
    hiddenGroupInput.value = groupId;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    startScanner();
  });

  closeModal.addEventListener('click', closeModalFn);
  cancelBtn.addEventListener('click', closeModalFn);

  function closeModalFn() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    stopScanner();
    form.reset();
    qrStatus.textContent = '';
    resetScanBtn.classList.add('hidden');
    lastResult = '';
  }

  async function startScanner() {
    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSecure = window.isSecureContext;

      if (!isSecure && !isLocalhost) {
        throw new Error('Camera access requires HTTPS or localhost.');
      }

      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

      if (typeof Html5Qrcode === 'undefined') {
        throw new Error('Html5Qrcode library not found. Make sure <script src="https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js"></script> is included before this module.');
      }

      if (html5QrCode) {
        await html5QrCode.stop().catch(() => {});
        html5QrCode.clear().catch(() => {});
      }

      html5QrCode = new Html5Qrcode('qr-reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        decodedText => {
          lastResult = decodedText;
          qrInput.value = decodedText;
          html5QrCode.stop().then(() => {
            qrStatus.textContent = `QR scanned: ${decodedText}`;
            resetScanBtn.classList.remove('hidden');
          });
        },
        errorMessage => {
          // optional: handle scanning errors here
        }
      );
    } catch (err) {
      console.error('Error accessing camera or starting scanner:', err);
      qrStatus.textContent = 'Cannot access camera. Ensure you are using HTTPS or localhost, and grant permission.';
    }
  }

  function stopScanner() {
    if (html5QrCode) {
      html5QrCode.stop().catch(() => {});
      html5QrCode.clear().catch(() => {});
    }
  }

  resetScanBtn.addEventListener('click', () => {
    qrStatus.textContent = '';
    resetScanBtn.classList.add('hidden');
    qrInput.value = '';
    lastResult = '';
    startScanner();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!lastResult) {
      alert('Please scan the QR code first.');
      return;
    }
    const payload = {
      qrIdentifier: qrInput.value,
      firstName:    form.firstName.value.trim(),
      lastName:     form.lastName.value.trim(),
      gender:       form.gender.value
    };
    try {
      const res = await fetch(`/api/groups/${groupId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadStudents();
      closeModalFn();
    } catch (err) {
      console.error('Error creating student:', err);
      alert('Registration failed. Please try again.');
    }
  });

  loadStudents();
});
