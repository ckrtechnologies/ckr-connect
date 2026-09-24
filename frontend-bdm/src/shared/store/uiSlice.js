import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quickAddModalOpen: false,
  wonModalLeadId: null,
  dropoffModalData: null, // { leadId, defaultStage: 'lost' | 'invalid' }
  unreadNotificationsCount: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setQuickAddModalOpen: (state, action) => {
      state.quickAddModalOpen = action.payload;
    },
    openWonModal: (state, action) => {
      state.wonModalLeadId = action.payload;
    },
    closeWonModal: (state) => {
      state.wonModalLeadId = null;
    },
    openDropoffModal: (state, action) => {
      state.dropoffModalData = action.payload;
    },
    closeDropoffModal: (state) => {
      state.dropoffModalData = null;
    },
    setUnreadNotificationsCount: (state, action) => {
      state.unreadNotificationsCount = action.payload;
    },
  },
});

export const {
  setQuickAddModalOpen,
  openWonModal,
  closeWonModal,
  openDropoffModal,
  closeDropoffModal,
  setUnreadNotificationsCount,
} = uiSlice.actions;

export default uiSlice.reducer;
