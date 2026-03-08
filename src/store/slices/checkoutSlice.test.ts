import checkoutReducer, { setStep, setPaymentStatus } from './checkoutSlice';

describe('checkout slice', () => {
  const initialState = {
    step: 1,
    customerData: null,
    deliveryData: null,
    paymentMethod: 'CARD',
    transactionId: null,
    paymentStatus: 'IDLE',
  };

  it('should handle initial state', () => {
    expect(checkoutReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setStep', () => {
    const actual = checkoutReducer(initialState, setStep(2));
    expect(actual.step).toEqual(2);
  });

  it('should handle setPaymentStatus', () => {
    const actual = checkoutReducer(initialState, setPaymentStatus('PROCESSING'));
    expect(actual.paymentStatus).toEqual('PROCESSING');
  });
});
