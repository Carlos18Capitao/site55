document.documentElement.classList.add('js-ready');

const body = document.body;
const menuToggles = document.querySelectorAll('.menu-toggle');
const menuToggle = menuToggles[0];
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const languageButtons = Array.from(document.querySelectorAll('[data-set-language]'));
const form = document.querySelector('#booking-form');
const feedback = document.querySelector('#form-feedback');
const year = document.querySelector('#current-year');
const todayInput = document.querySelector('#date');
const themeToggles = Array.from(document.querySelectorAll('.theme-toggle'));

// --- Security helpers ---
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeText(str) {
  // remove script tags and control characters
  return String(str).replace(/<\/?script[^>]*>/gi, '').replace(/[\x00-\x1F\x7F]/g, '').trim();
}

// Theme: restore saved preference
const savedTheme = localStorage.getItem('s55-theme');
if (savedTheme === 'light') body.classList.add('light-mode');

// Update header/footer logo sources according to theme class
function updateLogos() {
  const isLight = body.classList.contains('light-mode');
  const lightSrc = 'assets/icons/logo-white-letter.svg';
  const darkSrc = 'assets/icons/logo-black-letter.svg';

  // Header brand logos
  document.querySelectorAll('.brand__logo').forEach((img) => {
    try { img.src = isLight ? darkSrc : lightSrc; } catch (e) { /* ignore */ }
  });

  // Footer logo(s)
  document.querySelectorAll('.site-footer__logo').forEach((img) => {
    try { img.src = isLight ? darkSrc : lightSrc; } catch (e) { /* ignore */ }
  });

  // WhatsApp float icon
  const waImg = document.querySelector('.whatsapp-float img');
  if (waImg) waImg.src = isLight ? 'assets/icons/whatsapp.png' : 'assets/icons/whatsapp-4-black.png';
}

// ensure logos reflect saved theme on load
updateLogos();

if (themeToggles.length) {
  const syncThemeAria = (isLight) => {
    themeToggles.forEach((btn) => btn.setAttribute('aria-label', isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro'));
  };

  themeToggles.forEach((t) => {
    t.addEventListener('click', () => {
      const isLight = body.classList.toggle('light-mode');
      localStorage.setItem('s55-theme', isLight ? 'light' : 'dark');
      syncThemeAria(isLight);
  updateLogos();
    });
  });

  // Ensure aria labels reflect current theme on load
  syncThemeAria(body.classList.contains('light-mode'));
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (todayInput) {
  todayInput.min = new Date().toISOString().split('T')[0];
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    body.classList.toggle('menu-open');
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    // Active state on click
    navLinks.forEach((l) => l.classList.remove('is-active'));
    link.classList.add('is-active');
  });
});

// Update active nav link based on scroll position
const sections = document.querySelectorAll('main [id]');

