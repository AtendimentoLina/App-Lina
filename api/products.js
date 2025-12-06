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

  // Ensure LI_API_KEY is set in Vercel Environment Variables
  const API_KEY = process.env.LI_API_KEY;

  if (!API_KEY) {
     console.error("[API Error] Missing LI_API_KEY environment variable");
     // Respond with 500 to let frontend know configuration is missing
     return res.status(500).json({ 
       error: 'CONFIGURATION_ERROR', 
       message: 'A chave de API (LI_API_KEY) não está configurada na Vercel.' 
     });
  }

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
    console.error(`[API Error] Failed to fetch products from Loja Integrada.`);
    
    // Check specifically for Auth errors from Loja Integrada
    if (error.response && error.response.status === 401) {
       console.error(`[API Error] 401 Unauthorized - Check API Key validity.`);
       return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'A chave de API configurada é inválida ou expirou.'
       });
    }

    // For other errors (Timeout, 500 from LI, Network), fallback to Mock Data
    // allowing the app to function in "Offline/Demo" mode.
    if (error.response) {
       console.error(`[API Error] Status: ${error.response.status}`);
    } else {
       console.error(`[API Error] ${error.message}`);
    }

    // Return Mock Data with a specific header indicating fallback
    res.setHeader('X-Fallback-Mode', 'true');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(MOCK_PRODUCTS);
  }
}