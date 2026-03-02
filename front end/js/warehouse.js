// warehouse.js – PART 1

const WAREHOUSE_API_BASE = 'http://localhost:8080/api/warehouse';

let warehouseInitDone = false;

function initWarehousePage(root) {
  if (warehouseInitDone) return;
  warehouseInitDone = true;

  const batchesViewBtn = root.querySelector('#batchesViewBtn');
  const batchesAddBtn = root.querySelector('#batchesAddBtn');
  const inventoryViewBtn = root.querySelector('#inventoryViewBtn');
  const expiryViewBtn = root.querySelector('#expiryViewBtn');

  const batchesViewPanel = root.querySelector('#batchesViewPanel');
  const batchesAddPanel = root.querySelector('#batchesAddPanel');
  const inventoryViewPanel = root.querySelector('#inventoryViewPanel');
  const expiryViewPanel = root.querySelector('#expiryViewPanel');

  const searchInput = root.querySelector('#batchSearchInput');
  const locationFilter = root.querySelector('#batchLocationFilter');
  const statusFilter = root.querySelector('#batchStatusFilter');
  const searchBtn = root.querySelector('#batchSearchBtn');

  const addForm = root.querySelector('#batchAddForm');
  const addStatus = root.querySelector('#batchAddStatus');
  const addLocation = root.querySelector('#batchAddLocation');

  const expiry30Btn = root.querySelector('#expiry30Btn');
  const expiry60Btn = root.querySelector('#expiry60Btn');
  const expiry90Btn = root.querySelector('#expiry90Btn');
  const expiredBtn = root.querySelector('#expiredBtn');

  function showPanel(panel) {
    [batchesViewPanel, batchesAddPanel, inventoryViewPanel, expiryViewPanel].forEach(p => {
      if (!p) return;
      p.style.display = (p === panel) ? 'block' : 'none';
    });
  }

  batchesViewBtn?.addEventListener('click', () => {
    showPanel(batchesViewPanel);
    loadLocations();
    loadBatches();
  });

  batchesAddBtn?.addEventListener('click', () => {
    showPanel(batchesAddPanel);
    loadLocationsForForm();
    if (addStatus) addStatus.textContent = '';
  });

  inventoryViewBtn?.addEventListener('click', () => {
    showPanel(inventoryViewPanel);
    loadInventory();
  });

  expiryViewBtn?.addEventListener('click', () => {
    showPanel(expiryViewPanel);
    loadExpiringBatches(30);
  });

  // Search
  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value;
    const loc = locationFilter.value;
    const stat = statusFilter.value;
    loadBatches(q, loc, stat);
  });

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const loc = locationFilter.value;
      const stat = statusFilter.value;
      loadBatches(e.target.value, loc, stat);
    }
  });

  // Add batch
  addForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!addStatus) return;
    addStatus.textContent = 'Saving...';

    const payload = {
      productId: addForm.productId.value,
      productName: addForm.productName.value,
      quantity: Number(addForm.quantity.value),
      location: addForm.location.value,
      manufacturedDate: addForm.manufacturedDate.value,
      expiryDate: addForm.expiryDate.value || null
    };

    try {
      const res = await fetch(`${WAREHOUSE_API_BASE}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      addStatus.textContent = '✅ Batch added successfully!';
      addForm.reset();
      addForm.quantity.value = 10;
      setTimeout(() => loadBatches(), 1000);
    } catch (err) {
      console.error(err);
      addStatus.textContent = '❌ Error adding batch.';
    }
  });

  // Expiry buttons
  expiry30Btn?.addEventListener('click', () => loadExpiringBatches(30));
  expiry60Btn?.addEventListener('click', () => loadExpiringBatches(60));
  expiry90Btn?.addEventListener('click', () => loadExpiringBatches(90));
  expiredBtn?.addEventListener('click', () => loadExpiredBatches());

  console.log('✅ Warehouse page initialized');
}
// ===== Loaders & helpers – PART 2 (append this after Part 1) =====

async function loadBatches(query, location, status) {
  const grid = document.querySelector('#batchesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="batch-card"><p>Loading batches...</p></div>';

  const params = new URLSearchParams();
  if (query && query.trim()) params.append('q', query.trim());
  if (location) params.append('location', location);
  if (status) params.append('status', status);

  let url = `${WAREHOUSE_API_BASE}/batches`;
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  try {
    const res = await fetch(url);
    const batches = await res.json();

    if (!batches.length) {
      grid.innerHTML = '<div class="batch-card"><p>No batches found.</p></div>';
      return;
    }

    grid.innerHTML = batches.map(renderBatchCard).join('');

    // Wire actions
    batches.forEach(b => {
      const moveBtn = document.querySelector(`#batchMoveBtn-${b.id}`);
      const qtyBtn = document.querySelector(`#batchQtyBtn-${b.id}`);
      const delBtn = document.querySelector(`#batchDeleteBtn-${b.id}`);

      moveBtn?.addEventListener('click', () => moveBatch(b.id));
      qtyBtn?.addEventListener('click', () => editBatchQuantity(b.id));
      delBtn?.addEventListener('click', () => deleteBatch(b.id));
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="batch-card"><p>Failed to load batches.</p></div>';
  }
}

