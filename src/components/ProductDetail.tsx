import React from 'react';
import { Product } from '../types';
import { ChevronRight, Minus, Plus, Bolt, ArrowRight, Verified, Truck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onBuy: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onBuy }) => {
  const [quantity, setQuantity] = React.useState(1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <nav className="flex items-center gap-2 text-sm font-medium">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition-colors">Home</button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition-colors">Laptops</button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-8 group">
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1000'} 
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg border border-white/10 bg-white/5 p-2 cursor-pointer hover:border-primary/40 transition-colors">
                <img src={product.image || 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1000'} alt="Detail" className="w-full h-full object-cover rounded opacity-50" referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="aspect-square rounded-lg border border-white/10 bg-white/5 p-2 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-center">
              <span className="text-slate-400 text-xs">+5 Photos</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">Limited Edition</span>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 mb-4 leading-tight">{product.name}</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="py-4">
            <h2 className="text-3xl font-bold text-primary">${(product.price / 100).toLocaleString('es-CO', { minimumFractionDigits: 2 })} COP</h2>
            <p className="text-xs text-slate-500 mt-1 italic">Includes import taxes and local distribution fees</p>
          </div>

          <div className="flex flex-col gap-4 py-6 border-y border-white/10">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Quantity</span>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-bold text-slate-100">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2 pt-6">
                <button 
                  onClick={() => onBuy(product)}
                  className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Bolt className="w-5 h-5" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Delivery fee</span>
              <span className="text-slate-100 font-medium">$15.000 COP</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Base fee (Processing)</span>
              <span className="text-slate-100 font-medium">$5.000 COP</span>
            </div>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-100">Total Price</span>
              <span className="text-2xl font-bold text-primary tracking-tight">
                ${( (product.price * quantity + 2000000) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2 })} COP
              </span>
            </div>
            <button 
              onClick={() => onBuy(product)}
              className="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
              <Verified className="w-5 h-5 text-primary" />
              <span className="text-xs text-slate-300">2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-xs text-slate-300">Free Express Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
