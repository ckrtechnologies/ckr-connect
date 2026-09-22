import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
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
      // Cache reference data for 1 hour per docs/AGENTS.md §3
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
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/leads/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Leads', 'Dashboard'],
    }),
    bulkAssignLeads: builder.mutation({
      query: (body) => ({
        url: '/admin/leads/bulk-assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
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
      invalidatesTags: (result, error, arg) => [
        { type: 'Lead', id: arg.lead_id },
        'Interactions',
        'Dashboard',
      ],
    }),

    // Staff & BDMs
    getStaff: builder.query({
      query: (params = {}) => ({
        url: '/admin/staff',
        params,
      }),
      providesTags: ['Staff'],
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
      query: ({ id, ...body }) => ({
        url: `/admin/staff/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Staff', 'Bootstrap'],
    }),
    resetStaffPassword: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/staff/${id}/reset-password`,
        method: 'POST',
        body,
      }),
    }),

    // Attendance
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
      invalidatesTags: ['Attendance'],
    }),

    // Telecalling & Reports
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

    // Accounts
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

    // Masters: Tags & Holidays
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
  useUpdateLeadStatusMutation,
  useBulkAssignLeadsMutation,
  useImportCsvMutation,
  useAddInteractionMutation,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useResetStaffPasswordMutation,
  useGetAttendanceMatrixQuery,
  useCorrectAttendanceMutation,
  useGetInteractionsQuery,
  useGetDailySummaryQuery,
  useGetAccountsQuery,
  useGetAccountDetailQuery,
  useGetTagsQuery,
  useCreateTagMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
} = apiSlice;
