'use strict';
/**
 * ˚｡⋆୨୧˚  /api/state  ˚୨୧⋆｡˚
 *
 * Proxy entre el navegador de Grecia y Supabase.
 *
 * La razón de existir de este archivo: como la app no tiene login, la alternativa
 * era poner la llave de Supabase dentro del JS del navegador, donde cualquiera que
 * abra el inspector la puede leer. Acá la llave `service_role` vive como variable
 * de entorno del servidor y nunca sale de Vercel.
 *
 * CommonJS a propósito: así funciona sin package.json, sin `npm install` y sin
 * una sola dependencia. `fetch` es global desde Node 18.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROW_ID = process.env.STATE_ROW_ID;

const TABLE = 'study_state';
const MAX_BODY_BYTES = 256 * 1024;

/* ─────────────────────────── estado por defecto ─────────────────────────── */

function defaultState() {
  return {
    version: 1,
    name: 'Grecia',
    goal: 'la carrera de mis sueños ♡',
    durations: { focus: 25, short: 5, long: 15 },
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

/* ─────────────────────────────── saneado ────────────────────────────────── */
// Nunca guardamos lo que llegue tal cual. Si algún día alguien manda basura a
// este endpoint, lo peor que puede pasar es que se guarde un estado válido.

function clampInt(value, min, max, fallback) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function text(value, max, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, max);
}

function isDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitize(input) {
  const out = defaultState();
  if (!input || typeof input !== 'object') return out;

  out.name = text(input.name, 40, out.name).trim() || out.name;
  out.goal = text(input.goal, 120, out.goal);

  const d = input.durations;
  if (d && typeof d === 'object') {
    out.durations = {
      focus: clampInt(d.focus, 1, 180, 25),
      short: clampInt(d.short, 1, 60, 5),
      long: clampInt(d.long, 1, 120, 15),
    };
  }

  if (Array.isArray(input.tasks)) {
    out.tasks = input.tasks
      .slice(0, 200)
      .map((t) => ({
        id: text(t && t.id, 40) || `t${Math.random().toString(36).slice(2, 10)}`,
        text: text(t && t.text, 200).trim(),
        done: Boolean(t && t.done),
      }))
      .filter((t) => t.text.length > 0);
  }

  out.todayCount = clampInt(input.todayCount, 0, 100, 0);
  out.todayDate = isDateString(input.todayDate) ? input.todayDate : null;
  out.streak = clampInt(input.streak, 0, 10000, 0);
  out.lastActiveDate = isDateString(input.lastActiveDate) ? input.lastActiveDate : null;
  out.totalPomodoros = clampInt(input.totalPomodoros, 0, 1000000, 0);
  out.muted = Boolean(input.muted);

  // Sin esto el GET devolvía siempre 0 y el cliente nunca detectaba que el
  // servidor tenía algo más nuevo: la sincronización Mac <-> iPhone no ocurría.
  // En las escrituras da igual, porque writeState lo pisa con la hora actual.
  const ts = Number(input.updatedAt);
  out.updatedAt = Number.isFinite(ts) && ts > 0 ? Math.round(ts) : 0;

  if (Array.isArray(input.claimedRewards)) {
    out.claimedRewards = input.claimedRewards.slice(0, 500).map((r) => ({
      threshold: clampInt(r && r.threshold, 1, 1000000, 1),
      label: text(r && r.label, 80),
      code: text(r && r.code, 24),
      date: text(r && r.date, 30),
    }));
  }

  return out;
}

/* ───────────────────────────── Supabase ─────────────────────────────────── */

function sb(path, init = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function upsert(state) {
  const res = await sb(TABLE, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify([
      { id: ROW_ID, data: state, updated_at: new Date().toISOString() },
    ]),
  });
  if (!res.ok) {
    throw new Error(`upsert ${res.status}: ${await res.text()}`);
  }
}

/* ────────────────────────── cuerpo del request ──────────────────────────── */

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('TOO_LARGE'), { code: 'TOO_LARGE' }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function parseBody(req) {
  // Vercel ya parsea JSON cuando el content-type lo dice. Pero `sendBeacon`
  // (el guardado al cerrar la pestaña) puede llegar como Buffer o string, así
  // que cubrimos los tres casos.
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  let raw = req.body;
  if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
  if (typeof raw !== 'string') raw = await readRawBody(req);
  if (!raw) return null;
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw Object.assign(new Error('TOO_LARGE'), { code: 'TOO_LARGE' });
  }
  return JSON.parse(raw);
}

/* ─────────────────────────────── handler ────────────────────────────────── */

async function readState(res) {
  const r = await sb(`${TABLE}?id=eq.${encodeURIComponent(ROW_ID)}&select=data`);
  if (!r.ok) throw new Error(`select ${r.status}: ${await r.text()}`);

  const rows = await r.json();
  const stored = rows[0] && rows[0].data;

  if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
    return res.status(200).json(sanitize(stored));
  }

  // Primera vez: creamos la fila con los valores por defecto.
  const fresh = defaultState();
  fresh.updatedAt = Date.now();
  await upsert(fresh);
  return res.status(200).json(fresh);
}

async function writeState(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch (err) {
    if (err.code === 'TOO_LARGE') {
      return res.status(413).json({ error: 'El estado es demasiado grande' });
    }
    return res.status(400).json({ error: 'JSON inválido' });
  }

  if (!body) return res.status(400).json({ error: 'Cuerpo vacío' });

  const state = sanitize(body);
  // El servidor pone la marca de tiempo, no el cliente: así el Mac y el iPhone
  // comparan contra el mismo reloj y no importa si uno va desajustado.
  state.updatedAt = Date.now();

  await upsert(state);
  return res.status(200).json(state);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const missing = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'STATE_ROW_ID']
    .filter((key) => !process.env[key]);
  if (missing.length) {
    return res.status(500).json({
      error: `Faltan variables de entorno en Vercel: ${missing.join(', ')}`,
    });
  }

  try {
    if (req.method === 'GET') return await readState(res);
    if (req.method === 'PUT' || req.method === 'POST') return await writeState(req, res);
    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[api/state]', err);
    return res.status(502).json({ error: 'No se pudo hablar con la base de datos' });
  }
};
