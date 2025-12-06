// Arquivo: api/products.js
export default async function handler(req, res) {
  // Configuração CORS robusta
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight 24h

  // Responder imediatamente a solicitações OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.LI_API_KEY || '102b144575bdeacd312d'; 
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Configuração de API ausente.' });
  }

  try {
    // Tenta usar fetch nativo (Node 18+)
    const response = await fetch('https://api.awsli.com.br/v1/produto?limit=20&format=json', {
      method: 'GET',
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LI API Error:', response.status, errorText);
      throw new Error(`LI API Error: ${response.status}`);
    }

    const data = await response.json();

    const products = data.objects.map(item => ({
      id: item.id.toString(),
      name: item.nome,
      price: parseFloat(item.preco_venda),
      oldPrice: item.preco_cheio ? parseFloat(item.preco_cheio) : null,
      image: item.imagem_principal?.grande || '',
      category: item.categorias?.[0]?.nome || 'Geral',
      description: item.descricao_completa || item.nome,
      rating: 5.0 
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(products);
  } catch (error) {
    console.error('Handler Error:', error);
    res.status(500).json({ 
      error: 'Erro interno ao buscar produtos', 
      details: error.message 
    });
  }
}