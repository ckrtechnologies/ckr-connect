import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import dateReducer from './slices/dateSlice.js';
import uiReducer from './slices/uiSlice.js';
import { apiSlice } from '../api/apiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    date: dateReducer,
    ui: uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
