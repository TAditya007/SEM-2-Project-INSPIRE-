// alerts.js – alerts list + filters + acknowledge

window.ALERTS_API_BASE = window.ALERTS_API_BASE || 'http://localhost:8080/api/alerts';

let alertsInitDone = false;

function initAlertsPage(root) {
  if (alertsInitDone) return;
  alertsInitDone = true;

  const typeFilter = root.querySelector('#alertTypeFilter');
  const severityFilter = root.querySelector('#alertSeverityFilter');
  const ackFilter = root.querySelector('#alertAckFilter');
  const refreshBtn = root.querySelector('#alertsRefreshBtn');

  const reload = () => {
    const type = typeFilter.value || null;
    const severity = severityFilter.value || null;
    const ackValue = ackFilter.value;
    const acknowledged = ackValue === '' ? null : ackValue === 'true';
    loadAlerts(type, severity, acknowledged);
  };

  refreshBtn?.addEventListener('click', reload);
  typeFilter?.addEventListener('change', reload);
  severityFilter?.addEventListener('change', reload);
  ackFilter?.addEventListener('change', reload);

  // initial load
  reload();

  console.log('Alerts page initialized');
}

async function loadAlerts(type, severity, acknowledged) {
  const list = document.querySelector('#alertsList');
  if (!list) return;
  list.innerHTML = '<div class="alert-card"><p>Loading alerts...</p></div>';

  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (severity) params.append('severity', severity);
  if (acknowledged !== null && acknowledged !== undefined) {
    params.append('acknowledged', acknowledged);
  }

  let url = ALERTS_API_BASE;
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  try {
    const res = await fetch(url);
    const alerts = await res.json();

    if (!alerts.length) {
      list.innerHTML = '<div class="alert-card"><p>No alerts found.</p></div>';
      return;
    }

    list.innerHTML = alerts.map(renderAlertCard).join('');

    alerts.forEach(a => {
      const ackBtn = document.querySelector(`#alertAckBtn-${a.id}`);
      ackBtn?.addEventListener('click', () => acknowledgeAlert(a.id));
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<div class="alert-card"><p>Failed to load alerts.</p></div>';
  }
}

function renderAlertCard(a) {
  const cls = [
    'alert-card',
    `alert-severity-${a.severity || 'INFO'}`,
    a.acknowledged ? 'alert-acknowledged' : ''
  ].join(' ');

  const icon = a.type === 'MACHINE' ? '🛠'
            : a.type === 'PRODUCTION' ? '⚙️'
            : a.type === 'WAREHOUSE' ? '📦'
            : 'ℹ️';

  const ts = a.createdAt
    ? new Date(a.createdAt).toLocaleString()
    : '';

  const ackLabel = a.acknowledged ? 'Acknowledged' : 'Acknowledge';

  return `
    <article class="${cls}">
      <div class="alert-badge">${icon}</div>
      <div class="alert-content">
        <div class="alert-title-row">
          <h4 class="alert-title">${a.title}</h4>
          <span class="alert-meta">${a.type} · ${a.severity}</span>
        </div>
        <p class="alert-message">${a.message}</p>
        <div class="alert-meta">
          Source: ${a.sourceId || '-'} · ${ts}
        </div>
        <div class="alert-actions">
          <button id="alertAckBtn-${a.id}" class="btn-outline">${ackLabel}</button>
        </div>
      </div>
    </article>
  `;
}

async function acknowledgeAlert(id) {
  try {
    await fetch(`${ALERTS_API_BASE}/${id}/ack`, { method: 'POST' });
    // reload with same filters
    const type = document.querySelector('#alertTypeFilter')?.value || null;
    const severity = document.querySelector('#alertSeverityFilter')?.value || null;
    const ackValue = document.querySelector('#alertAckFilter')?.value;
    const acknowledged = ackValue === '' ? null : ackValue === 'true';
    loadAlerts(type, severity, acknowledged);
  } catch (err) {
    console.error('Failed to acknowledge alert', err);
  }
}

/* SPA hook – detect alerts.html */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  const existing = container.querySelector('.alerts-page');
  if (existing) {
    initAlertsPage(existing);
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('alerts-page')) {
          initAlertsPage(node);
        }
      });
    }
  });

  observer.observe(container, { childList: true, subtree: true });
});
