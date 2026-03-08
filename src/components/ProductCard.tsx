import React from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBuy: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onBuy }) => {
  const displayPrice = (product.price / 100).toLocaleString('es-CO', { minimumFractionDigits: 2 });
  const displayImage = product.image || `https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1000`;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="product-card-glow group flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-800">
        <img 
          src={displayImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.id === '1' && (
          <div className="absolute top-4 right-4 bg-primary text-background-dark px-3 py-1 rounded text-xs font-black uppercase">
            New Arrival
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-100 mb-1">{product.name}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto">
          <p className="text-primary text-2xl font-bold mb-6">
            ${displayPrice} <span className="text-xs uppercase opacity-70">COP</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg text-sm font-bold transition-colors">
              VIEW DETAILS
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBuy(); }}
              className="py-2 bg-primary text-background-dark hover:bg-primary/90 rounded-lg text-sm font-bold transition-colors"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
