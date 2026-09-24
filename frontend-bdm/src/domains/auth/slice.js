import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  isHydrated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
    },
    setOnboarded: (state, action) => {
      state.isOnboarded = action.payload;
    },
    setHydrated: (state, action) => {
      state.isHydrated = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setOnboarded, setHydrated, logout } = authSlice.actions;
export default authSlice.reducer;
