// Arquivo: api/categories.js
export default async function handler(req, res) {
  const API_KEY = process.env.LI_API_KEY; 
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API (LI_API_KEY) não configurada na Vercel.' });
  }

  try {
    const response = await fetch('https://api.awsli.com.br/v1/categoria?limit=20&format=json', {
      method: 'GET',
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API Loja Integrada: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const categories = data.objects.map(item => ({
      id: item.id.toString(),
      name: item.nome,
      image: `https://picsum.photos/seed/${item.id}/100/100` // Placeholder visual
    }));

    // Configura Cache e CORS (Necessário para testar localmente conectando na Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Erro ao buscar categorias.', 
      details: error.message 
    });
  }
}