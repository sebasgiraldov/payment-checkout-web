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
  
  // Use step to determine what to show in the main area
  // We'll treat step 1 as catalog/detail depending on if a product is selected in Redux (or local state for now)
  // For simplicity, let's keep selectedProduct in local state or move it to a slice later.
  // Actually, let's keep the existing "Page" concept but sync it with Redux steps where it makes sense.
  // The requirement says "Paso 1: Catálogo", "Paso 2: Formulario", etc.
  
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (step) {
      case 1:
        return currentPage === 'catalog' ? (
          <ProductGrid products={filteredProducts} onProductClick={handleProductClick} onBuy={handleBuy} />
        ) : selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => setCurrentPage('catalog')} 
            onBuy={handleBuy}
          />
        ) : null;
      case 2:
      case 3:
      case 4:
        return <Checkout />;
      case 5:
        if (paymentStatus === 'APPROVED') {
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-slate-100">Payment Successful!</h1>
              <p className="text-slate-400 max-w-md">
                Your order has been confirmed. You will receive an email with your receipt and tracking information shortly.
              </p>
              <button 
                onClick={() => {
                  dispatch(resetCheckout());
                  dispatch(fetchProducts()); // Refresh stock
                  window.scrollTo(0, 0);
                }}
                className="bg-primary text-background-dark font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-all"
              >
                Continue Shopping
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
              <h1 className="text-4xl font-bold text-slate-100">Payment Failed</h1>
              <p className="text-slate-400 max-w-md">
                There was an issue processing your transaction. Please check your payment details and try again.
              </p>
              <button 
                onClick={() => dispatch(setStep(2))}
                className="bg-white/10 text-slate-100 font-bold px-8 py-3 rounded-lg hover:bg-white/20 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-300 font-sans selection:bg-primary/30 selection:text-primary">
      <Navbar 
        cartCount={selectedProduct ? 1 : 0} 
        onNavigate={(target) => {
          if (target === 'catalog') {
            setCurrentPage('catalog');
            dispatch(resetCheckout());
            // Implicitly if we go to catalog, we stay in step 1
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
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {productsLoading && step === 1 ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-12 h-12 text-primary animate-spin" />
                 <p className="mt-4 text-slate-400">Loading products...</p>
               </div>
            ) : renderContent()}
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
