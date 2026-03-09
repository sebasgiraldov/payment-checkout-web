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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryCountry: string;
  deliveryPostalCode: string;
  baseFee: number;
  deliveryFee: number;
  currency: string;
  paymentMethod: string;
}

export interface TransactionResponse {
  id: string;
  status: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  customerEmail: string;
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
