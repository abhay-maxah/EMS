import { create } from 'zustand';
import axiosInstance from '../lib/axios';

const useTeamStatus = create((set) => ({
  team: null,
  loading: false,
  error: null,

  fetchTeam: async ({ team = '', subTeam = '' } = {}) => {
    set({ loading: true, error: null });

    const params = {};
    if (team) params.team = team;
    if (subTeam) params.subTeam = subTeam;

    try {
      const res = await axiosInstance.get('/attendance', { params });

      set({ team: res.data, loading: false });
    } catch (err) {
      console.error('Fetch Error:', err);
      set({
        error: err?.response?.data?.message || 'Failed to fetch team',
        loading: false,
      });
    }
  },
}));

export default useTeamStatus;
