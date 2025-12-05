import { Product, Category, Order } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Iluminação', image: 'https://picsum.photos/seed/ledlamp/100/100' },
  { id: '2', name: 'Fios e Cabos', image: 'https://picsum.photos/seed/wires/100/100' },
  { id: '3', name: 'Tomadas', image: 'https://picsum.photos/seed/switch/100/100' },
  { id: '4', name: 'Ferramentas', image: 'https://picsum.photos/seed/tools/100/100' },
  { id: '5', name: 'Chuveiros', image: 'https://picsum.photos/seed/shower/100/100' },
];

export const PRODUCTS: Product[] = [
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

export const BANNERS = [
  { id: 1, image: 'https://picsum.photos/seed/lightingstore/800/400', title: 'Iluminação LED', subtitle: 'Economia e Design' },
  { id: 2, image: 'https://picsum.photos/seed/electrician/800/400', title: 'Ofertas Elétricas', subtitle: 'Fios e Cabos' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '#LI-55021',
    date: '12/10/2023',
    status: 'delivered',
    total: 339.80,
    items: [PRODUCTS[0], PRODUCTS[1]] as any
  },
  {
    id: '#LI-55102',
    date: '05/11/2023',
    status: 'shipping',
    total: 389.90,
    items: [PRODUCTS[2]] as any
  },
  {
    id: '#LI-55230',
    date: '10/11/2023',
    status: 'pending',
    total: 25.90,
    items: [PRODUCTS[5]] as any
  }
];