"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginUser } from "../../lib/auth";
import { loginSchema, type LoginFormValues } from "../../lib/auth-schemas";
import { useAuthStore } from "../../store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setIsRegistered(params.get("registered") === "1");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as never),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function handleLogin(values: LoginFormValues) {
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(values);

      setSession({
        token: response.token ?? response.data.token,
        user: response.user ?? response.data.user
      });

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
          <h1 className="mt-2 font-[family:var(--font-heading)] text-3xl font-semibold text-slate-950">Login to your workspace</h1>
          <p className="mt-2 text-sm text-slate-600">Use your email and password to access the dashboard.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
          {isRegistered ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Account created successfully. Please login.
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="john@gmail.com"
              required
            />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="••••••••"
              required
            />
            {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p> : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
