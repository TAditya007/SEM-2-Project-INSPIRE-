// management.js – SPA-safe management page logic with custom modal + cards

const MGMT_API_BASE = 'http://localhost:8080/api/management';

let mgmtInitialized = false;

/* ===== Entry: Initialize when management-page is injected ===== */

function initManagementPage(root) {
  if (mgmtInitialized) return;
  mgmtInitialized = true;

  /* ---- Buttons ---- */
  const machinesExistingBtn = root.querySelector('#machinesExistingBtn');
  const machinesAddBtn = root.querySelector('#machinesAddBtn');
  const linesExistingBtn = root.querySelector('#linesExistingBtn');
  const linesAddBtn = root.querySelector('#linesAddBtn');

  /* ---- Panels ---- */
  const machinesExistingPanel = root.querySelector('#machinesExistingPanel');
  const machinesAddPanel = root.querySelector('#machinesAddPanel');
  const linesExistingPanel = root.querySelector('#linesExistingPanel');
  const linesAddPanel = root.querySelector('#linesAddPanel');

  /* ---- Machines controls ---- */
  const searchInput = root.querySelector('#machineSearchInput');
  const searchBtn = root.querySelector('#machineSearchBtn');
  const sortSelect = root.querySelector('#machineSortSelect');

  const addForm = root.querySelector('#machineAddForm');
  const addStatus = root.querySelector('#machineAddStatus');

  /* ---- Lines controls ---- */
  const lineForm = root.querySelector('#lineAddForm');
  const lineStatus = root.querySelector('#lineAddStatus');
  const lineSelect = root.querySelector('#lineMachineSelect');
  const linePreview = root.querySelector('#linePreview');

  /* ---- Panel switch helper ---- */
  function showPanel(target) {
    [
      machinesExistingPanel,
      machinesAddPanel,
      linesExistingPanel,
      linesAddPanel
    ].forEach(p => {
      if (!p) return;
      p.style.display = (p === target) ? 'block' : 'none';
    });
  }

  /* ===== Top-level nav buttons ===== */

  machinesExistingBtn?.addEventListener('click', () => {
    showPanel(machinesExistingPanel);
    loadMachines();
  });

  machinesAddBtn?.addEventListener('click', () => {
    showPanel(machinesAddPanel);
    if (addStatus) addStatus.textContent = '';
  });

  linesExistingBtn?.addEventListener('click', () => {
    showPanel(linesExistingPanel);
    loadLines();
  });

  linesAddBtn?.addEventListener('click', () => {
    showPanel(linesAddPanel);
    if (lineStatus) lineStatus.textContent = '';
    loadMachinesForLines();
    loadLines();
  });

  /* ===== Machines: search + sort ===== */

  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value;
    const sort = sortSelect.value;
    loadMachines(q, sort);
  });

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const sort = sortSelect.value;
      loadMachines(e.target.value, sort);
    }
  });

  sortSelect?.addEventListener('change', e => {
    const q = searchInput.value;
    loadMachines(q, e.target.value);
  });

  /* ===== Machines: add ===== */

  addForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!addStatus) return;
    addStatus.textContent = 'Saving...';

    const payload = {
      name: addForm.name.value,
      type: addForm.type.value,
      department: addForm.department.value,
      status: addForm.status.value,
      efficiency: Number(addForm.efficiency.value)
    };

    try {
      const res = await fetch(`${MGMT_API_BASE}/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');

      addStatus.textContent = 'Machine added successfully.';
      addForm.reset();
      addForm.efficiency.value = 85;

      await loadMachines();
      await loadMachinesForLines();
    } catch (err) {
      console.error(err);
      addStatus.textContent = 'Error adding machine.';
    }
  });

  /* ===== Lines: builder preview ===== */

  lineSelect?.addEventListener('change', () => {
    const ids = Array.from(lineSelect.selectedOptions).map(o => o.value);
    linePreview.textContent = ids.length
      ? ids.join(' → ')
      : 'No machines selected yet.';
  });

  /* ===== Lines: create ===== */

  lineForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!lineStatus) return;
    lineStatus.textContent = 'Saving...';

    const machineIds = Array.from(lineSelect.selectedOptions).map(o => o.value);
    const payload = {
      name: lineForm.name.value,
      product: lineForm.product.value,
      machineIds
    };

    try {
      const res = await fetch(`${MGMT_API_BASE}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');

      lineStatus.textContent = 'Line created successfully.';
      lineForm.reset();
      linePreview.textContent = 'No machines selected yet.';
      await loadLines();
    } catch (err) {
      console.error(err);
      lineStatus.textContent = 'Error creating line.';
    }
  });

  console.log('Management page initialized');
}

/* =======================================================
   Shared loaders
   ======================================================= */

