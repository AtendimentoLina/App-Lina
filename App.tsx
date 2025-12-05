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
  CheckCircle,
  Truck,
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES, BANNERS, MOCK_ORDERS } from './constants';
import { AppScreen, Product, CartItem, Order, Review, Category } from './types';

// --- Configuration ---
// Pointing directly to the Vercel production API as requested.
// This allows the app to fetch real data even when running locally or on a device.
const API_BASE_URL = 'https://app-lina.vercel.app/api'; 

// Set this to TRUE to test the UI without breaking before you deploy the API
// Set to FALSE to start using real data. 
// If the API fails (e.g. missing Key), it will automatically fallback to mock data.
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
    outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
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
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

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
    // Trigger animation next frame
    requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        top: window.innerHeight - 50, // Approx Nav bar location
        left: window.innerWidth * 0.65, // Approx Cart icon location (3rd tab)
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
    
    // Trigger flying animation if adding first item
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
      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-xl z-0"
    >
      <button 
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-400'} ${animatingHeart ? 'scale-150' : 'scale-100'}`} 
        />
      </button>

      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        {product.oldPrice && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
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
          <p className="text-primary font-bold">R$ {product.price.toFixed(2)}</p>
        </div>

        {cartQty > 0 ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 h-8 w-full mt-1" onClick={e => e.stopPropagation()}>
             <button onClick={(e) => handleQtyClick(e, -1)} className="w-8 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-l-lg hover:text-red-500">
               {cartQty === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
             </button>
             <span className="flex-1 text-center text-xs font-bold text-gray-900">{cartQty}</span>
             <button onClick={(e) => handleQtyClick(e, 1)} className="w-8 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-r-lg">
               <Plus className="w-3 h-3" />
             </button>
          </div>
        ) : (
          <button 
            onClick={(e) => handleQtyClick(e, 1)}
            className="w-full h-8 mt-1 bg-primary text-white text-xs font-semibold rounded-lg shadow-sm active:bg-secondary flex items-center justify-center gap-1 hover:bg-red-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
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
    <Skeleton className="h-5 w-1/3 mb-2" />
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
);

// --- SCREENS ---

const SplashScreen: React.FC = () => (
  <div className="h-full w-full bg-primary flex flex-col items-center justify-center animate-fade-in z-50">
    <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl font-bold text-white tracking-tighter">L</span>
    </div>
    <h1 className="text-3xl font-bold text-white tracking-widest">LINA</h1>
    <p className="text-white/80 text-xs tracking-[0.2em] mt-1 uppercase">Materiais Elétricos</p>
    <div className="mt-8 animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full"></div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
           <h2 className="text-3xl font-bold mb-4">{steps[step].title}</h2>
           <p className="text-gray-200 text-lg leading-relaxed">{steps[step].desc}</p>
        </div>
      </div>
      <div className="p-6 flex items-center justify-between bg-white">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}`} />
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
    <div className="h-full flex flex-col p-6 bg-white justify-center animate-fade-in">
       <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-2">Bem-vindo de volta!</h1>
          <p className="text-gray-500">Faça login para acessar seus pedidos e orçamentos.</p>
       </div>

       <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center border border-gray-100 focus-within:border-primary transition-colors">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <input type="email" placeholder="Seu e-mail" className="bg-transparent w-full outline-none" required />
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center border border-gray-100 focus-within:border-primary transition-colors">
            <Lock className="w-5 h-5 text-gray-400 mr-3" />
            <input type="password" placeholder="Sua senha" className="bg-transparent w-full outline-none" required />
          </div>
          <div className="flex justify-end">
            <button type="button" className="text-sm text-primary font-semibold">Esqueceu a senha?</button>
          </div>
          <Button type="submit" fullWidth>Entrar</Button>
       </form>

       <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-gray-400 text-sm">ou entre com</span>
          <div className="h-px bg-gray-200 flex-1" />
       </div>

       <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="text-sm"><span className="mr-2">G</span> Google</Button>
          <Button variant="outline" className="text-sm"><span className="mr-2"></span> Apple</Button>
       </div>

       <div className="mt-auto pt-6 text-center space-y-4">
          <p className="text-gray-600">
            Não tem uma conta? <button onClick={onRegister} className="text-primary font-bold">Cadastre-se</button>
          </p>
          <button onClick={onSkip} className="text-gray-400 text-sm underline">Continuar como visitante</button>
       </div>
    </div>
  )
};

const OrdersScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50 animate-slide-in">
       <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-6 h-6" /></button>
         <h1 className="font-bold text-lg">Meus Pedidos</h1>
       </div>
       <div className="p-4 space-y-4 overflow-y-auto pb-24">
          {MOCK_ORDERS.map(order => (
             <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <span className="font-bold text-gray-900 block">{order.id}</span>
                      <span className="text-xs text-gray-500">{order.date}</span>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize 
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'shipping' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {order.status === 'delivered' ? 'Entregue' : order.status === 'shipping' ? 'Em Trânsito' : 'Pendente'}
                   </div>
                </div>
                <div className="flex gap-2 mb-3 overflow-hidden">
                   {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                   ))}
                   {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold">
                         +{order.items.length - 3}
                      </div>
                   )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                   <span className="text-sm text-gray-500">Total: <span className="text-gray-900 font-bold">R$ {order.total.toFixed(2)}</span></span>
                   <button className="text-primary font-bold text-sm">Detalhes</button>
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
     <div className="h-full flex flex-col bg-gray-50 animate-slide-in">
        <div className="bg-white p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-10">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Configurações</h1>
        </div>
        <div className="p-4 space-y-6">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-gray-900">Geral</h3>
              <div className="flex items-center justify-between py-2">
                 <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span>Notificações Push</span>
                 </div>
                 <button 
                   onClick={() => setNotifications(!notifications)}
                   className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-gray-300'}`}
                 >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications ? 'left-6.5 translate-x-1' : 'left-0.5'}`} />
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 text-gray-900">Sobre</h3>
              <button className="w-full flex items-center justify-between py-3 border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span>Política de Privacidade</span>
                 </div>
                 <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between py-3">
                 <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span>Termos de Uso</span>
                 </div>
                 <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
           </div>
           
           <div className="text-center text-xs text-gray-400">
              App v1.3.0 (Lina Build)<br/>© 2023 Lina Materiais Elétricos
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
      <div className="space-y-6 pb-24 px-4 pt-6 animate-pulse">
        <div className="bg-gray-100 h-12 rounded-full w-full" />
        <div className="flex gap-4 overflow-hidden mt-6">
           <Skeleton className="min-w-[90%] h-48 rounded-2xl" />
           <Skeleton className="min-w-[90%] h-48 rounded-2xl" />
        </div>
        <div className="flex gap-4 mt-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="w-16 h-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
           {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="px-4 pt-2">
        <div className="bg-gray-100 rounded-full flex items-center px-4 py-3 shadow-sm border border-gray-200/50">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" placeholder="Busque por produto, marca..." className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400"/>
        </div>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 gap-4">
        {BANNERS.map((banner) => (
          <div key={banner.id} className="snap-center min-w-[90%] h-48 rounded-2xl overflow-hidden relative shadow-md">
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
              <h2 className="text-2xl font-bold">{banner.title}</h2>
              <p className="font-medium text-gray-200">{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4">
        <h3 className="text-lg font-bold text-secondary mb-3">Departamentos</h3>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center space-y-2 min-w-[72px]">
              <div className="w-16 h-16 rounded-full bg-white p-2 border border-gray-200 shadow-sm">
                <img src={cat.image} alt={cat.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-secondary">Ofertas do Dia</h3>
          <button className="text-primary text-sm font-semibold">Ver tudo</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
    
    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    if (sortBy === 'price_asc') result.sort((a,b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a,b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a,b) => b.rating - a.rating);
    // newest assumes index order or specific date field (using reverse index for mock)
    if (sortBy === 'newest') result.reverse();

    return result;
  }, [activeCat, sortBy, priceRange, products]);

  const getCartQty = (id: string) => cart.find(i => i.id === id)?.quantity || 0;
  const isWishlisted = (id: string) => wishlist.some(i => i.id === id);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
       <div className="px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-secondary">Catálogo</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-slide-in">
             <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ordenar Por</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setSortBy('newest')} className={`text-sm py-2 px-3 rounded-lg border ${sortBy === 'newest' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500'}`}>Lançamentos</button>
                   <button onClick={() => setSortBy('rating')} className={`text-sm py-2 px-3 rounded-lg border ${sortBy === 'rating' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500'}`}>Melhor Avaliação</button>
                   <button onClick={() => setSortBy('price_asc')} className={`text-sm py-2 px-3 rounded-lg border ${sortBy === 'price_asc' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500'}`}>Menor Preço</button>
                   <button onClick={() => setSortBy('price_desc')} className={`text-sm py-2 px-3 rounded-lg border ${sortBy === 'price_desc' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500'}`}>Maior Preço</button>
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Faixa de Preço (Máx: R$ {priceRange[1]})</label>
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCat === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
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
          <div className="flex flex-col items-center justify-center h-64 text-gray-400"><p>Nenhum produto encontrado.</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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
          text: `Confira este produto incrível: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert("Compartilhar não suportado neste navegador. Link copiado!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-full pb-24">
        <Skeleton className="h-[45vh] w-full rounded-none" />
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-[2rem] relative z-10 space-y-4">
           <Skeleton className="h-8 w-3/4" />
           <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-24" />
           </div>
           <Skeleton className="h-32 w-full rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full pb-24 animate-slide-in">
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
        <button onClick={onBack} className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm pointer-events-auto hover:bg-white"><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
        <div className="flex gap-2 pointer-events-auto">
            <button onClick={() => onToggleWishlist(product)} className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white">
                <Heart className={`w-6 h-6 transition-all duration-300 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-800'} ${animatingHeart ? 'scale-150' : 'scale-100'}`} />
            </button>
            <button onClick={handleShare} className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white"><Share2 className="w-6 h-6 text-gray-800" /></button>
        </div>
      </div>
      <div className="h-[45vh] bg-gray-100 relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="px-5 py-6 -mt-6 bg-white rounded-t-[2rem] relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-start mb-4">
          <div>
             <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
             <div className="flex items-center text-sm text-gray-500">
               <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
               <span className="font-medium text-gray-900 mr-1">{product.rating}</span>
               <span>({reviews.length} avaliações)</span>
             </div>
          </div>
          <div className="flex flex-col items-end">
             {product.oldPrice && <span className="text-sm text-gray-400 line-through">R$ {product.oldPrice.toFixed(2)}</span>}
             <span className="text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-secondary mb-2">Descrição</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
        </div>
        
        {/* Reviews Section */}
        <div className="border-t border-gray-100 pt-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-secondary">Avaliações</h3>
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-primary text-sm font-bold">Avaliar</button>
           </div>
           
           {showReviewForm && (
             <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-xl mb-6 animate-slide-in">
                <div className="flex gap-2 mb-3">
                   {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setNewReviewRating(star)}>
                         <Star className={`w-6 h-6 ${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                   ))}
                </div>
                <textarea 
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm mb-3 outline-none focus:border-primary" 
                  rows={3} 
                  placeholder="Conte o que achou do produto..."
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth>Enviar Avaliação</Button>
             </form>
           )}

           <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Seja o primeiro a avaliar!</p>
              ) : (
                reviews.map(review => (
                   <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-sm">{review.userName}</span>
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-3 z-20">
         <Button variant="outline" onClick={() => onAddToCart(product)} className="flex-1 border-primary text-primary hover:bg-red-50">Adicionar</Button>
         <Button onClick={() => onBuyNow(product)} className="flex-1 bg-primary shadow-primary/20">Comprar</Button>
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
      <div className="flex flex-col items-center justify-center h-full pb-20 p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400"><ShoppingBag className="w-10 h-10" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sua sacola está vazia</h2>
        <Button variant="outline" onClick={() => window.location.hash = ''}>Ir às compras</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10"><h1 className="text-xl font-bold text-secondary">Meu Carrinho ({cart.length})</h1></div>
      <div className="flex-1 overflow-y-auto p-4 pb-48 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative overflow-hidden">
             <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
             <div className="flex-1 flex flex-col justify-between py-1">
                <div className="pr-8"><h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4><p className="text-xs text-gray-500">{item.category}</p></div>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary text-lg">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      {item.quantity > 1 && <span className="text-xs text-gray-400">R$ {item.price.toFixed(2)} cada</span>}
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="px-2 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-l-lg hover:text-red-500"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} className="px-2 h-full flex items-center justify-center text-gray-600 active:bg-gray-200 rounded-r-lg"><Plus className="w-3 h-3" /></button>
                    </div>
                </div>
             </div>
             <button onClick={() => onRemove(item.id)} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-100 p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
         <div className="flex justify-between items-center mb-2 text-sm text-gray-500"><span>Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
         <div className="flex justify-between items-center mb-6"><span className="font-bold text-gray-900 text-lg">Total</span><span className="font-bold text-primary text-2xl">R$ {total.toFixed(2)}</span></div>
         <Button onClick={onCheckout} fullWidth>Finalizar Compra</Button>
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
        <div className="p-4 pt-8 h-full bg-gray-50 pb-24 overflow-y-auto">
            {user ? (
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-gray-500" /></div>
                <div><h2 className="text-xl font-bold text-gray-900">Olá, Visitante</h2><p className="text-gray-500 text-sm">Entre ou cadastre-se</p></div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <button onClick={() => onGoTo(AppScreen.ORDERS)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Meus Pedidos</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Cartões Salvos</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
                <button onClick={() => onGoTo(AppScreen.SETTINGS)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-primary" /><span className="font-medium text-gray-700">Configurações</span></div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </button>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-secondary mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500 fill-red-500" />Minha Lista de Desejos ({wishlist.length})</h3>
                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-100 text-sm">Sua lista de desejos está vazia.</div>
                ) : (
                    <div className="space-y-3">
                        {wishlist.map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-3 items-center active:scale-[0.99] transition-transform" onClick={() => onNavigate(product)}>
                                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                                <div className="flex-1"><h4 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h4><p className="text-primary font-bold text-sm">R$ {product.price.toFixed(2)}</p></div>
                                <button onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(product); }} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {!user ? (
               <Button onClick={() => onGoTo(AppScreen.LOGIN)} fullWidth>Login / Cadastro</Button>
            ) : (
               <Button variant="outline" className="text-red-500 border-red-200" fullWidth onClick={() => onGoTo(AppScreen.LOGIN)}><LogOut className="w-4 h-4 mr-2"/> Sair</Button>
            )}
        </div>
    )
}

// --- MAIN APP ---

const App: React.FC = () => {
  // Navigation Stack (History) for Native Feel
  const [navStack, setNavStack] = useState<AppScreen[]>([AppScreen.SPLASH]);
  const [flyingIcons, setFlyingIcons] = useState<{id: number, x: number, y: number}[]>([]);
  
  const currentScreen = navStack[navStack.length - 1];
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null); // Mock user state
  
  // -- Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(true);

  // -- Store State --
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { const saved = localStorage.getItem('cart'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try { const saved = localStorage.getItem('wishlist'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    try { const saved = localStorage.getItem('reviews'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  // Effects
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('reviews', JSON.stringify(reviews)); }, [reviews]);
  
  // Data Fetching Effect
  useEffect(() => {
    const fetchData = async () => {
      setIsApiLoading(true);
      try {
        if (USE_MOCK_DATA) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          setProducts(MOCK_PRODUCTS);
          setCategories(MOCK_CATEGORIES);
        } else {
          try {
            // Fetch Products
            const prodResponse = await fetch(`${API_BASE_URL}/products`);
            if (!prodResponse.ok) throw new Error(`Products API error! status: ${prodResponse.status}`);
            
            const prodContentType = prodResponse.headers.get("content-type");
            if (!prodContentType || !prodContentType.includes("application/json")) {
               throw new Error("Received non-JSON response from Products API");
            }
            const prodData = await prodResponse.json();
            setProducts(prodData);
            
            // Fetch Categories
            const catResponse = await fetch(`${API_BASE_URL}/categories`);
            if (!catResponse.ok) throw new Error(`Categories API error! status: ${catResponse.status}`);
            
            const catContentType = catResponse.headers.get("content-type");
            if (!catContentType || !catContentType.includes("application/json")) {
               throw new Error("Received non-JSON response from Categories API");
            }
            const catData = await catResponse.json();
            setCategories(catData); 

          } catch (innerError) {
             throw innerError; // Rethrow to be caught by the outer catch
          }
        }
      } catch (error) {
        console.warn("API unavailable, using mock data.", error);
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchData();
  }, []);

  // Splash Screen Timer
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

  // Navigation Helpers
  const pushScreen = (screen: AppScreen) => setNavStack(prev => [...prev, screen]);
  const popScreen = () => setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const replaceScreen = (screen: AppScreen) => setNavStack(prev => [...prev.slice(0, -1), screen]);
  const resetToHome = () => setNavStack([AppScreen.HOME]);

  // Actions
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

  const handleBuyNow = (product: Product) => {
     alert(`Checkout direto iniciado para: ${product.name}`);
  }

  const handleLogin = () => {
     setUser({ name: "Lina Client", email: "client@lina.com.br" }); // Mock Login
     resetToHome();
  };

  const triggerAddToCartAnim = (x: number, y: number) => {
    const id = Date.now();
    setFlyingIcons(prev => [...prev, { id, x, y }]);
  };

  const removeFlyingIcon = (id: number) => {
    setFlyingIcons(prev => prev.filter(i => i.id !== id));
  };

  // Nav Bar Logic
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
      <main className="flex-1 overflow-hidden relative">
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
              onRegister={() => alert('Register Mock')} 
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
                cart={cart} onUpdateQty={(id, d) => handleUpdateQty(cart.find(c=>c.id===id)!, d)} onRemove={handleRemoveCart} onCheckout={() => alert('Redirecting to Loja Integrada Checkout...')} 
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
        <nav className="bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2 pb-6 absolute bottom-0 w-full z-50">
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
                {item.badge ? <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">{item.badge}</span> : null}
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