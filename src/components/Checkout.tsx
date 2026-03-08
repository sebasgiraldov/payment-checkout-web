import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Smartphone, Landmark, Lock, ShieldCheck, ChevronLeft, Loader2, Package, MapPin, User as UserIcon } from 'lucide-react';
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
import { CardDetails } from '../types';

const baseSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
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

export const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { step, customerData, deliveryData, paymentMethod, paymentStatus } = useSelector((state: RootState) => state.checkout);
  const { items: products } = useSelector((state: RootState) => state.products);
  
  // For this test, we assume a single product checkout as per original flow
  // In a real app we would have a cart. Here we use the first product or a placeholder.
  const product = products[0]; 

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: customerData?.fullName || '',
      email: customerData?.email || '',
      phoneNumber: customerData?.phoneNumber || '',
      address: deliveryData?.address || '',
      city: deliveryData?.city || '',
      state: deliveryData?.state || '',
      zipCode: deliveryData?.zipCode || '',
      country: deliveryData?.country || 'Colombia',
      paymentMethod: paymentMethod || 'CARD',
    }
  });

  const paymentMethodSelected = watch('paymentMethod');
  const expirationDateValue = watch('expirationDate');

  useEffect(() => {
    if (expirationDateValue && expirationDateValue.length === 2 && !expirationDateValue.includes('/')) {
      setValue('expirationDate', expirationDateValue + '/');
    }
  }, [expirationDateValue, setValue]);

  const cardNumber = watch('cardNumber');
  const getCardLogo = (number: string) => {
    if (number?.startsWith('4')) return 'VISA';
    if (number?.match(/^5[1-5]/)) return 'MASTERCARD';
    return null;
  };

  const onSubmitStep2 = (data: CheckoutFormData) => {
    dispatch(setCustomerData({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber
    }));
    dispatch(setDeliveryData({
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country
    }));
    dispatch(setStep(3));
  };

  const processPaymentFlow = async (formData: CheckoutFormData) => {
    if (!product) return;
    
    dispatch(setPaymentStatus('PROCESSING'));
    dispatch(setStep(4));

    try {
      // 1. Create Transaction
      const transaction = await api.createTransaction({
        productId: product.id,
        quantity: 1,
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        },
        delivery: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      });

      dispatch(setTransactionId(transaction.id));

      // 2. Process Payment
      const paymentResponse = await api.processPayment({
        transactionId: transaction.id,
        paymentMethod: paymentMethod,
        paymentDetails: {
          cardNumber: formData.cardNumber,
          cardHolder: formData.cardHolder,
          expirationDate: formData.expirationDate,
          cvv: formData.cvv,
          installments: 1
        }
      });

      if (paymentResponse.status === 'APPROVED') {
        dispatch(setPaymentStatus('APPROVED'));
        dispatch(updateStock({ id: product.id, quantity: 1 }));
      } else {
        dispatch(setPaymentStatus('DECLINED'));
      }
      dispatch(setStep(5));
    } catch (error) {
      console.error('Payment error:', error);
      dispatch(setPaymentStatus('ERROR'));
      dispatch(setStep(5));
    }
  };

  if (!product) return <div>No product selected</div>;

  const baseFee = 500000; // 5,000 COP in cents
  const deliveryFee = 1500000; // 15,000 COP in cents
  const totalAmount = product.price + baseFee + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* ProgressBar */}
      <div className="flex justify-between mb-8 overflow-x-auto py-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 min-w-[60px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
              step === s ? 'bg-primary text-background-dark border-primary' : 
              step > s ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-slate-500 border-white/10'
            }`}>
              {s}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${step === s ? 'text-primary' : 'text-slate-500'}`}>
              Step {s}
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
                    <input 
                      {...register('phoneNumber')} 
                      placeholder="+573001234567" 
                      className={`w-full bg-background-dark border ${errors.phoneNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-slate-100 focus:border-primary focus:outline-none transition-all`} 
                    />
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest pl-1 font-bold">Hint: 10 digit mobile number</p>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Shipping Details</h3>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input 
                      {...register('address')} 
                      placeholder="Address" 
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
                    { id: 'CARD', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'NEQUI', label: 'Nequi', icon: <Smartphone className="w-4 h-4" /> },
                    { id: 'PSE', label: 'PSE', icon: <Landmark className="w-4 h-4" /> },
                    { id: 'BANCOLOMBIA_TRANSFER', label: 'Transfer', icon: <Package className="w-4 h-4" /> },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => dispatch(setPaymentMethod(method.id as any))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs whitespace-nowrap transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(56,255,20,0.2)]' 
                          : 'bg-background-dark border-white/10 text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      {method.icon}
                      {method.label}
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
                <p className="text-red-500 text-xs text-center font-bold animate-pulse">
                  Please fix the validation errors above to proceed.
                </p>
              )}
              
              <button 
                type="submit"
                className="w-full bg-primary text-background-dark font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(56,255,20,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>REVIEW SUMMARY</span>
                <Lock className="w-4 h-4" />
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
                     <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-primary">
                       <Package className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-slate-100 font-bold">{product.name}</p>
                       <p className="text-slate-500 text-xs">Quantity: 1</p>
                     </div>
                   </div>
                   <p className="text-slate-100 font-bold">${(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                 </div>

                 <div className="space-y-2 px-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Base Price</span>
                      <span className="text-slate-100">${(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fixed Platform Fee</span>
                      <span className="text-slate-100">${(baseFee / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Shipping Cost</span>
                      <span className="text-slate-100">${(deliveryFee / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>

                 <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-6 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-primary tracking-widest uppercase">Total to Pay</p>
                      <p className="text-3xl font-black text-slate-100">${(totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-primary ml-1">COP</span></p>
                    </div>
                    <ShieldCheck className="w-10 h-10 text-primary opacity-50" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => dispatch(setStep(2))}
                   className="py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-all"
                 >
                   GO BACK
                 </button>
                 <button 
                   onClick={handleSubmit(processPaymentFlow)}
                   className="py-4 rounded-xl bg-primary text-background-dark font-black hover:scale-[1.02] shadow-[0_0_30px_rgba(56,255,20,0.2)] transition-all"
                 >
                   CONFIRM & PAY
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
