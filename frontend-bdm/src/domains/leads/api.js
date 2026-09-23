import { baseApi } from '../../shared/store/api.js';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLeads: builder.query({
      query: (params = {}) => ({
        url: '/bdm/leads',
        params,
      }),
      providesTags: ['Leads'],
    }),
    getMyLeadById: builder.query({
      query: (id) => `/bdm/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/bdm/leads/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Leads', 'Workspace'],
    }),
    logInteraction: builder.mutation({
      query: (body) => ({
        url: '/bdm/interactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { lead_id }) => [
        { type: 'Lead', id: lead_id },
        'Leads',
        'Interactions',
        'Workspace',
      ],
    }),
    uploadBrd: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/bdm/leads/${id}/upload-brd`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Leads'],
    }),
  }),
});

export const {
  useGetMyLeadsQuery,
  useGetMyLeadByIdQuery,
  useUpdateLeadStatusMutation,
  useLogInteractionMutation,
  useUploadBrdMutation,
} = leadsApi;

export default leadsApi;
