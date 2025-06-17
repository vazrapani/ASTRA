import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from '../../types/notification';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  lastChecked: null,
  isLoading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    updateLastChecked: (state) => {
      state.lastChecked = Date.now();
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastChecked = null;
    }
  }
});

export const {
  setLoading,
  setError,
  addNotification,
  markNotificationAsRead,
  markAllAsRead,
  updateLastChecked,
  setNotifications,
  clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer; 