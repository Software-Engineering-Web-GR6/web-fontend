import api from "./api";
import type {
  ChangePasswordPayload,
  ForgotPasswordRequest,
  LoginCredentials,
  LoginResponse,
  ResetPasswordRequest,
  User,
  UserScheduleEntry,
  UserRoomAccess,
  VerifyResetCodeRequest,
} from "../types";
import { clearStoredAuth, getStoredToken } from "../utils/authStorage";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

const mapAdminUserToClientUser = (user: AdminUser): User => ({
  id: String(user.id),
  username: user.email.includes("@") ? user.email.split("@")[0] : user.email,
  email: user.email,
  role: user.role,
  fullName: user.full_name,
});

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface ImportUsersPayload {
  items: CreateUserPayload[];
}

export interface ImportScheduleRow {
  email: string;
  room_name: string;
  day_of_week: number | string | null;
  shift_number: number | string | null;
}

export interface ImportSchedulePayload {
  items: ImportScheduleRow[];
}

export interface BatchImportResultItem {
  row_number: number;
  success: boolean;
  message: string;
  email?: string | null;
  room_name?: string | null;
  user_id?: number | null;
}

export interface BatchImportResponse {
  created_count: number;
  failed_count: number;
  results: BatchImportResultItem[];
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
    clearStoredAuth();
  },

  getCurrentUser: async (): Promise<User> => {
    const token = getStoredToken();
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
    const token = getStoredToken();
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

  getMe: async (): Promise<User> => {
    const response = await api.get<AdminUser>("/api/v1/auth/me");
    return mapAdminUserToClientUser(response.data);
  },

  getMyRoomAccess: async (): Promise<UserRoomAccess[]> => {
    const response = await api.get<UserRoomAccess[]>("/api/v1/auth/me/room-access");
    return response.data;
  },

  getMySchedule: async (): Promise<UserScheduleEntry[]> => {
    const response = await api.get<UserScheduleEntry[]>("/api/v1/auth/me/schedule");
    return response.data;
  },

  getUserRoomAccess: async (userId: number): Promise<UserRoomAccess[]> => {
    const response = await api.get<UserRoomAccess[]>(
      `/api/v1/auth/users/${userId}/room-access`,
    );
    return response.data;
  },

  getUserSchedule: async (userId: number): Promise<UserScheduleEntry[]> => {
    const response = await api.get<UserScheduleEntry[]>(
      `/api/v1/auth/users/${userId}/schedule`,
    );
    return response.data;
  },

  getRoomOccupancy: async (roomId: number): Promise<UserRoomAccess[]> => {
    const response = await api.get<UserRoomAccess[]>(
      `/api/v1/auth/rooms/${roomId}/room-access`,
    );
    return response.data;
  },

  getRoomSchedule: async (roomId: number): Promise<UserScheduleEntry[]> => {
    const response = await api.get<UserScheduleEntry[]>(
      `/api/v1/auth/rooms/${roomId}/schedule`,
    );
    return response.data;
  },

  grantRoomAccess: async (
    userId: number,
    payload: { room_id: number; shifts: number[]; days_of_week: number[] },
  ): Promise<UserRoomAccess[]> => {
    const response = await api.post<UserRoomAccess[]>(
      `/api/v1/auth/users/${userId}/room-access`,
      payload,
    );
    return response.data;
  },

  assignSchedule: async (
    userId: number,
    payload: { room_id: number; shifts: number[]; days_of_week: number[] },
  ): Promise<UserScheduleEntry[]> => {
    const response = await api.post<UserScheduleEntry[]>(
      `/api/v1/auth/users/${userId}/schedule`,
      payload,
    );
    return response.data;
  },

  revokeRoomAccess: async (
    userId: number,
    roomId: number,
    shiftNumber: number,
    dayOfWeek: number,
  ): Promise<void> => {
    await api.delete(`/api/v1/auth/users/${userId}/room-access`, {
      params: {
        room_id: roomId,
        shift_number: shiftNumber,
        day_of_week: dayOfWeek,
      },
    });
  },

  removeScheduleSlot: async (
    userId: number,
    roomId: number,
    shiftNumber: number,
    dayOfWeek: number,
  ): Promise<void> => {
    await api.delete(`/api/v1/auth/users/${userId}/schedule`, {
      params: {
        room_id: roomId,
        shift_number: shiftNumber,
        day_of_week: dayOfWeek,
      },
    });
  },

  createUser: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await api.post<AdminUser>("/api/v1/auth/users", payload);
    return response.data;
  },

  importUsers: async (payload: ImportUsersPayload): Promise<BatchImportResponse> => {
    const response = await api.post<BatchImportResponse>("/api/v1/auth/users/import", payload);
    return response.data;
  },

  importSchedule: async (payload: ImportSchedulePayload): Promise<BatchImportResponse> => {
    const response = await api.post<BatchImportResponse>("/api/v1/auth/schedule/import", payload);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/api/v1/auth/users/${userId}`);
  },

  changeMyPassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.put("/api/v1/auth/me/password", payload);
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/v1/auth/forgot-password",
      payload,
    );
    return response.data;
  },

  verifyResetCode: async (
    payload: VerifyResetCodeRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/v1/auth/verify-reset-code",
      payload,
    );
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/api/v1/auth/reset-password",
      payload,
    );
    return response.data;
  },

};

function parseJwtPayload(
  token: string,
): {
  sub?: string | number;
  email?: string;
  role?: string;
  exp?: number;
} | null {
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
