import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // B-02 Workspace active sub-tab ('today' | 'funnel' | 'performance')
  workspaceTab: 'today',

  // B-05 Leads filtering state
  leadsSearchQuery: '',
  leadsFilterUrgency: 'all', // 'all' | 'overdue' | 'today' | 'won'
  leadsFilterStage: 'all',   // 'all' | 'NEW' | 'FOLLOW_UP' | 'PROPOSAL' | 'CONTACTED' | 'WON'

  // Global modals
  quickAddModalOpen: false,
  wonModalLeadId: null,
  dropoffModalData: null, // { leadId, defaultStage }

  // Attendance Punch State
  isPunchedIn: true,
  lastPunchTime: '09:28 AM',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setWorkspaceTab: (state, action) => {
      state.workspaceTab = action.payload;
    },
    setLeadsSearchQuery: (state, action) => {
      state.leadsSearchQuery = action.payload;
    },
    setLeadsFilterUrgency: (state, action) => {
      state.leadsFilterUrgency = action.payload;
    },
    setLeadsFilterStage: (state, action) => {
      state.leadsFilterStage = action.payload;
    },
    clearLeadsFilters: (state) => {
      state.leadsSearchQuery = '';
      state.leadsFilterUrgency = 'all';
      state.leadsFilterStage = 'all';
    },
    setQuickAddModalOpen: (state, action) => {
      state.quickAddModalOpen = action.payload;
    },
    setWonModalLeadId: (state, action) => {
      state.wonModalLeadId = action.payload;
    },
    setDropoffModalData: (state, action) => {
      state.dropoffModalData = action.payload;
    },
    toggleAttendancePunch: (state) => {
      state.isPunchedIn = !state.isPunchedIn;
      if (state.isPunchedIn) {
        state.lastPunchTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }
    },
  },
});

export const {
  setWorkspaceTab,
  setLeadsSearchQuery,
  setLeadsFilterUrgency,
  setLeadsFilterStage,
  clearLeadsFilters,
  setQuickAddModalOpen,
  setWonModalLeadId,
  setDropoffModalData,
  toggleAttendancePunch,
} = uiSlice.actions;

export default uiSlice.reducer;
