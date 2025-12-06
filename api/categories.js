import axios from 'axios';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Iluminação', image: 'https://picsum.photos/seed/ledlamp/100/100' },
  { id: '2', name: 'Fios e Cabos', image: 'https://picsum.photos/seed/wires/100/100' },
  { id: '3', name: 'Tomadas', image: 'https://picsum.photos/seed/switch/100/100' },
  { id: '4', name: 'Ferramentas', image: 'https://picsum.photos/seed/tools/100/100' },
  { id: '5', name: 'Chuveiros', image: 'https://picsum.photos/seed/shower/100/100' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.LI_API_KEY;

  if (!API_KEY) {
     console.error("[API Error] Missing LI_API_KEY environment variable");
     return res.status(500).json({ 
       error: 'CONFIGURATION_ERROR', 
       message: 'A chave de API (LI_API_KEY) não está configurada na Vercel.' 
     });
  }

  try {
    const response = await axios.get('https://api.awsli.com.br/v1/categoria', {
      params: { limit: 20, format: 'json' },
      headers: { 
        'Authorization': `chave_api ${API_KEY}`,
        'User-Agent': 'LinaApp/1.0'
      },
      timeout: 8000
    });

    const categories = response.data.objects.map(item => ({
      id: item.id.toString(),
      name: item.nome,
      image: `https://picsum.photos/seed/${item.id}/100/100` 
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(categories);

  } catch (error) {
    console.error(`[API Error] Failed to fetch categories from Loja Integrada.`);
    
    if (error.response && error.response.status === 401) {
       console.error(`[API Error] 401 Unauthorized - Check API Key validity.`);
       return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'A chave de API configurada é inválida ou expirou.'
       });
    }

    if (error.response) {
       console.error(`[API Error] Status: ${error.response.status}`);
    } else {
       console.error(`[API Error] ${error.message}`);
    }

    res.setHeader('X-Fallback-Mode', 'true');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(MOCK_CATEGORIES);
  }
}