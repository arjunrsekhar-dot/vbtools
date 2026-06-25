"use client";

import { SessionUser } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

type AppContextValue = {
  user: SessionUser | null;
  loadingUser: boolean;
  saved: string[];
  theme: ThemeMode;
  toggleTheme: () => void;
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const LEGACY_SAVED_KEY = "voltbean_saved";
const THEME_KEY = "voltbean_theme";

function readTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Theme still applies for the current page even if persistence is unavailable.
  }
}

function savedKey(userId: string) {
  return `voltbean_saved:${userId}`;
}

function readSavedTools(userId: string) {
  try {
    const stored = window.localStorage.getItem(savedKey(userId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    setTheme(readTheme());
    document.documentElement.dataset.reactReady = "true";
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (loadingUser) return;

    // Never migrate the old shared list into an account: it may contain
    // bookmarks created by a different user on the same browser.
    window.localStorage.removeItem(LEGACY_SAVED_KEY);
    if (!user) {
      setSaved([]);
      return;
    }

    const local = readSavedTools(user.id);
    fetch("/api/saved")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(async (data) => {
        const serverSaved = Array.isArray(data.saved) ? data.saved as string[] : [];
        if (local.length) {
          await fetch("/api/saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slugs: local })
          });
          window.localStorage.removeItem(savedKey(user.id));
        }
        setSaved([...new Set([...serverSaved, ...local])]);
      })
      .catch(() => setSaved(local));
  }, [user, loadingUser]);

  const toggleSaved = useCallback((slug: string) => {
    if (!user) return;

    setSaved((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      void fetch("/api/saved", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, saved: next.includes(slug) })
      });
      return next;
    });
  }, [user]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSaved([]);
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({
      user,
      loadingUser,
      saved,
      theme,
      toggleTheme,
      toggleSaved,
      isSaved: (slug: string) => saved.includes(slug),
      logout
    }),
    [user, loadingUser, saved, theme, toggleTheme, toggleSaved, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
