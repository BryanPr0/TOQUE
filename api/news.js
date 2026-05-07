// api/news.js — Vercel Serverless Function
// Noticias de fútbol vía NewsAPI o GNews (configura la que prefieras)
// Por defecto usa GNews (plan gratuito disponible en gnews.io)

const GNEWS_KEY = process.env.GNEWS_KEY; // Obtén gratis en gnews.io
const NEWSAPI_KEY = process.env.NEWSAPI_KEY; // Alternativa: newsapi.org

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=120'); // Cache 10 min

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { topic = 'futbol ecuador', lang = 'es', max = '10' } = req.query;

  // ── Opción A: GNews (recomendado — plan gratuito con 100 req/día) ──
  if (GNEWS_KEY) {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=${lang}&max=${max}&apikey=${GNEWS_KEY}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`GNews error: ${r.status}`);
      const data = await r.json();

      // Normalizar formato para el frontend
      const articles = (data.articles || []).map(a => ({
        title:       a.title,
        description: a.description,
        url:         a.url,
        image:       a.image,
        publishedAt: a.publishedAt,
        source:      a.source?.name || 'Desconocido',
      }));

      return res.status(200).json({ articles, total: articles.length });
    } catch (err) {
      // Si GNews falla, caer en noticias estáticas
    }
  }

  // ── Opción B: NewsAPI (requiere plan de pago para producción) ──
  if (NEWSAPI_KEY) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=${lang}&pageSize=${max}&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`NewsAPI error: ${r.status}`);
      const data = await r.json();

      const articles = (data.articles || []).map(a => ({
        title:       a.title,
        description: a.description,
        url:         a.url,
        image:       a.urlToImage,
        publishedAt: a.publishedAt,
        source:      a.source?.name || 'Desconocido',
      }));

      return res.status(200).json({ articles, total: articles.length });
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener noticias', detail: err.message });
    }
  }

  // ── Fallback: noticias estáticas curadas (sin API key) ──
  // Úsalas mientras configuras tu clave de noticias
  const staticNews = [
    {
      title: "Willian Pacho: 2ª semifinal de Champions League con PSG",
      description: "El defensa ecuatoriano es pieza clave en la defensa del PSG ante el Bayern de Kane y Luis Díaz.",
      url: "https://www.eluniverso.com",
      image: null,
      publishedAt: new Date().toISOString(),
      source: "El Universo"
    },
    {
      title: "Barcelona lidera LaLiga con 82 puntos tras vencer al Getafe",
      description: "El equipo blaugrana amplía su ventaja sobre el Real Madrid con 5 fechas por disputar.",
      url: "https://www.clarosports.com",
      image: null,
      publishedAt: new Date().toISOString(),
      source: "Claro Sports"
    },
    {
      title: "LDU Quito visita a Lanús en Copa Libertadores 2026",
      description: "Los albos van al frente del Grupo G con 6 puntos y buscan mantener el liderato.",
      url: "https://www.aficioncentral.com",
      image: null,
      publishedAt: new Date().toISOString(),
      source: "Afición Central"
    },
    {
      title: "Harry Kane: 53 goles en 45 partidos con el Bayern esta temporada",
      description: "El delantero inglés es el segundo goleador de la Champions con 12 tantos.",
      url: "https://www.espn.com.ec",
      image: null,
      publishedAt: new Date().toISOString(),
      source: "ESPN"
    },
    {
      title: "Piero Hincapié en semifinales de Champions con Arsenal",
      description: "El lateral ecuatoriano jugará ante el Atlético de Madrid en las semifinales.",
      url: "https://www.expreso.ec",
      image: null,
      publishedAt: new Date().toISOString(),
      source: "Expreso"
    }
  ];

  return res.status(200).json({ articles: staticNews, total: staticNews.length, static: true });
}
