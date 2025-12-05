export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export enum AppScreen {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  CATALOG = 'CATALOG',
  CART = 'CART',
  PROFILE = 'PROFILE',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  ORDERS = 'ORDERS',
  ORDER_DETAILS = 'ORDER_DETAILS',
  SETTINGS = 'SETTINGS'
}
