// api/matches.js — Vercel Serverless Function
// Devuelve partidos en vivo, de hoy y próximos de las ligas configuradas

const API_KEY = process.env.FD_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// IDs de competiciones soportadas
const COMPETITIONS = {
  ucl:  'CL',   // Champions League
  ll:   'PD',   // LaLiga
  pl:   'PL',   // Premier League
  bl:   'BL1',  // Bundesliga
  sa:   'SA',   // Serie A
  l1:   'FL1',  // Ligue 1
  lib:  'CLI',  // Copa Libertadores
};

function getTodayRange() {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return {
    dateFrom: from.toISOString().split('T')[0],
    dateTo:   to.toISOString().split('T')[0],
  };
}

function getWeekRange() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 1); // ayer
  const to = new Date(now);
  to.setDate(to.getDate() + 7);     // próximos 7 días
  return {
    dateFrom: from.toISOString().split('T')[0],
    dateTo:   to.toISOString().split('T')[0],
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30'); // Cache 1 min (partidos en vivo)

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const { competition = 'ucl', mode = 'week' } = req.query;
  const compCode = COMPETITIONS[competition];

  if (!compCode) {
    return res.status(400).json({ error: 'Competición no válida', available: Object.keys(COMPETITIONS) });
  }

  const range = mode === 'today' ? getTodayRange() : getWeekRange();
  const url = `${BASE_URL}/competitions/${compCode}/matches?dateFrom=${range.dateFrom}&dateTo=${range.dateTo}&status=LIVE,IN_PLAY,PAUSED,SCHEDULED,TIMED,FINISHED`;

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
