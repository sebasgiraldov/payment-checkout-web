import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { TransactionRequest, PaymentRequest } from '../types';

export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: (data: TransactionRequest) => api.createTransaction(data),
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentRequest) => api.processPayment(data),
    onSuccess: () => {
      // Invalidate products to refresh stock after payment
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
