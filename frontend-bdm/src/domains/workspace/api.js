import { baseApi } from '../../shared/store/baseApi.js';

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBdmDashboard: builder.query({
      query: () => '/bdm/workspace/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBdmDashboardQuery } = workspaceApi;
