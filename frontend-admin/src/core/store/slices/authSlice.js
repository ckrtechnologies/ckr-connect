import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem('token') || null;
const initialUser = getInitialUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken && !!initialUser,
    isAdmin: initialUser ? ['admin', 'super_admin'].includes(String(initialUser.role || '').toLowerCase()) : false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      const normalizedUser = {
        ...user,
        full_name: user.name || user.full_name,
      };
      state.user = normalizedUser;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = ['admin', 'super_admin'].includes(String(normalizedUser.role || '').toLowerCase());

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
