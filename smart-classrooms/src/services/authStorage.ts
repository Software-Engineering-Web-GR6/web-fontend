import type { LoginResponse, UserRole } from "../types";

export const AUTH_STORAGE_KEYS = {
  token: "token",
  role: "role",
  userName: "userName",
  userEmail: "userEmail",
} as const;

export const persistSession = ({ token, user }: LoginResponse) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.role, user.role);
  localStorage.setItem(AUTH_STORAGE_KEYS.userName, user.name);
  localStorage.setItem(AUTH_STORAGE_KEYS.userEmail, user.email);
};

export const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.role);
  localStorage.removeItem(AUTH_STORAGE_KEYS.userName);
  localStorage.removeItem(AUTH_STORAGE_KEYS.userEmail);
};

export const getStoredSession = (): LoginResponse | null => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const role = localStorage.getItem(AUTH_STORAGE_KEYS.role) as UserRole | null;
  const name = localStorage.getItem(AUTH_STORAGE_KEYS.userName);
  const email = localStorage.getItem(AUTH_STORAGE_KEYS.userEmail);

  if (!token || !role || !name || !email) {
    return null;
  }

  return {
    token,
    user: {
      name,
      email,
      role,
    },
  };
};
