/* ========================================
   LASTER — Landing Page Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // ========== CURSOR GLOW ==========
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    if (!isTouchDevice && cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    // ========== FEATURE CARD GLOW EFFECT ==========
    if (!isTouchDevice) {
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });
    }

    // ========== OPTIMIZED SCROLL HANDLER ==========
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const floatingCards = document.querySelectorAll('.floating-card');
    let scrollY = window.scrollY;
    let ticking = false;

    function updateScroll() {
        scrollY = window.scrollY;

        // Navbar scrolled state
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        // Parallax floating cards
        if (!isTouchDevice && floatingCards.length > 0) {
            floatingCards.forEach((card, index) => {
                const speed = 0.03 + (index * 0.01);
                card.style.transform = `translateY(${Math.sin(scrollY * speed + index) * 8}px)`;
            });
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });

    // Initial call
    updateScroll();

    // ========== MOBILE MENU ==========
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
                const offset = target.offsetTop - navHeight - 20;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== SCROLL ANIMATIONS ==========
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Stagger delay based on sibling index
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                let delay = 0;
                siblings.forEach((sibling, i) => {
                    if (sibling === entry.target) {
                        delay = i * 100;
                    }
                });
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Math.min(delay, 400));
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // ========== WAITLIST FORM & GOOGLE SHEETS INTEGRATION ==========
    const waitlistForm = document.getElementById('waitlistForm');
    const waitlistSuccess = document.getElementById('waitlistSuccess');
    
    // REPLACE THIS URL with your Google Apps Script Web App URL after deployment
    const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxq7Tqc2Wfp066Iwj3xGUdrKLgm6tHwPkb9IbBrJJpFzvxnj__qHI12LdesJzly_rqZww/exec"; 

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('waitlistEmail');
            const campusInput = document.getElementById('waitlistCampus');
            
            if (emailInput && campusInput && emailInput.value && campusInput.value) {
                const submitBtn = waitlistForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                try {
                    submitBtn.innerHTML = '<span>Saving...</span>';
                    submitBtn.disabled = true;

                    // If URL is provided, send to Google Sheets. Otherwise, fallback to local API.
                    const endpoint = GOOGLE_SHEET_URL || '/api/waitlist';
                    
                    // Prepare data for Google Sheets (needs to be URLSearchParams or FormData for many Apps Script setups)
                    const formData = new FormData();
                    formData.append('email', emailInput.value);
                    formData.append('campus', campusInput.value);
                    formData.append('timestamp', new Date().toISOString());

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        // Note: When sending to Google Apps Script, we often use mode: 'no-cors' 
                        // if we don't need to read the response body, or handle CORS in the script.
                        // For this implementation, we assume the script handles it or we use fallback.
                        body: GOOGLE_SHEET_URL ? formData : JSON.stringify({
                            email: emailInput.value,
                            campus: campusInput.value
                        }),
                        headers: GOOGLE_SHEET_URL ? {} : {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Google Apps Script 'no-cors' mode won't return response.ok, 
                    // so we check if the URL exists or if response.ok is true
                    if (response.ok || GOOGLE_SHEET_URL) {
                        waitlistSuccess.classList.add('show');
                        emailInput.value = '';
                        campusInput.value = '';
                        
                        setTimeout(() => {
                            waitlistSuccess.classList.remove('show');
                        }, 5000);
                    } else {
                        throw new Error('Failed to save');
                    }
                } catch (error) {
                    console.error('Error saving waitlist entry:', error);
                    alert('There was a problem saving your entry. Please try again.');
                } finally {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // ========== FAQ ACCORDION ==========
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Open clicked (if wasn't active)
            if (!isActive) {
                faqItem.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ========== TILT EFFECT ON HERO IMAGE ==========
    if (!isTouchDevice) {
        const heroWrapper = document.querySelector('.hero-image-wrapper');
        if (heroWrapper) {
            heroWrapper.addEventListener('mousemove', (e) => {
                const rect = heroWrapper.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                heroWrapper.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
            });

            heroWrapper.addEventListener('mouseleave', () => {
                heroWrapper.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
                heroWrapper.style.transition = 'transform 0.5s ease';
            });

            heroWrapper.addEventListener('mouseenter', () => {
                heroWrapper.style.transition = 'none';
            });
        }
    }

    // ========== COMMUNITY VOTE LOGIC ==========
    const voteBtn = document.getElementById('voteBtn');
    const voteCountEl = document.getElementById('voteCount');
    let hasVoted = localStorage.getItem('hasVoted') === 'true';

    async function fetchVoteCount() {
        if (!GOOGLE_SHEET_URL) {
            voteCountEl.textContent = '1,248'; // Fallback static number
            return;
        }
        try {
            const response = await fetch(`${GOOGLE_SHEET_URL}?action=getCount`);
            const data = await response.json();
            if (data && data.count !== undefined) {
                // Add a base number to make it look like a busy campus (e.g., base 1200 + actual votes)
                voteCountEl.textContent = (1248 + parseInt(data.count)).toLocaleString();
            }
        } catch (error) {
            console.error('Error fetching vote count:', error);
            voteCountEl.textContent = '1,248';
        }
    }

    if (voteBtn && voteCountEl) {
        // Initial fetch
        fetchVoteCount();

        if (hasVoted) {
            voteBtn.classList.add('voted');
            voteBtn.querySelector('span').textContent = 'Thanks for your support!';
        }

        voteBtn.addEventListener('click', async () => {
            if (hasVoted) return;

            // Optimistic UI update
            let currentCount = parseInt(voteCountEl.textContent.replace(/,/g, ''));
            if (isNaN(currentCount)) currentCount = 1248; 
            voteCountEl.textContent = (currentCount + 1).toLocaleString();
            voteBtn.classList.add('voted');
            voteBtn.querySelector('span').textContent = 'Thanks for your support!';
            
            // Save to localStorage
            localStorage.setItem('hasVoted', 'true');
            hasVoted = true;

            if (GOOGLE_SHEET_URL) {
                try {
                    const formData = new FormData();
                    formData.append('action', 'vote');
                    await fetch(GOOGLE_SHEET_URL, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors' // Use no-cors for simple Google Apps Script pings
                    });
                } catch (error) {
                    console.error('Error sending vote:', error);
                }
            }
        });
    }

    // ========== CAMPUS FLOW TAB SWITCHING ==========
    const tabBtns = document.querySelectorAll('.flow-tab-btn');
    const panels = document.querySelectorAll('.flow-panel');

    if (tabBtns.length > 0 && panels.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');

                const targetId = btn.getAttribute('data-panel');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // ========== NAVBAR LINKS ACTIVE STYLE INJECT ==========
    const style = document.createElement('style');
    style.textContent = `
        .nav-links a.active {
            color: var(--gold-400);
        }
        .nav-links a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});
