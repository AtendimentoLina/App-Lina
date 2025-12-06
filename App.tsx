import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  ChevronLeft, 
  Star, 
  Plus, 
  Minus, 
  Trash2,
  Share2,
  Heart,
  Settings,
  Package,
  LogOut,
  Bell,
  Shield,
  CreditCard,
  ArrowRight,
  Mail,
  Lock,
  MapPin,
  Truck,
  Filter,
  X,
  SlidersHorizontal,
  Info,
  ExternalLink,
  CheckCircle,
  Database
} from 'lucide-react';
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES, BANNERS, MOCK_ORDERS } from './constants';
import { AppScreen, Product, CartItem, Order, Review, Category } from './types';

// --- Configuration ---

const getApiBaseUrl = () => {
  // ATENÇÃO: Para o App Mobile funcionar, isso PRECISA ser a URL completa da Vercel.
  // Se estiver rodando local (localhost), ele usa a URL de produção para evitar erros de CORS/404 locais se o backend não estiver rodando.
  const prodUrl = 'https://app-lina.vercel.app/api';
  
  // Se estivermos no navegador na própria Vercel, podemos usar relativo, mas absoluto é mais seguro para o App Nativo.
  return prodUrl;
};

const API_BASE_URL = getApiBaseUrl();

// --- IMPORTANTE ---
// FALSE = Tenta conectar com a Loja Integrada via Vercel.
const USE_MOCK_DATA = false; 

// --- Shared Components ---

const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'primary', fullWidth = false, className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "py-3 px-6 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center";
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-white shadow-lg shadow-secondary/20",
    outline: "border-2 border-gray-100 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-50 text-red-500 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

// --- Robust Logo Component ---
const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center select-none ${className}`} style={{ minHeight: '40px' }}>
        <span className="text-4xl font-black tracking-tighter text-gray-900 leading-none">LINA</span>
        <div className="w-2 h-2 bg-primary rounded-full ml-1 mt-3"></div>
      </div>
    );
  }

  return (
    <img 
      src="/logo.png" 
      alt="LINA" 
      className={`${className} object-contain`} 
      onError={() => setError(true)} 
    />
  );
};

const FlyingIcon: React.FC<{ start: {x: number, y: number}, onEnd: () => void }> = ({ start, onEnd }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: start.x,
    top: start.y,
    opacity: 1,
    zIndex: 100,
    transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
    pointerEvents: 'none',
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        top: window.innerHeight - 50, 
        left: window.innerWidth * 0.65, 
        opacity: 0,
        transform: 'scale(0.5)'
      }));
    });

    const timer = setTimeout(onEnd, 800);
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div style={style} className="bg-primary text-white p-2 rounded-full shadow-lg flex items-center justify-center w-8 h-8">
      <Plus className="w-5 h-5" />
    </div>
  );
};

// --- Product Components ---

const ProductCard: React.FC<{
  product: Product;
  cartQty: number;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onUpdateQty: (p: Product, delta: number) => void;
  onClick: () => void;
  onAddToCartAnimated?: (x: number, y: number) => void;
}> = ({ product, cartQty, isWishlisted, onToggleWishlist, onUpdateQty, onClick, onAddToCartAnimated }) => {
  const [animatingHeart, setAnimatingHeart] = useState(false);

  useEffect(() => {
    if (isWishlisted) {
      setAnimatingHeart(true);
      const timer = setTimeout(() => setAnimatingHeart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  const handleQtyClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    onUpdateQty(product, delta);
    if (delta > 0 && cartQty === 0 && onAddToCartAnimated) {
      onAddToCartAnimated(e.clientX, e.clientY);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition-all duration-300 relative group hover:shadow-md z-0"
    >
      <button 
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-gray-50 border border-gray-100"
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-400'} ${animatingHeart ? 'scale-150' : 'scale-100'}`} 
        />
      </button>

      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
        {product.oldPrice && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            OFERTA
          </span>
        )}
      </div>
      
      <h4 className="font-medium text-gray-800 text-sm line-clamp-2 min-h-[40px] leading-tight mb-1">
        {product.name}
      </h4>
      
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          {product.oldPrice && (
            <p className="text-xs text-gray-400 line-through">R$ {product.oldPrice.toFixed(2)}</p>
          )}
          <p className="text-primary font-bold text-lg">R$ {product.price.toFixed(2)}</p>
        </div>

        {cartQty > 0 ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 h-9 w-full mt-1" onClick={e => e.stopPropagation()}>
             <button onClick={(e) => handleQtyClick(e, -1)} className="w-9 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-l-lg hover:text-red-500">
               {cartQty === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
             </button>
             <span className="flex-1 text-center text-sm font-bold text-gray-900">{cartQty}</span>
             <button onClick={(e) => handleQtyClick(e, 1)} className="w-9 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-r-lg">
               <Plus className="w-4 h-4" />
             </button>
          </div>
        ) : (
          <button 
            onClick={(e) => handleQtyClick(e, 1)}
            className="w-full h-9 mt-1 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm active:bg-red-700 flex items-center justify-center gap-1 hover:bg-red-600 transition-colors"
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  );
};

