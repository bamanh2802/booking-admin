// Application configuration constants
export const APP_CONFIG = {
  name: "Booking Car Admin",
  version: "1.0.0",
  description: "Hệ thống quản trị đặt vé xe khách",
  author: "Booking Car Team",
} as const;

// API configuration 
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/v1",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
} as const;

// UI configuration
export const UI_CONFIG = {
  theme: {
    defaultMode: "light" as const,
    availableModes: ["light", "dark"] as const,
  },
  layout: {
    sidebarWidth: 280,
    headerHeight: 64,
  },
  animations: {
    duration: 200,
    easing: "ease-in-out",
  },
} as const;

// Feature flags
export const FEATURES = {
  userManagement: true,
  ticketManagement: false, // Coming soon
  routeManagement: false,  // Coming soon
  analytics: false,        // Coming soon
  notifications: false,    // Coming soon
} as const;
