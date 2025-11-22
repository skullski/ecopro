/**
 * Secure API client with token management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    is_paid_client?: boolean;
  };
}

export interface ApiError {
  error: string;
  errors?: Array<{ msg: string; param: string }>;
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

/**
 * Remove auth token
 */
export function removeAuthToken(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: "An error occurred",
    }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Register new user
   */
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    return response;
  },

  /**
   * Login user
   */
  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    if (response.user.role === "admin") {
      localStorage.setItem("isAdmin", "true");
    }
    return response;
  },

  /**
   * Get current user
   */
  me: async (): Promise<{ id: string; email: string; name: string; role: string }> => {
    return apiRequest("/auth/me");
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    removeAuthToken();
    window.location.href = "/";
  },

  /**
   * Promote an existing user to admin (platform owner only)
   */
  promoteToAdmin: async (email: string): Promise<{ message: string; user?: any }> => {
    return apiRequest("/admin/promote", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Upgrade current user to VIP (paid client)
   */
  upgradeToVIP: async (): Promise<{ message: string }> => {
    return apiRequest("/auth/upgrade-vip", {
      method: "POST"
    });
  },
};

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; email: string; name: string; role: string; is_paid_client?: boolean } | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Admin utilities (client-side wrappers)
 */
export const adminApi = {
  listUsers: async (): Promise<any[]> => {
    return apiRequest("/admin/users");
  },
};
