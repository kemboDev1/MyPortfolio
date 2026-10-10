// Aloqa ma'lumotlari: bo'sh qoldirilsa tugma ko'rinmaydi. O'zingiznikini yozing.
const CONTACT = {
  email: '',        // masalan: 'ismingiz@gmail.com'
  telegram: ''      // masalan: 'username' (@ belgisisiz)
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

document.documentElement.classList.add('js');
$('#year').textContent = new Date().getFullYear();

/* ---------- Intro cutscene ---------- */
const intro = $('#intro');
const nameEl = $('#introName');
nameEl.innerHTML = [...nameEl.textContent].map((ch, i) =>
  ch === ' ' ? ' ' : `<span style="--i:${i}" aria-hidden="true">${ch}</span>`).join('');
let introDone = false;
function finishIntro() {
  if (introDone) return;
  introDone = true;
  intro.classList.add('open');
  document.body.classList.add('ready');
  sessionStorage.setItem('mr-intro', '1');
  setTimeout(() => { intro.remove(); document.documentElement.classList.remove('lock'); }, 1200);
}
if (reduced || sessionStorage.getItem('mr-intro')) {
  intro.remove();
  document.body.classList.add('ready');
} else {
  document.documentElement.classList.add('lock');
  setTimeout(finishIntro, 3300);
  $('#introSkip').addEventListener('click', finishIntro);
}

/* ---------- Menu ---------- */
const toggle = $('.menu-toggle');
const nav = $('#nav');
const setMenu = (open) => {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  nav.classList.toggle('open', open);
};
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Contact buttons ---------- */
const links = $('#contact-links');
const addLink = (text, href) => {
  const a = document.createElement('a');
  a.className = 'btn btn-ghost magnetic';
  a.href = href; a.textContent = text;
  if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noreferrer noopener'; }
  links.appendChild(a);
};
if (CONTACT.telegram) addLink('Telegram', `https://t.me/${CONTACT.telegram}`);
if (CONTACT.email) addLink('Email', `mailto:${CONTACT.email}`);

/* ---------- Sound (off by default) ---------- */
let audio, soundOn = false;
const soundBtn = $('#sound');
function chime(freq = 523.25, len = 1.4) {
  if (!soundOn) return;
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();
  const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(.06, t + .08);
  g.gain.exponentialRampToValueAtTime(.0001, t + len);
  o.connect(g).connect(audio.destination);
  o.start(t); o.stop(t + len + .05);
}
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  soundBtn.setAttribute('aria-label', soundOn ? "Ovozni o'chirish" : 'Ovozni yoqish');
  $('b', soundBtn).textContent = soundOn ? 'Ovoz yoqiq' : "Ovoz o'chiq";
  chime(659.25, 1);
});

/* ---------- Star field (hero) ---------- */
const canvas = $('#stars');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, stars = [], heroVisible = true;
const pointer = { x: .5, y: .5 };
function resizeStars() {
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = W < 700 ? 55 : 130;
  stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: .2 + Math.random() * .8, c: Math.random() < .35 ? '211,255,91' : '157,131,255' }));
}
function drawStars() {
  ctx.clearRect(0, 0, W, H);
  const ox = (pointer.x - .5) * 40, oy = (pointer.y - .5) * 40;
  for (const s of stars) {
    if (!reduced) { s.y -= .12 * s.z; if (s.y < -5) { s.y = H + 5; s.x = Math.random() * W; } }
    s.px = s.x + ox * s.z; s.py = s.y + oy * s.z;
  }
  for (let i = 0; i < stars.length; i++) {
    const a = stars[i];
    for (let j = i + 1; j < stars.length; j++) {
      const b = stars[j], dx = a.px - b.px, dy = a.py - b.py, d = dx * dx + dy * dy;
      if (d < 9000) { ctx.strokeStyle = `rgba(157,131,255,${(1 - d / 9000) * .18})`; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke(); }
    }
    ctx.fillStyle = `rgba(${a.c},${.35 + a.z * .55})`;
    ctx.beginPath(); ctx.arc(a.px, a.py, a.z * 1.7, 0, 6.283); ctx.fill();
  }
}
function loopStars() { if (heroVisible && !document.hidden) drawStars(); if (!reduced) requestAnimationFrame(loopStars); }
resizeStars(); drawStars();
addEventListener('resize', () => { resizeStars(); drawStars(); });
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('#home'));
if (!reduced) loopStars();

