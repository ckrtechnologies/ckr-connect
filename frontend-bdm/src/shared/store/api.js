import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Base RTK Query API Slice
 * Endpoints are injected modularly by each business domain
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Bootstrap',
    'Workspace',
    'Leads',
    'Lead',
    'Interactions',
    'Attendance',
    'Notifications',
  ],
  endpoints: () => ({}),
});

export default baseApi;
