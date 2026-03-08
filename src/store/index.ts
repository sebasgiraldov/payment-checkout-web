import { configureStore, combineReducers } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import checkoutReducer from './slices/checkoutSlice';

// Persistence logic
const PERSIST_KEY = 'techstore_checkout_state';

const rootReducer = combineReducers({
  products: productReducer,
  checkout: checkoutReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(PERSIST_KEY);
    if (serializedState === null) return undefined;
    const state = JSON.parse(serializedState);
    if (!state.checkout || typeof state.checkout.step !== 'number') {
      localStorage.removeItem(PERSIST_KEY);
      return undefined;
    }
    return state;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: Partial<RootState>) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(PERSIST_KEY, serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
});

store.subscribe(() => {
  const state = store.getState();
  saveState({
    checkout: state.checkout,
  });
});

export type AppDispatch = typeof store.dispatch;
