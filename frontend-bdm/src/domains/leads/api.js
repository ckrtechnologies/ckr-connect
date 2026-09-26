import { baseApi } from '../../shared/store/baseApi.js';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLeads: builder.query({
      query: (params = {}) => ({
        url: '/bdm/leads',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return { endpointName, ...rest };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1 || !arg.page) {
          return newItems;
        }
        currentCache.items.push(...newItems.items);
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
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
      query: ({ id, status, remarks, lost_reason, invalid_reason, won_amount, next_followup_date }) => ({
        url: `/bdm/leads/${id}/status`,
        method: 'PATCH',
        body: { status, remarks, lost_reason, invalid_reason, won_amount, next_followup_date },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Leads',
        'Dashboard',
        { type: 'Lead', id },
      ],
    }),
    uploadBrd: builder.mutation({
      query: ({ id, formData, body }) => ({
        url: `/bdm/leads/${id}/upload-brd`,
        method: 'POST',
        body: formData || body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Leads'],
    }),
    deleteDocument: builder.mutation({
      query: ({ leadId, docId }) => ({
        url: `/bdm/leads/${leadId}/documents/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { leadId }) => [{ type: 'Lead', id: leadId }, 'Leads'],
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
    updateLeadDetails: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/bdm/leads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Dashboard',
        'Leads',
        { type: 'Lead', id },
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
  useDeleteDocumentMutation,
  useLogInteractionMutation,
  useUpdateLeadDetailsMutation,
} = leadsApi;
