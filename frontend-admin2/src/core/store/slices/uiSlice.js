import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isSiteMapCollapsed: false,
    panelSide: 'right',
    protoState: 'normal',
    activeLeadFilterTab: 'ALL',
    isQuickCreateOpen: false,
  },
  reducers: {
    toggleSiteMap: (state) => {
      state.isSiteMapCollapsed = !state.isSiteMapCollapsed;
    },
    setSiteMapCollapsed: (state, action) => {
      state.isSiteMapCollapsed = action.payload;
    },
    setPanelSide: (state, action) => {
      state.panelSide = action.payload;
    },
    setProtoState: (state, action) => {
      state.protoState = action.payload;
    },
    setActiveLeadFilterTab: (state, action) => {
      state.activeLeadFilterTab = action.payload;
    },
    setQuickCreateOpen: (state, action) => {
      state.isQuickCreateOpen = action.payload;
    },
  },
});

export const {
  toggleSiteMap,
  setSiteMapCollapsed,
  setPanelSide,
  setProtoState,
  setActiveLeadFilterTab,
  setQuickCreateOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
