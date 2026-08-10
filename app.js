/* ═══════════════════════════════════════════════════════════════════════
   ˚｡⋆୨୧˚  study nook · app.js  ˚୨୧⋆｡˚
   Vanilla JS, sin dependencias.

   Todo lo que quieras cambiar (frases, premios, minutos) está en CONFIG,
   justo acá arriba. No hace falta leer el resto del archivo.
   ═══════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── premios canjeables en la vida real ─────────────────────────────
     `threshold` = pomodoros acumulados en total (no por día).
     `code` = 3 letras que aparecen en el vale.                        */
  REWARDS: [
    { threshold: 6,  emoji: '🧋', label: 'Un bubble tea de tu sabor',            code: 'BBT' },
    { threshold: 15, emoji: '👗', label: 'Carrito de Shein',                     code: 'SHN' },
    { threshold: 30, emoji: '🎬', label: 'Salida al cine con tu hermano',        code: 'CIN' },
    { threshold: 60, emoji: '✨', label: 'Combo grande: cine + bubble tea + Shein', code: 'CMB' },
  ],

  /* ── frases que rotan mientras estudia ──────────────────────────────
     {name} se reemplaza por su nombre.                                */
  QUOTES: [
    'respira. lo estás haciendo mejor de lo que crees ♡',
    'no tienes que hacerlo perfecto, {name}. solo tienes que empezar.',
    'cada página que lees hoy es una pregunta menos que temer mañana.',
    'tu única competencia es la {name} de ayer.',
    'los nervios y la emoción se sienten igual. elige llamarlo emoción.',
    'un tema a la vez. así se come un elefante.',
    'estudiar cansada no es lo mismo que estudiar mal.',
    'nadie que admiras empezó sabiendo. todos empezaron confundidos.',
    'si se te olvidó, es porque lo aprendiste. vuelve a pasar por ahí.',
    'la constancia le gana al talento cuando el talento no es constante.',
    'no estás atrasada. vas a tu ritmo, que es distinto.',
    'hoy solo tienes que ganarle a la silla. siéntate y lo demás llega.',
    'el examen mide lo que estudiaste, no lo que vales.',
    '{name}, mereces esa carrera. y ella te merece a ti.',
    'las ganas llegan después de empezar, no antes. es trampa saberlo.',
    'tu cerebro está construyendo algo ahora mismo, aunque no lo sientas.',
    'descansar también es estudiar. por eso existen los breaks.',
    'lo difícil de hoy es lo fácil de dentro de un mes.',
    'no te compares con quien lleva más tiempo entrenando.',
    'guarda energía para mañana. esto es maratón, no sprint.',
    'un pomodoro imperfecto vale más que un día perfecto que no llegó.',
    'si te bloqueaste: párate, agua, vuelve. no es falta de capacidad.',
    'la ansiedad te habla del futuro. tú vuelve a esta página.',
    'estás haciendo algo valiente y casi nadie te lo va a decir. yo sí.',
    'no necesitas motivación todos los días. necesitas horario.',
    'lo que hoy te cuesta, en marzo lo vas a explicar de memoria.',
    'error entendido = tema aprendido. busca los tuyos.',
    'tu futuro yo está tomando notas de esto. gracias, {name}.',
    'menos pestañas abiertas, más páginas leídas.',
    'el mejor momento para estudiar era ayer. el segundo mejor es ahora.',
    'no te rindas en el capítulo más difícil del libro.',
    'estudiar 25 minutos de verdad > 3 horas fingiendo.',
    'nadie va a creer en ti tanto como yo. pero intenta empatarme.',
    'suelta el celular. te espera al otro lado del timer, no se va.',
    'confía en el proceso aunque hoy no se vea el resultado.',
    'lo estás logrando ahora. no cuando entres: ahora.',
    'la disciplina es quererse a futuro. estás siendo buena contigo.',
    'si hoy solo puedes un pomodoro, ese pomodoro cuenta igual.',
    'tu esfuerzo no está desapareciendo. se está acumulando.',
    'orgullo de hermano nivel máximo, {name} ♡',
  ],

  /* ── frases al completar un pomodoro ────────────────────────────── */
  CELEBRATIONS: [
    '¡uno más! así se hace, {name} ♡',
    'pomodoro completo. tómate el break, te lo ganaste.',
    'mira eso: 25 minutos que ya nadie te quita.',
    '¡bien ahí! el vale de bubble tea está más cerca.',
    'eso fue concentración de verdad. estoy orgulloso.',
    'sumaste otro. tu yo de marzo te lo agradece.',
  ],

  /* ── duraciones por defecto, en minutos ─────────────────────────── */
  DEFAULT_DURATIONS: { focus: 25, short: 5, long: 15 },

  /* cada cuántos pomodoros toca el break largo */
  LONG_BREAK_EVERY: 4,

  /* cada cuánto rota la frase, en milisegundos */
  QUOTE_ROTATION_MS: 45000,
};

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL ART
   Los sprites se escriben como texto y se convierten a SVG. Cada letra es
   un color. Así el dibujo se lee y se edita a mano.
   ═══════════════════════════════════════════════════════════════════════ */

