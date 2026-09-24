import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import { baseApi } from '../../shared/store/baseApi.js';
import { setUnreadNotificationsCount } from '../../shared/store/uiSlice.js';

let socket = null;

const getSocketUrl = () => {
  if (__DEV__) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:4003`;
  }
  return 'https://connect.ckrtechnologies.in';
};

export const initSocket = (token, dispatch) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    if (__DEV__) {
      console.log('[Socket.io] Connected to notification stream');
    }
  });

  socket.on('notification', (data) => {
    // Invalidate notifications cache to trigger live re-fetch
    dispatch(baseApi.util.invalidateTags(['Notifications', 'Dashboard', 'Leads']));
    if (data?.unreadCount !== undefined) {
      dispatch(setUnreadNotificationsCount(data.unreadCount));
    }
  });

  socket.on('disconnect', () => {
    if (__DEV__) {
      console.log('[Socket.io] Disconnected from stream');
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
