import api from "./api";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  ApiResponse,
} from "../types";

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      email: "admin@smartclass.edu.vn",
      role: "admin",
      fullName: "Quản trị viên",
    },
  },
  user: {
    password: "user123",
    user: {
      id: "2",
      username: "user",
      email: "user@smartclass.edu.vn",
      role: "user",
      fullName: "Người dùng",
    },
  },
  teacher: {
    password: "teacher123",
    user: {
      id: "3",
      username: "teacher",
      email: "teacher@smartclass.edu.vn",
      role: "user",
      fullName: "Giáo viên Nguyễn Văn A",
    },
  },
};

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Try real API first
      const response = await api.post<ApiResponse<LoginResponse>>(
        "/api/auth/login",
        credentials,
      );
      return response.data.data;
    } catch (error) {
      // Fallback to demo mode
      console.log("API unavailable, using demo mode");
      return authApi.demoLogin(credentials);
    }
  },

  // Demo login for testing without backend
  demoLogin: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoUser = DEMO_USERS[credentials.username];

    if (!demoUser || demoUser.password !== credentials.password) {
      throw {
        response: {
          data: {
            message: "Tên đăng nhập hoặc mật khẩu không đúng",
          },
        },
      };
    }

    return {
      user: demoUser.user,
      token: `demo-token-${Date.now()}`,
    };
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      // Ignore errors on logout
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>("/api/auth/me");
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get("/api/auth/verify");
      return true;
    } catch (error) {
      return false;
    }
  },
};
