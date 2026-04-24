document.documentElement.classList.add('js-ready');

const body = document.body;
const menuToggles = document.querySelectorAll('.menu-toggle');
const menuToggle = menuToggles[0];
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const languageButtons = document.querySelectorAll('[data-set-language]');
const form = document.querySelector('#booking-form');
const feedback = document.querySelector('#form-feedback');
const year = document.querySelector('#current-year');
const todayInput = document.querySelector('#date');
const themeToggle = document.querySelector('.theme-toggle');

// Theme: restore saved preference
const savedTheme = localStorage.getItem('s55-theme');
if (savedTheme === 'light') body.classList.add('light-mode');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = body.classList.toggle('light-mode');
    localStorage.setItem('s55-theme', isLight ? 'light' : 'dark');
    themeToggle.setAttribute('aria-label', isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro');
  });
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
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const lang = button.dataset.setLanguage;
    body.classList.toggle('lang-en', lang === 'en');
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-AO';

    languageButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn === button);
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
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const service = String(formData.get('service') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const notes = String(formData.get('notes') || '').trim();
    const isEnglish = body.classList.contains('lang-en');

    const phoneDigits = phone.replace(/\D/g, '');
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const setMessage = (message, type) => {
      feedback.textContent = message;
      feedback.classList.remove('is-error', 'is-success');
      feedback.classList.add(type);
    };

    if (!name || !phone || !service || !date) {
      setMessage(
        isEnglish ? 'Please fill in all required fields.' : 'Preencha todos os campos obrigatórios.',
        'is-error'
      );
      return;
    }

    if (phoneDigits.length < 9) {
      setMessage(
        isEnglish ? 'Enter a valid phone number.' : 'Introduza um número de telefone válido.',
        'is-error'
      );
      return;
    }

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      setMessage(
        isEnglish ? 'Choose a valid future date.' : 'Escolha uma data futura válida.',
        'is-error'
      );
      return;
    }

    const text = isEnglish
      ? `Hello Sartorial 55, I would like to book an appointment.%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0APreferred date: ${encodeURIComponent(date)}%0ANotes: ${encodeURIComponent(notes || 'None')}`
      : `Olá Sartorial 55, gostaria de agendar um atendimento.%0A%0ANome: ${encodeURIComponent(name)}%0ATelefone: ${encodeURIComponent(phone)}%0AServiço: ${encodeURIComponent(service)}%0AData pretendida: ${encodeURIComponent(date)}%0ANotas: ${encodeURIComponent(notes || 'Sem notas')}`;

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
    name: 'Smoking Executivo',
    namePt: 'Smoking Executivo',
    nameEn: 'Executive Smoking',
    type: 'Fato',
    typeEn: 'Suit',
    description: 'Corte impecável para ocasiões formais e de cerimónia. Estrutura refinada, lapela de seda e acabamento artesanal.',
    descriptionEn: 'Impeccable cut for formal and ceremonial occasions. Refined structure, silk lapel and artisanal finishing.',
  },
  {
    image: 'assets/images/blazerbluesport.svg',
    imageAlt: 'Blazer sport azul Sartorial 55',
    name: 'Blazer Sport Azul',
    namePt: 'Blazer Sport Azul',
    nameEn: 'Blue Sport Blazer',
    type: 'Casaco',
    typeEn: 'Jacket',
    description: 'Equilíbrio entre elegância casual e presença executiva. Tecido premium com textura visível e botões contrastantes.',
    descriptionEn: 'A balance between casual elegance and executive presence. Premium textured fabric with contrasting buttons.',
  },
  {
    image: 'assets/images/camisa-oxford.jpeg',
    imageFallback: 'assets/images/camisa-oxford.jpeg',
    imageAlt: 'Camisa personalizada Sartorial 55',
    name: 'Camisa Premium',
    namePt: 'Camisa Premium',
    nameEn: 'Premium Shirt',
    type: 'Camisa',
    typeEn: 'Shirt',
    description: 'Colarinho feito à medida, canhão duplo e tecido de algodão egipcio de 140 fios. Detalhe que define o visual.',
    descriptionEn: 'Bespoke collar, double barrel cuff and 140-thread Egyptian cotton fabric. Details that define the look.',
  },
  {
    image: 'assets/images/Oxford.jpeg',
    imageFallback: 'assets/images/Oxford.jpeg',
    imageAlt: 'Sapatos clássicos Sartorial 55',
    name: 'Oxford Clássico',
    namePt: 'Oxford Clássico',
    nameEn: 'Classic Oxford',
    type: 'Sapatos',
    typeEn: 'Shoes',
    description: 'Modelo Oxford em couro plena flor, construção Blake Rapid para leveza e durabilidade. Acabamento espelhado.',
    descriptionEn: 'Full-grain leather Oxford, Blake Rapid construction for lightness and durability. Mirror-polished finish.',
  },
];

