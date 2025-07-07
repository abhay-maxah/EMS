import { create } from "zustand";
import axiosInstance from "../lib/axios";

// Utility functions
const LOCAL_STORAGE_KEY = "company";

const saveCompanyToLocalStorage = (company) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(company));
};

const loadCompanyFromLocalStorage = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

const clearCompanyFromLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

const useCompanyStore = create((set) => {
  // Load initial company from localStorage
  const initialCompany = loadCompanyFromLocalStorage();

  return {
    company: initialCompany,
    isCompanyPresent: !!initialCompany,
    loading: false,

    // ✅ Create Company
    createCompany: async (companyData) => {
      try {
        set({ loading: true });
        const res = await axiosInstance.post("/company", companyData);
        saveCompanyToLocalStorage(res.data);
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
        saveCompanyToLocalStorage(res.data.company);
        set({ company: res.data.company, isCompanyPresent: true });
        return res.data.company;
      } catch (error) {
        console.error("Error fetching company:", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    // ✅ Update Company
    updateCompany: async (companyId, updateData) => {
      try {
        set({ loading: true });
        const res = await axiosInstance.patch(`/company/${companyId}`, updateData);
        saveCompanyToLocalStorage(res.data);
        set({ company: res.data, isCompanyPresent: true });
        return res.data;
      } catch (error) {
        console.error("Error updating company:", error);
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    // ✅ Reset Company State
    resetCompanyState: () => {
      clearCompanyFromLocalStorage();
      set({ company: null, isCompanyPresent: false });
    },
  };
});

export default useCompanyStore;
