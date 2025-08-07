import { create } from "zustand";
import axiosInstance from "../lib/axios";
import useCompanyStore from './useCompanyStore'
const useUserStore = create((set,get) => ({
  user: null,
  userInfo: null,
  loading: false,
  addUser: async ({ username, email, team, password, role, companyId, createdById }) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/add-user", {
        username,
        email,
        password,
        role,
        team,
        companyId,
        createdById,
      });
      return { success: true, data: res.data.user };
    } catch (err) {
      set({ loading: false });

      const errorMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(", ")
        : err?.response?.data?.message || "Registration failed";

      console.log("Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  loginUser: async ({ credential, password }) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/auth/login", {
        credential,
        password,
      });

      await get().fetchCurrentUser();

      set({ loading: false });
      return { success: true, data: res.data.user };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err?.response?.data?.message || "Login failed",
      };
    }
  },
  
  updateUserInfo: async (userId, updateData) => {
    set({ loading: true });

    try {
      await axiosInstance.patch(`/user/${userId}`, updateData);

      const currentUserId = get().user?.id;

      if (userId === currentUserId) {
        const prev = get();

        set({
          user: {
            ...prev.user,
            team: updateData.team ?? prev.user.team,
            subteam: updateData.subteam ?? prev.user.subteam,
            totalLeaveDays: updateData.totalLeaveDays ?? prev.user.totalLeaveDays,
          },
          userInfo: updateData.userInfo
            ? {
              ...prev.userInfo,
              ...updateData.userInfo,
            }
            : prev.userInfo,
        });
      }

      set({ loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });

      const errorMessage =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : Array.isArray(err?.response?.data?.message)
            ? err.response.data.message[0]
            : "Failed to update user info";

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  
  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/user/me", {
        withCredentials: true,
      });

      const userData = res.data?.data; 
      set({
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          team: userData.team,
          subteam: userData.subteam,
          userName: userData.userName,
          companyId: userData.companyId,
          totalLeaveDays: userData.totalLeaveDays,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        userInfo: userData.userInfo ?? null,
        loading: false,
      });

      return { success: true, data: userData };
    } catch (err) {
      set({ loading: false });
      console.error("Failed to fetch user:", err);
      return {
        success: false,
        error: "Unable to fetch user",
      };
    }
  },
  logoutUser: async () => {
    try {
      await axiosInstance.get("/auth/logout", { withCredentials: true });
      set({ user: null, userInfo: null, team: null });
      useCompanyStore.getState().resetCompanyState();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  },
  getAllUsers: async () => {
    try {
      const res = await axiosInstance.get('/user');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return [];
    }
  },
  deleteUser: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/user/${userId}`);

      if (res.status === 204) {
        return { success: true };
      }
      return res.data;
    } catch (err) {
      console.error("Failed to delete user:", err);
      return { success: false, message: err.response?.data?.message || "Something went wrong" };
    }
  },
}));

export default useUserStore;