// Auth Types
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatar?: string;
}

export interface UserRoomAccess {
  id: number;
  user_id: number;
  room_id: number;
  shift_number: number;
  day_of_week: number;
  created_at: string;
}

export type UserScheduleEntry = UserRoomAccess;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}
