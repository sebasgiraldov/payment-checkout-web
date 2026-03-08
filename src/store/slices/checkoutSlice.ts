import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

export interface CheckoutState {
  step: CheckoutStep;
  customerData: {
    email: string;
    fullName: string;
    phoneNumber: string;
  } | null;
  deliveryData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  paymentMethod: 'CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER';
  transactionId: string | null;
  paymentStatus: 'IDLE' | 'PROCESSING' | 'APPROVED' | 'DECLINED' | 'ERROR';
}

const initialState: CheckoutState = {
  step: 1,
  customerData: null,
  deliveryData: null,
  paymentMethod: 'CARD',
  transactionId: null,
  paymentStatus: 'IDLE',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setCustomerData: (state, action: PayloadAction<CheckoutState['customerData']>) => {
      state.customerData = action.payload;
    },
    setDeliveryData: (state, action: PayloadAction<CheckoutState['deliveryData']>) => {
      state.deliveryData = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<CheckoutState['paymentMethod']>) => {
      state.paymentMethod = action.payload;
    },
    setTransactionId: (state, action: PayloadAction<string>) => {
      state.transactionId = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<CheckoutState['paymentStatus']>) => {
      state.paymentStatus = action.payload;
    },
    resetCheckout: (state) => {
      state.step = 1;
      state.customerData = null;
      state.deliveryData = null;
      state.transactionId = null;
      state.paymentStatus = 'IDLE';
    },
  },
});

export const { 
  setStep, 
  setCustomerData, 
  setDeliveryData, 
  setPaymentMethod, 
  setTransactionId, 
  setPaymentStatus, 
  resetCheckout 
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
