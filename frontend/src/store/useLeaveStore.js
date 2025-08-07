import { create } from 'zustand';
import axiosInstance from '../lib/axios';
const useLeaveStore = create((set, get) => ({
  leaves: [],
  loading: false,
  error: null,

  fetchLeaves: async ({ page = 1, limit = 10, year = 'all' } = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get('/leaves', {
        params: { page, limit, year },
      });

      return res.data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || 'Failed to fetch leaves',
        loading: false,
      });
    }
  },
  fetchLeavesForAdmin: async (params = { page: 1, limit: 10, userName: undefined, year: 'all' }) => {
    set({ loading: true, error: null, leaves: [] });
    try {
      const res = await axiosInstance.get('/leaves/AllLeavesForAdmin', {
        params,
      });

      const { data, totalCount, totalPages, currentPage } = res.data;
      set({ loading: false });
      return { data, totalCount, totalPages, currentPage };
    } catch (err) {
      set({
        error: err?.response?.data?.message || 'Failed to fetch leaves',
        loading: false,
      });
    }
  },
  addLeave: async (leavePayload) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post('/leaves', leavePayload);
      return { success: true, data: res.data }; 
    } catch (err) {
      const resMessage = err?.response?.data?.message;
      const message = Array.isArray(resMessage)
        ? resMessage.join(', ')
        : resMessage || 'Error adding leave';

      set({ error: message, loading: false });

      return { success: false, error: message }; 
    }
  },
  fetchLeaveById: async (leaveId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/leaves/${leaveId}`);
      return res.data; // Directly return the fetched leave data
    } catch (err) {
      set({
        error: err?.response?.data?.message || 'Failed to fetch leave by ID',
        loading: false,
      });
    }
  },
  updateLeaveStatus: async (leaveId, newStatus, adminNote = '') => {
    try {
      const payload =
        newStatus === 'REJECTED'
          ? { status: newStatus, adminNote }
          : { status: newStatus };

      const res = await axiosInstance.patch(`leaves/${leaveId}`, payload);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update leave status';
    }
  },
  clearError: () => set({ error: null }),
}));

export default useLeaveStore;
