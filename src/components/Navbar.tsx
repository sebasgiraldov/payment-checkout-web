import React from 'react';
import { Terminal, ShoppingCart, User, Search } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onNavigate: (page: 'catalog' | 'detail' | 'checkout') => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onNavigate, onSearch }) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  return (
    <header className="border-b border-white/10 px-4 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2 text-primary cursor-pointer group"
          onClick={() => onNavigate('catalog')}
        >
          <Terminal className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold tracking-tight text-slate-100">TechStore</h2>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate('catalog')} className="text-sm font-medium hover:text-primary transition-colors">Laptops</button>
          <button onClick={() => onNavigate('catalog')} className="text-sm font-medium hover:text-primary transition-colors">Components</button>
          <button onClick={() => onNavigate('catalog')} className="text-sm font-medium hover:text-primary transition-colors">Peripherals</button>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search tech..." 
            onChange={(e) => onSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 transition-all"
          />
        </div>
        
        <button 
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-100 relative transition-all"
          onClick={() => onNavigate('checkout')}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-background-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-100 transition-all"
          >
            <User className="w-5 h-5" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">SG</div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Sebastian G.</p>
                  <p className="text-[10px] text-slate-500">Demo User</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Account Status</p>
              <div className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold w-fit mb-4">VERIFIED</div>
              <button 
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left text-xs text-slate-400 hover:text-white transition-colors"
              >
                Sign Out (Mock)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
