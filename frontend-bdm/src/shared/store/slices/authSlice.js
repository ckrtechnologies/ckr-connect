import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_BDM_USER } from '../../utils/mockSeedData.js';

const initialState = {
  token: 'mock-jwt-token-aarav',
  user: INITIAL_BDM_USER,
  isAuthenticated: true,
  hasSeenOnboarding: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (user?.has_seen_onboarding !== undefined) {
        state.hasSeenOnboarding = user.has_seen_onboarding;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setOnboardingCompleted: (state) => {
      state.hasSeenOnboarding = true;
      if (state.user) {
        state.user.has_seen_onboarding = true;
      }
    },
  },
});

export const { setCredentials, logout, setOnboardingCompleted } = authSlice.actions;
export default authSlice.reducer;
