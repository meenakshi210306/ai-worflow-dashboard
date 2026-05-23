import { create } from "zustand";

import { AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type { AuthUser } from "../lib/auth-schemas";

type AuthSession = {
  user: AuthUser;
  token: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
  hydrateSession: () => void;
};

function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem("ai_workflow_auth_user");
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
  window.localStorage.setItem("ai_workflow_auth_user", JSON.stringify(session.user));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setSession: (session) => {
    persistSession(session);

    set({
      user: session.user,
      accessToken: session.token,
      isHydrated: true
    });
  },
  updateUser: (user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ai_workflow_auth_user", JSON.stringify(user));
    }

    set((state) => ({
      ...state,
      user
    }));
  },
  clearSession: () => {
    persistSession(null);

    set({
      user: null,
      accessToken: null,
      isHydrated: true
    });
  },
  hydrateSession: () => {
    if (typeof window === "undefined") {
      return;
    }

    const accessToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem("ai_workflow_auth_user");

    set({
      user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
      accessToken,
      isHydrated: true
    });
  }
}));