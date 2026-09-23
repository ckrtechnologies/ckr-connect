import { baseApi } from '../../shared/store/api.js';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    markOnboardingSeen: builder.mutation({
      query: () => ({
        url: '/auth/onboarding-seen',
        method: 'PATCH',
      }),
    }),
  }),
});

export const { useLoginMutation, useMarkOnboardingSeenMutation } = authApi;
export default authApi;
