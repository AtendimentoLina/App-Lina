export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.LI_API_KEY || '102b144575bdeacd312d'; 
  
  try {
    const response = await fetch('https://api.awsli.com.br/v1/categoria?limit=20&format=json', {
      method: 'GET',
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LinaApp/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LI API Error ${response.status}: ${errorText}`);
      return res.status(response.status).json({ 
        error: 'Erro na Loja Integrada', 
        details: errorText,
        li_status: response.status
      });
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
    console.error('Internal API Error:', error);
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}