// api/scorers.js — Vercel Serverless Function
// Tabla de goleadores de cualquier competición soportada

const API_KEY = process.env.FD_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

const COMPETITIONS = {
  ucl: 'CL',
  ll:  'PD',
  pl:  'PL',
  bl:  'BL1',
  sa:  'SA',
  l1:  'FL1',
  lib: 'CLI',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300'); // Cache 1 hora

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const { competition = 'ucl', limit = '10' } = req.query;
  const compCode = COMPETITIONS[competition];

  if (!compCode) {
    return res.status(400).json({ error: 'Competición no válida', available: Object.keys(COMPETITIONS) });
  }

  const url = `${BASE_URL}/competitions/${compCode}/scorers?limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Error football-data.org: ${response.status}`, detail: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detail: err.message });
  }
}
