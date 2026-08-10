'use strict';
/**
 * ˚｡⋆୨୧˚  Servidor de desarrollo  ˚୨୧⋆｡˚
 *
 * Sirve para probar todo en tu PC antes de desplegar a Vercel:
 *
 *     node dev-server.js          ->  http://localhost:3000
 *
 * Emula lo que hace Vercel: sirve los archivos estáticos y monta las mismas
 * funciones de /api. Cero dependencias, cero `npm install`.
 *
 * Esto NO se despliega: en producción las funciones las corre Vercel.
 * Grecia nunca ejecuta este archivo.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

/* ─────────────────────── cargar .env.local a mano ────────────────────── */
// Tiene que pasar ANTES de requerir las funciones de /api, porque leen
// process.env cuando se cargan.

function loadEnv(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return false;

  for (const rawLine of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value && !process.env[key]) process.env[key] = value;
  }
  return true;
}

const envLoaded = loadEnv('.env.local');

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'STATE_ROW_ID'];
const missing = REQUIRED.filter((k) => !process.env[k]);

/* ─────────────── adaptar la respuesta de Node al estilo Vercel ────────── */

function vercelify(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

const stateHandler = require('./api/state.js');
const keepaliveHandler = require('./api/keepalive.js');

/* ───────────────────────── archivos estáticos ────────────────────────── */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
};

// Nunca servimos credenciales ni código de servidor, aunque alguien lo pida.
const BLOCKED = new Set(['.env', '.env.local', 'dev-server.js', '.gitignore']);

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';

  const full = path.join(ROOT, rel);

  // guard contra path traversal (../../algo)
  if (!full.startsWith(ROOT + path.sep) && full !== path.join(ROOT, 'index.html')) {
    res.statusCode = 403;
    res.end('403');
    return;
  }
  if (BLOCKED.has(path.basename(full)) || rel.startsWith('/api/')) {
    res.statusCode = 404;
    res.end('404');
    return;
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<p style="font-family:sans-serif">404 · no encontré ese archivo ♡</p>');
      return;
    }
    res.setHeader('Content-Type', MIME[path.extname(full).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(data);
  });
}

/* ──────────────────────────── el servidor ────────────────────────────── */

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (pathname === '/api/state') {
      if (missing.length) {
        return vercelify(res).status(500).json({
          error: `Falta rellenar en .env.local: ${missing.join(', ')}`,
        });
      }
      return await stateHandler(req, vercelify(res));
    }

    if (pathname === '/api/keepalive') {
      return await keepaliveHandler(req, vercelify(res));
    }

    return serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[dev-server]', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('500');
    }
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ˚｡⋆୨୧˚  study nook · servidor de desarrollo  ˚୨୧⋆｡˚');
  console.log('');
  console.log(`  ▸ http://localhost:${PORT}`);
  console.log('');

  if (!envLoaded) {
    console.log('  ⚠  No encontré .env.local — créalo y rellena tus datos de Supabase.');
  } else if (missing.length) {
    console.log(`  ⚠  Faltan valores en .env.local: ${missing.join(', ')}`);
    console.log('     La página va a cargar igual, pero en "✿ modo local"');
    console.log('     (los datos se guardan solo en el navegador).');
  } else {
    console.log('  ✓  Credenciales de Supabase cargadas.');
  }
  console.log('');
  console.log('  Ctrl+C para detener.');
  console.log('');
});
