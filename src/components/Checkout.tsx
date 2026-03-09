import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  Lock, 
  ShieldCheck, 
  ChevronLeft, 
  Loader2, 
  Package, 
  MapPin, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RootState, AppDispatch } from '../store';
import { 
  setStep, 
  setCustomerData, 
  setDeliveryData, 
  setPaymentMethod, 
  setTransactionId, 
  setPaymentStatus 
} from '../store/slices/checkoutSlice';
import { updateStock } from '../store/slices/productSlice';
import { api } from '../services/api';
import { Product, CardDetails } from '../types';
import { getProductImage } from '../utils/constants';
import { useCreateTransaction, useProcessPayment } from '../hooks/useCheckout';

// Product images mapping moved to constants.ts

const baseSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

const cardSchema = baseSchema.extend({
  paymentMethod: z.literal('CARD'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardHolder: z.string().min(3, 'Card holder name is required'),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiration must be MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

const otherSchema = baseSchema.extend({
  paymentMethod: z.enum(['NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER']),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  expirationDate: z.string().optional(),
  cvv: z.string().optional(),
});

const checkoutSchema = z.discriminatedUnion('paymentMethod', [cardSchema, otherSchema]);

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutProps {
  product: Product | null;
}

export const Checkout: React.FC<CheckoutProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { step, customerData, deliveryData, paymentMethod, paymentStatus, transactionId } = useSelector((state: RootState) => state.checkout);
  
  const createTransactionMutation = useCreateTransaction();
  const processPaymentMutation = useProcessPayment();

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isValid } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      fullName: customerData?.fullName || '',
      email: customerData?.email || '',
      phoneNumber: (customerData?.phoneNumber || '').replace(/^\+57/, ''),
      address: deliveryData?.address || '',
      city: deliveryData?.city || '',
      state: deliveryData?.state || '',
      zipCode: deliveryData?.zipCode || '',
      country: deliveryData?.country || 'Colombia',
      paymentMethod: paymentMethod || 'CARD',
    }
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const paymentMethodSelected = watch('paymentMethod');
  const expirationDateValue = watch('expirationDate');

  useEffect(() => {
    if (expirationDateValue && expirationDateValue.length === 2 && !expirationDateValue.includes('/')) {
      setValue('expirationDate', expirationDateValue + '/');
    }
  }, [expirationDateValue, setValue]);

  const cardNumber = watch('cardNumber');
  const getCardLogo = (number: string | undefined) => {
    if (!number) return null;
    if (number.startsWith('4')) return 'VISA';
    if (number.match(/^5[1-5]/)) return 'MASTERCARD';
    return null;
  };

  const onSubmitStep2 = async (data: CheckoutFormData) => {
    if (!product) return;
    setApiError(null);
    
    try {
      const transaction = await createTransactionMutation.mutateAsync({
        productId: product.id,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: `+57${data.phoneNumber}`,
        deliveryAddress: data.address,
        deliveryCity: data.city,
        deliveryState: data.state,
        deliveryCountry: data.country || 'Colombia',
        deliveryPostalCode: data.zipCode || '00000',
        baseFee: 5.00,
        deliveryFee: 10.00,
        currency: "COP",
        paymentMethod: "CARD"
      });

      dispatch(setTransactionId(transaction.id));
      dispatch(setCustomerData({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: `+57${data.phoneNumber}`
      }));
      dispatch(setDeliveryData({
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || '00000',
        country: data.country || 'Colombia'
      }));
      dispatch(setStep(3));
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      setApiError(error.message || 'Failed to create transaction. Please try again.');
    }
  };

  const processPaymentFlow = async (formData: any) => {
    if (!product || !transactionId) {
      setApiError('Missing product or transaction data.');
      return;
    }
    
    dispatch(setPaymentStatus('PROCESSING'));
    dispatch(setStep(4));

    try {
      const expirationDate = formData.expirationDate || '';
      const [expiryMonth, expiryYear] = expirationDate.includes('/') ? expirationDate.split('/') : ['', ''];
      
      const payload: any = {
        transactionId: String(transactionId),
        cardNumber: String(formData.cardNumber || ''),
        cardHolder: String(formData.cardHolder || ''),
        expiryMonth: String(expiryMonth),
        expiryYear: String(expiryYear ? `20${expiryYear}` : ''),
        cvv: String(formData.cvv || ''),
        customerEmail: String(formData.email || '')
      };

      const paymentResponse = await processPaymentMutation.mutateAsync(payload);

      if (paymentResponse.status === 'APPROVED' || paymentResponse.status === 'PENDING') {
        dispatch(setPaymentStatus(paymentResponse.status));
        // Stock is invalidated in useProcessPayment hook onSuccess
      } else {
        dispatch(setPaymentStatus('DECLINED'));
      }
      dispatch(setStep(5));
    } catch (error: any) {
      console.error('Payment error:', error);
      setApiError(error.message || 'Payment processing failed. Please check your card details.');
      dispatch(setPaymentStatus('ERROR'));
      dispatch(setStep(5));
    }
  };

  const handleConfirmPayment = () => {
    if (!transactionId) {
      setApiError('Missing transaction ID. Please go back and try again.');
      return;
    }
    const data = getValues();
    processPaymentFlow(data);
  };

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <XCircle className="w-16 h-16 text-red-500 opacity-20" />
      <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Cart Deployment Failed</h3>
      <p className="text-slate-400 max-w-xs text-sm">Your tactical payload is empty. Please return to the catalog to select your gear.</p>
      <button 
        onClick={() => dispatch(setStep(1))}
        className="mt-4 px-8 py-3 bg-primary text-background-dark font-black rounded-xl hover:bg-primary/90 transition-all"
      >
        RETURN TO ARMORY
      </button>
    </div>
  );

  const baseFee = 5000; // Fixed as 5k pesos
  const deliveryFee = 15000; // Fixed as 15k pesos
  const totalAmount = product.price + baseFee + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* ProgressBar */}
      <div className="flex justify-between mb-8 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 min-w-[60px] md:min-w-[80px]">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs border ${
              step === s ? 'bg-primary text-background-dark border-primary shadow-[0_0_10px_rgba(56,255,20,0.3)]' : 
              step > s ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-slate-500 border-white/10'
            }`}>
              {s}
            </div>
            <span className={`text-[8px] md:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap ${step === s ? 'text-primary' : 'text-slate-500'}`}>
              {s === 1 ? 'Catalog' : s === 2 ? 'Details' : s === 3 ? 'Review' : s === 4 ? 'Processing' : 'Status'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 2 && (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit(onSubmitStep2)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <UserIcon className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Customer Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <input 
                      {...register('fullName')} 
                      placeholder="Full Name" 
                      className={`w-full bg-background-dark border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <input 
                      {...register('email')} 
                      placeholder="Email Address" 
                      className={`w-full bg-background-dark border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <div className="w-20 bg-background-dark border border-white/10 rounded-lg px-3 py-3 text-slate-400 text-sm flex items-center justify-center font-bold">
                        +57
                      </div>
                      <input 
                        {...register('phoneNumber')} 
                        placeholder="300 123 4567" 
                        inputMode="numeric"
                        maxLength={10}
                        className={`w-full bg-background-dark border ${errors.phoneNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') e.preventDefault();
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest pl-1 font-bold">Colombia Prefix Included</p>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Shipping Details</h3>
                </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input 
                      {...register('address')} 
                      placeholder="Shipping Address" 
                      className={`w-full bg-background-dark border ${errors.address ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <input 
                      {...register('city')} 
                      placeholder="City" 
                      className={`w-full bg-background-dark border ${errors.city ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <input 
                      {...register('state')} 
                      placeholder="State" 
                      className={`w-full bg-background-dark border ${errors.state ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Payment Method</h3>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { id: 'CARD', label: 'Card', icon: <CreditCard className="w-4 h-4" />, available: true },
                    { id: 'NEQUI', label: 'Nequi', icon: <Smartphone className="w-4 h-4" />, available: false },
                    { id: 'PSE', label: 'PSE', icon: <Landmark className="w-4 h-4" />, available: false },
                    { id: 'BANCOLOMBIA_TRANSFER', label: 'Transfer', icon: <Package className="w-4 h-4" />, available: false },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => method.available && dispatch(setPaymentMethod(method.id as any))}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border font-bold text-xs whitespace-nowrap transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(56,255,20,0.2)]' 
                          : !method.available 
                            ? 'bg-white/5 border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                            : 'bg-background-dark border-white/10 text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {method.icon}
                        {method.label}
                      </div>
                      {!method.available && <span className="text-[8px] opacity-70 uppercase">Coming Soon</span>}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'CARD' ? (
                  <>
                    <div className="relative">
                      <input 
                        {...register('cardNumber')} 
                        placeholder="Card Number (16 digits)" 
                        inputMode="numeric"
                        maxLength={16}
                        className={`w-full bg-background-dark border ${errors.cardNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') e.preventDefault();
                        }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6">
                        {getCardLogo(cardNumber) === 'VISA' && <span className="text-blue-500 font-bold italic">VISA</span>}
                        {getCardLogo(cardNumber) === 'MASTERCARD' && <span className="text-orange-500 font-bold">MC</span>}
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                    </div>
                    <div>
                      <input 
                        {...register('cardHolder')} 
                        placeholder="Card Holder Name" 
                        className={`w-full bg-background-dark border ${errors.cardHolder ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                      />
                      {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input 
                          {...register('expirationDate')} 
                          placeholder="MM/YY" 
                          maxLength={5}
                          className={`w-full bg-background-dark border ${errors.expirationDate ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                        />
                        {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>}
                      </div>
                      <div>
                        <input 
                          {...register('cvv')} 
                          placeholder="CVV" 
                          inputMode="numeric"
                          maxLength={4}
                          className={`w-full bg-background-dark border ${errors.cvv ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`}
                          onKeyDown={(e) => {
                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') e.preventDefault();
                          }}
                        />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 bg-background-dark/50 border border-white/5 rounded-xl text-center space-y-4 animate-in fade-in zoom-in-95">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      {paymentMethod === 'NEQUI' && <Smartphone className="w-6 h-6" />}
                      {paymentMethod === 'PSE' && <Landmark className="w-6 h-6" />}
                      {paymentMethod === 'BANCOLOMBIA_TRANSFER' && <Package className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 uppercase tracking-widest text-xs">{paymentMethod?.replace('_', ' ')} SELECTED</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">You will be redirected to the secure gateway to complete your payment.</p>
                    </div>
                  </div>
                )}
              </section>
              
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-red-500 text-[10px] uppercase font-black tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Attention: Required Fields Missing
                  </p>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-slate-400 text-[10px] flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-500/50 rounded-full"></span>
                        {error?.message as string}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {paymentMethod !== 'CARD' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <p className="text-amber-500 text-[10px] uppercase font-black tracking-tight">Currently Unavailable</p>
                  <p className="text-slate-400 text-[10px] mt-1">Only Credit Card payments are supported in this sandbox environment.</p>
                </div>
              )}
              
              {apiError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-500 text-[10px] uppercase font-black tracking-tight">{apiError}</p>
                </div>
              )}

              <button 
                type="button"
                onClick={handleSubmit(onSubmitStep2)}
                disabled={!isValid || paymentMethod !== 'CARD' || createTransactionMutation.isPending}
                className={`w-full ${!isValid || paymentMethod !== 'CARD' ? 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale' : 'bg-primary text-background-dark hover:scale-[1.02] shadow-[0_0_30px_rgba(56,255,20,0.15)]'} font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all`}
              >
                {createTransactionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>REVIEW SUMMARY</span>
                    <Lock className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Secure checkout powered by</span>
                  <span className="text-primary">Wompi</span>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => {
                  dispatch(setStep(1));
                  window.scrollTo(0, 0);
                }}
                className="w-full border border-white/10 text-slate-400 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>RETURN TO STORE</span>
              </button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background-dark/95 backdrop-blur-xl"
          >
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-8 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
               
               <div className="text-center space-y-2">
                 <h2 className="text-2xl font-black text-slate-100 tracking-tight">PAYMENT SUMMARY</h2>
                 <p className="text-slate-400 text-sm">Please review your order details before processing</p>
               </div>

               <div className="space-y-4">
                 <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-primary overflow-hidden">
                        <img src={getProductImage(product.name)} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-slate-100 font-bold">{product.name}</p>
                        <p className="text-slate-500 text-xs">Quantity: 1</p>
                      </div>
                    </div>
                    <p className="text-slate-100 font-bold">${product.price.toLocaleString('es-CO')}</p>
                 </div>

                 <div className="space-y-2 px-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Base Price</span>
                      <span className="text-slate-100">${product.price.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fixed Platform Fee</span>
                      <span className="text-slate-100">${baseFee.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Shipping Cost</span>
                      <span className="text-slate-100">${deliveryFee.toLocaleString('es-CO')}</span>
                    </div>
                 </div>

                 <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-6 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-primary tracking-widest uppercase">Total to Pay</p>
                      <p className="text-3xl font-black text-slate-100">${totalAmount.toLocaleString('es-CO')} <span className="text-xs text-primary ml-1">COP</span></p>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-primary opacity-50" />
                 </div>
               </div>

               {apiError && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                   <p className="text-red-500 text-[10px] uppercase font-black tracking-tight text-center">{apiError}</p>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => dispatch(setStep(2))}
                   className="py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-all"
                 >
                   GO BACK
                 </button>
                  <button 
                    onClick={handleConfirmPayment}
                    disabled={paymentStatus === 'PROCESSING'}
                    className={`py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${paymentStatus === 'PROCESSING' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary text-background-dark hover:scale-[1.02] shadow-[0_0_30px_rgba(56,255,20,0.2)]'}`}
                  >
                    {paymentStatus === 'PROCESSING' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <span>CONFIRM & PAY</span>
                    )}
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background-dark/95 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <Loader2 className="w-20 h-20 animate-spin text-primary relative z-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-100 uppercase tracking-widest">Processing Payment</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Secure Gateway Connection Established</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background-dark/95 backdrop-blur-xl"
          >
            <div className={`bg-slate-900 border ${paymentStatus === 'APPROVED' ? 'border-primary/30 shadow-[0_0_50px_rgba(56,255,20,0.1)]' : 'border-red-500/30'} rounded-3xl w-full max-w-lg p-10 space-y-8 relative overflow-hidden text-center`}>
               <div className={`absolute top-0 left-0 w-full h-1.5 ${paymentStatus === 'APPROVED' ? 'bg-primary' : 'bg-red-500'}`}></div>
               
               <div className="flex flex-col items-center gap-6">
                 {['APPROVED', 'PENDING'].includes(paymentStatus) ? (
                   <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-[0_0_30px_rgba(56,255,20,0.3)] animate-in zoom-in-50 duration-500">
                     <CheckCircle2 className="w-12 h-12" />
                   </div>
                 ) : (
                   <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-in zoom-in-50 duration-500">
                     <XCircle className="w-12 h-12" />
                   </div>
                 )}
                 
                 <div className="space-y-2">
                   <h2 className={`text-4xl font-black tracking-tight text-slate-100`}>
                     {['APPROVED', 'PENDING'].includes(paymentStatus) ? 'PAYMENT SUCCESSFUL' : 'PAYMENT DECLINED'}
                   </h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                     {paymentStatus === 'APPROVED' ? 'Your order has been confirmed' : 
                      paymentStatus === 'PENDING' ? 'Your payment is being processed' :
                      'Something went wrong with your transaction'}
                   </p>
                 </div>
               </div>

               {['APPROVED', 'PENDING'].includes(paymentStatus) && (
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="text-slate-100 font-bold text-xs">#{transactionId?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                      <span className="text-slate-400">Total Paid:</span>
                      <span className="text-primary font-black text-xl font-mono">${totalAmount.toLocaleString('es-CO')}</span>
                    </div>
                 </div>
               )}

               {paymentStatus === 'DECLINED' && (
                 <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                   <p className="text-red-500 text-xs font-bold leading-relaxed">
                     Please verify your card details, ensure you have sufficient funds, or try a different payment method.
                   </p>
                 </div>
               )}

               <button 
                 onClick={() => {
                   dispatch(setStep(1));
                   window.scrollTo(0, 0);
                 }}
                 className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${
                   paymentStatus === 'APPROVED' 
                     ? 'bg-primary text-background-dark hover:scale-[1.02] shadow-[0_0_30px_rgba(56,255,20,0.2)]' 
                     : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                 }`}
               >
                 {paymentStatus === 'APPROVED' ? 'CONTINUE SHOPPING' : 'TRY AGAIN'}
                 <ChevronLeft className="w-5 h-5 rotate-180" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
