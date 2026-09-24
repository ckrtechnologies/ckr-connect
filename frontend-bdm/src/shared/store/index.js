import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi.js';
import authReducer from '../../domains/auth/slice.js';
import leadsReducer from '../../domains/leads/slice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    leads: leadsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});
