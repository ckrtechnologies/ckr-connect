import { baseApi } from '../../shared/store/baseApi.js';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getBootstrap: builder.query({
      query: () => '/bootstrap',
      providesTags: ['Bootstrap'],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useGetBootstrapQuery } = authApi;
