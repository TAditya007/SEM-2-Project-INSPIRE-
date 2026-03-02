// Smooth scroll for internal links (preserved + enhanced)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        if (targetId.length > 1) {
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// Animate hero stats counters
function animateStats() {
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(num => {
        const target = parseFloat(num.dataset.target);
        const increment = target / 120;
        let current = 0;
        const updateNum = () => {
            if (current < target) {
                current += increment;
                num.textContent = current.toFixed(1);
                requestAnimationFrame(updateNum);
            } else {
                num.textContent = target.toFixed(1);
            }
        };
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                updateNum();
                observer.disconnect();
            }
        });
        observer.observe(num);
    });
}

// Header scroll effects
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10,10,10,0.98)';
        header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    } else {
        header.style.background = 'rgba(10,10,10,0.95)';
        header.style.boxShadow = 'none';
    }
});

// Fade-in sections on scroll
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.content-section, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Parallax hero bg
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const overlay = document.querySelector('.hero-bg-overlay');
    if (overlay) overlay.style.transform = `translateY(${scrolled * 0.3}px)`;
});

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    animateStats();
});