/* ---------- Pointer effects ---------- */
const glow = $('.cursor-glow');
const laptop = $('#laptop');
if (finePointer) {
  addEventListener('pointermove', (e) => {
    glow.classList.add('on');
    glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight;
    if (!reduced && scrollY < innerHeight) {
      laptop.style.setProperty('--ry', `${-14 + (pointer.x - .5) * 22}deg`);
      laptop.style.setProperty('--rx', `${6 - (pointer.y - .5) * 14}deg`);
    }
  });
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - .5) * 14}deg`); el.style.setProperty('--rx', `${(.5 - y) * 12}deg`);
      el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .32}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Reveal, counters, word highlight ---------- */
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in'); io.unobserve(en.target);
}), { threshold: .12 });
$$('.reveal').forEach((el) => io.observe(el));

const counters = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  const el = en.target, end = +el.dataset.count, t0 = performance.now();
  const step = (t) => { const k = clamp((t - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  reduced ? (el.textContent = end) : requestAnimationFrame(step);
  counters.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach((el) => counters.observe(el));

const big = $('#bigText');
big.innerHTML = big.textContent.trim().split(/\s+/).map((w) => `<span class="bw">${w}</span>`).join(' ');
const words = $$('.bw', big);

/* ---------- Scroll-driven cutscenes ---------- */
const story = $('#story'), stage = $('#storyStage'), dev = $('#dev');
const chapters = $$('#chapters li'), chNum = $('#chNum'), storyBar = $('#storyBar'), devUrl = $('#devUrl');
const hues = [35, 265, 210, 75];
const urls = ['sketch.draft', 'figma.com/design', 'localhost:3000', 'portfolio.vercel.app'];
const notes = [392, 493.88, 587.33, 783.99];
let chapter = -1;
function setChapter(c) {
  if (c === chapter) return;
  const first = chapter === -1;
  chapter = c;
  chapters.forEach((li, i) => { li.classList.toggle('on', i === c); li.classList.toggle('past', i < c); });
  stage.classList.toggle('s1', c >= 1); stage.classList.toggle('s2', c >= 2); stage.classList.toggle('s3', c >= 3);
  stage.style.setProperty('--hue', hues[c]);
  chNum.textContent = `0${c + 1}`;
  devUrl.textContent = urls[c];
  if (!first) chime(notes[c], 1.6);
}
const outro = $('#outro'), outroText = $('#outroText'), browser = $('#browser3d'), header = $('#header');
const progress = $('.scroll-progress i');
const navLinks = $$('a:not(.nav-cta)', nav);
const spyTargets = ['story', 'about', 'skills', 'work'].map((id) => $('#' + id));

function update() {
  const vh = innerHeight, y = scrollY;
  progress.style.width = `${(y / (document.documentElement.scrollHeight - vh)) * 100}%`;
  header.classList.toggle('scrolled', y > 40);
  const hero = $('.hero-inner');
  if (y < vh) hero.style.transform = `translateY(${y * .12}px)`;

  // Cutscene 1
  let r = story.getBoundingClientRect();
  let p = clamp(-r.top / (r.height - vh));
  setChapter(Math.min(3, Math.floor(p * 4)));
  storyBar.style.width = `${p * 100}%`;
  stage.style.setProperty('--dry', `${-20 + p * 40}deg`);
  stage.style.setProperty('--drx', `${10 - Math.sin(p * Math.PI) * 10}deg`);
  stage.style.setProperty('--ds', (.92 + Math.sin(p * Math.PI) * .12).toFixed(3));
  dev.style.setProperty('--dry', `${-20 + p * 40}deg`);
  dev.style.setProperty('--drx', `${10 - Math.sin(p * Math.PI) * 10}deg`);
  dev.style.setProperty('--ds', (.92 + Math.sin(p * Math.PI) * .12).toFixed(3));

  // About words
  const br = big.getBoundingClientRect();
  const bp = clamp((vh * .85 - br.top) / (br.height + vh * .35));
  const lit = Math.floor(bp * (words.length + 1));
  words.forEach((w, i) => w.classList.toggle('lit', i < lit));

  // Project browser tilt
  const pr = browser.getBoundingClientRect();
  const t = clamp((pr.top + pr.height / 2 - vh / 2) / vh, -1, 1);
  browser.style.setProperty('--bry', `${-14 + (1 - Math.abs(t)) * 8}deg`);
  browser.style.setProperty('--brx', `${10 + t * 14}deg`);

  // Cutscene 2: zoom through
  r = outro.getBoundingClientRect();
  p = clamp(-r.top / (r.height - vh));
  const zp = clamp((p - .22) / .78);
  outro.style.setProperty('--os', (1 + Math.pow(zp, 2.2) * 22).toFixed(3));
  outro.style.setProperty('--ot', p < .7 ? 1 : clamp(1 - (p - .7) / .22).toFixed(3));
  outro.style.setProperty('--og', (.4 + p * 3.2).toFixed(3));
  outro.style.setProperty('--oo', (.4 + Math.sin(p * Math.PI) * .6).toFixed(3));
  outro.style.setProperty('--osub', clamp((p - .55) / .25).toFixed(3));

  // Nav spy
  let active = '';
  spyTargets.forEach((s) => { const b = s.getBoundingClientRect(); if (b.top < vh * .5 && b.bottom > vh * .5) active = s.id; });
  navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${active}`));
}
let ticking = false;
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
update();
