import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onBuy: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, onBuy }) => {
  const [activeCategory, setActiveCategory] = React.useState('All Items');

  const filteredProducts = products;

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
    </div>
  );
};
