export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Chave de fallback caso a variável de ambiente falhe
  const API_KEY = process.env.LI_API_KEY || '102b144575bdeacd312d'; 
  
  try {
    const response = await fetch('https://api.awsli.com.br/v1/produto?limit=20&format=json', {
      method: 'GET',
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LinaApp/1.0' // Importante para evitar bloqueios de API
      }
    });

    if (!response.ok) {
      // Se a LI retornar erro (ex: 401), repassamos o código exato para facilitar o debug
      const errorText = await response.text();
      console.error(`LI API Error ${response.status}: ${errorText}`);
      return res.status(response.status).json({ 
        error: 'Erro na Loja Integrada', 
        details: errorText,
        li_status: response.status
      });
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
    console.error('Internal API Error:', error);
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}