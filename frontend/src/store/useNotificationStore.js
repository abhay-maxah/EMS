import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notif) =>
    set((state) => ({
      notifications: [...state.notifications, notif],
    })),
}));

export default useNotificationStore;