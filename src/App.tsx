import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { Checkout } from './components/Checkout';
import { Product } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from './store';
import { fetchProducts } from './store/slices/productSlice';
import { setStep, resetCheckout, setPaymentStatus } from './store/slices/checkoutSlice';

type Page = 'catalog' | 'detail';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState<Page>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { items: products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { step, paymentStatus } = useSelector((state: RootState) => state.checkout);
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    dispatch(setStep(2));
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    if (step === 1) {
      if (currentPage === 'catalog') {
        return (
          <ProductGrid 
            onProductClick={handleProductClick} 
            onBuy={handleBuy} 
            searchQuery={searchQuery}
          />
        );
      }
      
      if (selectedProduct) {
        return (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => {
              setCurrentPage('catalog');
              setSelectedProduct(null);
            }} 
            onBuy={handleBuy}
          />
        );
      }
      
      return null;
    }

    if (step >= 2 && step <= 4) {
      return <Checkout product={selectedProduct} />;
    }

    if (step === 5) {
      if (['APPROVED', 'PENDING'].includes(paymentStatus)) {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100">
              {paymentStatus === 'APPROVED' ? 'Order Confirmed!' : 'Awaiting Confirmation'}
            </h1>
            <p className="text-slate-400 max-w-md">
              {paymentStatus === 'APPROVED' 
                ? 'Your tactical transmission has been received. Your gear is now being prepared for deployment.' 
                : 'The bank is currently verifying your coordinates. We will dispatch your order as soon as we receive clearance.'}
            </p>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 w-full max-w-sm text-left space-y-4">
               <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Items Dispatched</span>
                  <div className="flex justify-between items-center text-slate-100 font-bold">
                    <span>{selectedProduct?.name}</span>
                    <span>1 Unit</span>
                  </div>
               </div>
               <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Status</span>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">{paymentStatus}</span>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => {
                dispatch(resetCheckout());
                setSelectedProduct(null);
                setCurrentPage('catalog');
                window.scrollTo(0, 0);
              }}
              className="bg-primary text-background-dark font-black px-10 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(56,255,20,0.2)]"
            >
              CONTINUE SHOPPING
            </button>
          </motion.div>
        );
      } else {
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-slate-100">Transmission Interrupted</h1>
            <p className="text-slate-400 max-w-md">
              There was a security failure during the payment terminal handshake. Please verify your credentials and try again.
            </p>
            <button 
              onClick={() => dispatch(setStep(2))}
              className="bg-white/10 text-slate-100 font-bold px-8 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/10"
            >
              RETRY HANDSHAKE
            </button>
          </motion.div>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-300 font-sans selection:bg-primary/30 selection:text-primary">
      <Navbar 
        cartCount={selectedProduct ? 1 : 0} 
        onNavigate={(target) => {
          if (target === 'catalog') {
            setCurrentPage('catalog');
            dispatch(resetCheckout());
            setSelectedProduct(null);
            dispatch(setStep(1));
          } else if (target === 'checkout' && selectedProduct) {
            dispatch(setStep(2));
          }
          window.scrollTo(0, 0);
        }} 
        onSearch={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-10 min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step > 1 && step < 5 ? 'checkout-step' : step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>


      {paymentStatus === 'PROCESSING' && (
        <div className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center flex-col gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-primary font-bold tracking-widest text-sm uppercase">Processing Secure Payment...</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
