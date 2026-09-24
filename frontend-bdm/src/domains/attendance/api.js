import { baseApi } from '../../shared/store/baseApi.js';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTodayAttendance: builder.query({
      query: () => '/bdm/attendance/today',
      providesTags: ['Attendance'],
    }),
    punchIn: builder.mutation({
      query: () => ({
        url: '/bdm/attendance/punch-in',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),
    punchOut: builder.mutation({
      query: () => ({
        url: '/bdm/attendance/punch-out',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),
    getMyAttendanceHistory: builder.query({
      query: ({ year, month } = {}) => ({
        url: '/bdm/attendance/my-history',
        params: { year, month },
      }),
      providesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceHistoryQuery,
} = attendanceApi;
