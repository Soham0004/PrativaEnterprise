// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Responsive Mobile Menu (Top-down Dropdown logic)
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const icon = menuBtn.querySelector('i');
        if (mobileMenu.classList.contains('open')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });
    });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
        nav.classList.toggle('shadow-md', window.scrollY > 20);
    }
});

const GOOGLE_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzjvS2-pYPXtUa4DW20yuc5xWDD-snyduv_goUHFpQrrVtDjPFygfF7FhbOFrZpfsbu/exec';

function setFormAlert(messageElement, shouldShow) {
    if (!messageElement) {
        return;
    }

    messageElement.classList.toggle('hidden', !shouldShow);
}

// Booking Form Submission Handler - Sends data to Google Sheets
async function submitForm(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');
    const originalText = btn.innerHTML;
    const googleScriptUrl = GOOGLE_SCRIPT_WEB_APP_URL.trim();

    setFormAlert(successMsg, false);
    setFormAlert(errorMsg, false);
    setFormAlert(phoneError, false);

    const phoneValue = phoneInput.value.trim();
    if (phoneValue.length !== 10 || !/^\d{10}$/.test(phoneValue)) {
        setFormAlert(phoneError, true);
        return;
    }

    if (!googleScriptUrl) {
        setFormAlert(errorMsg, true);
        console.error('Google Apps Script Web App URL is missing.');
        return;
    }

    // Show loading state while the request is being sent.
    btn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Sending...';
    btn.classList.add('opacity-80', 'cursor-not-allowed');
    btn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        service: formData.get('service') || '',
        date: formData.get('date') || '',
        message: String(formData.get('message') || '').trim(),
        area: formData.get('area') || '',
        timestamp: new Date().toLocaleString('en-IN')
    };
    const payload = new URLSearchParams(data);

    try {
        // Using no-cors avoids the browser blocking the request to the Apps Script web app.
        // The response is opaque, so this only confirms the request was sent by the browser.
        await fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: payload
        });

        form.reset();
        setFormAlert(successMsg, true);
        window.setTimeout(() => setFormAlert(successMsg, false), 5000);
    } catch (error) {
        console.error('Error submitting booking form:', error);
        setFormAlert(errorMsg, true);
        window.setTimeout(() => setFormAlert(errorMsg, false), 5000);
    } finally {
        btn.innerHTML = originalText;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
        btn.disabled = false;
    }
}

// Click to Copy Utility Function
function copyToClipboard(text, msg) {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        textArea.remove();
    }
    
    // Show toast notification
    const toast = document.getElementById('copyToast');
    if (toast) {
        toast.textContent = msg;
        toast.classList.remove('copy-toast');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('copy-toast');
        
        // Hide toast after animation
        setTimeout(() => {
            toast.classList.remove('copy-toast');
        }, 2000);
    }
}

// Phone Input - Restrict to numbers only
const phoneInput = document.getElementById('phoneInput');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
}

// FAQ Accordion - handles the toggling via onclick on the .faq-item element
// The HTML already has onclick="this.classList.toggle('active')" on each FAQ item,
// so no additional JavaScript is needed for that functionality.

// Review modal
if (window.ReviewModal) {
    window.reviewModalInstance = new window.ReviewModal();
}

// Smooth scroll for anchor links (optional enhancement)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) {
        return;
    }

    container.innerHTML = '';
    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 3;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            bottom: ${Math.random() * 30}%;
            --dur: ${Math.random() * 5 + 3}s;
            --delay: ${Math.random() * 4}s;
            opacity: 0;
            background: ${Math.random() > 0.5 ? '#0284c7' : '#10b981'};
        `;

        container.appendChild(particle);
    }
}

let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) {
        return;
    }

    countersAnimated = true;
    document.querySelectorAll('.counter-val').forEach((el) => {
        const target = parseInt(el.dataset.target || '0', 10);
        const duration = 1800;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(ease * target);
            el.textContent = current.toLocaleString('en-IN');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    });
}

const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if (revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => revealObserver.observe(el));
}

const counterTrigger = document.querySelector('.counter-val');
if (counterTrigger) {
    const counterGrid = counterTrigger.closest('.grid') || counterTrigger;
    const counterObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
            return;
        }

        animateCounters();
        counterObserver.disconnect();
    }, { threshold: 0.3 });

    counterObserver.observe(counterGrid);
}

createParticles();

// ====================================
// Horizontal Scrolling Comments with Zoom-Focus and Background Blur
// ====================================

const CommentZoomFocus = {
    overlayId: 'commentZoomOverlay',
    activeCard: null,
    isAnimating: false,

    init() {
        this.createOverlay();
        this.bindReviewCards();
        this.bindOverlay();
    },

    createOverlay() {
        if (document.getElementById(this.overlayId)) {
            return;
        }
        const overlay = document.createElement('div');
        overlay.id = this.overlayId;
        overlay.className = 'comment-zoom-overlay';
        document.body.appendChild(overlay);
    },

    bindReviewCards() {
        document.addEventListener('click', (e) => {
            const reviewCard = e.target.closest('.review-card');
            if (reviewCard && !this.activeCard) {
                e.stopPropagation();
                this.zoomCard(reviewCard);
            }
        });
    },

    bindOverlay() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) {
            overlay.addEventListener('click', () => this.closeZoom());
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeCard) {
                this.closeZoom();
            }
        });
    },

    zoomCard(card) {
        if (this.isAnimating || this.activeCard) {
            return;
        }

        this.isAnimating = true;
        this.activeCard = card;

        const overlay = document.getElementById(this.overlayId);
        const clonedCard = card.cloneNode(true);
        clonedCard.classList.remove('review-card');
        clonedCard.classList.add('review-card', 'zoom-focus');
        clonedCard.style.position = 'fixed';

        document.body.appendChild(clonedCard);
        overlay.classList.add('active');

        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        // Re-enable modal interactions
        clonedCard.addEventListener('click', (e) => {
            if (e.target === clonedCard) {
                this.closeZoom();
            }
        });

        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    },

    closeZoom() {
        if (this.isAnimating || !this.activeCard) {
            return;
        }

        this.isAnimating = true;

        const overlay = document.getElementById(this.overlayId);
        const zoomedCards = document.querySelectorAll('.review-card.zoom-focus');

        zoomedCards.forEach((card) => {
            card.classList.add('closing');
            setTimeout(() => {
                card.remove();
            }, 300);
        });

        overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.activeCard = null;

        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    }
};

// Initialize zoom-focus feature on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CommentZoomFocus.init());
} else {
    CommentZoomFocus.init();
}
