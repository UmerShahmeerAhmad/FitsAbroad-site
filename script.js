// =========================================
// FITSABROAD — script.js
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

/* =========================================
   COOKIE HELPERS (shared by consent, theme, and recently-viewed features)
   ========================================= */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/* ---------- 4. Reveal Code + Copy to Clipboard (+ records "recently viewed") ---------- */
const revealButtons = document.querySelectorAll('.btn-reveal');

function flashCopied(btn, code) {
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
          /* Clipboard can fail silently in some browsers — code is still
             shown on the button, so the user can select/copy manually. */
        });
      }
    };

    if (!btn.classList.contains('revealed')) {
      btn.classList.add('revealed');
      btn.textContent = code;
      copyText();
      flashCopied(btn, code);

      const card = btn.closest('.coupon-card');
      if (card) {
        const storeEl = card.querySelector('.coupon-store');
        const discountEl = card.querySelector('.coupon-discount');
        const store = storeEl ? storeEl.textContent.trim() : '';
        const discount = discountEl ? discountEl.textContent.trim() : '';
        if (store) {
          addRecentlyViewed({ store: store, discount: discount, code: code });
          renderRecentlyViewed();
        }
      }
    } else {
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

  function parseDiscountValue(card) {
    const el = card.querySelector('.coupon-discount');
    const text = el ? el.textContent : '';
    const match = text.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : -1;
  }

  function parseExpiryDate(card) {
    const el = card.querySelector('.coupon-expiry');
    const text = el ? el.textContent : '';
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

    allCards.forEach((card) => {
      const matches = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    let sortedCards = allCards.slice();

    if (sortValue === 'discount') {
      sortedCards.sort((a, b) => parseDiscountValue(b) - parseDiscountValue(a));
    } else if (sortValue === 'expiring') {
      sortedCards.sort((a, b) => parseExpiryDate(a) - parseExpiryDate(b));
    }

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
        noResultsMsg.textContent = 'No deals match "' + searchTerm + '" yet — try browsing all deals below.';
      }
    }
  } else {
    applyFilterAndSort();
  }
}

/* ---------- 5b. Blog page (home): category filter ---------- */
const blogGrid = document.getElementById('blogGrid');
const blogFilters = document.getElementById('blogFilters');
const noBlogResultsMsg = document.getElementById('noBlogResultsMsg');

