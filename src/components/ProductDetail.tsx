import React from 'react';
import { Product } from '../types';
import { ChevronRight, Minus, Plus, Bolt, ArrowRight, Verified, Truck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { getProductImage } from '../utils/constants';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onBuy: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onBuy }) => {
  const [quantity, setQuantity] = React.useState(1);
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <nav className="flex items-center gap-2 text-sm font-medium">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition-colors">Home</button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-8 group">
            <img 
              src={getProductImage(product.name)} 
              alt={product.name}
              className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`}
              referrerPolicy="no-referrer"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background-dark/40 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-red-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-lg shadow-2xl scale-110">
                  Sold Out
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg border border-white/10 bg-white/5 p-2 cursor-pointer hover:border-primary/40 transition-colors">
                <img src={getProductImage(product.name)} alt="Detail" className="w-full h-full object-cover rounded opacity-50" referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="aspect-square rounded-lg border border-white/10 bg-white/5 p-2 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-center text-slate-400 text-xs">
              +5 Photos
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">Premium Selection</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${isOutOfStock ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {isOutOfStock ? 'No stock' : `${product.stock} available`}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 mb-4 leading-tight">{product.name}</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="py-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">${product.price.toLocaleString('es-CO')}</span>
              <span className="text-lg text-primary font-bold">COP</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 italic">Exclusive price for the next generation of creators</p>
          </div>

          {isOutOfStock ? (
            <div className="flex flex-col gap-4 py-8 border-y border-white/10 bg-red-500/5 rounded-xl px-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-bold text-lg">Currently Unavailable</span>
              </div>
              <p className="text-slate-400 text-sm">This legendary gear is temporarily out of stock. Join the waitlist to be notified when the next drop arrives.</p>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 rounded-lg transition-all">
                JOIN THE WAITLIST
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-6 border-y border-white/10">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Quantity</span>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:text-primary transition-colors disabled:opacity-30"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-bold text-slate-100 w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:text-primary transition-colors disabled:opacity-30"
                      disabled={quantity >= product.stock}
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
          )}

          {!isOutOfStock && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Delivery fee</span>
                <span className="text-slate-100 font-medium">$15.000 COP</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Safe Payment Fee</span>
                <span className="text-slate-100 font-medium">$5.000 COP</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-100">Checkout Total</span>
                <span className="text-2xl font-bold text-primary tracking-tight">
                  ${(product.price * quantity + 20000).toLocaleString('es-CO')} COP
                </span>
              </div>
              <button 
                onClick={() => onBuy(product)}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                Secure Purchase
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
              <Verified className="w-5 h-5 text-primary" />
              <span className="text-xs text-slate-300">Certified Tech</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-xs text-slate-300">Fast Forward Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
