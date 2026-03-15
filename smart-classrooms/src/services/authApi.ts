import api from "./api";
import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../types";
import {
  clearSession,
  getStoredSession,
  persistSession,
} from "./authStorage";

const MOCK_AUTH_ENABLED =
  import.meta.env.VITE_ENABLE_MOCK_AUTH !== "false";

const MOCK_USERS = [
  {
    email: "admin@school.edu",
    password: "123456",
    role: "admin",
    name: "admin",
  },
  {
    email: "user@school.edu",
    password: "123456",
    role: "user",
    name: "user",
  },
] as const;

const buildMockLogin = ({
  email,
  password,
  role,
}: LoginRequest): LoginResponse => {
  const matchedUser = MOCK_USERS.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password &&
      (!role || user.role === role),
  );

  if (!matchedUser) {
    throw new Error("Invalid mock credentials");
  }

  return {
    token: "demo-token",
    user: {
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    },
  };
};

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const normalized = {
      ...credentials,
      email: credentials.email.trim(),
    };

    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        "/api/auth/login",
        normalized,
      );
      persistSession(response.data.data);
      return response.data.data;
    } catch (error) {
      if (!MOCK_AUTH_ENABLED) {
        throw error;
      }

      const mockResponse = buildMockLogin(normalized);
      persistSession(mockResponse);
      return mockResponse;
    }
  },

  async getProfile(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>("/api/auth/me");
    return response.data.data;
  },

  logout(): void {
    clearSession();
  },

  getStoredSession(): LoginResponse | null {
    return getStoredSession();
  },

  isAuthenticated(): boolean {
    return Boolean(getStoredSession()?.token);
  },

  getRole() {
    return getStoredSession()?.user.role ?? null;
  },

  getDefaultRoute(role?: LoginResponse["user"]["role"] | null): string {
    return role === "user" ? "/user/dashboard" : "/admin/dashboard";
  },
};

export default authApi;
