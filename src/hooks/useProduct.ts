import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product } from '../types';

export const useProduct = (id: string | null) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.getProducts().then(products => {
      const p = products.find(prod => prod.id === id);
      if (!p) throw new Error('Product not found');
      return p;
    }),
    enabled: !!id,
  });
};
