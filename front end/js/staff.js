// staff.js – FIXED button selectors to match HTML IDs

const STAFF_API_BASE = 'http://localhost:8080/api/staff';

let staffInitDone = false;

function initStaffPage(root) {
  if (staffInitDone) return;
  staffInitDone = true;

  console.log('✅ Initializing staff page...', root);

  // ✅ FIXED: Correct button IDs from HTML
  const staffListBtn = root.querySelector('#staffListBtn');
  const staffAddBtn = root.querySelector('#staffAddBtn');
  const meetingsHistoryBtn = root.querySelector('#meetingsHistoryBtn');
  const meetingsScheduleBtn = root.querySelector('#meetingsScheduleBtn');

  const staffListPanel = root.querySelector('#staffListPanel');
  const staffAddPanel = root.querySelector('#staffAddPanel');
  const meetingsPanel = root.querySelector('#meetingsPanel');

  const searchInput = root.querySelector('#staffSearchInput');
  const searchBtn = root.querySelector('#staffSearchBtn');
  const sortSelect = root.querySelector('#staffSortSelect');

  const addForm = root.querySelector('#staffAddForm');
  const addStatus = root.querySelector('#staffAddStatus');

  const meetingForm = root.querySelector('#meetingForm');
  const meetingStatus = root.querySelector('#meetingStatus');
  const meetingStaffIdInput = root.querySelector('#meetingStaffId');

  console.log('Buttons found:', {
    staffListBtn: !!staffListBtn,
    staffAddBtn: !!staffAddBtn,
    meetingsHistoryBtn: !!meetingsHistoryBtn,
    meetingsScheduleBtn: !!meetingsScheduleBtn
  });

  function showPanel(panel) {
    [staffListPanel, staffAddPanel, meetingsPanel].forEach(p => {
      if (!p) return;
      p.style.display = (p === panel) ? 'block' : 'none';
    });
  }

  // ✅ FIXED: Event listeners with null checks
  if (staffListBtn) {
    staffListBtn.addEventListener('click', () => {
      console.log('Show Staff List clicked');
      showPanel(staffListPanel);
      loadStaff();
    });
  }

  if (staffAddBtn) {
    staffAddBtn.addEventListener('click', () => {
      console.log('Add Staff clicked');
      showPanel(staffAddPanel);
      if (addStatus) addStatus.textContent = '';
    });
  }

  if (meetingsHistoryBtn) {
    meetingsHistoryBtn.addEventListener('click', () => {
      console.log('Meeting History clicked');
      showPanel(meetingsPanel);
      if (meetingStatus) meetingStatus.textContent = '';
      const currentId = meetingStaffIdInput?.value;
      if (currentId) loadMeetings(currentId);
    });
  }

  if (meetingsScheduleBtn) {
    meetingsScheduleBtn.addEventListener('click', () => {
      console.log('Schedule Meeting clicked');
      showPanel(meetingsPanel);
      if (meetingStatus) meetingStatus.textContent = '';
    });
  }

  // Search + sort
  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value;
    const sort = sortSelect.value;
    loadStaff(q, undefined, sort);
  });

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const sort = sortSelect.value;
      loadStaff(e.target.value, undefined, sort);
    }
  });

  sortSelect?.addEventListener('change', e => {
    const q = searchInput.value;
    loadStaff(q, undefined, e.target.value);
  });

  // Add staff
  addForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!addStatus) return;
    addStatus.textContent = 'Saving...';

    const payload = {
      name: addForm.name.value,
      role: addForm.role.value,
      department: addForm.department.value,
      status: addForm.status.value,
      salary: Number(addForm.salary.value)
    };

    try {
      const res = await fetch(STAFF_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      addStatus.textContent = '✅ Staff added successfully.';
      addForm.reset();
      addForm.salary.value = 50000;
      setTimeout(() => {
        showPanel(staffListPanel);
        loadStaff();
      }, 1000);
    } catch (err) {
      console.error(err);
      addStatus.textContent = '❌ Error adding staff.';
    }
  });

  // Schedule meeting
  meetingForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!meetingStatus) return;
    meetingStatus.textContent = 'Scheduling...';

    const staffId = meetingForm.staffId.value.trim();
    if (!staffId) {
      meetingStatus.textContent = 'Staff ID required.';
      return;
    }

    const payload = {
      title: meetingForm.title.value,
      notes: meetingForm.notes.value
    };

    try {
      const res = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(staffId)}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Schedule failed');
      meetingStatus.textContent = '✅ Meeting scheduled.';
      meetingForm.reset();
      meetingForm.staffId.value = staffId;
      await loadMeetings(staffId);
    } catch (err) {
      console.error(err);
      meetingStatus.textContent = '❌ Error scheduling meeting.';
    }
  });

  console.log('✅ Staff page initialized successfully');
}

