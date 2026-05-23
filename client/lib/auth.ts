import { api } from "./api";
import type { AuthUser, LoginFormValues, RegisterFormValues } from "./auth-schemas";

type AuthApiResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
  data: {
    token: string;
    user: AuthUser;
  };
};

type LogoutResponse = {
  success: boolean;
  message: string;
};

export async function registerUser(payload: RegisterFormValues) {
  const response = await api.post<AuthApiResponse>("/api/auth/register", payload);

  return response.data;
}

export async function loginUser(payload: LoginFormValues) {
  const response = await api.post<AuthApiResponse>("/api/auth/login", payload);

  return response.data;
}

export async function refreshAuthSession() {
  const response = await api.post<AuthApiResponse>("/api/auth/refresh", {});

  return response.data;
}

export async function logoutAuthSession() {
  const response = await api.post<LogoutResponse>("/api/auth/logout", {});

  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get<{ success: boolean; data: AuthUser }>("/api/auth/me");

  return response.data;
}