/* ---- Machines list ---- */
async function loadMachines(query, sort) {
  const tbody = document.querySelector('#machineTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  let url = `${MGMT_API_BASE}/machines?`;
  if (query && query.trim()) url += `q=${encodeURIComponent(query.trim())}&`;
  if (sort) url += `sort=${sort}`;

  try {
    const res = await fetch(url);
    const machines = await res.json();

    if (!machines.length) {
      tbody.innerHTML = '<tr><td colspan="5">No machines found.</td></tr>';
      return;
    }

    tbody.innerHTML = machines.map(m => `
      <tr data-machine-id="${m.id}">
        <td>${m.id}</td>
        <td>${m.name}</td>
        <td>${m.department}</td>
        <td>${m.status}</td>
        <td>${m.efficiency}%</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-machine-id');
        loadMachineDetails(id);
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5">Failed to load machines.</td></tr>';
  }
}

/* ---- Machine details + delete ---- */
async function loadMachineDetails(id) {
  const details = document.querySelector('#machineDetails');
  if (!details) return;
  details.innerHTML = '<p>Loading...</p>';

  try {
    const res = await fetch(`${MGMT_API_BASE}/machines/${id}`);
    if (!res.ok) throw new Error('Not found');
    const m = await res.json();

    details.innerHTML = `
      <h4>${m.id} – ${m.name}</h4>
      <p><strong>Type:</strong> ${m.type}</p>
      <p><strong>Department:</strong> ${m.department}</p>
      <p><strong>Status:</strong> ${m.status}</p>
      <p><strong>Efficiency:</strong> ${m.efficiency}%</p>
      <button class="btn-outline" id="machineDeleteBtn">Remove Machine</button>
      <span class="form-status" id="machineDeleteStatus"></span>
    `;

    const deleteBtn = document.querySelector('#machineDeleteBtn');
    const statusEl = document.querySelector('#machineDeleteStatus');

    deleteBtn?.addEventListener('click', () => {
      showConfirmModal(
        'Remove machine',
        `Are you sure you want to remove machine ${m.id}?`,
        async () => {
          statusEl.textContent = 'Removing...';
          try {
            const delRes = await fetch(`${MGMT_API_BASE}/machines/${m.id}`, {
              method: 'DELETE'
            });
            if (!delRes.ok) throw new Error('Delete failed');

            statusEl.textContent = 'Machine removed.';
            await loadMachines();
            details.innerHTML = '<h4>Machine details</h4><p>Select a machine from the list.</p>';
          } catch (err) {
            console.error(err);
            statusEl.textContent = 'Error removing machine.';
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    details.innerHTML = '<p>Failed to load details.</p>';
  }
}

/* ---- Lines list (cards) ---- */
async function loadLines() {
  const grid = document.querySelector('#lineCardGrid');
  if (!grid) {
    console.warn('Line card grid not found');
    return;
  }

  grid.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #666;">
      Loading lines...
    </div>
  `;

  try {
    const res = await fetch(`${MGMT_API_BASE}/lines`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lines = await res.json();

    if (!Array.isArray(lines) || !lines.length) {
      grid.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #666;">
          No production lines defined yet.
          <a href="#" id="createFirstLine"
             style="color: #6366f1; text-decoration: underline; cursor: pointer;">
            Create your first line
          </a>
        </div>
      `;
      const link = grid.querySelector('#createFirstLine');
      if (link) {
        link.addEventListener('click', e => {
          e.preventDefault();
          const createBtn = document.querySelector('#linesAddBtn');
          if (createBtn) createBtn.click();
        });
      }
      return;
    }

    grid.innerHTML = lines.map(line => {
      const machineIds = (line.machineSequence || line.machineIds || []).filter(Boolean);
      const seq = machineIds.length ? machineIds.join(' → ') : 'No machines';

      return `
        <article class="line-card">
          <h4>${line.name}</h4>
          <div class="line-meta">
            <span>ID: ${line.id}</span> · 
            <span>Product: ${line.product || 'N/A'}</span>
          </div>
          <div class="line-machines">Machines: ${seq}</div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load lines:', err);
    grid.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #e74c3c;">
        Failed to load production lines. Please try again.
      </div>
    `;
  }
}

/* ---- Machines for line builder ---- */
async function loadMachinesForLines() {
  const select = document.querySelector('#lineMachineSelect');
  if (!select) return;

  try {
    const res = await fetch(`${MGMT_API_BASE}/machines`);
    const machines = await res.json();

    if (!Array.isArray(machines) || !machines.length) {
      select.innerHTML = '';
      return;
    }

    select.innerHTML = machines.map(m =>
      `<option value="${m.id}">${m.id} – ${m.name} (${m.department})</option>`
    ).join('');
  } catch (err) {
    console.error(err);
    select.innerHTML = '';
  }
}

/* =======================================================
   Custom confirmation modal
   ======================================================= */

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  const titleEl = document.getElementById('confirmTitle');
  const msgEl = document.getElementById('confirmMessage');
  const okBtn = document.getElementById('confirmOkBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');

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

/* =======================================================
   SPA hook: watch for management page injection
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('management-page')) {
          initManagementPage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});