/* ===== Loaders (unchanged) ===== */

async function loadStaff(query, department, sort) {
  const tbody = document.querySelector('#staffTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  let url = `${STAFF_API_BASE}?`;
  if (query && query.trim()) url += `q=${encodeURIComponent(query.trim())}&`;
  if (department && department.trim()) url += `dept=${encodeURIComponent(department.trim())}&`;
  if (sort) url += `sort=${sort}`;

  try {
    const res = await fetch(url);
    const staff = await res.json();

    if (!staff.length) {
      tbody.innerHTML = '<tr><td colspan="5">No staff found.</td></tr>';
      return;
    }

    tbody.innerHTML = staff.map(s => `
      <tr data-staff-id="${s.id}" style="cursor: pointer;">
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.department}</td>
        <td>${s.role}</td>
        <td>₹${s.salary.toLocaleString()}</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-staff-id');
        loadStaffDetails(id);
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5">Failed to load staff.</td></tr>';
  }
}

async function loadStaffDetails(id) {
  const card = document.querySelector('#staffDetails');
  const meetingStaffIdInput = document.querySelector('#meetingStaffId');
  if (!card) return;

  card.innerHTML = '<p>Loading...</p>';

  try {
    const res = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Not found');
    const s = await res.json();

    if (meetingStaffIdInput) meetingStaffIdInput.value = s.id;

    card.innerHTML = `
      <div class="staff-details-header">
        <div class="staff-avatar">${s.avatarInitials || s.name.charAt(0)}</div>
        <div>
          <h4>${s.name}</h4>
          <p class="staff-meta">${s.role} · ${s.department}</p>
        </div>
      </div>
      <p><strong>ID:</strong> ${s.id}</p>
      <p><strong>Status:</strong> ${s.status}</p>
      <p><strong>Salary:</strong> ₹${s.salary.toLocaleString()}</p>

      <div class="staff-details-actions">
        <button class="btn-outline" id="staffDeptBtn">Change Department</button>
        <button class="btn-outline" id="staffHikeBtn">Hike Salary</button>
        <button class="btn-outline" id="staffMeetingsBtn">View Meetings</button>
        <button class="btn-primary" id="staffDeleteBtn">Remove Staff</button>
      </div>

      <div class="staff-details-forms">
        <label>
          New department:
          <input type="text" id="staffDeptInput" placeholder="e.g. Assembly" />
        </label>
        <label>
          Hike (%):
          <input type="number" id="staffHikeInput" placeholder="e.g. 10" />
        </label>
      </div>
      <span class="form-status" id="staffDetailsStatus"></span>
    `;

    const deptBtn = document.querySelector('#staffDeptBtn');
    const hikeBtn = document.querySelector('#staffHikeBtn');
    const meetingsBtn = document.querySelector('#staffMeetingsBtn');
    const deleteBtn = document.querySelector('#staffDeleteBtn');
    const deptInput = document.querySelector('#staffDeptInput');
    const hikeInput = document.querySelector('#staffHikeInput');
    const statusEl = document.querySelector('#staffDetailsStatus');

    deptBtn.addEventListener('click', async () => {
      if (!deptInput.value.trim()) {
        statusEl.textContent = 'Enter a department.';
        return;
      }
      statusEl.textContent = 'Updating department...';
      try {
        const res = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(s.id)}/department`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ department: deptInput.value.trim() })
        });
        if (!res.ok) throw new Error('Update failed');
        statusEl.textContent = '✅ Department updated.';
        await loadStaff();
        await loadStaffDetails(s.id);
      } catch (err) {
        console.error(err);
        statusEl.textContent = '❌ Error updating department.';
      }
    });

    hikeBtn.addEventListener('click', async () => {
      const percent = Number(hikeInput.value);
      if (!percent) {
        statusEl.textContent = 'Enter hike percentage.';
        return;
      }
      statusEl.textContent = 'Updating salary...';
      try {
        const res = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(s.id)}/salary/hike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ percent })
        });
        if (!res.ok) throw new Error('Hike failed');
        statusEl.textContent = '✅ Salary updated.';
        await loadStaff();
        await loadStaffDetails(s.id);
      } catch (err) {
        console.error(err);
        statusEl.textContent = '❌ Error updating salary.';
      }
    });

    meetingsBtn.addEventListener('click', async () => {
      const meetingsPanel = document.querySelector('#meetingsPanel');
      if (meetingsPanel) meetingsPanel.style.display = 'block';
      if (meetingStaffIdInput) meetingStaffIdInput.value = s.id;
      await loadMeetings(s.id);
    });

    deleteBtn.addEventListener('click', () => {
      showStaffConfirmModal(
        'Remove staff',
        `Are you sure you want to remove ${s.name} (${s.id})?`,
        async () => {
          statusEl.textContent = 'Removing...';
          try {
            const delRes = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(s.id)}`, {
              method: 'DELETE'
            });
            if (!delRes.ok) throw new Error('Delete failed');
            statusEl.textContent = '✅ Staff removed.';
            await loadStaff();
            card.innerHTML = '<h4>Staff details</h4><p>Select a staff member from the list.</p>';
          } catch (err) {
            console.error(err);
            statusEl.textContent = '❌ Error removing staff.';
          }
        }
      );
    });

  } catch (err) {
    console.error(err);
    card.innerHTML = '<p>Failed to load details.</p>';
  }
}

async function loadMeetings(staffId) {
  const list = document.querySelector('#meetingList');
  if (!list) return;
  list.innerHTML = '<li>Loading...</li>';

  try {
    const res = await fetch(`${STAFF_API_BASE}/${encodeURIComponent(staffId)}/meetings`);
    const meetings = await res.json();

    if (!meetings.length) {
      list.innerHTML = '<li>No meetings found for this staff.</li>';
      return;
    }

    list.innerHTML = meetings.map(m => `
      <li>
        <strong>${m.title}</strong><br/>
        <span class="help-text">${new Date(m.scheduledAt).toLocaleString()}</span><br/>
        <span>${m.notes}</span>
      </li>
    `).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Failed to load meetings.</li>';
  }
}

/* ===== Custom confirm modal ===== */

function showStaffConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('staffConfirmModal');
  const titleEl = document.getElementById('staffConfirmTitle');
  const msgEl = document.getElementById('staffConfirmMessage');
  const okBtn = document.getElementById('staffConfirmOkBtn');
  const cancelBtn = document.getElementById('staffConfirmCancelBtn');

  if (!modal || !titleEl || !msgEl || !okBtn || !cancelBtn) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  modal.style.display = 'flex';

  const cleanup = () => {
    modal.style.display = 'none';
    okBtn.removeEventListener('click', okHandler);
    cancelBtn.removeEventListener('click', cancelHandler);
  };

  const okHandler = () => {
    cleanup();
    if (typeof onConfirm === 'function') onConfirm();
  };

  const cancelHandler = () => {
    cleanup();
  };

  okBtn.addEventListener('click', okHandler);
  cancelBtn.addEventListener('click', cancelHandler);
}

/* ===== SPA hook ===== */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  // Check if staff page already loaded
  const existing = container.querySelector('.staff-page');
  if (existing) {
    console.log('Staff page already in DOM');
    initStaffPage(existing);
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('staff-page')) {
          console.log('Staff page injected via observer');
          initStaffPage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});
