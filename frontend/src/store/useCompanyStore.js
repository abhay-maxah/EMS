import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useCompanyStore = create((set) => ({
  company: null,
  isCompanyPresent: false,
  loading: false,

  // ✅ Create Company
  createCompany: async (companyData) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/company", companyData);
      set({ company: res.data, isCompanyPresent: true });
      return res.data;
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Get Company by ID
  getCompanyById: async (companyId) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get(`/company/${companyId}`);
      set({ company: res.data.company, isCompanyPresent: true });
      return res.data.company;
    } catch (error) {
      console.error("Error fetching company:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  resetCompanyState: () => set({ company: null, isCompanyPresent: false }),
  // ✅ Update  Company by ID
  updateCompany: async (companyId, updateData) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.patch(`/company/${companyId}`, updateData);
      set({ company: res.data, isCompanyPresent: true });
      return res.data;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCompanyStore;
