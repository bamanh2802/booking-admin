import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for UI state
type Theme = "light" | "dark" | "system";

interface UIState {
  // Theme
  theme: Theme;

  // Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals & overlays
  modals: {
    [key: string]: boolean;
  };

  // Loading states
  globalLoading: boolean;

  // Notifications
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description?: string;
    duration?: number;
  }>;
}

interface UIActions {
  // Theme actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Sidebar actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;

  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean) => void;

  // Notification actions
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      sidebarOpen: true,
      sidebarCollapsed: false,
      modals: {},
      globalLoading: false,
      notifications: [],

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme to document
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme =
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        get().setTheme(newTheme);
      },

      // Sidebar actions
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Modal actions
      openModal: (modalId: string) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        }));
      },

      closeModal: (modalId: string) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        }));
      },

      toggleModal: (modalId: string) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: !state.modals[modalId],
          },
        }));
      },

      closeAllModals: () => {
        set({ modals: {} });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = { id, ...notification };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || 5000);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "ui-storage",
      // Only persist theme and layout preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

export type { UIStore };
