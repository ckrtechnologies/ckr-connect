import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  urgencyFilter: 'all',  // 'all' | 'overdue' | 'today' | 'upcoming' | 'won'
  stageFilter: 'all',    // 'all' | 'new' | 'follow_up' | 'proposal' | 'contacted' | 'won' | 'lost'
  priorityFilter: 'all', // 'all' | 'urgent' | 'high' | 'medium' | 'low'
  sortFilter: 'created_desc', // 'created_desc' | 'created_asc' | 'value_desc' | 'value_asc'
};

export const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload || '';
    },
    setUrgencyFilter: (state, action) => {
      state.urgencyFilter = (action.payload || 'all').toLowerCase().replace(/-/g, '_');
    },
    setStageFilter: (state, action) => {
      state.stageFilter = (action.payload || 'all').toLowerCase().replace(/-/g, '_');
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = (action.payload || 'all').toLowerCase();
    },
    setSortFilter: (state, action) => {
      state.sortFilter = action.payload || 'created_desc';
    },
    setAllFilters: (state, action) => {
      if (action.payload.stage !== undefined) {
        state.stageFilter = (action.payload.stage || 'all').toLowerCase().replace(/-/g, '_');
      }
      if (action.payload.urgency !== undefined) {
        state.urgencyFilter = (action.payload.urgency || 'all').toLowerCase().replace(/-/g, '_');
      }
      if (action.payload.priority !== undefined) {
        state.priorityFilter = (action.payload.priority || 'all').toLowerCase();
      }
      if (action.payload.sort !== undefined) {
        state.sortFilter = action.payload.sort || 'created_desc';
      }
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.urgencyFilter = 'all';
      state.stageFilter = 'all';
      state.priorityFilter = 'all';
      state.sortFilter = 'created_desc';
    },
  },
});

export const {
  setSearchQuery,
  setUrgencyFilter,
  setStageFilter,
  setPriorityFilter,
  setSortFilter,
  setAllFilters,
  resetFilters,
} = leadsSlice.actions;

export default leadsSlice.reducer;