const PX_COLORS = {
  '.': null,
  k: '#4A2B33',  // contorno
  w: '#FFFFFF',  // pelaje
  p: '#FF9EC4',  // rosa (orejitas)
  b: '#FFD9E4',  // rubor
  r: '#F0407A',  // fresa / naricita
  y: '#FFE9A8',  // amarillo
  g: '#7FBF9A',  // verde hoja
  c: '#6B4A55',  // café
};

const SPRITES = {
  /* gatita sentada, ojos abiertos */
  cat: [
    '................',
    '...kk......kk...',
    '..kppk....kppk..',
    '..kwwwwwwwwwwk..',
    '.kwwwwwwwwwwwwk.',
    '.kwwkkwwwwkkwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwbwwwrrwwwbwk.',
    '.kwwwwwwwwwwwwk.',
    '..kwwwwwwwwwwk..',
    '...kwwwwwwwwk...',
    '..kwwwwwwwwwwk..',
    '..kwwwwwwwwwwk..',
    '..kwwkwwwwkwwk..',
    '..kkk.kkkk.kkk..',
    '................',
  ],

  /* misma gatita parpadeando (ojos como rayitas) */
  catBlink: [
    '................',
    '...kk......kk...',
    '..kppk....kppk..',
    '..kwwwwwwwwwwk..',
    '.kwwwwwwwwwwwwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwbwwwrrwwwbwk.',
    '.kwwwwwwwwwwwwk.',
    '..kwwwwwwwwwwk..',
    '...kwwwwwwwwk...',
    '..kwwwwwwwwwwk..',
    '..kwwwwwwwwwwk..',
    '..kwwkwwwwkwwk..',
    '..kkk.kkkk.kkk..',
    '................',
  ],

  /* gatita echada, durmiendo */
  catSleep: [
    '................',
    '................',
    '................',
    '.....kk....kk...',
    '....kppk..kppk..',
    '....kwwwwwwwwk..',
    '...kwwwwwwwwwwk.',
    '...kwwkwwwwkwwk.',
    '...kwwwrrwwwwwk.',
    '..kwwwwwwwwwwwwk',
    '.kwwwwwwwwwwwwwk',
    '.kwwwwwwwwwwwwk.',
    '..kkkkkkkkkkkk..',
    '................',
    '................',
    '................',
  ],

  /* corazón 8×8 · bullets del checklist */
  heart: [
    '........',
    '.rr..rr.',
    'rrrrrrrr',
    'rrrrrrrr',
    '.rrrrrr.',
    '..rrrr..',
    '...rr...',
    '........',
  ],

  /* fresa 8×8 · los sellitos de cada pomodoro */
  strawberry: [
    '..ggg...',
    '.grrrg..',
    'rrrrrrr.',
    'rrrwrrr.',
    'rrrrrrr.',
    '.rrrrr..',
    '..rrr...',
    '...r....',
  ],
};

/** Convierte un sprite de texto a SVG, agrupando píxeles seguidos del mismo
 *  color en un solo <rect> para no generar cientos de nodos. */
