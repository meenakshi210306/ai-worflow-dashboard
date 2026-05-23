"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { refreshAuthSession } from "../lib/auth";
import { useAuthStore } from "../store/auth-store";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    async function bootstrapSession() {
      if (accessToken) {
        if (isMounted) {
          setIsChecking(false);
        }

        return;
      }

      try {
        const response = await refreshAuthSession();

        if (!isMounted) {
          return;
        }

        setSession({
          token: response.token ?? response.data.token,
          user: response.user ?? response.data.user
        });
      } catch {
        clearSession();
        router.replace("/login");
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearSession, isHydrated, router, setSession]);

  if (!isHydrated || isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur">
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-6 h-40 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}