if (blogGrid && blogFilters) {
  const blogCards = Array.from(blogGrid.querySelectorAll('.blog-card'));

  function applyBlogFilter() {
    const activeChip = blogFilters.querySelector('.chip-filter.active');
    const activeCategory = activeChip ? activeChip.getAttribute('data-category') : 'all';
    let visibleCount = 0;

    blogCards.forEach((card) => {
      const matches = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    if (noBlogResultsMsg) {
      noBlogResultsMsg.hidden = visibleCount !== 0;
    }
  }

  blogFilters.querySelectorAll('.chip-filter').forEach((chip) => {
    chip.addEventListener('click', () => {
      blogFilters.querySelectorAll('.chip-filter').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyBlogFilter();
    });
  });
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
    e.preventDefault();

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

/* ---------- 8. Newsletter form validation + Mailchimp submission ---------- */
const newsletterForm = document.getElementById('newsletterForm');
const newsletterStatus = document.getElementById('newsletterStatus');

function submitToMailchimp(form, email, interests) {
  return new Promise((resolve, reject) => {
    const action = form.getAttribute('data-mc-action');
    const u = form.getAttribute('data-mc-u');
    const id = form.getAttribute('data-mc-id');

    if (!action || !u || !id || action.indexOf('YOUR-SUBDOMAIN') !== -1) {
      reject(new Error('Mailchimp is not configured yet — replace the data-mc-* placeholders in contact.html.'));
      return;
    }

    const callbackName = 'mcCallback_' + Date.now();

    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      if (data.result === 'success') {
        resolve(data);
      } else {
        reject(new Error(data.msg || 'Subscription failed.'));
      }
    };

    const params = new URLSearchParams();
    params.set('u', u);
    params.set('id', id);
    params.set('EMAIL', email);
    interests.forEach((value) => params.append('interest', value));
    params.set('c', callbackName);

    const script = document.createElement('script');
    script.src = action + '?' + params.toString();
    script.onerror = () => {
      delete window[callbackName];
      reject(new Error('Could not reach Mailchimp. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
}

if (newsletterForm && newsletterStatus) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newsletterEmail = document.getElementById('newsletterEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = newsletterEmail && emailPattern.test(newsletterEmail.value.trim());

    if (!emailValid) {
      newsletterStatus.textContent = 'Please enter a valid email address.';
      newsletterStatus.className = 'form-status error';
      return;
    }

    const selectedInterests = Array.from(
      newsletterForm.querySelectorAll('input[name="interest"]:checked')
    ).map((box) => box.value);

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    submitToMailchimp(newsletterForm, newsletterEmail.value.trim(), selectedInterests)
      .then(() => {
        newsletterStatus.textContent = "You're subscribed! Look out for our next dispatch.";
        newsletterStatus.className = 'form-status success';
        newsletterForm.reset();
      })
      .catch((err) => {
        newsletterStatus.textContent = err.message || 'Something went wrong subscribing. Please try again.';
        newsletterStatus.className = 'form-status error';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

/* =========================================
   9. COOKIE CONSENT BANNER + GOOGLE CONSENT MODE
   ========================================= */
const COOKIE_CONSENT_KEY = 'fitsabroad_cookie_consent'; // 'accepted' | 'rejected'

function applyConsent(choice) {
  if (typeof gtag !== 'function') return;
  const granted = choice === 'accepted';
  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied'
  });
}

function showCookieBanner() {
  if (document.getElementById('cookieBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.className = 'cookie-banner';
  banner.innerHTML =
    '<p>We use cookies for site analytics and ads. See our ' +
    '<a href="privacy-policy.html">Privacy Policy</a> for details.</p>' +
    '<div class="cookie-banner-actions">' +
    '<button id="cookieRejectBtn" class="btn btn-ghost">Reject Non-Essential</button>' +
    '<button id="cookieAcceptBtn" class="btn btn-primary">Accept All</button>' +
    '</div>';

  document.body.appendChild(banner);

  document.getElementById('cookieAcceptBtn').addEventListener('click', () => {
    setCookie(COOKIE_CONSENT_KEY, 'accepted', 180);
    applyConsent('accepted');
    banner.remove();
  });

  document.getElementById('cookieRejectBtn').addEventListener('click', () => {
    setCookie(COOKIE_CONSENT_KEY, 'rejected', 180);
    applyConsent('rejected');
    banner.remove();
  });
}

const existingConsent = getCookie(COOKIE_CONSENT_KEY);
if (existingConsent) {
  applyConsent(existingConsent);
} else {
  showCookieBanner();
}

// Dynamically add a "Cookie Settings" link to every page's footer so people
// can change their mind later, without editing every HTML file by hand.
const footerLinksList = document.querySelector('.footer-links');
if (footerLinksList && !document.getElementById('cookieSettingsLink')) {
  const settingsLi = document.createElement('li');
  settingsLi.innerHTML = '<a href="#" id="cookieSettingsLink">Cookie Settings</a>';
  footerLinksList.appendChild(settingsLi);

  document.getElementById('cookieSettingsLink').addEventListener('click', (e) => {
    e.preventDefault();
    showCookieBanner();
  });
}

/* =========================================
   10. DARK MODE TOGGLE (functional cookie)
   ========================================= */
const THEME_COOKIE_KEY = 'fitsabroad_theme'; // 'dark' | 'light'

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
}

const savedTheme = getCookie(THEME_COOKIE_KEY) || 'light';
applyTheme(savedTheme);

const navbarEl = document.querySelector('.navbar');
if (navbarEl && !document.getElementById('themeToggleBtn')) {
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'themeToggleBtn';
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  const hamburgerRef = navbarEl.querySelector('.hamburger');
  navbarEl.insertBefore(toggleBtn, hamburgerRef); // appends if hamburgerRef is null

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    setCookie(THEME_COOKIE_KEY, isDark ? 'dark' : 'light', 365);
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
}

/* =========================================
   11. RECENTLY VIEWED DEALS (functional cookie)
   ========================================= */
const RECENTLY_VIEWED_KEY = 'fitsabroad_recently_viewed';
const MAX_RECENTLY_VIEWED = 5;

function getRecentlyViewed() {
  const raw = getCookie(RECENTLY_VIEWED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function addRecentlyViewed(entry) {
  let list = getRecentlyViewed();
  list = list.filter((item) => item.code !== entry.code);
  list.unshift(entry);
  list = list.slice(0, MAX_RECENTLY_VIEWED);
  setCookie(RECENTLY_VIEWED_KEY, JSON.stringify(list), 30);
}

function renderRecentlyViewed() {
  if (!dealsGrid) return; // only render this on deals.html

  const list = getRecentlyViewed();
  let section = document.getElementById('recentlyViewedSection');

  if (list.length === 0) {
    if (section) section.remove();
    return;
  }

  if (!section) {
    section = document.createElement('div');
    section.id = 'recentlyViewedSection';
    section.className = 'recently-viewed';
    section.innerHTML = '<h2>Recently Viewed</h2><div class="recently-viewed-list"></div>';

    const filterSection = document.querySelector('.filter-section');
    if (filterSection && filterSection.parentNode) {
      filterSection.parentNode.insertBefore(section, filterSection);
    }
  }

  const listEl = section.querySelector('.recently-viewed-list');
  listEl.innerHTML = list
    .map((item) => '<span class="recently-viewed-chip">' + item.store + ' — ' + item.discount + '</span>')
    .join('');
}

renderRecentlyViewed(); // in case there's already history when the page loads