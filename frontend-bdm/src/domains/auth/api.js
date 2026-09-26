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
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: '/auth/upload-avatar',
        method: 'POST',
        body: formData,
        // FetchBaseQuery automatically removes Content-Type when body is FormData
      }),
      // We might want to invalidate Bootstrap or something to refresh user data,
      // but typically we can just update the auth slice manually.
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useGetBootstrapQuery, useUploadAvatarMutation } = authApi;
