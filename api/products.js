import axios from 'axios';

// Mock Data for fallback
const MOCK_PRODUCTS = [
  {
    id: '101',
    name: 'Kit 10 Lâmpadas LED Bulbo 9W Branco Frio',
    price: 89.90,
    oldPrice: 120.00,
    category: 'Iluminação',
    image: 'https://picsum.photos/seed/ledbulb/400/400',
    description: 'Alta eficiência energética e durabilidade. Ideal para ambientes residenciais e comerciais.',
    rating: 4.9
  },
  {
    id: '102',
    name: 'Cabo Flexível 2.5mm Rolo 100m Sil',
    price: 249.90,
    category: 'Fios e Cabos',
    image: 'https://picsum.photos/seed/cable/400/400',
    description: 'Cabo de cobre com isolamento em PVC, antichama. Certificado pelo INMETRO.',
    rating: 5.0
  },
  {
    id: '103',
    name: 'Chuveiro Lorenzetti Acqua Ultra',
    price: 389.90,
    oldPrice: 450.00,
    category: 'Chuveiros',
    image: 'https://picsum.photos/seed/shower/400/400',
    description: 'Design ultra fino e moderno. Tecnologia Press Plus para jatos de alta performance.',
    rating: 4.8
  },
  {
    id: '104',
    name: 'Furadeira de Impacto 600W',
    price: 299.90,
    category: 'Ferramentas',
    image: 'https://picsum.photos/seed/drill/400/400',
    description: 'Potência e robustez para perfurações em concreto, aço e madeira. Acompanha maleta.',
    rating: 4.7
  },
  {
    id: '105',
    name: 'Pendente Industrial Preto Fosco',
    price: 159.90,
    category: 'Iluminação',
    image: 'https://picsum.photos/seed/pendant/400/400',
    description: 'Estilo industrial moderno, ideal para bancadas e mesas de jantar.',
    rating: 4.6
  },
   {
    id: '106',
    name: 'Conjunto Tomada 20A + Interruptor',
    price: 25.90,
    category: 'Tomadas',
    image: 'https://picsum.photos/seed/socket/400/400',
    description: 'Design clean e acabamento brilhante. Fácil instalação e alta durabilidade.',
    rating: 4.8
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.LI_API_KEY || '102b144575bdeacd312d'; 

  try {
    const response = await axios.get('https://api.awsli.com.br/v1/produto', {
      params: { limit: 20, format: 'json' },
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'User-Agent': 'LinaApp/1.0'
      },
      timeout: 8000 // 8s timeout
    });

    const products = response.data.objects.map(item => ({
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
    return res.status(200).json(products);

  } catch (error) {
    // Graceful Fallback:
    // If the API Key is invalid (401), or API is down (5xx), or timeout
    // We serve the Mock Data so the app remains functional for the user.
    console.warn(`[API] Serving Mock Data due to error: ${error.message}`);
    
    if (error.response) {
       console.warn(`[API] Upstream Status: ${error.response.status}`);
    }

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(MOCK_PRODUCTS);
  }
}