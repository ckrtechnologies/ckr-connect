import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ckr_connect_bdm_token';
const USER_KEY = '@ckr_connect_bdm_user';
const ONBOARDING_KEY = '@ckr_connect_bdm_onboarded';

export const storage = {
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  },
  async getUser() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async setUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch {}
  },
  async getOnboarded() {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },
  async setOnboarded(val = true) {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, val ? 'true' : 'false');
    } catch {}
  },
  async clearSession() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch {}
  },
};
