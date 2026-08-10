'use strict';
/**
 * ˚｡⋆୨୧˚  /api/keepalive  ˚୨୧⋆｡˚
 *
 * Supabase pausa los proyectos del plan gratuito tras 7 días sin actividad.
 * Ese es exactamente el escenario que esta app tiene que sobrevivir: si Grecia
 * se toma una semana sin estudiar, el proyecto se dormiría y habría que
 * despertarlo a mano desde el dashboard justo cuando ella vuelve.
 *
 * Este endpoint hace una consulta trivial para reiniciar ese contador. Lo llama
 * el cron de Vercel una vez al día (ver vercel.json).
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Vercel manda `Authorization: Bearer <CRON_SECRET>` en sus invocaciones de cron.
  // Si configuraste el secreto, exigimos que coincida para que nadie más lo dispare.
  if (CRON_SECRET) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'No autorizado' });
    }
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/study_state?select=id&limit=1`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });

    if (!r.ok) {
      throw new Error(`${r.status}: ${await r.text()}`);
    }

    return res.status(200).json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error('[api/keepalive]', err);
    return res.status(502).json({ ok: false, error: 'No se pudo despertar la base' });
  }
};
