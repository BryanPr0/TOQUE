import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nombre, equipo, comentario } = req.body;
    const { data, error } = await supabase
      .from('comentarios')
      .insert([{ nombre, equipo, comentario }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: '¡Comentario guardado!' });
  } 

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
}
