import { create } from 'zustand';
import axiosInstance from '../lib/axios';

const useReportStore = create((set, get) => ({
  reports: [],

  // Clock In
  addReport: async () => {
    try {
      const response = await axiosInstance.post('/reports');

      const newReport = response.data;
      set((state) => ({
        reports: [...state.reports, newReport],
      }));

      return newReport;
    } catch (error) {
      console.error('Error adding report:', error.response?.data || error.message);
      throw error;
    }
  },

  // Clock Out (PATCH with userId in body)
  updateReport: async (totalWorkingHours, note) => {
    try {
      const response = await axiosInstance.patch('/reports', {
        totalWorkingHours,
        note,
      });

      const updatedReport = response.data;

      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === updatedReport.id ? updatedReport : r
        ),
      }));
      return updatedReport;
    } catch (error) {
      console.error(
        'Error updating report:',
        error.response?.data || error.message
      );
      throw error;
    }  
  },
  // ✅ GET: Fetch all reports for a user
  fetchUserReports: async (userId, page = 1, dateRange = 'all') => {
    try {
      const response = await axiosInstance.get(`/reports/${userId}`, {
        params: {
          page,
          dateRange,
        },
      });

      const { data, totalPages, currentPage, email } = response.data;

      set(() => ({
        reports: data,
      }));

      return { data, totalPages, currentPage, email };
    } catch (error) {
      console.error('Error fetching user reports:', error.response?.data || error.message);
      throw error;
    }
  },
  
 
  // 🔹 ✅ Fetch all reports for admin
  fetchAllReports: async ({ page = 1, name = '', dateRange = 'all' }) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get('/reports', {
        params: { page, limit: 10, name, dateRange },
      });
      return res.data;
    } catch (err) {
      console.error('Fetch all reports error:', err.response?.data || err.message);
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useReportStore;
