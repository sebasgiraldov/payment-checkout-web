import '@testing-library/jest-dom';

// Mock import.meta.env for Jest
(global as any).import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'https://payment-checkout-api-staging.up.railway.app/api/v1',
    },
  },
};
