import api from "./api";
import type { LoginCredentials, LoginResponse, User } from "../types";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const formData = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
    });

    const response = await api.post<{ access_token: string; token_type: string }>(
      "/api/v1/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const token = response.data.access_token;
    const payload = parseJwtPayload(token);
    const email = payload?.email ?? credentials.username;
    const username = email.includes("@") ? email.split("@")[0] : email;

    return {
      token,
      user: {
        id: String(payload?.sub ?? ""),
        username,
        email,
        role: payload?.role === "admin" ? "admin" : "user",
        fullName: username,
      },
    };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },

  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const payload = parseJwtPayload(token);
    if (!payload?.email) {
      throw new Error("Invalid token payload");
    }

    const email = payload.email;
    const username = email.includes("@") ? email.split("@")[0] : email;

    return {
      id: String(payload.sub ?? ""),
      username,
      email,
      role: payload.role === "admin" ? "admin" : "user",
      fullName: username,
    };
  },

  verifyToken: async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    const payload = parseJwtPayload(token);
    if (!payload?.exp) {
      return false;
    }

    return Date.now() < Number(payload.exp) * 1000;
  },

  listUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>("/api/v1/auth/users");
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await api.post<AdminUser>("/api/v1/auth/users", payload);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/api/v1/auth/users/${userId}`);
  },
};

function parseJwtPayload(
  token: string,
): { sub?: string | number; email?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as {
      sub?: string | number;
      email?: string;
      role?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}
