import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  setAuth: (token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('isAdminLoggedIn', 'true');
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminLoggedIn');
    set({ token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
