// Arquivo: api/categories.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.LI_API_KEY || '102b144575bdeacd312d'; 
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Configuração de API ausente.' });
  }

  try {
    const response = await fetch('https://api.awsli.com.br/v1/categoria?limit=20&format=json', {
      method: 'GET',
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LI API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    const categories = data.objects.map(item => ({
      id: item.id.toString(),
      name: item.nome,
      image: `https://picsum.photos/seed/${item.id}/100/100` 
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(categories);
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ 
      error: 'Erro interno ao buscar categorias', 
      details: error.message 
    });
  }
}