function pixelArt(name, extraClass = '') {
  const rows = SPRITES[name];
  if (!rows) return '';
  const h = rows.length;
  const w = rows[0].length;
  let rects = '';

  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const ch = rows[y][x];
      const color = PX_COLORS[ch];
      if (!color) { x++; continue; }
      let len = 1;
      while (x + len < w && rows[y][x + len] === ch) len++;
      rects += `<rect x="${x}" y="${y}" width="${len}" height="1" fill="${color}"/>`;
      x += len;
    }
  }

  return `<svg class="${extraClass}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" `
       + `xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${rects}</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   ESTADO
   La fuente de verdad vive en Supabase, detrás de /api/state.
   localStorage es solo un espejo por si se cae internet.
   ═══════════════════════════════════════════════════════════════════════ */

const API = '/api/state';
const MIRROR_KEY = 'gress:mirror';
const FULLSCREEN_KEY = 'gress:fullscreen';

function defaultState() {
  return {
    version: 1,
    name: 'Grecia',
    goal: 'la carrera de mis sueños ♡',
    durations: { ...CONFIG.DEFAULT_DURATIONS },
    tasks: [],
    todayCount: 0,
    todayDate: null,
    streak: 0,
    lastActiveDate: null,
    totalPomodoros: 0,
    claimedRewards: [],
    muted: false,
    updatedAt: 0,
  };
}

let state = defaultState();
let serverReachable = true;
let pendingChanges = false;
let saveTimer = null;

/* ── espejo local ───────────────────────────────────────────────────── */

function writeMirror(data) {
  try { localStorage.setItem(MIRROR_KEY, JSON.stringify(data)); }
  catch { /* modo incógnito o storage lleno: seguimos sin espejo */ }
}

function readMirror() {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── indicador de conexión ──────────────────────────────────────────── */

function setReachable(ok) {
  if (serverReachable === ok) return;
  serverReachable = ok;
  const badge = $('#syncBadge');
  if (ok) {
    badge.hidden = true;
  } else {
    badge.hidden = false;
    badge.textContent = '✿ modo local';
    badge.dataset.tone = 'bad';
    badge.title = 'No se pudo conectar. Tus cambios se guardan acá y suben cuando vuelva la conexión.';
  }
}

/* ── carga y guardado ───────────────────────────────────────────────── */

async function fetchState() {
  const res = await fetch(API, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${res.status}`);
  return res.json();
}

async function loadState() {
  try {
    const data = await fetchState();
    setReachable(true);
    writeMirror(data);
    return data;
  } catch {
    setReachable(false);
    const mirror = readMirror();
    if (mirror) return { ...defaultState(), ...mirror };
    return defaultState();
  }
}

async function pushState() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error(`PUT ${res.status}`);
    const saved = await res.json();
    state.updatedAt = saved.updatedAt;
    pendingChanges = false;
    writeMirror(state);
    setReachable(true);
  } catch {
    pendingChanges = true;
    setReachable(false);
  }
}

/** `immediate` para lo que no se puede perder: completar un pomodoro
 *  y canjear un premio. El resto va con debounce. */
function save({ immediate = false } = {}) {
  pendingChanges = true;
  writeMirror(state);
  clearTimeout(saveTimer);
  if (immediate) { pushState(); return; }
  saveTimer = setTimeout(pushState, 800);
}

/** Al volver a la pestaña: si el servidor tiene algo más nuevo (por ejemplo
 *  porque marcó una tarea en el iPhone), lo adoptamos. */
