// public/js/groupDetail.js
import { renderHeaderAndSidebar } from './menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAndSidebar();

  // --- Group edit elements ---
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
        headers:{ 'Content-Type':'application/json' },
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
    statusBox.textContent = msg;
    statusBox.className = '';
    statusBox.classList.add('mt-2','text-sm','text-center');
    statusBox.classList.add(type==='error'?'text-red-600':'text-gray-600');
  }

  await loadGroup();


  // ============================
  // Student / QR Scanner Section
  // ============================
  const studentsTableBody = document.querySelector('#students-table tbody');
  const addBtn            = document.getElementById('add-student-btn');
  const modal             = document.getElementById('student-modal');
  const closeModalBtn     = document.getElementById('close-modal');
  const cancelBtn         = document.getElementById('cancel-btn');
  const qrReaderElem      = document.getElementById('qr-reader');
  const qrStatus          = document.getElementById('qr-status');
  const resetScanBtn      = document.getElementById('reset-scan-btn');
  const qrInput           = document.getElementById('qrIdentifier');
  const hiddenGroupInput  = document.getElementById('groupId');
  const form              = document.getElementById('student-form');
  const formError         = document.getElementById('form-error');
  const firstNameInput    = document.getElementById('firstName');
  const lastNameInput     = document.getElementById('lastName');
  const genderSelect      = document.getElementById('gender');
  
  let html5QrCode = null;
  let lastResult  = '';
  let overlayEl   = null;
  let isUpdate    = false;
  let updatingStudentId = null;

  async function loadStudents() {
    try {
      const res = await fetch(`/api/groups/${groupId}/students`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      studentsTableBody.innerHTML = '';
      data.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="p-2 border-b">
            <a href="student.html?groupId=${groupId}&studentId=${s.id}"
               class="text-blue-600 hover:underline">
              ${s.firstName} ${s.lastName}
            </a>
          </td>`;
        studentsTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('loadStudents error:', err);
    }
  }

  addBtn.addEventListener('click', () => {
    if (formError) formError.textContent = '';
    hiddenGroupInput.value = groupId;
    form.reset();
    qrStatus.textContent     = '';
    resetScanBtn.classList.add('hidden');
    lastResult               = '';
    isUpdate                 = false;
    updatingStudentId        = null;

    // enforce square mask
    Object.assign(qrReaderElem.style, {
      width:'250px', height:'250px',
      overflow:'hidden', position:'relative'
    });

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    startScanner();
  });

  closeModalBtn.addEventListener('click', closeModalFn);
  cancelBtn.addEventListener('click', closeModalFn);

  async function closeModalFn() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    await stopScanner();
    removeOverlay();
  }

  async function startScanner() {
    try {
      const isLocalhost = ['localhost','127.0.0.1'].includes(window.location.hostname);
      if (!window.isSecureContext && !isLocalhost) {
        throw new Error('Camera access requires HTTPS or localhost.');
      }
      try {
        await navigator.mediaDevices.getUserMedia({
          video:{ facingMode:'environment', width:{ ideal:1280 } }
        });
      } catch {
        await navigator.mediaDevices.getUserMedia({ video:true });
      }
      if (typeof Html5Qrcode === 'undefined') {
        throw new Error('Html5Qrcode library not found.');
      }
      if (html5QrCode) await stopScanner();
      html5QrCode = new Html5Qrcode('qr-reader');
      await html5QrCode.start(
        { facingMode:'environment' },
        { fps:10, qrbox:250 },
        onScanSuccess,
        () => {}
      );
    } catch (err) {
      console.error('Scanner error:', err);
      qrStatus.textContent = err.message;
    }
  }

  // Called when a QR is successfully decoded
  async function onScanSuccess(decodedText) {
    lastResult = decodedText;
    qrInput.value = decodedText;
    qrStatus.textContent = `QR scanned: ${decodedText}`;
    resetScanBtn.classList.remove('hidden');

    if (html5QrCode) {
      try { await html5QrCode.stop() } catch {}
    }
    const vid = qrReaderElem.querySelector('video');
    if (vid) vid.pause();

    // === lookup in global student model ===
    try {
      const res = await fetch(`/api/students/qr/${decodedText}`);
      if (res.ok) {
        const stu = await res.json();
        isUpdate = true;
        updatingStudentId = stu.id;
        // populate for edit
        firstNameInput.value   = stu.firstName;
        lastNameInput.value    = stu.lastName;
        genderSelect.value     = stu.gender;
        hiddenGroupInput.value = groupId;
        qrStatus.textContent  += ' (existing student loaded)';
      }
    } catch (e) {
      console.warn('Global student lookup failed:', e);
    }

    // add dark overlay prompt
    addOverlay();
  }

  // stopScanner: full stop but keep last frame
  async function stopScanner() {
    if (!html5QrCode) return;
    try { await html5QrCode.stop() } catch (e) { console.warn(e) }
    html5QrCode = null;
    removeOverlay();
  }

  // create and show overlay with "Tap to rescan"
  function addOverlay() {
    removeOverlay();
    overlayEl = document.createElement('div');
    Object.assign(overlayEl.style, {
      position:'absolute', top:'0', left:'0',
      width:'100%', height:'100%',
      display:'flex', justifyContent:'center', alignItems:'center',
      color:'#fff', background:'rgba(0,0,0,0.7)',
      fontSize:'16px', cursor:'pointer', userSelect:'none'
    });
    overlayEl.innerText = 'Tap to rescan';
    qrReaderElem.appendChild(overlayEl);
    overlayEl.addEventListener('click', () => {
      lastResult = '';
      qrInput.value = '';
      qrStatus.textContent = '';
      resetScanBtn.classList.add('hidden');
      stopScanner().then(startScanner);
    });
  }

  function removeOverlay() {
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
      overlayEl = null;
    }
  }

  resetScanBtn.addEventListener('click', () => {
    qrStatus.textContent = '';
    resetScanBtn.classList.add('hidden');
    lastResult = '';
    qrInput.value = '';
    stopScanner().then(startScanner);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (formError) formError.textContent = '';

    if (!lastResult) {
      if (formError) formError.textContent = 'Please scan the QR code first.';
      return;
    }

    const payload = {
      qrIdentifier: qrInput.value,
      firstName:    form.firstName.value.trim(),
      lastName:     form.lastName.value.trim(),
      gender:       form.gender.value,
      groupId       // assign/move to this group
    };

    // choose POST or PUT based on duplicate check
    let url = `/api/groups/${groupId}/students`;
    let method = 'POST';
    if (isUpdate && updatingStudentId) {
      url = `/api/students/${updatingStudentId}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      await loadStudents();
      await closeModalFn();
    } catch (err) {
      console.error('Error saving student:', err);
      if (formError) formError.textContent = err.message;
      else alert(err.message);
    }
  });

  loadStudents();
});
