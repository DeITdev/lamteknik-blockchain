import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Akreditasi, StatusAkreditasi, DashboardStats } from '@/types';

// ============================================================
// AUTH STORE
// ============================================================
interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  setTenant: (tenantId: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tenantId: null,
      isAuthenticated: false,
      loading: false,
      setAuth: (user, token) => {
        set({ user, token, tenantId: user.tenantId, isAuthenticated: true, loading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('tenantId', user.tenantId);
        }
      },
      setTenant: (tenantId) => {
        set({ tenantId });
        if (typeof window !== 'undefined') {
          localStorage.setItem('tenantId', tenantId);
        }
      },
      logout: () => {
        set({ user: null, token: null, tenantId: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('tenantId');
        }
      },
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clearUnread: () => set({ unreadCount: 0 }),
}));

// ============================================================
// AKREDITASI STORE - Track current akreditasi & workflow
// ============================================================
interface AkreditasiState {
  current: Akreditasi | null;
  list: Akreditasi[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;
  setCurrent: (akreditasi: Akreditasi) => void;
  setList: (list: Akreditasi[]) => void;
  setSelectedId: (id: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateStatus: (status: StatusAkreditasi) => void;
  clear: () => void;
}

export const useAkreditasiStore = create<AkreditasiState>((set) => ({
  current: null,
  list: [],
  selectedId: null,
  loading: false,
  error: null,
  setCurrent: (akreditasi) => set({ current: akreditasi, selectedId: akreditasi.id }),
  setList: (list) => set({ list }),
  setSelectedId: (id) => set({ selectedId: id }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateStatus: (status) =>
    set((state) => ({
      current: state.current ? { ...state.current, status } : null,
    })),
  clear: () => set({ current: null, selectedId: null, error: null }),
}));

// ============================================================
// DASHBOARD STORE - Track dashboard stats & filters
// ============================================================
interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: StatusAkreditasi;
    tipe?: string;
    periode?: string;
    institusiId?: number;
  };
  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: DashboardState['filters']) => void;
  clearFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  error: null,
  filters: {},
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
}));

// ============================================================
// UI STATE STORE - Track UI states like modals, dialogs
// ============================================================
interface UIState {
  modals: {
    [key: string]: boolean;
  };
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  toggleModal: (name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},
  openModal: (name) =>
    set((state) => ({
      modals: { ...state.modals, [name]: true },
    })),
  closeModal: (name) =>
    set((state) => ({
      modals: { ...state.modals, [name]: false },
    })),
  toggleModal: (name) =>
    set((state) => ({
      modals: { ...state.modals, [name]: !state.modals[name] },
    })),
}));