async function refreshFromServer() {
  if (pendingChanges) { pushState(); return; }
  try {
    const data = await fetchState();
    setReachable(true);
    if ((data.updatedAt || 0) > (state.updatedAt || 0)) {
      state = data;
      writeMirror(state);
      renderAll();
    }
  } catch {
    setReachable(false);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════════════════════════════ */

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const pad2 = (n) => String(n).padStart(2, '0');

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function fmtClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

function withName(text) {
  return text.replace(/\{name\}/g, state.name || 'Grecia');
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function uid() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ═══════════════════════════════════════════════════════════════════════
   SONIDO · Web Audio, sin archivos externos
   ═══════════════════════════════════════════════════════════════════════ */

let audioCtx = null;

function unlockAudio() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { audioCtx = null; }
}

function tone(freq, startAt, duration, peak, type = 'triangle') {
  if (!audioCtx || state.muted) return;
  const t0 = audioCtx.currentTime + startAt;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/* campanita de tres notas: mi · sol · do */
function chime() {
  [659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.15, 0.55, 0.16));
}

function blip() {
  tone(880, 0, 0.05, 0.04, 'square');
}

/* ═══════════════════════════════════════════════════════════════════════
   EL TIMER
   Anclado a un timestamp, no a contar ticks: así no se desfasa cuando ella
   minimiza la ventana o bloquea el teléfono.
   ═══════════════════════════════════════════════════════════════════════ */

const timer = {
  mode: 'focus',        // 'focus' | 'short' | 'long'
  running: false,
  deadline: 0,          // marca de tiempo absoluta en ms
  remaining: 0,         // lo que queda cuando está en pausa
  completedInCycle: 0,  // 0..LONG_BREAK_EVERY-1
};

let tickHandle = null;

const MODE_LABEL = {
  focus: '🍓 hora de concentrarse',
  short: '🧋 break cortito',
  long:  '✨ break largo, te lo ganaste',
};

function durationMs(mode = timer.mode) {
  const mins = state.durations[mode] ?? CONFIG.DEFAULT_DURATIONS[mode];
  return mins * 60 * 1000;
}

function timeLeft() {
  if (timer.running) return Math.max(0, timer.deadline - Date.now());
  return timer.remaining || durationMs();
}

function startTimer() {
  unlockAudio();
  if (timer.running) return;
  timer.deadline = Date.now() + (timer.remaining || durationMs());
  timer.remaining = 0;
  timer.running = true;
  if (timer.mode === 'focus') enterFocusMode();
  loopTick();
  renderTimer();
}

function pauseTimer() {
  if (!timer.running) return;
  timer.remaining = timeLeft();
  timer.running = false;
  stopLoop();
  renderTimer();
}

function toggleTimer() {
  blip();
  timer.running ? pauseTimer() : startTimer();
}

function resetTimer() {
  blip();
  timer.running = false;
  timer.remaining = 0;
  stopLoop();
  exitFocusMode();
  closeBreak();
  renderTimer();
}

function loopTick() {
  stopLoop();
  tickHandle = setInterval(onTick, 250);
  onTick();
}

function stopLoop() {
  if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
}

function onTick() {
  if (!timer.running) return;
  if (Date.now() >= timer.deadline) { completeBlock(); return; }
  renderTimer();
}

/** Se acabó el bloque actual. `counted` distingue terminar de saltar:
 *  saltar un pomodoro NO suma al contador de premios. */
function completeBlock({ counted = true } = {}) {
  stopLoop();
  timer.running = false;
  timer.remaining = 0;

  if (timer.mode === 'focus') {
    if (counted) {
      registerPomodoro();
      chime();
      showQuote(withName(randomOf(CONFIG.CELEBRATIONS)));
      timer.completedInCycle = (timer.completedInCycle + 1) % CONFIG.LONG_BREAK_EVERY;
    }
    exitFocusMode();
    timer.mode = timer.completedInCycle === 0 ? 'long' : 'short';
    openBreak();
    // el descanso arranca solo: si tiene que decidir empezarlo, no descansa
    timer.deadline = Date.now() + durationMs();
    timer.running = true;
    loopTick();
  } else {
    if (counted) chime();
    closeBreak();
    timer.mode = 'focus';
    renderTimer();          // se queda esperando a que ella presione empezar
  }

  renderAll();
}

function skipBlock() {
  blip();
  completeBlock({ counted: false });
}

/* ── modo foco ──────────────────────────────────────────────────────── */

let revealHandle = null;

function enterFocusMode() {
  document.body.classList.add('focus');
  $('#mascotArt').innerHTML = pixelArt('catSleep');   // se duerme al instante
  revealControls();
  if (localStorage.getItem(FULLSCREEN_KEY) === '1') {
    document.documentElement.requestFullscreen?.().catch(() => { /* el navegador puede negarse */ });
  }
  prefetchCat();
}

function exitFocusMode() {
  if (!document.body.classList.contains('focus')) return;
  document.body.classList.remove('focus', 'reveal');
  $('#mascotArt').innerHTML = pixelArt('cat');        // y se despierta
  clearTimeout(revealHandle);
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

/** En modo foco los controles están invisibles y aparecen al mover el mouse.
 *  Si están siempre a la vista, son una distracción más. */
function revealControls() {
  if (!document.body.classList.contains('focus')) return;
  document.body.classList.add('reveal');
  clearTimeout(revealHandle);
  revealHandle = setTimeout(() => document.body.classList.remove('reveal'), 2200);
}

/* ═══════════════════════════════════════════════════════════════════════
   PROGRESO · sellitos, racha y premios
   ═══════════════════════════════════════════════════════════════════════ */

function registerPomodoro() {
  const today = dayKey();

  if (state.todayDate !== today) {
    state.todayDate = today;
    state.todayCount = 0;
  }
  state.todayCount += 1;
  state.totalPomodoros += 1;

  if (state.lastActiveDate !== today) {
    state.streak = state.lastActiveDate === yesterdayKey() ? state.streak + 1 : 1;
    state.lastActiveDate = today;
  }

  save({ immediate: true });   // esto alimenta los premios: no se arriesga
  checkNewRewards();
}

/** La racha real: si el último día activo no fue ni hoy ni ayer, se cortó. */
function effectiveStreak() {
  const today = dayKey();
  if (state.lastActiveDate === today || state.lastActiveDate === yesterdayKey()) {
    return state.streak;
  }
  return 0;
}

function todayCount() {
  return state.todayDate === dayKey() ? state.todayCount : 0;
}

function isClaimed(threshold) {
  return state.claimedRewards.some((r) => r.threshold === threshold);
}

let knownReady = new Set();

function checkNewRewards() {
  CONFIG.REWARDS.forEach((reward) => {
    const ready = state.totalPomodoros >= reward.threshold && !isClaimed(reward.threshold);
    if (ready && !knownReady.has(reward.threshold)) {
      knownReady.add(reward.threshold);
      confetti();
    }
  });
}

function claimReward(reward) {
  if (isClaimed(reward.threshold) || state.totalPomodoros < reward.threshold) return;

  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const entry = {
    threshold: reward.threshold,
    label: reward.label,
    code: `VALE-${reward.code}-${rand}`,
    date: new Date().toISOString(),
  };

  state.claimedRewards.push(entry);
  save({ immediate: true });

  chime();
  confetti();
  showVoucher(reward, entry);
  renderRewards();
}

/* ═══════════════════════════════════════════════════════════════════════
   GATITOS
   Cascada de fuentes. cataas no puede ser la primaria: su endpoint de gifs
   da 404 y el dominio devuelve 502 con frecuencia.
   ═══════════════════════════════════════════════════════════════════════ */

const CAT_SOURCES = [
  async function theCatApi() {
    const res = await fetchTimeout('https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=20');
    const data = await res.json();
    return data.map((c) => c.url).filter(Boolean);
  },
  async function cataas() {
    const res = await fetchTimeout('https://cataas.com/api/cats?tags=gif&limit=50');
    const data = await res.json();
    // su parámetro `mimetype=` no se respeta, hay que filtrar a mano
    return data
      .filter((c) => c.mimetype === 'image/gif')
      .map((c) => `https://cataas.com/cat/${c.id}`);
  },
];

let catQueue = [];
let catsExhausted = false;

function fetchTimeout(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res;
    })
    .finally(() => clearTimeout(t));
}

async function refillCats() {
  for (const source of CAT_SOURCES) {
    try {
      const urls = await source();
      if (urls.length) {
        catQueue = shuffle(urls);
        catsExhausted = false;
        return true;
      }
    } catch { /* probamos la siguiente fuente */ }
  }
  catsExhausted = true;
  return false;
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Se llama al empezar a estudiar: cuando llegue el break, el gif ya está
 *  descargado y no hay spinner. */
async function prefetchCat() {
  if (catQueue.length < 3 && !catsExhausted) await refillCats();
  if (catQueue.length) {
    const img = new Image();
    img.src = catQueue[0];
  }
}

async function showCat() {
  const img = $('#catImg');
  const fallback = $('#catFallback');
  const loading = $('#catLoading');

  img.hidden = true;
  fallback.innerHTML = '';
  loading.hidden = false;

  if (!catQueue.length && !catsExhausted) await refillCats();

  // probamos hasta 4 urls antes de rendirnos
  for (let attempt = 0; attempt < 4 && catQueue.length; attempt++) {
    const url = catQueue.shift();
    const ok = await loadImage(img, url);
    if (ok) {
      loading.hidden = true;
      img.hidden = false;
      if (catQueue.length < 3) refillCats();
      return;
    }
  }

  // sin internet o todas las fuentes caídas: gatitas dibujadas por mí
  loading.hidden = true;
  const poses = ['cat', 'catBlink', 'catSleep'];
  fallback.innerHTML = pixelArt(randomOf(poses));
}

function loadImage(imgEl, url) {
  return new Promise((resolve) => {
    const probe = new Image();
    const done = (ok) => { probe.onload = probe.onerror = null; resolve(ok); };
    const timeout = setTimeout(() => done(false), 6000);
    probe.onload = () => { clearTimeout(timeout); imgEl.src = url; done(true); };
    probe.onerror = () => { clearTimeout(timeout); done(false); };
    probe.src = url;
  });
}

function openBreak() {
  const overlay = $('#breakOverlay');
  overlay.hidden = false;
  $('#breakTitle').textContent = timer.mode === 'long'
    ? '¡break largo! estírate un poco'
    : '¡descansa un poquito!';
  showCat();
}

function closeBreak() {
  $('#breakOverlay').hidden = true;
}

/* ═══════════════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════════════ */

function renderAll() {
  renderHeader();
  renderTimer();
  renderTasks();
  renderProgress();
  renderRewards();
}

function renderHeader() {
  $('#userName').textContent = state.name;
  $('#goalText').textContent = state.goal;
  $('#focusGoal').textContent = state.goal;
  $('#muteIcon').textContent = state.muted ? '🔇' : '🔊';
  $('#muteBtn').setAttribute('aria-pressed', String(state.muted));
  $('#muteBtn').setAttribute('aria-label', state.muted ? 'Activar sonidos' : 'Silenciar sonidos');
}

function renderTimer() {
  const left = timeLeft();
  const clock = fmtClock(left);

  $('#timerDisplay').textContent = clock;
  $('#breakTimer').textContent = clock;
  $('#modeLabel').textContent = MODE_LABEL[timer.mode];
  $('#startBtn').textContent = timer.running ? 'pausa' : (timer.remaining ? 'seguir' : 'empezar');

  // el título de la pestaña sirve de reloj aunque esté en otra pestaña
  document.title = timer.running
    ? `${clock} ${timer.mode === 'focus' ? '🍓 foco' : '🧋 break'}`
    : '˚｡⋆୨୧˚ study nook ˚୨୧⋆｡˚';

  renderBoba(1 - left / durationMs());
  renderSessionDots();
}

function renderBoba(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const top = 14, bottom = 43;              // interior del vaso en el viewBox
  const height = (bottom - top) * p;
  const fill = $('#bobaFill');
  fill.setAttribute('y', String(bottom - height));
  fill.setAttribute('height', String(height));
  $('#bobaCaption').textContent = `${Math.round(p * 100)}%`;
}

function renderSessionDots() {
  const dots = [];
  for (let i = 0; i < CONFIG.LONG_BREAK_EVERY; i++) {
    dots.push(i < timer.completedInCycle
      ? '<span class="on">●</span>'
      : '<span>○</span>');
  }
  $('#sessionDots').innerHTML = dots.join('');
}

/* ── tareas ─────────────────────────────────────────────────────────── */

/* qué tareas ya se dibujaron alguna vez, para animar solo las nuevas */
const seenTasks = new Set();

function renderTasks() {
  const list = $('#taskList');
  list.innerHTML = '';

  state.tasks.forEach((task) => {
    const isNew = !seenTasks.has(task.id);
    seenTasks.add(task.id);

    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}${isNew ? ' is-new' : ''}`;

    const bullet = document.createElement('span');
    bullet.className = 'task-bullet';
    bullet.innerHTML = pixelArt('heart');
    bullet.setAttribute('aria-hidden', 'true');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'px-check';
    check.checked = task.done;
    check.id = `chk-${task.id}`;
    check.addEventListener('change', () => {
      task.done = check.checked;
      blip();
      save();
      renderTasks();
    });

    const label = document.createElement('label');
    label.className = 'task-text';
    label.setAttribute('for', check.id);
    label.textContent = task.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'task-del';
    del.innerHTML = '✕';
    del.setAttribute('aria-label', `Borrar "${task.text}"`);
    del.addEventListener('click', () => {
      state.tasks = state.tasks.filter((t) => t.id !== task.id);
      save();
      renderTasks();
    });

    li.append(bullet, check, label, del);
    list.appendChild(li);
  });

  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;
  $('#taskEmpty').hidden = total > 0;
  $('#taskCount').textContent = total ? `${done} de ${total} ✿` : '';
}

/* ── progreso ───────────────────────────────────────────────────────── */

let lastStampCount = 0;

function renderProgress() {
  const count = todayCount();
  const stamps = $('#stamps');
  stamps.innerHTML = '';

  if (count === 0) {
    const empty = document.createElement('p');
    empty.className = 'stamps-empty';
    empty.textContent = 'todavía ninguno hoy ♡';
    stamps.appendChild(empty);
  } else {
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = `stamp${i === count - 1 && count > lastStampCount ? ' stamp--new' : ''}`;
      span.innerHTML = pixelArt('strawberry');
      stamps.appendChild(span);
    }
  }
  lastStampCount = count;

  $('#statToday').textContent  = String(count);
  $('#statStreak').textContent = String(effectiveStreak());
  $('#statTotal').textContent  = String(state.totalPomodoros);
}

/* ── premios ────────────────────────────────────────────────────────── */

const SEGMENTS = 12;

function renderRewards() {
  const wrap = $('#rewardList');
  wrap.innerHTML = '';

  CONFIG.REWARDS.forEach((reward) => {
    const claimed = isClaimed(reward.threshold);
    const have = Math.min(state.totalPomodoros, reward.threshold);
    const ready = state.totalPomodoros >= reward.threshold && !claimed;

    const card = document.createElement('div');
    card.className = `reward${ready ? ' reward--ready' : ''}${claimed ? ' reward--claimed' : ''}`;

    const head = document.createElement('div');
    head.className = 'reward-head';
    head.innerHTML =
      `<span class="reward-emoji" aria-hidden="true">${reward.emoji}</span>` +
      `<span class="reward-name">${reward.label}</span>` +
      `<span class="reward-count">${have}/${reward.threshold}</span>`;
    card.appendChild(head);

    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    const filled = Math.round((have / reward.threshold) * SEGMENTS);
    for (let i = 0; i < SEGMENTS; i++) {
      const seg = document.createElement('span');
      seg.className = `seg${i < filled ? ' on' : ''}`;
      bar.appendChild(seg);
    }
    card.appendChild(bar);

    if (claimed) {
      const done = document.createElement('p');
      done.className = 'reward-done';
      const entry = state.claimedRewards.find((r) => r.threshold === reward.threshold);
      done.textContent = `♡ canjeado · ${entry.code}`;
      card.appendChild(done);
    } else if (ready) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-btn px-btn--primary reward-claim';
      btn.textContent = '¡canjear! ♡';
      btn.addEventListener('click', () => claimReward(reward));
      card.appendChild(btn);
    }

    wrap.appendChild(card);
  });
}

function showVoucher(reward, entry) {
  $('#voucherEmoji').textContent = reward.emoji;
  $('#voucherTitle').textContent = reward.label;
  $('#voucherName').textContent = state.name;
  $('#voucherThreshold').textContent = String(reward.threshold);
  $('#voucherCode').textContent = entry.code;
  $('#voucherDate').textContent = new Date(entry.date).toLocaleDateString('es', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  $('#voucherOverlay').hidden = false;
}

/* ═══════════════════════════════════════════════════════════════════════
   FRASES
   ═══════════════════════════════════════════════════════════════════════ */

let quoteDeck = [];
let quoteTimer = null;

function nextQuote() {
  if (!quoteDeck.length) quoteDeck = shuffle(CONFIG.QUOTES);
  return withName(quoteDeck.pop());
}

function showQuote(text) {
  const el = $('#quoteText');
  el.classList.add('fading');
  setTimeout(() => {
    el.textContent = text || nextQuote();
    el.classList.remove('fading');
  }, 450);
}

function startQuoteRotation() {
  $('#quoteText').textContent = nextQuote();
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => {
    // en modo foco no rotan: la idea es que no haya nada que mirar
    if (!document.body.classList.contains('focus')) showQuote();
  }, CONFIG.QUOTE_ROTATION_MS);
}

/* ═══════════════════════════════════════════════════════════════════════
   ADORNOS · estrellitas de fondo, confetti y la mascota
   ═══════════════════════════════════════════════════════════════════════ */

function buildSparkles() {
  const chars = ['✧', '⋆', '˚', '♡', '✦'];
  const wrap = $('#sparkles');
  const count = window.innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = randomOf(chars);
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${14 + Math.random() * 16}s`;
    s.style.animationDelay = `${-Math.random() * 25}s`;
    s.style.fontSize = `${0.65 + Math.random() * 0.7}rem`;
    wrap.appendChild(s);
  }
}

function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const wrap = $('#confetti');
  const chars = ['♡', '✧', '⋆', '🍓', '✦'];
  for (let i = 0; i < 26; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti-bit';
    bit.textContent = randomOf(chars);
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    bit.style.animationDelay = `${Math.random() * 0.5}s`;
    bit.style.color = randomOf(['#FF9EC4', '#F0407A', '#FFE9A8', '#C21E56']);
    wrap.appendChild(bit);
    setTimeout(() => bit.remove(), 4200);
  }
}

function buildBobaPearls() {
  const pearls = $('#bobaPearls');
  const spots = [[11, 39], [15, 40], [19, 39], [13, 36], [17, 36], [12, 41], [18, 41]];
  pearls.innerHTML = spots
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2"/>`)
    .join('');
}

/* la gatita parpadea cada tanto */
function startMascot() {
  const art = $('#mascotArt');
  art.innerHTML = pixelArt('cat');
  setInterval(() => {
    if (document.body.classList.contains('focus')) {
      art.innerHTML = pixelArt('catSleep');
      return;
    }
    art.innerHTML = pixelArt('catBlink');
    setTimeout(() => {
      if (!document.body.classList.contains('focus')) art.innerHTML = pixelArt('cat');
    }, 180);
  }, 4200);
}

/* ═══════════════════════════════════════════════════════════════════════
   AJUSTES
   ═══════════════════════════════════════════════════════════════════════ */

function openSettings() {
  $('#setName').value  = state.name;
  $('#setGoal').value  = state.goal;
  $('#setFocus').value = state.durations.focus;
  $('#setShort').value = state.durations.short;
  $('#setLong').value  = state.durations.long;
  $('#setFullscreen').checked = localStorage.getItem(FULLSCREEN_KEY) === '1';
  $('#settingsOverlay').hidden = false;
  $('#settingsBtn').setAttribute('aria-expanded', 'true');
  $('#setName').focus();
}

function closeSettings() {
  $('#settingsOverlay').hidden = true;
  $('#settingsBtn').setAttribute('aria-expanded', 'false');
}

function saveSettings(event) {
  event.preventDefault();

  state.name = $('#setName').value.trim() || 'Grecia';
  state.goal = $('#setGoal').value.trim();
  state.durations = {
    focus: clampNum($('#setFocus').value, 1, 180, 25),
    short: clampNum($('#setShort').value, 1, 60, 5),
    long:  clampNum($('#setLong').value, 1, 120, 15),
  };

  try {
    localStorage.setItem(FULLSCREEN_KEY, $('#setFullscreen').checked ? '1' : '0');
  } catch { /* sin storage: la pantalla completa simplemente no se recuerda */ }

  if (!timer.running) timer.remaining = 0;   // aplica los minutos nuevos ya

  save();
  closeSettings();
  renderAll();
}

function clampNum(value, min, max, fallback) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/* ═══════════════════════════════════════════════════════════════════════
   EVENTOS
   ═══════════════════════════════════════════════════════════════════════ */

function wireEvents() {
  $('#startBtn').addEventListener('click', toggleTimer);
  $('#resetBtn').addEventListener('click', resetTimer);
  $('#skipBtn').addEventListener('click', skipBlock);
  $('#exitFocusBtn').addEventListener('click', () => { blip(); exitFocusMode(); });

  $('#anotherCatBtn').addEventListener('click', () => { blip(); showCat(); });
  $('#backToWorkBtn').addEventListener('click', () => { blip(); completeBlock({ counted: false }); });

  $('#settingsBtn').addEventListener('click', () => { blip(); openSettings(); });
  $('#settingsCancel').addEventListener('click', () => { blip(); closeSettings(); });
  $('#settingsForm').addEventListener('submit', saveSettings);

  $('#voucherClose').addEventListener('click', () => { $('#voucherOverlay').hidden = true; });

  $('#muteBtn').addEventListener('click', () => {
    state.muted = !state.muted;
    unlockAudio();
    if (!state.muted) blip();
    save();
    renderHeader();
  });

  $('#taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#taskInput');
    const text = input.value.trim();
    if (!text) return;
    state.tasks.push({ id: uid(), text, done: false });
    input.value = '';
    blip();
    save();
    renderTasks();
  });

  // cerrar overlays con clic fuera
  [['#settingsOverlay', closeSettings], ['#voucherOverlay', () => { $('#voucherOverlay').hidden = true; }]]
    .forEach(([sel, close]) => {
      $(sel).addEventListener('click', (e) => { if (e.target === $(sel)) close(); });
    });

  // ── atajos de teclado ──
  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    if (e.key === 'Escape') {
      if (!$('#voucherOverlay').hidden) { $('#voucherOverlay').hidden = true; return; }
      if (!$('#settingsOverlay').hidden) { closeSettings(); return; }
      exitFocusMode();
      return;
    }
    if (typing) return;

    if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
    if (e.key === 'r' || e.key === 'R') resetTimer();
  });

  // ── revelar controles en modo foco ──
  ['mousemove', 'touchstart', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, revealControls, { passive: true });
  });

  // ── volver a la pestaña: resincronizar reloj y datos ──
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (timer.running) onTick();     // recalcula desde el timestamp
    refreshFromServer();
  });
  window.addEventListener('focus', () => { if (timer.running) onTick(); });
  window.addEventListener('online', () => { if (pendingChanges) pushState(); });

  // ── no perder el último cambio al cerrar ──
  window.addEventListener('beforeunload', () => {
    if (!pendingChanges) return;
    try {
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
      navigator.sendBeacon(API, blob);
    } catch { /* si falla, el espejo local ya tiene los datos */ }
  });

  // el primer gesto desbloquea el audio (Safari lo exige)
  ['pointerdown', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, unlockAudio, { once: true });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   ARRANQUE
   ═══════════════════════════════════════════════════════════════════════ */

async function init() {
  buildSparkles();
  buildBobaPearls();
  startMascot();
  wireEvents();

  state = await loadState();

  // si cambió el día, el contador de hoy arranca en cero
  if (state.todayDate !== dayKey()) state.todayCount = 0;

  CONFIG.REWARDS.forEach((r) => {
    if (state.totalPomodoros >= r.threshold && !isClaimed(r.threshold)) {
      knownReady.add(r.threshold);
    }
  });

  renderAll();
  startQuoteRotation();
  prefetchCat();
}

document.addEventListener('DOMContentLoaded', init);
