const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const intro = document.querySelector('#intro-scene');
const skipIntro = document.querySelector('#intro-skip');
const closeIntro = () => {
  intro.classList.add('intro-finished');
  window.setTimeout(() => intro.remove(), 900);
  sessionStorage.setItem('portfolio-intro-seen', '1');
};

if (sessionStorage.getItem('portfolio-intro-seen') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  intro.remove();
} else {
  window.setTimeout(closeIntro, 5200);
  skipIntro.addEventListener('click', closeIntro, { once: true });
}

const scenePlay = document.querySelector('#scene-play');
const sceneSound = document.querySelector('#scene-sound');
const sceneFrame = document.querySelector('#scene-frame');
const sceneTitle = document.querySelector('#scene-title');
const sceneCaption = document.querySelector('#scene-caption');
const scenePart = document.querySelector('#scene-part');
const sceneTime = document.querySelector('#scene-time');
const sceneProgress = document.querySelector('#scene-progress');
const sceneStatus = document.querySelector('.scene-status');
const chapters = [
  {title:'From idea<br><em>to interface.</em>',caption:'DESIGN · CODE · CREATE',float:'&lt; HTML / CSS / JS &gt;'},
  {title:'Make it<br><em>take shape.</em>',caption:'WIREFRAME · COLOR · DETAIL',float:'FIGMA → UI'},
  {title:'Build the<br><em>real thing.</em>',caption:'HTML · CSS · JAVASCRIPT',float:'git commit — project'},
  {title:'Keep learning.<br><em>Keep creating.</em>',caption:'CODYCAMP · NEXT CHAPTER',float:'DEPLOY → GROW'}
];
let sceneTimer;
let audioContext;
let ambience;
let soundEnabled = true;
let sceneStartedAt = 0;
let audioNodes = [];

function playChime(context, frequency, when, length = 1.4) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, when);
  envelope.gain.setValueAtTime(0.0001, when);
  envelope.gain.exponentialRampToValueAtTime(0.045, when + 0.12);
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + length);
  oscillator.connect(envelope).connect(context.destination);
  oscillator.start(when);
  oscillator.stop(when + length + .05);
  audioNodes.push(oscillator);
}

function startSceneSound() {
  if (!soundEnabled) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume();
  if (ambience) return;
  ambience = audioContext.createGain();
  ambience.gain.value = soundEnabled ? .025 : 0;
  ambience.connect(audioContext.destination);
  [110, 164.81, 220].forEach((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = index === 1 ? 'triangle' : 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = index === 0 ? .35 : .13;
    osc.connect(gain).connect(ambience);
    osc.start();
    audioNodes.push(osc);
  });
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880, 739.99].forEach((note, index) => {
    playChime(audioContext, note, now + 1 + index * 2.6, 1.8);
  });
}

function stopSceneSound() {
  audioNodes.forEach((node) => { try { node.stop(); } catch {} });
  audioNodes = [];
  ambience = null;
}

function updateScene() {
  const elapsed = Math.floor((Date.now() - sceneStartedAt) / 1000);
  const remaining = Math.max(0, 10 - elapsed);
  const chapter = Math.min(3, Math.floor(elapsed / 2.5));
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  sceneTime.textContent = `${minutes}:${seconds}`;
  sceneProgress.style.width = `${Math.min(100, (elapsed / 10) * 100)}%`;
  if (scenePart.textContent !== `· 0${chapter + 1} / 04`) {
    scenePart.textContent = `· 0${chapter + 1} / 04`;
    sceneTitle.innerHTML = chapters[chapter].title;
    sceneCaption.textContent = chapters[chapter].caption;
    document.querySelector('.scene-float-c').innerHTML = chapters[chapter].float;
    sceneFrame.classList.remove('scene-chapter-change');
    void sceneFrame.offsetWidth;
    sceneFrame.classList.add('scene-chapter-change');
    if (soundEnabled && audioContext) playChime(audioContext, [392, 493.88, 587.33, 698.46][chapter], audioContext.currentTime, 2.2);
  }
  if (remaining === 0) {
    clearInterval(sceneTimer);
    sceneTimer = undefined;
    scenePlay.textContent = '↻';
    scenePlay.disabled = false;
    scenePlay.setAttribute('aria-label', 'Cutscene’ni qayta boshlash');
    sceneStatus.textContent = 'TUGADI · REPLAY';
    stopSceneSound();
  }
}

scenePlay.addEventListener('click', () => {
  if (sceneTimer) return;
  sceneStartedAt = Date.now();
  scenePlay.textContent = '•';
  scenePlay.disabled = true;
  scenePlay.setAttribute('aria-label', 'Cutscene ijro etilmoqda');
  sceneStatus.textContent = 'PLAYING · 01:00';
  startSceneSound();
  updateScene();
  sceneTimer = window.setInterval(updateScene, 250);
});

sceneSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  sceneSound.textContent = soundEnabled ? '♫' : '×';
  sceneSound.setAttribute('aria-label', soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o‘chirilgan');
  sceneSound.title = soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o‘chirilgan';
  if (ambience) ambience.gain.value = soundEnabled ? .025 : 0;
});
