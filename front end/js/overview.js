// overview.js – final version with logs + reliable init + RECENT ALERTS ✅

const DASHBOARD_API_BASE = 'http://localhost:8080/api/dashboard';
const ALERTS_API_BASE = 'http://localhost:8080/api/alerts';

let overviewInitDone = false;

function initOverviewPage(root) {
  if (!root) {
    console.warn('initOverviewPage called with no root');
    return;
  }
  if (overviewInitDone) {
    console.log('Overview already initialized, skipping');
    return;
  }
  overviewInitDone = true;
  console.log('✅ initOverviewPage starting', root);

  // Load summary on first open
  loadDashboardSummary(root);

  // Quick nav buttons
  const goProd = root.querySelector('#goProduction');
  const goWh = root.querySelector('#goWarehouse');
  const goMgmt = root.querySelector('#goManagement');

  goProd?.addEventListener('click', () => {
    loadPageFromOverview('front end/HTML/production.html');
  });

  goWh?.addEventListener('click', () => {
    loadPageFromOverview('front end/HTML/warehouse.html');
  });

  goMgmt?.addEventListener('click', () => {
    loadPageFromOverview('front end/HTML/management.html');
  });

  console.log('✅ Overview page initialized');
}

async function loadDashboardSummary(root) {
  console.log('🔄 loadDashboardSummary called');
  try {
    const res = await fetch(`${DASHBOARD_API_BASE}/summary`);
    console.log('summary status', res.status);
    if (!res.ok) {
      console.error('❌ summary response not ok');
      return;
    }
    const data = await res.json();
    console.log('summary data', data);

    // Machines (your existing detailed KPIs)
    root.querySelector('#kpiTotalMachines').textContent = data.totalMachines;
    root.querySelector('#kpiRunningMachines').textContent = `Running: ${data.runningMachines}`;
    root.querySelector('#kpiIdleMachines').textContent = `Idle: ${data.idleMachines}`;
    root.querySelector('#kpiMaintenanceMachines').textContent = `Maint: ${data.maintenanceMachines}`;

    // Production (your existing detailed KPIs)
    root.querySelector('#kpiActiveRuns').textContent = data.activeRuns;
    root.querySelector('#kpiQueuedRuns').textContent = `Queued: ${data.queuedRuns}`;
    root.querySelector('#kpiCompletedToday').textContent = `Done today: ${data.completedToday}`;

    // Warehouse (your existing detailed KPIs)
    root.querySelector('#kpiTotalStock').textContent = data.totalAvailableStock;
    root.querySelector('#kpiProducts').textContent = `Products: ${data.totalProducts}`;
    root.querySelector('#kpiLowStock').textContent = `Low stock: ${data.lowStockItems}`;
    root.querySelector('#kpiExpiring').textContent = `Expiring soon: ${data.expiringSoonBatches}`;

    // Quick-card mini info (your existing)
    const quickProdInfo = root.querySelector('#quickProdInfo');
    const quickWhInfo = root.querySelector('#quickWhInfo');
    const quickMgmtInfo = root.querySelector('#quickMgmtInfo');

    if (quickProdInfo) {
      quickProdInfo.textContent = `Active: ${data.activeRuns}, Queued: ${data.queuedRuns}`;
    }
    if (quickWhInfo) {
      quickWhInfo.textContent = `Stock: ${data.totalAvailableStock}, Low stock: ${data.lowStockItems}`;
    }
    if (quickMgmtInfo) {
      quickMgmtInfo.textContent = `Machines: ${data.totalMachines}, Lines: ${data.totalLines}`;
    }

    // NEW: Recent alerts (doesn't interfere with anything above)
    await loadRecentAlerts(root);

  } catch (err) {
    console.error('❌ Failed to load dashboard summary', err);
  }
}

// NEW: Recent alerts function (added without breaking existing code)
async function loadRecentAlerts(root) {
  try {
    const res = await fetch(`${ALERTS_API_BASE}/recent?limit=3`);
    const alerts = await res.json();

    const section = root.querySelector('#recentAlertsSection');
    const list = root.querySelector('#recentAlertsList');
    const showBtn = root.querySelector('#showAlertsBtn');

    if (!section || !list || !showBtn) {
      console.log('Recent alerts section not found - skipping');
      return;
    }

    if (!alerts.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    list.innerHTML = alerts.map(renderCompactAlert).join('');

    // ✅ FIXED: Remove old listeners first, then add new one
    showBtn.removeEventListener('click', handleShowAlerts);
    showBtn.addEventListener('click', handleShowAlerts);
  } catch (err) {
    console.error('Failed to load recent alerts', err);
  }
}

// NEW: Separate handler function (fixes duplicate listeners)
function handleShowAlerts() {
  loadPageFromOverview('front end/HTML/alerts.html');
}

function renderCompactAlert(a) {
  const icon = a.type === 'MACHINE' ? '🛠' 
            : a.type === 'PRODUCTION' ? '⚙️' 
            : a.type === 'WAREHOUSE' ? '📦' 
            : 'ℹ️';
  const cls = `alert-compact-badge alert-severity-${a.severity || 'INFO'}`;
  const ts = new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return `
    <article class="alert-compact">
      <div class="${cls}">${icon}</div>
      <div class="alert-compact-content">
        <div class="alert-compact-title">${a.title}</div>
        <div class="alert-compact-meta">${a.sourceId} · ${ts}</div>
      </div>
    </article>
  `;
}

/**
 * Load a page HTML directly into #dynamicContent
 */
async function loadPageFromOverview(path) {
  const container = document.getElementById('dynamicContent');
  if (!container) {
    console.warn('No #dynamicContent container found');
    return;
  }

  try {
    console.log('🔄 Loading page from overview:', path);
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    const html = await res.text();
    container.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('❌ Error loading page from overview:', err);
  }
}

/* SPA hook – detect when overview.html is injected OR already present */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) {
    console.warn('No #dynamicContent found on DOMContentLoaded');
    return;
  }

  // 1) If overview is already in DOM when page loads
  const existing = container.querySelector('.overview-page');
  if (existing) {
    console.log('Found existing .overview-page on load');
    initOverviewPage(existing);
  }

  // 2) Watch for overview.html being injected later
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('overview-page')) {
          console.log('Observer saw new .overview-page');
          initOverviewPage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});

// ✅ FIXED: Make loadPageFromOverview GLOBAL for button use
window.loadPageFromOverview = loadPageFromOverview;
