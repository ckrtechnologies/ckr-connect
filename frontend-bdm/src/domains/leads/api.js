import { baseApi } from '../../shared/store/baseApi.js';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLeads: builder.query({
      query: (params = {}) => ({
        url: '/bdm/leads',
        params,
      }),
      providesTags: ['Leads'],
    }),
    getLeadDetail: builder.query({
      query: (id) => `/bdm/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    createBdmLead: builder.mutation({
      query: (body) => ({
        url: '/bdm/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status, remarks, lost_reason, invalid_reason, won_amount }) => ({
        url: `/bdm/leads/${id}/status`,
        method: 'PATCH',
        body: { status, remarks, lost_reason, invalid_reason, won_amount },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Leads',
        'Dashboard',
        { type: 'Lead', id },
      ],
    }),
    uploadBrd: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/bdm/leads/${id}/upload-brd`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }],
    }),
    logInteraction: builder.mutation({
      query: (body) => ({
        url: '/bdm/interactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { lead_id }) => [
        'Interactions',
        'Dashboard',
        'Leads',
        { type: 'Lead', id: lead_id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyLeadsQuery,
  useGetLeadDetailQuery,
  useCreateBdmLeadMutation,
  useUpdateLeadStatusMutation,
  useUploadBrdMutation,
  useLogInteractionMutation,
} = leadsApi;
