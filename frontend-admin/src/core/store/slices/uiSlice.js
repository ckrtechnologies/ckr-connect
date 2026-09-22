import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isSiteMapCollapsed: false,
    isQuickCreateOpen: false,
    activeLeadFilterTab: 'ALL',
  },
  reducers: {
    toggleSiteMap: (state) => {
      state.isSiteMapCollapsed = !state.isSiteMapCollapsed;
    },
    setSiteMapCollapsed: (state, action) => {
      state.isSiteMapCollapsed = action.payload;
    },
    setQuickCreateOpen: (state, action) => {
      state.isQuickCreateOpen = action.payload;
    },
    setActiveLeadFilterTab: (state, action) => {
      state.activeLeadFilterTab = action.payload;
    },
  },
});

export const {
  toggleSiteMap,
  setSiteMapCollapsed,
  setQuickCreateOpen,
  setActiveLeadFilterTab,
} = uiSlice.actions;

export default uiSlice.reducer;
