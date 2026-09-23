import { baseApi } from '../../shared/store/api.js';

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceDashboard: builder.query({
      query: () => '/bdm/workspace/dashboard',
      providesTags: ['Workspace'],
    }),
  }),
});

export const { useGetWorkspaceDashboardQuery } = workspaceApi;
export default workspaceApi;
