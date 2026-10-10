// Aloqa ma'lumotlari: bo'sh qoldirilsa tugma ko'rinmaydi. O'zingiznikini yozing.
const CONTACT = {
  email: '',        // masalan: 'ismingiz@gmail.com'
  telegram: ''      // masalan: 'username' (@ belgisisiz)
};

document.documentElement.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();

// Mobil menyu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
const setMenu = (open) => {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  nav.classList.toggle('open', open);
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Aloqa tugmalari (faqat to'ldirilganlari)
const links = document.getElementById('contact-links');
const add = (text, href) => {
  const a = document.createElement('a');
  a.className = 'btn btn-ghost';
  a.href = href;
  a.textContent = text;
  if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noreferrer noopener'; }
  links.appendChild(a);
};
if (CONTACT.telegram) add('Telegram', `https://t.me/${CONTACT.telegram}`);
if (CONTACT.email) add('Email', `mailto:${CONTACT.email}`);

// Bo'limlar paydo bo'lishi
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// Menyuda faol bo'limni belgilash
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...nav.querySelectorAll('a:not(.nav-cta)')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => spy.observe(s));
