// Arquivo: api/products.js
export default async function handler(req, res) {
  // A chave que você acabou de configurar na Vercel
  const API_KEY = process.env.LI_API_KEY; 
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API (LI_API_KEY) não configurada na Vercel.' });
  }

  try {
    // Busca produtos na Loja Integrada usando fetch nativo
    const response = await fetch('https://api.awsli.com.br/v1/produto?limit=20&format=json', {
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

    // Formata para o App Lina Design
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

    // Configura Cache e CORS (Necessário para testar localmente conectando na Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Erro ao buscar produtos.', 
      details: error.message 
    });
  }
}