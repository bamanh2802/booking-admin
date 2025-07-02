import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// Extend axios config to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = 30000; 

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or auth store
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.metadata) {
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("Access forbidden:", data);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", error.config?.url);
          break;

        case 429:
          // Rate limiting
          console.error("Too many requests. Please try again later.");
          break;

        case 500:
          // Internal server error
          console.error("Internal server error:", data);
          break;

        default:
          console.error("API Error:", data);
      }

      // Return formatted error with type safety
      const errorData = data as any;
      return Promise.reject({
        status,
        message: errorData?.message || "An error occurred",
        errors: errorData?.errors || [],
        data: data,
      });
    } else if (error.request) {
      // Network error - no response received
      console.error("Network error:", error.message);
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
        errors: ["Network connectivity issue"],
      });
    } else {
      // Other error
      console.error("Request error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "Request failed",
        errors: [error.message],
      });
    }
  }
);

// Generic API methods
export class BaseAPI {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // GET request
  async get<T = any>(path = "", params?: Record<string, any>): Promise<T> {
    const response = await apiClient.get(`${this.endpoint}${path}`, { params });
    return response.data;
  }

  // POST request
  async post<T = any>(path = "", data?: any): Promise<T> {
    const response = await apiClient.post(`${this.endpoint}${path}`, data);
    return response.data;
  }

  // PUT request
  async put<T = any>(path = "", data?: any): Promise<T> {
    const response = await apiClient.put(`${this.endpoint}${path}`, data);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(path = "", data?: any): Promise<T> {
    const response = await apiClient.patch(`${this.endpoint}${path}`, data);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(path = ""): Promise<T> {
    const response = await apiClient.delete(`${this.endpoint}/${path}`);
    return response.data;
  }
}

// Utility functions for common API operations
export const apiUtils = {
  // Handle file upload
  uploadFile: async (
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  },

  // Download file
  downloadFile: async (endpoint: string, filename?: string) => {
    const response = await apiClient.get(endpoint, {
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "download");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Retry failed requests
  retryRequest: async <T>(
    requestFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (i < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, i))
          );
        }
      }
    }

    throw lastError;
  },
};

// Export configured axios instance for direct use if needed
export default apiClient;
