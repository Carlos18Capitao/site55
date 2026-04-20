document.documentElement.classList.add('js-ready');

const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
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
