import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    // Android emulator routes 10.0.2.2 to host machine's localhost; iOS simulator uses localhost directly
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:4003/api/v1`;
  }
  return 'https://connect.ckrtechnologies.in/api/v1';
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    timeout: 30000,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Leads',
    'Lead',
    'Interactions',
    'Attendance',
    'Notifications',
    'Bootstrap',
  ],
  endpoints: () => ({}),
});