const ProductCardSkeleton = () => (
  <div className="bg-white p-3 rounded-2xl border border-gray-100">
    <Skeleton className="aspect-square w-full rounded-xl mb-3" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-2/3 mb-2" />
    <Skeleton className="h-6 w-1/3 mb-2" />
    <Skeleton className="h-9 w-full rounded-lg" />
  </div>
);

// --- SCREENS ---

const SplashScreen: React.FC = () => (
  <div className="h-full w-full bg-white flex flex-col items-center justify-center animate-fade-in z-50 absolute inset-0">
     <div className="mb-10 p-4">
        <Logo className="w-56 h-auto" />
     </div>
     <div className="animate-spin w-8 h-8 border-2 border-gray-100 border-t-[#d6001c] rounded-full"></div>
     <div className="absolute bottom-10 text-gray-400 text-xs font-medium">Carregando Loja...</div>
  </div>
);

const OnboardingScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Tudo em Elétrica", desc: "Encontre a maior variedade de fios, cabos e componentes para sua obra.", image: "https://picsum.photos/seed/elecboard/400/500" },
    { title: "Iluminação Moderna", desc: "Lâmpadas LED, pendentes e luminárias para renovar seus ambientes.", image: "https://picsum.photos/seed/lighting/400/500" },
    { title: "Entrega Rápida", desc: "Receba seus materiais com segurança e agilidade em todo o Brasil.", image: "https://picsum.photos/seed/deliverytruck/400/500" }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 relative">
        <img src={steps[step].image} alt="Onboarding" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-gray-900">
           <h2 className="text-3xl font-bold mb-4 text-primary">{steps[step].title}</h2>
           <p className="text-gray-600 text-lg leading-relaxed">{steps[step].desc}</p>
        </div>
      </div>
      <div className="p-6 flex items-center justify-between bg-white">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
        <button 
          onClick={() => step < 2 ? setStep(step + 1) : onFinish()}
          className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const LoginScreen: React.FC<{ onLogin: () => void, onRegister: () => void, onSkip: () => void }> = ({ onLogin, onRegister, onSkip }) => {
  return (
    <div className="h-full flex flex-col p-8 bg-white justify-center animate-fade-in">
       <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
             <Logo className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo(a)!</h1>
          <p className="text-gray-500">Acesse sua conta para ver pedidos e ofertas exclusivas.</p>
       </div>

       <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center border border-gray-100 focus-within:border-primary transition-colors">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <input type="email" placeholder="E-mail" className="bg-transparent w-full outline-none text-gray-900" required />
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center border border-gray-100 focus-within:border-primary transition-colors">
            <Lock className="w-5 h-5 text-gray-400 mr-3" />
            <input type="password" placeholder="Senha" className="bg-transparent w-full outline-none text-gray-900" required />
          </div>
          <div className="flex justify-end">
            <button type="button" className="text-sm text-primary font-semibold">Esqueceu a senha?</button>
          </div>
          <Button type="submit" fullWidth>Entrar</Button>
       </form>

       <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="text-gray-400 text-sm">ou</span>
          <div className="h-px bg-gray-100 flex-1" />
       </div>

       <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="text-sm border-gray-200"><span className="mr-2">G</span> Google</Button>
          <Button variant="outline" className="text-sm border-gray-200"><span className="mr-2"></span> Apple</Button>
       </div>

       <div className="mt-auto pt-6 text-center space-y-4">
          <p className="text-gray-600">
            Ainda não tem conta? <button onClick={onRegister} className="text-primary font-bold">Cadastrar</button>
          </p>
          <button onClick={onSkip} className="text-gray-400 text-sm hover:text-gray-600">Continuar sem login</button>
       </div>
    </div>
  )
};

const OrdersScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-white animate-slide-in">
       <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-50 border border-gray-100"><ChevronLeft className="w-6 h-6" /></button>
         <h1 className="font-bold text-lg">Meus Pedidos</h1>
       </div>
       <div className="p-4 space-y-4 overflow-y-auto pb-24">
          {MOCK_ORDERS.map(order => (
             <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <span className="font-bold text-gray-900 block text-lg">{order.id}</span>
                      <span className="text-xs text-gray-500">{order.date}</span>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1
                      ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 
                        order.status === 'shipping' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                        'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                      {order.status === 'delivered' ? <CheckCircle className="w-3 h-3"/> : order.status === 'shipping' ? <Truck className="w-3 h-3"/> : null}
                      {order.status === 'delivered' ? 'Entregue' : order.status === 'shipping' ? 'Enviado' : 'Processando'}
                   </div>
                </div>
                <div className="flex gap-2 mb-3 overflow-hidden">
                   {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 p-1">
                         <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                   ))}
                   {order.items.length > 3 && (
                      <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold border border-gray-100">
                         +{order.items.length - 3}
                      </div>
                   )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                   <span className="text-sm text-gray-500">Total: <span className="text-gray-900 font-bold">R$ {order.total.toFixed(2)}</span></span>
                   <button className="text-primary font-bold text-sm px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Ver Detalhes</button>
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}

const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
   const [notifications, setNotifications] = useState(true);
   return (
     <div className="h-full flex flex-col bg-white animate-slide-in">
        <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-50 border border-gray-100"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Configurações</h1>
        </div>
        <div className="p-4 space-y-6">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wider">Preferências</h3>
              <div className="flex items-center justify-between py-2">
                 <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Notificações Push</span>
                 </div>
                 <button 
                   onClick={() => setNotifications(!notifications)}
                   className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-gray-200'}`}
                 >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${notifications ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wider">Legal</h3>
              <button className="w-full flex items-center justify-between py-3 border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Política de Privacidade</span>
                 </div>
                 <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between py-3">
                 <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Termos de Uso</span>
                 </div>
                 <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
           </div>
           
           <div className="text-center text-xs text-gray-400 mt-8">
              Versão 2.0.1<br/>Desenvolvido para Lina Design
           </div>
        </div>
     </div>
   )
}

const HomeScreen: React.FC<{ 
  onNavigate: (product: Product) => void;
  cart: CartItem[];
  wishlist: Product[];
  onUpdateQty: (p: Product, delta: number) => void;
  onToggleWishlist: (p: Product) => void;
  onAddToCartAnimated: (x: number, y: number) => void;
  products: Product[];
  categories: Category[];
  isApiLoading: boolean;
}> = ({ onNavigate, cart, wishlist, onUpdateQty, onToggleWishlist, onAddToCartAnimated, products, categories, isApiLoading }) => {
  
  const getCartQty = (id: string) => cart.find(i => i.id === id)?.quantity || 0;
  const isWishlisted = (id: string) => wishlist.some(i => i.id === id);

  if (isApiLoading) {
    return (
      <div className="space-y-6 pb-24 px-4 pt-6 animate-pulse bg-white h-full">
        <div className="bg-gray-100 h-12 rounded-full w-full" />
        <div className="flex gap-4 overflow-hidden mt-6">
           <Skeleton className="min-w-[90%] h-48 rounded-2xl" />
        </div>
        <div className="flex gap-4 mt-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-24 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
           {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in bg-white min-h-full">
      <div className="px-4 pt-2 sticky top-0 bg-white z-10 pb-2">
        <div className="bg-gray-50 rounded-full flex items-center px-4 py-3 shadow-sm border border-gray-100">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" placeholder="O que você procura hoje?" className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-400"/>
        </div>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 gap-4">
        {BANNERS.map((banner) => (
          <div key={banner.id} className="snap-center min-w-[90%] h-48 rounded-2xl overflow-hidden relative shadow-md group">
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <h2 className="text-2xl font-bold mb-1">{banner.title}</h2>
              <p className="font-medium text-gray-200 text-sm flex items-center gap-1">{banner.subtitle} <ArrowRight className="w-4 h-4"/></p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold text-gray-900">Categorias</h3>
        </div>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center space-y-2 min-w-[72px] cursor-pointer active:scale-95 transition-transform">
              <div className="w-16 h-16 rounded-full bg-white p-2 border border-gray-100 shadow-sm flex items-center justify-center hover:border-primary hover:shadow-md transition-all">
                <img src={cat.image} alt={cat.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight line-clamp-2 max-w-[70px]">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Destaques</h3>
          <button className="text-primary text-sm font-semibold hover:bg-red-50 px-3 py-1 rounded-full transition-colors">Ver todos</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              cartQty={getCartQty(product.id)}
              isWishlisted={isWishlisted(product.id)}
              onUpdateQty={onUpdateQty}
              onToggleWishlist={onToggleWishlist}
              onClick={() => onNavigate(product)}
              onAddToCartAnimated={onAddToCartAnimated}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CatalogScreen: React.FC<{ 
  onNavigate: (product: Product) => void;
  cart: CartItem[];
  wishlist: Product[];
  onUpdateQty: (p: Product, delta: number) => void;
  onToggleWishlist: (p: Product) => void;
  onAddToCartAnimated: (x: number, y: number) => void;
  products: Product[];
  categories: Category[];
  isApiLoading: boolean;
}> = ({ onNavigate, cart, wishlist, onUpdateQty, onToggleWishlist, onAddToCartAnimated, products, categories, isApiLoading }) => {
  const [activeCat, setActiveCat] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const filteredProducts = useMemo(() => {
    let result = activeCat === 'Todos' ? [...products] : products.filter(p => p.category === activeCat);
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sortBy === 'price_asc') result.sort((a,b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a,b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a,b) => b.rating - a.rating);
    if (sortBy === 'newest') result.reverse();

    return result;
  }, [activeCat, sortBy, priceRange, products]);

  const getCartQty = (id: string) => cart.find(i => i.id === id)?.quantity || 0;
  const isWishlisted = (id: string) => wishlist.some(i => i.id === id);

  return (
    <div className="flex flex-col h-full bg-white relative">
       <div className="px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-lg animate-slide-in absolute left-4 right-4 z-20 top-16">
             <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ordenar Por</label>
                <div className="grid grid-cols-2 gap-2">
                   {/* Filters Buttons */}
                   {[['newest','Lançamentos'], ['rating','Melhor Avaliação'], ['price_asc','Menor Preço'], ['price_desc','Maior Preço']].map(([key, label]) => (
                     <button 
                       key={key}
                       onClick={() => setSortBy(key as any)} 
                       className={`text-sm py-2 px-3 rounded-lg border transition-colors ${sortBy === key ? 'border-primary text-primary bg-red-50' : 'border-gray-200 text-gray-600'}`}
                     >
                       {label}
                     </button>
                   ))}
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Preço Máximo: R$ {priceRange[1]}</label>
                <input 
                  type="range" 
                  min="0" max="10000" step="100" 
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
             </div>
          </div>
        )}

        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          {['Todos', ...categories.map(c => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${activeCat === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {isApiLoading ? (
           <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map(i => <ProductCardSkeleton key={i} />)}
           </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
            <Search className="w-12 h-12 opacity-20"/>
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                cartQty={getCartQty(product.id)}
                isWishlisted={isWishlisted(product.id)}
                onUpdateQty={onUpdateQty}
                onToggleWishlist={onToggleWishlist}
                onClick={() => onNavigate(product)}
                onAddToCartAnimated={onAddToCartAnimated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetailScreen: React.FC<{ 
  product: Product; 
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
}> = ({ product, onBack, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist, reviews, onAddReview }) => {
  const [loading, setLoading] = useState(true);
  const [animatingHeart, setAnimatingHeart] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [product]);

  useEffect(() => {
    if (isWishlisted) {
      setAnimatingHeart(true);
      const timer = setTimeout(() => setAnimatingHeart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewText.trim()) {
      onAddReview(newReviewRating, newReviewText);
      setNewReviewText('');
      setShowReviewForm(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira este produto na Lina: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-full pb-24">
        <Skeleton className="h-[50vh] w-full rounded-none bg-gray-100" />
        <div className="px-6 py-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-10 space-y-4">
           <Skeleton className="h-8 w-3/4" />
           <Skeleton className="h-6 w-1/4" />
           <Skeleton className="h-32 w-full rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full pb-24 animate-slide-in">
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
        <button onClick={onBack} className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm pointer-events-auto hover:bg-white border border-gray-100"><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
        <div className="flex gap-2 pointer-events-auto">
            <button onClick={() => onToggleWishlist(product)} className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white border border-gray-100">
                <Heart className={`w-6 h-6 transition-all duration-300 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-800'} ${animatingHeart ? 'scale-150' : 'scale-100'}`} />
            </button>
            <button onClick={handleShare} className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white border border-gray-100"><Share2 className="w-6 h-6 text-gray-800" /></button>
        </div>
      </div>
      <div className="h-[50vh] bg-white relative flex items-center justify-center p-8">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="px-6 py-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-50">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <div className="mb-6">
           <span className="text-primary font-bold text-xs uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md">{product.category}</span>
           <h1 className="text-2xl font-bold text-gray-900 leading-tight mt-2 mb-2">{product.name}</h1>
           <div className="flex items-center text-sm text-gray-500 gap-4">
             <div className="flex items-center">
               <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
               <span className="font-medium text-gray-900 mr-1">{product.rating}</span>
             </div>
             <span>{reviews.length} avaliações</span>
             <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Em Estoque</span>
           </div>
        </div>

        <div className="flex justify-between items-end mb-8 border-b border-gray-50 pb-6">
          <div className="flex flex-col">
             {product.oldPrice && <span className="text-sm text-gray-400 line-through">R$ {product.oldPrice.toFixed(2)}</span>}
             <span className="text-3xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="text-xs text-gray-400">Marca: Lina</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">Sobre o produto</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
        </div>
        
        {/* Reviews Section */}
        <div className="pt-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900">Avaliações</h3>
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-primary text-sm font-bold bg-red-50 px-3 py-1 rounded-lg">Escrever</button>
           </div>
           
           {showReviewForm && (
             <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-xl mb-6 animate-slide-in border border-gray-100">
                <div className="flex gap-2 mb-3">
                   {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setNewReviewRating(star)}>
                         <Star className={`w-8 h-8 ${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                   ))}
                </div>
                <textarea 
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm mb-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  rows={3} 
                  placeholder="O que você achou?"
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth>Enviar</Button>
             </form>
           )}

           <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <p className="text-gray-400 text-sm">Este produto ainda não tem avaliações.</p>
                </div>
              ) : (
                reviews.map(review => (
                   <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-sm text-gray-900">{review.userName}</span>
                         <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                         ))}
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                   </div>
                ))
              )}
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-3 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
         <Button variant="outline" onClick={() => onAddToCart(product)} className="flex-1 border-primary text-primary hover:bg-red-50 h-12">
            Adicionar à Sacola
         </Button>
         <Button onClick={() => onBuyNow(product)} className="flex-1 bg-primary shadow-lg shadow-primary/30 h-12">
            Comprar Agora
         </Button>
      </div>
    </div>
  );
};

const CartScreen: React.FC<{ 
  cart: CartItem[]; 
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}> = ({ cart, onUpdateQty, onRemove, onCheckout }) => {
  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-20 p-8 text-center animate-fade-in bg-white">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300"><ShoppingBag className="w-12 h-12" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <p className="text-gray-500 mb-8 max-w-[200px] mx-auto">Navegue pelo catálogo e aproveite nossas ofertas.</p>
        <Button variant="primary" onClick={() => window.location.hash = ''} className="px-10">Ir às compras</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10"><h1 className="text-xl font-bold text-gray-900">Minha Sacola ({cart.length})</h1></div>
      <div className="flex-1 overflow-y-auto p-4 pb-56 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-4 relative overflow-hidden shadow-sm">
             <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-50"><img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" /></div>
             <div className="flex-1 flex flex-col justify-between py-1">
                <div className="pr-8"><h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h4><p className="text-xs text-gray-400 mt-1">{item.category}</p></div>
                <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary text-lg">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="px-2 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-l-lg hover:text-red-500"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} className="px-2 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-r-lg"><Plus className="w-3 h-3" /></button>
                    </div>
                </div>
             </div>
             <button onClick={() => onRemove(item.id)} className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-100 p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
         <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm text-gray-500"><span>Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
            <div className="flex justify-between items-center text-sm text-gray-500"><span>Frete</span><span className="text-green-600 font-bold">Grátis</span></div>
            <div className="flex justify-between items-center text-sm text-gray-500"><span>Descontos</span><span>-</span></div>
         </div>
         <div className="h-px bg-gray-100 w-full mb-4"></div>
         <div className="flex justify-between items-center mb-6"><span className="font-bold text-gray-900 text-xl">Total</span><span className="font-bold text-primary text-2xl">R$ {total.toFixed(2)}</span></div>
         <Button onClick={onCheckout} fullWidth className="shadow-lg shadow-primary/30 h-12 text-lg">Finalizar Compra</Button>
      </div>
    </div>
  );
};

const ProfileScreen: React.FC<{ 
  wishlist: Product[], 
  onNavigate: (p: Product) => void, 
  onRemoveFromWishlist: (p: Product) => void,
  onGoTo: (s: AppScreen) => void,
  user: any
}> = ({ wishlist, onNavigate, onRemoveFromWishlist, onGoTo, user }) => {
    return (
        <div className="p-4 pt-8 h-full bg-white pb-24 overflow-y-auto">
            {user ? (
              <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200"><User className="w-8 h-8 text-gray-400" /></div>
                <div><h2 className="text-xl font-bold text-gray-900">Olá, Visitante</h2><p className="text-gray-500 text-sm">Entre ou cadastre-se para ver seus dados</p></div>
              </div>
            )}

            {/* Indicator of Data Source */}
            <div className="mb-8 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-blue-700 text-xs font-medium">
               <div className="flex items-center gap-2">
                 <Database className="w-4 h-4" />
                 <span>Fonte de Dados: {USE_MOCK_DATA ? 'Demonstração (Mock)' : 'Loja Integrada (Live)'}</span>
               </div>
               {!USE_MOCK_DATA && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shadow-sm">
                <button onClick={() => onGoTo(AppScreen.ORDERS)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Meus Pedidos</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                 <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Meus Endereços</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Cartões Salvos</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                <button onClick={() => onGoTo(AppScreen.SETTINGS)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Configurações</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
            </div>

            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
                   <Heart className="w-4 h-4 text-primary fill-primary" /> Favoritos ({wishlist.length})
                </h3>
                {wishlist.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 border-dashed">
                       <p className="text-gray-400 text-sm">Você ainda não favoritou nenhum produto.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {wishlist.map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-3 items-center shadow-sm active:scale-[0.99] transition-transform" onClick={() => onNavigate(product)}>
                                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-50" />
                                <div className="flex-1"><h4 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h4><p className="text-primary font-bold text-sm">R$ {product.price.toFixed(2)}</p></div>
                                <button onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(product); }} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {!user ? (
               <Button onClick={() => onGoTo(AppScreen.LOGIN)} fullWidth className="shadow-lg shadow-primary/20">Login / Cadastro</Button>
            ) : (
               <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" fullWidth onClick={() => onGoTo(AppScreen.LOGIN)}><LogOut className="w-4 h-4 mr-2"/> Sair da Conta</Button>
            )}
        </div>
    )
}

// --- MAIN APP ---

const App: React.FC = () => {
  const [navStack, setNavStack] = useState<AppScreen[]>([AppScreen.SPLASH]);
  const [flyingIcons, setFlyingIcons] = useState<{id: number, x: number, y: number}[]>([]);
  
  const currentScreen = navStack[navStack.length - 1];
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { const saved = localStorage.getItem('cart'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try { const saved = localStorage.getItem('wishlist'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    try { const saved = localStorage.getItem('reviews'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('reviews', JSON.stringify(reviews)); }, [reviews]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsApiLoading(true);
      
      // Force mock data in preview/dev if USE_MOCK_DATA is true
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setIsApiLoading(false);
        return;
      }

      // Simple fetch config to avoid preflight issues where possible
      const fetchOptions = {
         headers: {
            'Content-Type': 'application/json'
         }
      };

      try {
         // Fetch both concurrently
         const [prodRes, catRes] = await Promise.all([
             fetch(`${API_BASE_URL}/products`, fetchOptions),
             fetch(`${API_BASE_URL}/categories`, fetchOptions)
         ]);

         if (prodRes.ok) {
            const prodData = await prodRes.json();
            setProducts(prodData);
         } else {
            console.warn(`Products API unavailable (${prodRes.status}). Switching to mock data.`);
            setProducts(MOCK_PRODUCTS);
         }

         if (catRes.ok) {
            const catData = await catRes.json();
            setCategories(catData);
         } else {
            console.warn(`Categories API unavailable (${catRes.status}). Switching to mock data.`);
            setCategories(MOCK_CATEGORIES);
         }

      } catch (err) {
         console.warn("Network Error (Using Mock):", err);
         setProducts(MOCK_PRODUCTS);
         setCategories(MOCK_CATEGORIES);
      } finally {
         setIsApiLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentScreen === AppScreen.SPLASH) {
       setTimeout(() => {
          const seenOnboarding = localStorage.getItem('seen_onboarding');
          if (seenOnboarding) {
             setNavStack([AppScreen.HOME]);
          } else {
             setNavStack([AppScreen.ONBOARDING]);
          }
       }, 2500);
    }
  }, [currentScreen]);

  const pushScreen = (screen: AppScreen) => setNavStack(prev => [...prev, screen]);
  const popScreen = () => setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const replaceScreen = (screen: AppScreen) => setNavStack(prev => [...prev.slice(0, -1), screen]);
  const resetToHome = () => setNavStack([AppScreen.HOME]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    pushScreen(AppScreen.PRODUCT_DETAILS);
  };

  const handleUpdateQty = (product: Product, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (!existing && delta > 0) return [...prev, { ...product, quantity: delta }];
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(item => item.id !== product.id);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return prev;
    });
  };

  const handleRemoveCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => prev.some(p => p.id === product.id) ? prev.filter(p => p.id !== product.id) : [...prev, product]);
  };

  const handleAddReview = (rating: number, comment: string) => {
    if (!selectedProduct) return;
    const newReview: Review = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      userName: user ? user.name : 'Visitante',
      rating,
      comment,
      date: new Date().toLocaleDateString('pt-BR')
    };
    setReviews(prev => [newReview, ...prev]);
  };

  // Integration with Loja Integrada Checkout via WebView/External Link
  const handleCheckout = () => {
     if(cart.length === 0) return;
     const checkoutUrl = `https://www.lina.com.br/carrinho/produto/${cart[0].id}/qtde/${cart[0].quantity}`;
     if (confirm("Você será redirecionado para o ambiente seguro da Loja Integrada para finalizar o pagamento.")) {
        window.open(checkoutUrl, '_blank');
     }
  }

  const handleBuyNow = (product: Product) => {
     const checkoutUrl = `https://www.lina.com.br/carrinho/produto/${product.id}/qtde/1`;
     window.open(checkoutUrl, '_blank');
  }

  const handleLogin = () => {
     setUser({ name: "Cliente Lina", email: "cliente@email.com" }); 
     resetToHome();
  };

  const triggerAddToCartAnim = (x: number, y: number) => {
    const id = Date.now();
    setFlyingIcons(prev => [...prev, { id, x, y }]);
  };

  const removeFlyingIcon = (id: number) => {
    setFlyingIcons(prev => prev.filter(i => i.id !== id));
  };

  const mainTabs = [AppScreen.HOME, AppScreen.CATALOG, AppScreen.CART, AppScreen.PROFILE];
  const isTabBarActuallyVisible = mainTabs.includes(currentScreen);

  const handleTabPress = (screen: AppScreen) => {
      if (navStack.includes(screen)) {
          const newStack = navStack.filter(s => !mainTabs.includes(s));
          setNavStack([...newStack, screen]);
      } else {
          setNavStack([screen]);
      }
  }

  const navItems = [
    { id: AppScreen.HOME, icon: Home, label: 'Início' },
    { id: AppScreen.CATALOG, icon: Menu, label: 'Catálogo' },
    { id: AppScreen.CART, icon: ShoppingBag, label: 'Sacola', badge: cart.reduce((a,c) => a + c.quantity, 0) },
    { id: AppScreen.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center">
    <div className="w-full h-full max-w-md bg-white shadow-2xl overflow-hidden relative font-sans text-gray-900 flex flex-col md:rounded-3xl md:h-[95vh] md:border-4 md:border-gray-800">
      
      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative bg-white">
        {flyingIcons.map(icon => (
          <FlyingIcon key={icon.id} start={{x: icon.x, y: icon.y}} onEnd={() => removeFlyingIcon(icon.id)} />
        ))}

        {currentScreen === AppScreen.SPLASH && <SplashScreen />}
        
        {currentScreen === AppScreen.ONBOARDING && (
           <OnboardingScreen onFinish={() => {
              localStorage.setItem('seen_onboarding', 'true');
              replaceScreen(AppScreen.HOME);
           }} />
        )}
        
        {currentScreen === AppScreen.LOGIN && (
           <LoginScreen 
              onLogin={handleLogin} 
              onRegister={() => alert('Redirecionando para cadastro web...')} 
              onSkip={() => resetToHome()} 
           />
        )}

        {currentScreen === AppScreen.HOME && (
            <HomeScreen 
                onNavigate={handleProductClick} 
                cart={cart} wishlist={wishlist} onUpdateQty={handleUpdateQty} onToggleWishlist={handleToggleWishlist}
                onAddToCartAnimated={triggerAddToCartAnim}
                products={products}
                categories={categories}
                isApiLoading={isApiLoading}
            />
        )}
        
        {currentScreen === AppScreen.CATALOG && (
            <CatalogScreen 
                onNavigate={handleProductClick}
                cart={cart} wishlist={wishlist} onUpdateQty={handleUpdateQty} onToggleWishlist={handleToggleWishlist}
                onAddToCartAnimated={triggerAddToCartAnim}
                products={products}
                categories={categories}
                isApiLoading={isApiLoading}
            />
        )}
        
        {currentScreen === AppScreen.CART && (
            <CartScreen 
                cart={cart} onUpdateQty={(id, d) => handleUpdateQty(cart.find(c=>c.id===id)!, d)} onRemove={handleRemoveCart} onCheckout={handleCheckout} 
            />
        )}
        
        {currentScreen === AppScreen.PROFILE && (
            <ProfileScreen 
                wishlist={wishlist} onNavigate={handleProductClick} onRemoveFromWishlist={handleToggleWishlist} user={user}
                onGoTo={pushScreen}
            />
        )}

        {currentScreen === AppScreen.ORDERS && <OrdersScreen onBack={popScreen} />}
        {currentScreen === AppScreen.SETTINGS && <SettingsScreen onBack={popScreen} />}
        
        {currentScreen === AppScreen.PRODUCT_DETAILS && selectedProduct && (
          <ProductDetailScreen 
            product={selectedProduct} 
            onBack={popScreen} 
            onAddToCart={(p) => handleUpdateQty(p, 1)} 
            onBuyNow={handleBuyNow}
            isWishlisted={wishlist.some(w => w.id === selectedProduct.id)} 
            onToggleWishlist={handleToggleWishlist}
            reviews={reviews.filter(r => r.productId === selectedProduct.id)}
            onAddReview={handleAddReview}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {isTabBarActuallyVisible && (
        <nav className="bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2 pb-6 absolute bottom-0 w-full z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          {navItems.map((item) => {
             const isActive = currentScreen === item.id;
             return (
              <button
                key={item.id}
                onClick={() => handleTabPress(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 relative ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <item.icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
                {item.badge ? <span className="absolute top-1 right-3 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm ring-2 ring-white">{item.badge}</span> : null}
              </button>
             );
          })}
        </nav>
      )}
    </div>
    </div>
  );
};

export default App;