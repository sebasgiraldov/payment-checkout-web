import { Product, TransactionRequest, TransactionResponse, PaymentRequest, PaymentResponse, ApiResponse } from '../types';

// Mock import.meta.env for Jest or non-Vite environments
const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const BASE_URL = (metaEnv as any).VITE_API_BASE_URL || 'https://payment-checkout-api-staging.up.railway.app/api/v1';

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const result: ApiResponse<Product[]> = await response.json();
    return result.data;
  },

  async createTransaction(data: TransactionRequest): Promise<TransactionResponse> {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    const result: ApiResponse<TransactionResponse> = await response.json();
    return result.data;
  },

  async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${BASE_URL}/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<PaymentResponse> = await response.json();
    
    if (!response.ok) {
      const errorMessage = (result as any).message || 'Failed to process payment';
      throw new Error(errorMessage);
    }
    
    return result.data;
  },
};
