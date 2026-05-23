import { api } from "../../lib/api";
import type { AuthUser } from "../../lib/auth-schemas";

export type UpdateProfilePayload = {
  name: string;
  email: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.patch<{ success: boolean; message: string; data: AuthUser }>("/api/settings/profile", payload);

  return response.data.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.patch<{ success: boolean; message: string }>("/api/settings/password", payload);

  return response.data;
}