if ('IntersectionObserver' in window && sections.length) {
  // Track which sections are currently visible and pick the topmost one
  const visibleSections = new Set();

  const setActiveLink = () => {
    if (!visibleSections.size) return;

    // Among all visible sections, activate the one closest to the top of the viewport
    let topmost = null;
    let topmostY = Infinity;
    visibleSections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const y = Math.abs(el.getBoundingClientRect().top);
        if (y < topmostY) { topmostY = y; topmost = id; }
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${topmost}`);
    });
  };

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          visibleSections.add(id);
        } else {
          visibleSections.delete(id);
        }
      });
      setActiveLink();
    },
    // Fires when any part of the section is within the middle 60% of the viewport
    { rootMargin: '-10% 0px -30% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const lang = button.dataset.setLanguage;
    body.classList.toggle('lang-en', lang === 'en');
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-AO';

    languageButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.setLanguage === lang);
    });
  });
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (form && feedback) {
  // Helpers to show/clear per-field errors
  const setFieldError = (fieldId, message) => {
    const el = document.getElementById(`error-${fieldId}`);
    if (el) el.textContent = message;
    const input = document.getElementById(fieldId);
    if (input) input.setAttribute('aria-invalid', 'true');
  };

  const clearFieldErrors = () => {
    ['name', 'phone', 'service', 'date', 'notes'].forEach((id) => {
      const el = document.getElementById(`error-${id}`);
      if (el) el.textContent = '';
      const input = document.getElementById(id);
      if (input) input.removeAttribute('aria-invalid');
    });
    feedback.textContent = '';
    feedback.classList.remove('is-error', 'is-success');
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const service = String(formData.get('service') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const notes = String(formData.get('notes') || '').trim();
    const isEnglish = body.classList.contains('lang-en');

  // Validate against HTML patterns as a second line of defence
  const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,80}$/;
  const phonePattern = /^[+()\d\s-]{9,20}$/;
  const notesPattern = /^([\s\S]{0,500})$/;

    const phoneDigits = phone.replace(/\D/g, '');
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const setMessage = (message, type) => {
      feedback.textContent = message;
      feedback.classList.remove('is-error', 'is-success');
      feedback.classList.add(type);
    };

    // Clear prior field errors
    clearFieldErrors();

    if (!name || !phone || !service || !date) {
      if (!name) setFieldError('name', isEnglish ? 'Name is required.' : 'Nome obrigatório.');
      if (!phone) setFieldError('phone', isEnglish ? 'Phone is required.' : 'Telefone obrigatório.');
      if (!service) setFieldError('service', isEnglish ? 'Service selection is required.' : 'Selecção de serviço obrigatória.');
      if (!date) setFieldError('date', isEnglish ? 'Preferred date is required.' : 'Data pretendida obrigatória.');
      setMessage(isEnglish ? 'Please fill required fields.' : 'Preencha os campos obrigatórios.', 'is-error');
      return;
    }

    // enforce pattern checks
    if (!namePattern.test(name)) {
      setFieldError('name', isEnglish ? 'Enter a valid name.' : 'Introduza um nome válido.');
      setMessage(isEnglish ? 'Please correct the highlighted fields.' : 'Corrija os campos assinalados.', 'is-error');
      return;
    }

    if (!phonePattern.test(phone)) {
      setFieldError('phone', isEnglish ? 'Enter a valid phone number.' : 'Introduza um número de telefone válido.');
      setMessage(isEnglish ? 'Please correct the highlighted fields.' : 'Corrija os campos assinalados.', 'is-error');
      return;
    }

    if (phoneDigits.length < 9) {
      setFieldError('phone', isEnglish ? 'Phone must contain at least 9 digits.' : 'O telefone deve ter pelo menos 9 dígitos.');
      setMessage(isEnglish ? 'Please correct the highlighted fields.' : 'Corrija os campos assinalados.', 'is-error');
      return;
    }

    if (!notesPattern.test(notes)) {
      setFieldError('notes', isEnglish ? 'Notes contain invalid characters.' : 'Notas com caracteres inválidos.');
      setMessage(isEnglish ? 'Please correct the highlighted fields.' : 'Corrija os campos assinalados.', 'is-error');
      return;
    }

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      setFieldError('date', isEnglish ? 'Choose a valid future date.' : 'Escolha uma data futura válida.');
      setMessage(isEnglish ? 'Please correct the highlighted fields.' : 'Corrija os campos assinalados.', 'is-error');
      return;
    }

    // Sanitize values before encoding
    const safeName = escapeHtml(sanitizeText(name));
    const safePhone = escapeHtml(sanitizeText(phone));
    const safeService = escapeHtml(sanitizeText(service));
    const safeDate = escapeHtml(sanitizeText(date));
    const safeNotes = escapeHtml(sanitizeText(notes || (isEnglish ? 'None' : 'Sem notas')));

    const text = isEnglish
      ? `Hello Sartorial 55, I would like to book an appointment.%0A%0AName: ${encodeURIComponent(safeName)}%0APhone: ${encodeURIComponent(safePhone)}%0AService: ${encodeURIComponent(safeService)}%0APreferred date: ${encodeURIComponent(safeDate)}%0ANotes: ${encodeURIComponent(safeNotes)}`
      : `Olá Sartorial 55, gostaria de agendar um atendimento.%0A%0ANome: ${encodeURIComponent(safeName)}%0ATelefone: ${encodeURIComponent(safePhone)}%0AServiço: ${encodeURIComponent(safeService)}%0AData pretendida: ${encodeURIComponent(safeDate)}%0ANotas: ${encodeURIComponent(safeNotes)}`;

    setMessage(
      isEnglish ? 'Valid request. Redirecting to WhatsApp...' : 'Pedido válido. A redirecionar para o WhatsApp...',
      'is-success'
    );

    window.open(`https://wa.me/244929653400?text=${text}`, '_blank', 'noopener');
    form.reset();
    if (todayInput) {
      todayInput.min = new Date().toISOString().split('T')[0];
    }
  });
}

/* ─────────────────────────────────────────────────────
   Premium Gallery Card System
   ───────────────────────────────────────────────────── */

const galleryItems = [
  {
    image: 'assets/images/smooking.svg',
    imageAlt: 'Smoking executivo Sartorial 55',
  },
  {
    image: 'assets/images/blazerbluesport.svg',
    imageAlt: 'Blazer sport azul Sartorial 55',
  },
  {
    image: 'assets/images/camisa-oxford.jpeg',
    imageFallback: 'assets/images/camisa-oxford.jpeg',
    imageAlt: 'Camisa personalizada Sartorial 55',
  },
  {
    image: 'assets/images/Oxford.jpeg',
    imageFallback: 'assets/images/Oxford.jpeg',
    imageAlt: 'Sapatos clássicos Sartorial 55',
  },
];

// ── Render photos only ───────────────────────────────
const galleryRoot = document.getElementById('premium-gallery');

function renderGallery() {
  if (!galleryRoot) return;
  galleryRoot.innerHTML = '';

  galleryItems.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'gallery-photo reveal';
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', item.imageAlt);

    const imgSrc = item.image;
    const imgFallback = item.imageFallback || item.image;

    article.innerHTML = item.imageFallback
      ? `<picture>
          <source srcset="${imgSrc}" type="image/webp" />
          <img src="${imgFallback}" alt="${item.imageAlt}" loading="lazy" decoding="async" width="400" height="450" />
        </picture>`
      : `<img src="${imgSrc}" alt="${item.imageAlt}" loading="lazy" decoding="async" width="400" height="450" />`;

    galleryRoot.appendChild(article);
  });

  // Re-observe new .reveal elements
  if ('IntersectionObserver' in window) {
    const newReveal = galleryRoot.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    newReveal.forEach((el) => obs.observe(el));
  } else {
    galleryRoot.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }
}

// Initial render
renderGallery();