// ── Render cards ─────────────────────────────────────
const galleryRoot = document.getElementById('premium-gallery');
const modal = document.getElementById('gallery-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalType = document.getElementById('modal-type');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalCta = document.getElementById('modal-cta');

function isEnglish() {
  return document.body.classList.contains('lang-en');
}

function renderGallery() {
  if (!galleryRoot) return;
  galleryRoot.innerHTML = '';

  galleryItems.forEach((item, index) => {
    const lang = isEnglish();
    const article = document.createElement('article');
    article.className = 'pgc reveal';
    article.setAttribute('role', 'listitem');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', lang ? item.nameEn : item.namePt);

    // Image source: prefer webp if available
    const imgSrc = item.image;
    const imgFallback = item.imageFallback || item.image;

    article.innerHTML = `
      <div class="pgc__img-wrap">
        ${item.imageFallback
          ? `<picture>
              <source srcset="${imgSrc}" type="image/webp" />
              <img src="${imgFallback}" alt="${item.imageAlt}" loading="lazy" decoding="async" width="400" height="450" />
            </picture>`
          : `<img src="${imgSrc}" alt="${item.imageAlt}" loading="lazy" decoding="async" width="400" height="450" />`}
        <span class="pgc__badge" aria-hidden="true">${lang ? item.typeEn : item.type}</span>
      </div>
      <div class="pgc__body">
        <h3 class="pgc__name">${lang ? item.nameEn : item.namePt}</h3>
        <p class="pgc__desc">${lang ? item.descriptionEn : item.description}</p>
        <button class="pgc__cta" type="button" data-index="${index}" aria-haspopup="dialog">
          <span data-lang="pt">Ver Detalhes</span><span data-lang="en" ${!lang ? 'style="display:none"' : ''}>View Details</span>
        </button>
      </div>`;

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

// ── Open modal ───────────────────────────────────────
function openModal(index) {
  const item = galleryItems[index];
  if (!item || !modal) return;

  const lang = isEnglish();
  const imgSrc = item.imageFallback || item.image;

  modalImg.src = imgSrc;
  modalImg.alt = item.imageAlt;
  modalType.textContent = lang ? item.typeEn : item.type;
  modalTitle.textContent = lang ? item.nameEn : item.namePt;
  modalDesc.textContent = lang ? item.descriptionEn : item.description;

  // Sync bilingual spans in modal CTA
  if (modalCta) {
    modalCta.querySelectorAll('[data-lang]').forEach((el) => {
      el.style.display = (el.dataset.lang === 'pt' && !lang) || (el.dataset.lang === 'en' && lang) ? 'inline' : 'none';
    });
  }

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// ── Event delegation for card CTAs ──────────────────
if (galleryRoot) {
  galleryRoot.addEventListener('click', (e) => {
    const btn = e.target.closest('.pgc__cta');
    if (btn) openModal(Number(btn.dataset.index));
  });

  galleryRoot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('.pgc__cta');
      if (btn) { e.preventDefault(); openModal(Number(btn.dataset.index)); }
    }
  });
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

if (modalCta) {
  modalCta.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    const booking = document.getElementById('booking');
    if (booking) booking.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
});

// Re-render when language toggles so card text & badges update
languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Slight delay ensures body class is toggled first
    setTimeout(renderGallery, 0);
  });
});

// Initial render
renderGallery();
