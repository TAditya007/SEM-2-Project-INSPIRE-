// ---------- ALL SECTIONS DYNAMIC LOADING ----------

const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("pageTitle");
const dynamicContent = document.getElementById("dynamicContent");

// CO4: simple in‑memory cache to avoid refetching same HTML repeatedly
const sectionCache = {};

// map every section -> its HTML file
const sectionFiles = {
  overview: "overview.html",
  production: "production.html",
  warehouse: "warehouse.html",
  staff: "staff.html",
  profile: "profile.html",
  management: "management.html",
  analytics: "analytics.html",
  rd: "r&d.html" // file literally named r&d.html
};

// CO4: async/await version of loader (robust but same behavior)
async function loadSection(section) {
  const fileName = sectionFiles[section];
  if (!fileName || !dynamicContent) return;

  // update page title
  pageTitle.textContent =
    section.charAt(0).toUpperCase() + section.slice(1);

  dynamicContent.innerHTML = "\n\nLoading...";

  try {
    // use cache first if available
    if (sectionCache[fileName]) {
      dynamicContent.innerHTML = sectionCache[fileName];
      return;
    }

    const res = await fetch(fileName);
    if (!res.ok) throw new Error("Network error");
    const html = await res.text();

    sectionCache[fileName] = html;          // cache HTML
    dynamicContent.innerHTML = html;        // inject section into main space
  } catch (err) {
    console.error("Section load failed:", err);
    dynamicContent.innerHTML = "\n\nFailed to load section.";
  }
}

// sidebar buttons -> load file into main content area
navItems.forEach((btn) => {
  const section = btn.dataset.section;
  if (!section) return;

  btn.addEventListener("click", () => {
    navItems.forEach((b) => b.classList.remove("nav-item-active"));
    btn.classList.add("nav-item-active");
    loadSection(section);
  });
});

// initial view
loadSection("overview");

// ---------- BACKEND HEALTH STATUS ----------

async function loadBackendHealth() {
  const el = document.getElementById("backend-status");
  if (!el) return; // safety: span not present

  el.textContent = "Backend: checking…";

  try {
    const response = await fetch("http://localhost:8080/api/health");
    const data = await response.json();
    el.textContent = `Backend: ${data.status} (${data.service})`;
  } catch (err) {
    console.error("Health check failed", err);
    el.textContent = "Backend: ERROR";
  }
}

// run health check when dashboard DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadBackendHealth();
});

// ---------- SESSION CHECK (ties to login.js LocalStorage) ----------

(function checkSession() {
  try {
    const raw = localStorage.getItem("inspireSession");
    if (!raw) return; // allow viewing without hard lock (demo)

    const session = JSON.parse(raw);
    // optional: could show user email somewhere in header
    const userEmailEl = document.getElementById("userEmailDisplay");
    if (userEmailEl && session.email) {
      userEmailEl.textContent = session.email;
    }
  } catch (e) {
    console.warn("Session parse failed", e);
  }
})();

// ---------- LOGOUT ----------

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // keep same key as in login.js/profile.js
    localStorage.removeItem("inspireSession");
    localStorage.removeItem("inspireProfile");
    window.location.href = "login.html"; // adjust path if needed
  });
}

// ---------- SIDEBAR COLLAPSE ----------

const sidebar = document.getElementById("sidebar");
const collapseToggle = document.getElementById("collapseToggle");

if (collapseToggle && sidebar) {
  collapseToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// ---------- EVENT DELEGATION FOR DYNAMIC CONTENT (optional UX) ----------

// Example: any button with data-section inside dynamicContent can also trigger section loads
if (dynamicContent) {
  dynamicContent.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-section-link]");
    if (!btn) return;

    const section = btn.getAttribute("data-section-link");
    if (section && sectionFiles[section]) {
      navItems.forEach((b) => {
        if (b.dataset.section === section) {
          b.classList.add("nav-item-active");
        } else {
          b.classList.remove("nav-item-active");
        }
      });
      loadSection(section);
    }
  });
}
