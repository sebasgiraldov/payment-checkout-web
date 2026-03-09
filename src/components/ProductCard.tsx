import React from 'react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { getProductImage } from '../utils/constants';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBuy: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onBuy }) => {
  const displayPrice = product.price.toLocaleString('es-CO');
  const displayImage = getProductImage(product.name);
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isOutOfStock ? { y: -5 } : {}}
      className={`product-card-glow group flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : 'cursor-pointer'}`}
      onClick={!isOutOfStock ? onClick : undefined}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-800">
        <img 
          src={displayImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-background-dark/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
              Out of Stock
            </span>
          </div>
        ) : product.stock < 5 && (
          <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded text-xs font-black uppercase">
            Only {product.stock} left
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-slate-100">{product.name}</h3>
          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${product.stock > 0 ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
            {product.stock > 0 ? `${product.stock} units` : 'Sold Out'}
          </span>
        </div>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto">
          <p className="text-primary text-2xl font-bold mb-6">
            ${displayPrice} <span className="text-xs uppercase opacity-70">COP</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              disabled={isOutOfStock}
              className="py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              DETAILS
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBuy(); }}
              disabled={isOutOfStock}
              className="py-2 bg-primary text-background-dark hover:bg-primary/90 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
