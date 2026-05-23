"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, Save, SunMedium, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { changePassword, updateProfile } from "../../../services/api/settings";
import { useAuthStore } from "../../../store/auth-store";
import { useToastStore } from "../../../store/toast-store";
import { useThemeStore, type Theme } from "../../../store/theme-store";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email address")
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(128)
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const themeOptions: Theme[] = ["light", "dark", "system"];
const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System"
};

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateStoredUser = useAuthStore((state) => state.updateUser);
  const pushToast = useToastStore((state) => state.pushToast);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("Startup operations");
  const [mounted, setMounted] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema as never),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? ""
    }
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema as never),
    defaultValues: {
      currentPassword: "",
      newPassword: ""
    }
  });

  useEffect(() => {
    setMounted(true);
    const storedNotifications = window.localStorage.getItem("ai_workflow_notifications_enabled");
    const storedWorkspaceName = window.localStorage.getItem("ai_workflow_workspace_name");

    if (storedNotifications !== null) {
      setNotificationsEnabled(storedNotifications === "true");
    }

    if (storedWorkspaceName) {
      setWorkspaceName(storedWorkspaceName);
    }
  }, []);

  async function handleProfileSubmit(values: ProfileForm) {
    try {
      const updatedUser = await updateProfile(values);
      updateStoredUser(updatedUser);
      pushToast({ title: "Profile saved", description: "Your profile updates were saved successfully.", tone: "success" });
    } catch (error) {
      pushToast({
        title: "Profile update failed",
        description: error instanceof Error ? error.message : "Unable to save profile",
        tone: "error"
      });
    }
  }

  async function handlePasswordSubmit(values: PasswordForm) {
    try {
      await changePassword(values);
      passwordForm.reset({ currentPassword: "", newPassword: "" });
      pushToast({ title: "Password updated", description: "Your password change has been saved.", tone: "success" });
    } catch (error) {
      pushToast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : "Unable to change password",
        tone: "error"
      });
    }
  }

  function savePreferences() {
    window.localStorage.setItem("ai_workflow_notifications_enabled", String(notificationsEnabled));
    window.localStorage.setItem("ai_workflow_workspace_name", workspaceName);
    pushToast({ title: "Preferences saved", description: "Theme and notification preferences updated.", tone: "success" });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Workspace configuration</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your profile, security, theme, and workspace preferences.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-950">Profile settings</h2>
          </div>
          <form className="mt-6 space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                {...profileForm.register("name")}
              />
              {profileForm.formState.errors.name ? <p className="mt-2 text-sm text-rose-600">{profileForm.formState.errors.name.message}</p> : null}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                {...profileForm.register("email")}
              />
              {profileForm.formState.errors.email ? <p className="mt-2 text-sm text-rose-600">{profileForm.formState.errors.email.message}</p> : null}
            </div>
            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-950">Change password</h2>
          </div>
          <form className="mt-6 space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword ? <p className="mt-2 text-sm text-rose-600">{passwordForm.formState.errors.currentPassword.message}</p> : null}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword ? <p className="mt-2 text-sm text-rose-600">{passwordForm.formState.errors.newPassword.message}</p> : null}
            </div>
            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update password
            </button>
          </form>
        </section>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <SunMedium className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-950">Theme preferences</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  theme === option ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                {themeLabels[option]}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-950">Workspace preferences</h2>
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>Enable notification banners</span>
              <input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Workspace name
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
            <button
              type="button"
              onClick={savePreferences}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save preferences
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
