import { baseApi } from '../../shared/store/api.js';

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
      invalidatesTags: ['Attendance'],
    }),
    punchOut: builder.mutation({
      query: () => ({
        url: '/bdm/attendance/punch-out',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyAttendanceHistory: builder.query({
      query: (params = {}) => ({
        url: '/bdm/attendance/my-history',
        params,
      }),
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceHistoryQuery,
} = attendanceApi;

export default attendanceApi;
