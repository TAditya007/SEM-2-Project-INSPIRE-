// profile.js – user profile + password change (CO1-CO4 enhanced)

let profileInitDone = false;

async function loadUserProfile() {  // CO4: async/await function
  try {
    // CO4: Fetch from Spring Boot API (fallback to demo)
    const response = await fetch('http://localhost:8080/api/profile');
    const profileData = await response.json();  // CO4: JSON parsing
    
    // CO3: Object destructuring
    const { email, department, lastLogin } = profileData;
    return { email, department, lastLogin };
  } catch (error) {
    console.warn('API unavailable, using demo + LocalStorage:', error);
    // CO4: LocalStorage fallback
    const stored = localStorage.getItem('inspireProfile');
    if (stored) {
      const parsed = JSON.parse(stored);  // JSON parse
      return parsed;
    }
    // Demo fallback
    return {
      email: 'admin@inspire.com',
      department: 'Administration',
      lastLogin: new Date().toLocaleString()
    };
  }
}

function initProfilePage(root) {
  if (profileInitDone) return;
  profileInitDone = true;

  console.log('✅ Profile page initialized (CO4 async loaded)');

  // CO4: Async profile load
  loadUserProfile().then(profile => {
    root.querySelector('#profileEmail').textContent = profile.email;
    root.querySelector('#profileDept').textContent = profile.department;
    
    // Format lastLogin (CO3: array methods on date string)
    const loginDate = new Date(profile.lastLogin);
    const formatted = loginDate.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', 
      hour12: true 
    });
    root.querySelector('#profileLastLogin').textContent = formatted;

    // CO4: Save to LocalStorage
    localStorage.setItem('inspireProfile', JSON.stringify(profile));
  });

  // Password form (enhanced validation - CO3: array methods, regex)
  const form = root.querySelector('#passwordForm');
  const successMsg = root.querySelector('#successMsg');
  const errorMsg = root.querySelector('#errorMsg');
  const cancelBtn = root.querySelector('#cancelBtn');

  form.addEventListener('submit', async (e) => {  // CO4: async submit
    e.preventDefault();
    
    const current = root.querySelector('#currentPassword').value;
    const newPass = root.querySelector('#newPassword').value;
    const confirm = root.querySelector('#confirmPassword').value;

    // Hide messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // CO3: Array methods + regex validation
    const errors = [];
    if (current !== 'inspire123') errors.push('Current password incorrect');
    if (newPass.length < 6) errors.push('New password min 6 chars');
    if (newPass !== confirm) errors.push('Passwords do not match');
    if (!/[A-Z]/.test(newPass)) errors.push('Include uppercase letter');  // Regex

    if (errors.length === 0) {
      // CO4: Simulate API save (async)
      try {
        await new Promise(resolve => setTimeout(resolve, 500));  // Fake API delay
        successMsg.textContent = `✅ Password updated for ${DEMO_USER.email}`;
        successMsg.style.display = 'block';
        form.reset();
        
        // Auto-hide (CO3: callback)
        setTimeout(() => successMsg.style.display = 'none', 4000);
      } catch (error) {
        errorMsg.textContent = 'Update failed';
        errorMsg.style.display = 'block';
      }
    } else {
      // CO3: Array join for error list
      errorMsg.innerHTML = `❌ ${errors.join('<br>')}`;
      errorMsg.style.display = 'block';
    }
  });

  // Cancel button (CO3: arrow function)
  cancelBtn.addEventListener('click', () => {
    form.reset();
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
  });

  // Logout from profile (CO4: clear storage)
  const logoutBtn = root.querySelector('#logoutBtnProfile');
  logoutBtn.addEventListener('click', () => {
    if (confirm('Logout and clear session?')) {
      // CO4: Clear LocalStorage
      localStorage.removeItem('inspireSession');
      localStorage.removeItem('inspireProfile');
      window.location.href = 'login.html';
    }
  });

  // CO4: ResizeObserver for responsive profile cards
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const profileCard = entry.target.querySelector('.profile-card');
      if (profileCard) {
        const width = entry.contentRect.width;
        profileCard.style.fontSize = width > 500 ? '1.1rem' : '1rem';
      }
    });
  });
  resizeObserver.observe(root);
}

/* SPA hook – detect profile.html injection (CO4: MutationObserver preserved) */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  const existing = container.querySelector('.profile-page');
  if (existing) {
    initProfilePage(existing);
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('profile-page')) {
          initProfilePage(node);
        }
      });
    });
  });

  observer.observe(container, { childList: true, subtree: true });
});
