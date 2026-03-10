const form = document.getElementById("loginForm");
const errorBar = document.getElementById("errorBar");

// Single demo user (CO3: Objects)
const DEMO_USER = {
  email: "admin@inspire.com",
  password: "inspire123"
};

// CO4: Check existing session on load
document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('inspireSession');
  if (session) {
    const sessionData = JSON.parse(session);  // CO4: JSON parsing
    // Recent login? Auto-redirect (demo convenience)
    const loginTime = new Date(sessionData.timestamp);
    const hourAgo = new Date(Date.now() - 60*60*1000);
    if (loginTime > hourAgo) {
      window.location.href = "../HTML/dashboard.html";
      return;
    }
  }
});

form.addEventListener("submit", async (e) => {  // CO4: async arrow function
  e.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  
  errorBar.style.display = "none";
  
  // Check single user login
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    // CO4: LocalStorage + JSON object with timestamp
    const loginData = {
      email: email,
      timestamp: new Date().toISOString(),  // CO3: Date object
      sessionId: 'ins' + Math.random().toString(36).substr(2, 9)  // Unique ID
    };
    localStorage.setItem('inspireSession', JSON.stringify(loginData));  // Save JSON
    
    // CO4: Callback simulation (setTimeout for UX)
    errorBar.textContent = "✅ Welcome back! Loading dashboard...";
    errorBar.style.background = "#10b981";
    errorBar.style.display = "block";
    
    setTimeout(() => {
      window.location.href = "../HTML/dashboard.html";
    }, 800);
  } else {
    // Error (CO3: template literals)
    errorBar.innerHTML = `❌ Invalid credentials. Try: <strong>${DEMO_USER.email}</strong> / ${DEMO_USER.password}`;
    errorBar.style.display = "block";
  }
});

// Password toggle (eye icon) - CO3: Event listeners, arrow functions
document.getElementById("passwordToggle").addEventListener("mouseenter", () => {
  document.getElementById("password").type = "text";
});

document.getElementById("passwordToggle").addEventListener("mouseleave", () => {
  document.getElementById("password").type = "password";
});

// CO3: Array method example (demo validation helpers)
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
console.log('Email regex test:', validateEmail(DEMO_USER.email));  // true
