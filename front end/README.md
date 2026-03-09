# INSPIRE Frontend – Smart Factory Dashboard (FWD Project)

INSPIRE is a smart factory front‑end dashboard for an automotive manufacturing scenario.  
It provides real‑time style views for production lines, warehouse inventory, staff management, alerts, and high‑level KPIs, designed as a single‑page experience with modular HTML, CSS, and JavaScript files.

This frontend was developed for the **Frontend Web Development (FWD)** course to demonstrate mastery of **CO1–CO5**: HTML/CSS fundamentals, responsive layouts, JavaScript fundamentals, DOM and async programming, and advanced web concepts.

---

## Features

- **Landing page (Home)**
  - Marketing‑style hero with animated KPI counters
  - Navigation: About, News, Careers, Contact
  - SEO‑ready `<head>` with meta and Open Graph tags

- **Authentication**
  - Login form with validation and password visibility toggle
  - Demo user session stored in `localStorage`

- **Dashboard shell**
  - Sidebar navigation with buttons for each module
  - Central `#dynamicContent` container for SPA‑like navigation
  - Backend health indicator (ping `/api/dashboard/summary`)

- **Overview**
  - Aggregated KPIs (machines, production, warehouse)
  - Quick navigation cards to deeper modules
  - Recent alerts preview with “View all alerts” shortcut

- **Production**
  - Active runs grid with progress bars and quality metrics
  - Form to start new production runs
  - Completed runs history table

- **Warehouse**
  - Batches listing with filters (search, location, status)
  - Add batch form (dates, quantities, locations)
  - Inventory summary and low‑stock view
  - Expiring and expired batches views

- **Management**
  - Machines list with details and delete option
  - Add machine form (type, department, status, efficiency)
  - Production line builder (choose machine sequence)

- **Alerts**
  - Filterable alerts list (type, severity, acknowledged)
  - Acknowledge action per alert
  - Page initialization when alerts HTML is injected

- **Staff**
  - Staff table with search and sort (name, department, salary)
  - Staff detail card: department change, salary hike, meetings history
  - Schedule meeting form per staff member

- **Profile**
  - User profile panel loaded from API or `localStorage` fallback
  - Password change form with validation and async save

---

## Tech Stack

- **HTML5**
  - Semantic structure (`header`, `main`, `section`, `article`, `table`)
  - Forms and tables with accessible labels and attributes[web:33]

- **CSS3**
  - Flexbox and CSS Grid layouts
  - CSS custom properties (`:root` variables)
  - Transitions, animations, gradients, shadows
  - Media queries and container queries for responsiveness
  - Pseudo‑classes/elements (`:focus`, `:hover`, `::before`, `::placeholder`)

- **JavaScript (ES6+)**
  - `type="module"` entry scripts
  - DOM manipulation and event handling
  - Async/await with `fetch` for REST APIs
  - `localStorage` for session/profile
  - Intersection / Mutation / Resize Observers in dashboard interactions[web:30]

The frontend is served as static files (e.g., with VS Code Live Server) and talks to the backend at `http://localhost:8080/api/...`.

---

## Course Outcomes Mapping (FWD CO1–CO5)

- **CO1 – Internet, HTML & Intro CSS**
  - Files: `home.html`, `login.html`, `dashboard.html`, `production.html`
  - Basic layout, headings, paragraphs, links, simple CSS in `home.css`

- **CO2 – Forms, Semantics & Layouts**
  - Semantic HTML pages: `alerts.html`, `management.html`, `overview.html`, `profile.html`, `staff.html`, `warehouse.html`
  - Advanced CSS layouts and components:  
    `login.css`, `dashboard.css`, `alerts.css`, `management.css`, `overview.css`,  
    `production.css`, `profile.css`, `staff.css`, `warehouse.css`

- **CO3 – JavaScript Fundamentals**
  - Logic in: `home.js`, `login.js`, `dashboard.js`, `alerts.js`, `management.js`,  
    `overview.js`, `production.js`, `profile.js`, `staff.js`, `warehouse.js`
  - Covers variables, arrays/objects, loops, functions, module‑style organization

- **CO4 – DOM, Events, Async & Storage**
  - Same JS files:
    - Event listeners for clicks and form submits
    - DOM updates for SPA navigation
    - Async `fetch` calls to REST APIs
    - `localStorage` for session and profile data
    - Observers for dynamic sections

- **CO5 – Advanced Web Concepts**
  - REST API integration with Spring Boot backend
  - Client‑side validation with `try/catch` around API calls
  - SEO meta tags and Open Graph in `home.html`
  - ES6 modules (`type="module"`)
  - PWA‑ready hooks (manifest link, optional service worker stub)

---

## Project Structure (Frontend)

```text
frontend/
├─ HTML/
│  ├─ home.html
│  ├─ login.html
│  ├─ dashboard.html
│  ├─ overview.html
│  ├─ alerts.html
│  ├─ management.html
│  ├─ production.html
│  ├─ profile.html
│  ├─ staff.html
│  └─ warehouse.html
├─ CSS/
│  ├─ home.css
│  ├─ login.css
│  ├─ dashboard.css
│  ├─ alerts.css
│  ├─ management.css
│  ├─ overview.css
│  ├─ production.css
│  ├─ profile.css
│  ├─ staff.css
│  └─ warehouse.css
├─ js/
│  ├─ home.js
│  ├─ login.js
│  ├─ dashboard.js
│  ├─ overview.js
│  ├─ alerts.js
│  ├─ management.js
│  ├─ production.js
│  ├─ profile.js
│  ├─ staff.js
│  └─ warehouse.js
└─ README.md




How to Run (Frontend)
Open the frontend/ folder in VS Code.

Start a static server (for example the “Live Server” extension) and open HTML/home.html.

Ensure the backend is running on http://localhost:8080 and CORS allows http://127.0.0.1:5500.

Log in through login.html and navigate using the dashboard sidebar.