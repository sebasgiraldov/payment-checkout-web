import checkoutReducer, { 
  setStep, 
  setCustomerData, 
  setDeliveryData, 
  setPaymentMethod, 
  setTransactionId, 
  setPaymentStatus, 
  resetCheckout,
  CheckoutState,
  CheckoutStep
} from './checkoutSlice';

describe('checkoutSlice', () => {
  const initialState: CheckoutState = {
    step: 1,
    customerData: null,
    deliveryData: null,
    paymentMethod: 'CARD',
    transactionId: null,
    paymentStatus: 'IDLE',
  };

  test('should return the initial state', () => {
    expect(checkoutReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setStep', () => {
    const steps: CheckoutStep[] = [1, 2, 3, 4, 5];
    steps.forEach(step => {
      const actual = checkoutReducer(initialState, setStep(step));
      expect(actual.step).toEqual(step);
    });
  });

  test('should handle setCustomerData', () => {
    const customerData = {
      email: 'test@example.com',
      fullName: 'John Doe',
      phoneNumber: '+573001234567'
    };
    const actual = checkoutReducer(initialState, setCustomerData(customerData));
    expect(actual.customerData).toEqual(customerData);
  });

  test('should handle setDeliveryData', () => {
    const deliveryData = {
      address: 'Calle 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110111',
      country: 'Colombia'
    };
    const actual = checkoutReducer(initialState, setDeliveryData(deliveryData));
    expect(actual.deliveryData).toEqual(deliveryData);
  });

  test('should handle setPaymentMethod', () => {
    const methods: ('CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER')[] = 
      ['CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER'];
    
    methods.forEach(method => {
      const actual = checkoutReducer(initialState, setPaymentMethod(method));
      expect(actual.paymentMethod).toEqual(method);
    });
  });

  test('should handle setTransactionId', () => {
    const transactionId = 'uuid-1234-5678';
    const actual = checkoutReducer(initialState, setTransactionId(transactionId));
    expect(actual.transactionId).toEqual(transactionId);
  });

  test('should handle setPaymentStatus', () => {
    const statuses: ('IDLE' | 'PROCESSING' | 'APPROVED' | 'PENDING' | 'DECLINED' | 'ERROR')[] = 
      ['IDLE', 'PROCESSING', 'APPROVED', 'PENDING', 'DECLINED', 'ERROR'];
    
    statuses.forEach(status => {
      const actual = checkoutReducer(initialState, setPaymentStatus(status));
      expect(actual.paymentStatus).toEqual(status);
    });
  });

  test('should handle resetCheckout', () => {
    const modifiedState: CheckoutState = {
      step: 3,
      customerData: {
        email: 'test@example.com',
        fullName: 'John Doe',
        phoneNumber: '+573001234567'
      },
      deliveryData: {
        address: 'Calle 123',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia'
      },
      paymentMethod: 'NEQUI',
      transactionId: 'uuid-1234-5678',
      paymentStatus: 'APPROVED'
    };

    const actual = checkoutReducer(modifiedState, resetCheckout());
    // Note: resetCheckout currently does NOT reset paymentMethod in the original slice logic
    expect(actual).toEqual({
      ...initialState,
      paymentMethod: 'NEQUI'
    });
  });

  test('should preserve state while updating other fields', () => {
    const customerData = {
      email: 'test@example.com',
      fullName: 'John Doe',
      phoneNumber: '+573001234567'
    };
    
    let state = checkoutReducer(initialState, setStep(2));
    state = checkoutReducer(state, setCustomerData(customerData));
    
    expect(state.step).toEqual(2);
    expect(state.customerData).toEqual(customerData);
    expect(state.paymentMethod).toEqual('CARD'); // Should stay as default
  });
});
