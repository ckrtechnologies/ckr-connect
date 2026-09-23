import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    timeout: 30000,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Bootstrap',
    'Dashboard',
    'Leads',
    'Lead',
    'Interactions',
    'Staff',
    'Attendance',
    'Accounts',
    'Masters',
  ],
  endpoints: (builder) => ({
    // Auth & Bootstrap
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getBootstrap: builder.query({
      query: () => '/bootstrap',
      keepUnusedDataFor: 3600,
      providesTags: ['Bootstrap'],
    }),

    // Executive Dashboard
    getDashboard: builder.query({
      query: (params = {}) => ({
        url: '/admin/dashboard',
        params,
      }),
      providesTags: ['Dashboard'],
    }),

    // Leads & Opportunities
    getLeads: builder.query({
      query: (params = {}) => ({
        url: '/admin/leads',
        params,
      }),
      providesTags: ['Leads'],
    }),
    getLeadDetail: builder.query({
      query: (id) => `/admin/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    createLead: builder.mutation({
      query: (body) => ({
        url: '/admin/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads', 'Dashboard', 'Accounts'],
    }),
    importLeadsCsv: builder.mutation({
      query: (formData) => ({
        url: '/admin/leads/import-csv',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/leads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Leads', 'Dashboard', { type: 'Lead', id }],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/admin/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status, remarks, lost_reason, invalid_reason, won_amount }) => ({
        url: `/admin/leads/${id}/status`,
        method: 'PATCH',
        body: { status, remarks, lost_reason, invalid_reason, won_amount },
      }),
      invalidatesTags: (result, error, { id }) => ['Leads', 'Dashboard', { type: 'Lead', id }],
    }),
    uploadBrd: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/leads/${id}/brd`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }],
    }),
    bulkDeleteLeads: builder.mutation({
      query: (lead_ids) => ({
        url: '/admin/leads/bulk-delete',
        method: 'POST',
        body: { lead_ids },
      }),
      invalidatesTags: ['Leads'],
    }),
    bulkAssignLeads: builder.mutation({
      query: ({ lead_ids, bdm_id }) => ({
        url: '/admin/leads/bulk-assign',
        method: 'POST',
        body: { lead_ids, bdm_id },
      }),
      invalidatesTags: ['Leads', 'Dashboard', 'Staff'],
    }),
    bulkTagLeads: builder.mutation({
      query: ({ lead_ids, tags_to_add, tags_to_remove }) => ({
        url: '/admin/leads/bulk-tags',
        method: 'POST',
        body: { lead_ids, tags_to_add, tags_to_remove },
      }),
      invalidatesTags: ['Leads'],
    }),
    importCsv: builder.mutation({
      query: (formData) => ({
        url: '/admin/leads/import-csv',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    addInteraction: builder.mutation({
      query: (body) => ({
        url: '/admin/interactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { lead_id }) => [
        'Interactions',
        'Dashboard',
        { type: 'Lead', id: lead_id },
      ],
    }),

    // Staff Roster
    getStaff: builder.query({
      query: (params = {}) => ({
        url: '/admin/staff',
        params,
      }),
      providesTags: ['Staff'],
    }),
    getStaffById: builder.query({
      query: (id) => ({
        url: `/admin/staff/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),
    createStaff: builder.mutation({
      query: (body) => ({
        url: '/admin/staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Staff', 'Bootstrap'],
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/staff/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Staff', 'Bootstrap'],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/admin/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff', 'Bootstrap', 'Leads', 'Dashboard'],
    }),
    resetStaffPassword: builder.mutation({
      query: (id) => ({
        url: `/admin/staff/${id}/reset-password`,
        method: 'POST',
      }),
    }),

    // Attendance Matrix & Audit
    getAttendanceMatrix: builder.query({
      query: (params = {}) => ({
        url: '/admin/attendance/matrix',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    correctAttendance: builder.mutation({
      query: (body) => ({
        url: '/admin/attendance/correct',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),

    // Interaction Reports & Ledger
    getInteractions: builder.query({
      query: (params = {}) => ({
        url: '/admin/interactions',
        params,
      }),
      providesTags: ['Interactions'],
    }),
    getDailySummary: builder.query({
      query: (params = {}) => ({
        url: '/admin/interactions/daily-summary',
        params,
      }),
      providesTags: ['Interactions'],
    }),

    // Accounts Directory
    getAccounts: builder.query({
      query: (params = {}) => ({
        url: '/admin/accounts',
        params,
      }),
      providesTags: ['Accounts'],
    }),
    getAccountDetail: builder.query({
      query: (id) => `/admin/accounts/${id}`,
      providesTags: ['Accounts'],
    }),

    // Masters (Tags & Holidays)
    getTags: builder.query({
      query: () => '/admin/masters/tags',
      providesTags: ['Masters'],
    }),
    createTag: builder.mutation({
      query: (body) => ({
        url: '/admin/masters/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Masters', 'Bootstrap'],
    }),
    updateTag: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/masters/tags/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Masters', 'Bootstrap'],
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/admin/masters/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Masters', 'Bootstrap', 'Leads'],
    }),
    getHolidays: builder.query({
      query: (params = {}) => ({
        url: '/admin/masters/holidays',
        params,
      }),
      providesTags: ['Masters'],
    }),
    createHoliday: builder.mutation({
      query: (body) => ({
        url: '/admin/masters/holidays',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Masters', 'Bootstrap'],
    }),
    deleteHoliday: builder.mutation({
      query: (id) => ({
        url: `/admin/masters/holidays/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Masters', 'Bootstrap'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetBootstrapQuery,
  useGetDashboardQuery,
  useGetLeadsQuery,
  useGetLeadDetailQuery,
  useCreateLeadMutation,
  useImportLeadsCsvMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  useUploadBrdMutation,
  useBulkAssignLeadsMutation,
  useBulkTagLeadsMutation,
  useImportCsvMutation,
  useAddInteractionMutation,
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useResetStaffPasswordMutation,
  useGetAttendanceMatrixQuery,
  useCorrectAttendanceMutation,
  useGetInteractionsQuery,
  useGetDailySummaryQuery,
  useGetAccountsQuery,
  useGetAccountDetailQuery,
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} = apiSlice;