async function loadLocations() {
  const select = document.querySelector('#batchLocationFilter');
  if (!select) return;

  try {
    const res = await fetch(`${WAREHOUSE_API_BASE}/locations`);
    const locations = await res.json();

    const current = select.value;
    select.innerHTML = '<option value="">All Locations</option>' +
      locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
    if (current) select.value = current;
  } catch (err) {
    console.error(err);
  }
}

async function loadLocationsForForm() {
  const select = document.querySelector('#batchAddLocation');
  if (!select) return;

  try {
    const res = await fetch(`${WAREHOUSE_API_BASE}/locations`);
    const locations = await res.json();

    // Provide some defaults if empty
    const base = locations.length ? locations : ['WAREHOUSE-A', 'WAREHOUSE-B'];
    select.innerHTML = base.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  } catch (err) {
    console.error(err);
    select.innerHTML = `
      <option value="WAREHOUSE-A">WAREHOUSE-A</option>
      <option value="WAREHOUSE-B">WAREHOUSE-B</option>
    `;
  }
}

async function loadInventory() {
  const grid = document.querySelector('#inventoryGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="inventory-card"><p>Loading inventory...</p></div>';

  try {
    const res = await fetch(`${WAREHOUSE_API_BASE}/inventory`);
    const items = await res.json();

    if (!items.length) {
      grid.innerHTML = '<div class="inventory-card"><p>No inventory data.</p></div>';
      return;
    }

    grid.innerHTML = items.map(renderInventoryCard).join('');
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="inventory-card"><p>Failed to load inventory.</p></div>';
  }
}

async function loadExpiringBatches(days) {
  const grid = document.querySelector('#expiryGrid');
  if (!grid) return;
  grid.innerHTML = `<div class="batch-card"><p>Loading batches expiring in ${days} days...</p></div>`;

  try {
    const res = await fetch(`${WAREHOUSE_API_BASE}/batches/expiring/${days}`);
    const batches = await res.json();

    if (!batches.length) {
      grid.innerHTML = `<div class="batch-card"><p>No batches expiring in next ${days} days.</p></div>`;
      return;
    }

    grid.innerHTML = batches.map(b => renderBatchCard(b, { markExpiring: true })).join('');
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="batch-card"><p>Failed to load expiring batches.</p></div>';
  }
}

async function loadExpiredBatches() {
  const grid = document.querySelector('#expiryGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="batch-card"><p>Loading expired batches...</p></div>';

  try {
    const res = await fetch(`${WAREHOUSE_API_BASE}/batches/expired`);
    const batches = await res.json();

    if (!batches.length) {
      grid.innerHTML = '<div class="batch-card"><p>No expired batches.</p></div>';
      return;
    }

    grid.innerHTML = batches.map(b => renderBatchCard(b, { forceExpired: true })).join('');
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="batch-card"><p>Failed to load expired batches.</p></div>';
  }
}

/* ===== Render helpers ===== */

function renderBatchCard(batch, options = {}) {
  const isExpired = batch.status === 'EXPIRED' || options.forceExpired;
  const expiringClass = options.markExpiring && !isExpired ? 'expiring' : '';
  const statusLower = (batch.status || '').toLowerCase();
  const statusClass = isExpired ? 'expired' : expiringClass || statusLower || 'available';

  const mfg = batch.manufacturedDate ? new Date(batch.manufacturedDate).toLocaleDateString() : 'N/A';
  const exp = batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A';

  return `
    <article class="batch-card">
      <div class="batch-card-header">
        <h4>${batch.id}</h4>
        <span class="batch-status-badge ${statusClass}">
          ${isExpired ? 'EXPIRED' : batch.status || 'AVAILABLE'}
        </span>
      </div>
      <div class="batch-card-meta">
        <div>${batch.productName} (${batch.productId})</div>
        <div>Qty: ${batch.quantity} · Location: ${batch.location}</div>
        <div>Mfg: ${mfg} · Exp: ${exp}</div>
      </div>
      <div class="batch-card-actions">
        <button id="batchMoveBtn-${batch.id}" class="btn-outline">Move</button>
        <button id="batchQtyBtn-${batch.id}" class="btn-outline">Edit Qty</button>
        <button id="batchDeleteBtn-${batch.id}" class="btn-primary">Delete</button>
      </div>
    </article>
  `;
}

function renderInventoryCard(item) {
  const low = item.lowStockThreshold != null && item.availableQuantity < item.lowStockThreshold;
  const cls = low ? 'inventory-card low-stock' : 'inventory-card';

  return `
    <article class="${cls}">
      <h4>${item.productName}</h4>
      <div class="inventory-card-meta">
        ${item.productId} · ${item.category || 'Uncategorized'}
      </div>
      <div class="inventory-card-stats">
        <span>Total: ${item.totalQuantity}</span>
        <span>Reserved: ${item.reservedQuantity}</span>
        <span>Available: ${item.availableQuantity}</span>
      </div>
      <div style="font-size:0.75rem; margin-top:4px;">
        Low stock threshold: ${item.lowStockThreshold}
      </div>
    </article>
  `;
}

/* ===== Actions ===== */

async function moveBatch(batchId) {
  const newLocation = prompt('Move batch to location:', 'WAREHOUSE-B');
  if (!newLocation) return;

  showWarehouseConfirmModal(
    'Move batch',
    `Move ${batchId} to ${newLocation}?`,
    async () => {
      try {
        const res = await fetch(`${WAREHOUSE_API_BASE}/batches/${batchId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newLocation })
        });
        if (res.ok) {
          await loadBatches();
        }
      } catch (err) {
        console.error(err);
      }
    }
  );
}

async function editBatchQuantity(batchId) {
  const newQtyStr = prompt('New quantity for batch:', '10');
  if (!newQtyStr) return;
  const newQty = Number(newQtyStr);
  if (Number.isNaN(newQty) || newQty < 0) return;

  showWarehouseConfirmModal(
    'Update quantity',
    `Set quantity of ${batchId} to ${newQty}?`,
    async () => {
      try {
        const res = await fetch(`${WAREHOUSE_API_BASE}/batches/${batchId}/quantity?quantity=${newQty}`, {
          method: 'PUT'
        });
        if (res.ok) {
          await loadBatches();
          await loadInventory();
        }
      } catch (err) {
        console.error(err);
      }
    }
  );
}

async function deleteBatch(batchId) {
  showWarehouseConfirmModal(
    'Delete batch',
    `Are you sure you want to delete ${batchId}?`,
    async () => {
      try {
        const res = await fetch(`${WAREHOUSE_API_BASE}/batches/${batchId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await loadBatches();
          await loadInventory();
        }
      } catch (err) {
        console.error(err);
      }
    }
  );
}

/* ===== Modal helper ===== */

function showWarehouseConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('warehouseConfirmModal');
  const titleEl = document.getElementById('warehouseConfirmTitle');
  const msgEl = document.getElementById('warehouseConfirmMessage');
  const okBtn = document.getElementById('warehouseConfirmOkBtn');
  const cancelBtn = document.getElementById('warehouseConfirmCancelBtn');

  if (!modal || !titleEl || !msgEl || !okBtn || !cancelBtn) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  modal.style.display = 'flex';

  const cleanup = () => {
    modal.style.display = 'none';
    okBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  okBtn.onclick = () => {
    cleanup();
    if (typeof onConfirm === 'function') onConfirm();
  };
  cancelBtn.onclick = cleanup;
}

/* ===== SPA hook ===== */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('warehouse-page')) {
          initWarehousePage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});
