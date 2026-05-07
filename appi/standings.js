// api/standings.js — Vercel Serverless Function
// Proxy hacia football-data.org para evitar CORS y proteger la API key

const API_KEY = process.env.FD_KEY; // Configura esto en Vercel → Settings → Environment Variables
const BASE_URL = 'https://api.football-data.org/v4';

const LEAGUE_IDS = {
  'll': 2014,  // LaLiga
  'pl': 2021,  // Premier League
  'bl': 2002,  // Bundesliga
  'sa': 2019,  // Serie A
  'l1': 2015,  // Ligue 1
};

export default async function handler(req, res) {
  // CORS — permite peticiones desde tu dominio en Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60'); // Cache 5 min

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { league } = req.query;
  const leagueId = LEAGUE_IDS[league];

  if (!leagueId) {
    return res.status(400).json({ error: 'Liga no válida. Usa: ll, pl, bl, sa, l1' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key no configurada en variables de entorno' });
  }

  try {
    const response = await fetch(`${BASE_URL}/competitions/${leagueId}/standings`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Error football-data.org: ${response.status}`, detail: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
  }
}
