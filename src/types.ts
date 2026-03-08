export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  currency: string;
  image?: string;
}

export interface Customer {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface Delivery {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TransactionRequest {
  productId: string;
  quantity: number;
  customer: Customer;
  delivery: Delivery;
}

export interface TransactionResponse {
  id: string;
  status: string;
  productId: string;
  quantity: number;
  customer: Customer;
  delivery: Delivery;
}

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expirationDate: string; // MM/YY
  cvv: string;
  installments: number;
}

export interface PaymentRequest {
  transactionId: string;
  paymentMethod: 'CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER';
  paymentDetails: CardDetails;
}

export interface PaymentResponse {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED';
  transactionId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  correlationId: string;
}
