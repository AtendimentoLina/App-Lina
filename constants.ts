import { Product, Category, Order } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Cadeiras', image: 'https://picsum.photos/seed/chair/100/100' },
  { id: '2', name: 'Mesas', image: 'https://picsum.photos/seed/table/100/100' },
  { id: '3', name: 'Sofás', image: 'https://picsum.photos/seed/sofa/100/100' },
  { id: '4', name: 'Decoração', image: 'https://picsum.photos/seed/decor/100/100' },
  { id: '5', name: 'Iluminação', image: 'https://picsum.photos/seed/lamp/100/100' },
];

export const PRODUCTS: Product[] = [
  {
    id: '101',
    name: 'Cadeira Eames Wood',
    price: 249.90,
    oldPrice: 329.00,
    category: 'Cadeiras',
    image: 'https://picsum.photos/seed/eames/400/400',
    description: 'Design clássico de Charles e Ray Eames. Assento em polipropileno e base em madeira maciça.',
    rating: 4.8
  },
  {
    id: '102',
    name: 'Mesa de Jantar Industrial',
    price: 1290.00,
    category: 'Mesas',
    image: 'https://picsum.photos/seed/tablewood/400/400',
    description: 'Mesa com tampo de madeira maciça e pés de ferro estilo industrial. Perfeita para 6 lugares.',
    rating: 4.9
  },
  {
    id: '103',
    name: 'Sofá Retrátil 3 Lugares',
    price: 2599.00,
    oldPrice: 3100.00,
    category: 'Sofás',
    image: 'https://picsum.photos/seed/sofa1/400/400',
    description: 'Conforto absoluto com assento retrátil e encosto reclinável. Tecido Suede aveludado.',
    rating: 4.7
  },
  {
    id: '104',
    name: 'Luminária Pendente Cobre',
    price: 189.90,
    category: 'Iluminação',
    image: 'https://picsum.photos/seed/lamp1/400/400',
    description: 'Acabamento em cobre moderno, ideal para bancadas e mesas de jantar.',
    rating: 4.5
  },
  {
    id: '105',
    name: 'Vaso Cerâmica Nórdico',
    price: 89.90,
    category: 'Decoração',
    image: 'https://picsum.photos/seed/vase/400/400',
    description: 'Design minimalista nórdico. Perfeito para plantas secas ou naturais.',
    rating: 4.6
  },
   {
    id: '106',
    name: 'Poltrona Charles Eames',
    price: 4599.90,
    oldPrice: 5200.00,
    category: 'Cadeiras',
    image: 'https://picsum.photos/seed/armchair/400/400',
    description: 'A clássica poltrona com puff. Couro ecológico e madeira multilaminada.',
    rating: 5.0
  }
];

export const BANNERS = [
  { id: 1, image: 'https://picsum.photos/seed/livingroom/800/400', title: 'Renove sua Sala', subtitle: 'Até 40% OFF' },
  { id: 2, image: 'https://picsum.photos/seed/kitchen/800/400', title: 'Cozinha Gourmet', subtitle: 'Lançamentos' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: '#LI-10293',
    date: '12/10/2023',
    status: 'delivered',
    total: 399.80,
    items: [PRODUCTS[0], PRODUCTS[3]] as any
  },
  {
    id: '#LI-10344',
    date: '05/11/2023',
    status: 'shipping',
    total: 2599.00,
    items: [PRODUCTS[2]] as any
  },
  {
    id: '#LI-10401',
    date: '10/11/2023',
    status: 'pending',
    total: 89.90,
    items: [PRODUCTS[4]] as any
  }
];
