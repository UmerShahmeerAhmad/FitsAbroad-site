// =========================================
// FITSABROAD — script.js (Stage 2 — full shared functionality)
// Shared across every page. All DOM lookups are null-checked so this file
// works safely even on pages that don't have a given element.
// =========================================

/* ---------- 1. Auto-update footer copyright year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ---------- 2. Mobile hamburger menu toggle ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

/* ---------- 3. Hero search — redirects to deals.html with a query param ---------- */
const heroSearchForm = document.getElementById('heroSearchForm');

if (heroSearchForm) {
  heroSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('heroSearchInput');
    const query = input && input.value.trim() ? input.value.trim() : '';
    window.location.href = query
      ? `deals.html?search=${encodeURIComponent(query)}`
      : 'deals.html';
  });
}

/* ---------- 4. Reveal Code + Copy to Clipboard ---------- */
// Every button with class "btn-reveal" has a data-code attribute.
// First click: reveal the code and copy it to the clipboard.
// Later clicks: re-copy the already-revealed code (handy if the user navigated away).
const revealButtons = document.querySelectorAll('.btn-reveal');

function flashCopied(btn, code) {
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => {
    btn.textContent = code;
  }, 1200);
}

revealButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const code = btn.getAttribute('data-code');
    if (!code) return;

    const copyText = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {
          /* Clipboard can fail silently in some browsers/contexts — code is
             still shown on the button, so the user can select/copy manually. */
        });
      }
    };

    if (!btn.classList.contains('revealed')) {
      // First click — reveal the code
      btn.classList.add('revealed');
      btn.textContent = code;
      copyText();
      flashCopied(btn, code);
    } else {
      // Already revealed — re-copy on click
      copyText();
      flashCopied(btn, code);
    }
  });
});

/* ---------- 5. Deals page: category filter + sort ---------- */
const dealsGrid = document.getElementById('dealsGrid');
const categoryFilters = document.getElementById('categoryFilters');
const sortSelect = document.getElementById('sortSelect');
const noResultsMsg = document.getElementById('noResultsMsg');

if (dealsGrid) {
  const allCards = Array.from(dealsGrid.querySelectorAll('.coupon-card'));

  // Parse a discount card's headline (e.g. "25% OFF", "$15 OFF", "Buy 1 Get 1")
  // into a comparable number. Non-numeric discounts sort to the bottom.
  function parseDiscountValue(card) {
    const text = card.querySelector('.coupon-discount')?.textContent || '';
    const match = text.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : -1;
  }

  // Parse "Expires Aug 15, 2026" into a Date object for sorting.
  function parseExpiryDate(card) {
    const text = card.querySelector('.coupon-expiry')?.textContent || '';
    const cleaned = text.replace('Expires', '').trim();
    const parsed = new Date(cleaned);
    return isNaN(parsed.getTime()) ? new Date('2999-12-31') : parsed;
  }

  function applyFilterAndSort() {
    const activeChip = categoryFilters
      ? categoryFilters.querySelector('.chip-filter.active')
      : null;
    const activeCategory = activeChip ? activeChip.getAttribute('data-category') : 'all';
    const sortValue = sortSelect ? sortSelect.value : 'trending';

    let visibleCount = 0;

    // Filter
    allCards.forEach((card) => {
      const matches = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    // Sort (re-append visible cards in the new order)
    let sortedCards = [...allCards];

    if (sortValue === 'discount') {
      sortedCards.sort((a, b) => parseDiscountValue(b) - parseDiscountValue(a));
    } else if (sortValue === 'expiring') {
      sortedCards.sort((a, b) => parseExpiryDate(a) - parseExpiryDate(b));
    }
    // 'trending' = keep original order

    sortedCards.forEach((card) => dealsGrid.appendChild(card));

    if (noResultsMsg) {
      noResultsMsg.hidden = visibleCount !== 0;
    }
  }

  if (categoryFilters) {
    categoryFilters.querySelectorAll('.chip-filter').forEach((chip) => {
      chip.addEventListener('click', () => {
        categoryFilters.querySelectorAll('.chip-filter').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilterAndSort();
      });
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilterAndSort);
  }

  // Handle ?search=... coming from the homepage hero search bar
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;

    allCards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const matches = cardText.includes(term);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    if (noResultsMsg) {
      noResultsMsg.hidden = visibleCount !== 0;
      if (visibleCount === 0) {
        noResultsMsg.textContent = `No deals match "${searchTerm}" yet — try browsing all deals below.`;
      }
    }
  } else {
    applyFilterAndSort();
  }
}

/* ---------- 6. Animated number counters (About page stats) ---------- */
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const duration = 1500;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach((el) => counterObserver.observe(el));
}

/* ---------- 7. Contact form validation + Formspree submission ---------- */
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // stop the normal page reload/redirect either way

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const nameValid = name && name.value.trim().length > 1;
    const emailValid = email && emailPattern.test(email.value.trim());
    const messageValid = message && message.value.trim().length > 5;

    if (!(nameValid && emailValid && messageValid)) {
      contactStatus.textContent = 'Please fill in your name, a valid email, and a message before sending.';
      contactStatus.className = 'form-status error';
      return;
    }

    // Passed validation — send it to Formspree in the background
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (response.ok) {
          contactStatus.textContent = "Thanks — your message has been sent. We'll reply within 1-2 business days.";
          contactStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          contactStatus.textContent = 'Something went wrong sending your message. Please try again or email us directly.';
          contactStatus.className = 'form-status error';
        }
      })
      .catch(() => {
        contactStatus.textContent = 'Something went wrong sending your message. Please try again or email us directly.';
        contactStatus.className = 'form-status error';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

/* ---------- 8. Newsletter form validation ---------- */
const newsletterForm = document.getElementById('newsletterForm');
const newsletterStatus = document.getElementById('newsletterStatus');

if (newsletterForm && newsletterStatus) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newsletterEmail = document.getElementById('newsletterEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailValid = newsletterEmail && emailPattern.test(newsletterEmail.value.trim());

    if (emailValid) {
      newsletterStatus.textContent = "You're subscribed! Look out for our next dispatch.";
      newsletterStatus.className = 'form-status success';
      newsletterForm.reset();

      // NOTE: Front-end only — same Formspree note as above applies here.
    } else {
      newsletterStatus.textContent = 'Please enter a valid email address.';
      newsletterStatus.className = 'form-status error';
    }
  });
}