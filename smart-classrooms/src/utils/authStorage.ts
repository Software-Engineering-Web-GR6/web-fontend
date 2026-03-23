const AUTH_STORAGE_KEY = "auth-storage";

type PersistedAuthState = {
  state?: {
    token?: string | null;
    isAuthenticated?: boolean;
  };
};

export function getStoredToken(): string | null {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }

  const persisted = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!persisted) {
    return null;
  }

  try {
    const parsed = JSON.parse(persisted) as PersistedAuthState;
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
