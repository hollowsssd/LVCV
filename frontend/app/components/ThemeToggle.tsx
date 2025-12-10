"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false); // chặn spam “cứng” (không lọt click)

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const runThemeChange = (next: "light" | "dark" | "system") => {
    if (lockRef.current) return;

    lockRef.current = true;
    setCooldown(true);

    document.documentElement.classList.add("theme-transition");
    setTheme(next);

    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      setCooldown(false);
      lockRef.current = false;
    }, 650);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={cooldown}
        onClick={() => runThemeChange(isDark ? "light" : "dark")}
        onContextMenu={(e) => {
          e.preventDefault();
          if (cooldown) return;
          setOpen((p) => !p);
        }}
        className="
          rounded-full border border-slate-200 bg-white p-2 hover:border-slate-900 shadow-sm transition
          disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
          dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-200
        "
        aria-label="Toggle theme"
        title="Click: Light/Dark • Right click: menu"
      >
        <span className={`block transition-transform duration-200 ${cooldown ? "scale-90" : "scale-100"}`}>
          {isDark ? (
            <Sun size={18} className="text-slate-700 dark:text-slate-200" />
          ) : (
            <Moon size={18} className="text-slate-700 dark:text-slate-200" />
          )}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md text-xs
                        dark:border-slate-800 dark:bg-slate-900">
          <button
            disabled={cooldown}
            className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800
              disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
              ${theme === "light" ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}
            `}
            onClick={() => {
              runThemeChange("light");
              setOpen(false);
            }}
          >
            Light
          </button>

          <button
            disabled={cooldown}
            className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800
              disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
              ${theme === "dark" ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}
            `}
            onClick={() => {
              runThemeChange("dark");
              setOpen(false);
            }}
          >
            Dark
          </button>

          <button
            disabled={cooldown}
            className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800
              disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
              ${theme === "system" ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-200"}
            `}
            onClick={() => {
              runThemeChange("system");
              setOpen(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Laptop size={14} /> System
            </span>
          </button>

          <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Using: {resolvedTheme}
          </div>
        </div>
      )}
    </div>
  );
}
