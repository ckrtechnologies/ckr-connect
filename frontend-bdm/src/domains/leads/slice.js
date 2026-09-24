import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  urgencyFilter: 'all', // 'all' | 'overdue' | 'today' | 'won'
  stageFilter: 'all',   // 'all' | 'NEW' | 'FOLLOW_UP' | 'PROPOSAL' | 'CONTACTED' | 'WON'
};

export const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setUrgencyFilter: (state, action) => {
      state.urgencyFilter = action.payload;
    },
    setStageFilter: (state, action) => {
      state.stageFilter = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.urgencyFilter = 'all';
      state.stageFilter = 'all';
    },
  },
});

export const {
  setSearchQuery,
  setUrgencyFilter,
  setStageFilter,
  resetFilters,
} = leadsSlice.actions;

export default leadsSlice.reducer;
