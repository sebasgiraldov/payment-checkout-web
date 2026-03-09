import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
  onBuy: (product: Product) => void;
  searchQuery: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick, onBuy, searchQuery }) => {
  const [activeCategory, setActiveCategory] = React.useState('All Items');
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-slate-400 font-medium">Synchronizing elite inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-100">Connection Interrupted</h3>
        <p className="text-slate-400 max-w-sm mt-2">We couldn't reach the warehouse. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const filteredProducts = (products || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All Items') return matchesSearch;
    
    // Simple category mapping - in a real app this would come from the API
    const isPeripheral = ['Mechanical Keyboard', 'Wireless Mouse', 'USB-C Hub'].includes(p.name);
    if (activeCategory === 'Peripherals') return isPeripheral && matchesSearch;
    if (activeCategory === 'Components') return !isPeripheral && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm font-medium">
        <button className="text-slate-500 hover:text-primary transition-colors">Home</button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-primary">Product Catalog</span>
      </nav>

      <div className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight">
          HIGH-PERFORMANCE <span className="text-primary">GEAR</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          Engineered for the elite. Push the boundaries of possibility with our next-generation technology collection.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All Items', 'Components', 'Peripherals'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
              activeCategory === cat 
                ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(56,255,20,0.3)]' 
                : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:border-primary/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product)} 
              onBuy={() => onBuy(product)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
          <p className="text-slate-500 font-medium">No tactical gear matches your search criteria.</p>
        </div>
      )}
    </div>
  );
};
