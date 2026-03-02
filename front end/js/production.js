// production.js – COMPLETE working version

const PRODUCTION_API_BASE = 'http://localhost:8080/api/production';

let productionInitDone = false;

function initProductionPage(root) {
  if (productionInitDone) return;
  productionInitDone = true;

  const activeBtn = root.querySelector('#productionActiveBtn');
  const startBtn = root.querySelector('#productionStartBtn');
  const historyBtn = root.querySelector('#productionHistoryBtn');
  const refreshActiveBtn = root.querySelector('#refreshActiveBtn');

  const activePanel = root.querySelector('#productionActivePanel');
  const startPanel = root.querySelector('#productionStartPanel');
  const historyPanel = root.querySelector('#productionHistoryPanel');

  const startForm = root.querySelector('#productionStartForm');
  const startStatus = root.querySelector('#productionStartStatus');
  const lineSelect = root.querySelector('#productionLineSelect');

  function showPanel(panel) {
    [activePanel, startPanel, historyPanel].forEach(p => {
      if (!p) return;
      p.style.display = (p === panel) ? 'block' : 'none';
    });
  }

  activeBtn?.addEventListener('click', () => {
    showPanel(activePanel);
    loadActiveRuns();
  });

  startBtn?.addEventListener('click', () => {
    showPanel(startPanel);
    loadLines();
    if (startStatus) startStatus.textContent = '';
  });

  historyBtn?.addEventListener('click', () => {
    showPanel(historyPanel);
    loadHistory();
  });

  refreshActiveBtn?.addEventListener('click', () => {
    loadActiveRuns();
  });

  // Start form
  startForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!startStatus) return;
    startStatus.textContent = 'Starting...';

    const payload = {
      lineId: startForm.lineId.value,
      targetQuantity: Number(startForm.targetQuantity.value)
    };

    try {
      const res = await fetch(`${PRODUCTION_API_BASE}/runs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Start failed');
      startStatus.textContent = '✅ Run queued successfully!';
      startForm.reset();
      startForm.targetQuantity.value = 100;
      setTimeout(() => loadActiveRuns(), 1000);
    } catch (err) {
      console.error(err);
      startStatus.textContent = '❌ Error starting run.';
    }
  });

  console.log('✅ Production page initialized');
}

/* ===== Loaders ===== */

async function loadActiveRuns() {
  const grid = document.querySelector('#activeRunsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="run-card"><p>Loading active runs...</p></div>';

  try {
    const res = await fetch(`${PRODUCTION_API_BASE}/runs/active`);
    const runs = await res.json();

    if (!runs.length) {
      grid.innerHTML = '<div class="run-card"><p>No active production runs.</p></div>';
      return;
    }

    grid.innerHTML = runs.map(renderRunCard).join('');
    
    // Wire buttons
    runs.forEach(run => {
      const stopBtn = document.querySelector(`#stopBtn-${run.id}`);
      const updateBtn = document.querySelector(`#updateBtn-${run.id}`);
      stopBtn?.addEventListener('click', () => stopRun(run.id));
      updateBtn?.addEventListener('click', () => updateProgress(run.id));
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="run-card"><p>Failed to load active runs.</p></div>';
  }
}

async function loadHistory() {
  const grid = document.querySelector('#historyRunsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="run-card"><p>Loading history...</p></div>';

  try {
    const res = await fetch(`${PRODUCTION_API_BASE}/runs/completed`);
    const runs = await res.json();

    if (!runs.length) {
      grid.innerHTML = '<div class="run-card"><p>No completed runs yet.</p></div>';
      return;
    }

    grid.innerHTML = runs.map(renderRunCard).join('');

  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="run-card"><p>Failed to load history.</p></div>';
  }
}

async function loadLines() {
  const select = document.querySelector('#productionLineSelect');
  if (!select) return;

  try {
    const res = await fetch(`${PRODUCTION_API_BASE}/lines`);
    const lines = await res.json();
    select.innerHTML = '<option value="">Select line...</option>' + 
      lines.map(line => 
        `<option value="${line.id}">${line.name} (${line.product})</option>`
      ).join('');
  } catch (err) {
    console.error(err);
  }
}

function renderRunCard(run) {
  const progress = run.progressPercent || 0;
  const passRate = run.qualityMetrics?.passRate || 0;
  const statusClass = run.status.toLowerCase().replace('_', '-');
  
  const machines = run.machineIds?.join(', ') || 'N/A';
  const started = run.startedAt ? new Date(run.startedAt).toLocaleString() : 'N/A';

  return `
    <div class="run-card">
      <div class="run-card-header">
        <h4>${run.lineName}</h4>
        <span class="run-status-badge ${statusClass}">${run.status}</span>
      </div>
      <div class="run-card-meta">${run.product} · ${run.currentQuantity}/${run.targetQuantity}</div>
      
      <div class="run-progress-bar">
        <div class="run-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="run-card-metrics">
        <span>Pass: ${passRate.toFixed(1)}%</span>
        <span>${run.currentQuantity}/${run.targetQuantity}</span>
        <span>${machines}</span>
      </div>
      
      <div class="run-card-actions">
        ${run.status === 'IN_PROGRESS' ? `
          <button id="updateBtn-${run.id}" class="btn-outline">📊 Update Progress</button>
          <button id="stopBtn-${run.id}" class="btn-primary">⏹️ Stop Run</button>
        ` : ''}
      </div>
      
      <div style="font-size: 0.7rem; color: var(--text-muted);">
        Started: ${started}
      </div>
    </div>
  `;
}

/* ===== Actions ===== */

async function stopRun(runId) {
  showConfirmModal('Stop production run?', 
    'This will mark the run as failed and free up machines.', 
    async () => {
    try {
      const res = await fetch(`${PRODUCTION_API_BASE}/runs/${runId}/stop`, { method: 'POST' });
      if (res.ok) {
        await loadActiveRuns();
      }
    } catch (err) {
      console.error(err);
    }
  });
}

async function updateProgress(runId) {
  const produced = prompt('Units produced?', '10');
  const passed = prompt('Units passed QC?', '9');
  const failed = prompt('Units failed QC?', '1');
  
  if (produced && passed && failed) {
    const payload = {
      produced: Number(produced),
      passed: Number(passed),
      failed: Number(failed)
    };
    
    try {
      const res = await fetch(`${PRODUCTION_API_BASE}/runs/${runId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadActiveRuns();
      }
    } catch (err) {
      console.error(err);
    }
  }
}

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('productionConfirmModal');
  const titleEl = document.getElementById('productionConfirmTitle');
  const msgEl = document.getElementById('productionConfirmMessage');
  const okBtn = document.getElementById('productionConfirmOkBtn');
  const cancelBtn = document.getElementById('productionConfirmCancelBtn');

  titleEl.textContent = title;
  msgEl.textContent = message;
  modal.style.display = 'flex';

  const cleanup = () => modal.style.display = 'none';

  okBtn.onclick = () => {
    cleanup();
    onConfirm();
  };
  cancelBtn.onclick = cleanup;
}

/* ===== SPA Observer ===== */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('production-page')) {
          initProductionPage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});
