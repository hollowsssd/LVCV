"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { i } from "framer-motion/client";
import Image from "next/image";

export default function LoginPage() {
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: gọi API thực tế ở đây
      await new Promise((r) => setTimeout(r, 800));
      console.log({ email, password, remember });
      // ví dụ: router.push('/dashboard')
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <Link
            href="/"
            className="relative h-14 w-40 hover:opacity-90 transition"
          >
            <Image
              src="/logo.png"
              alt="LVCV Logo"
              fill
              priority
              className="object-contain"
            />
          </Link>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Đăng nhập
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Chào mừng quay lại{" "}
            <span className="font-medium text-black dark:text-white">LVCV</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm">
          <form onSubmit={onSubmit} className="p-6">
            {/* Email */}
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950 focus-within:ring-2 focus-within:ring-neutral-300 dark:focus-within:ring-neutral-700">
              <Mail size={18} className="shrink-0" />
              <input
                id="email"
                type="email"
                className="w-full bg-transparent outline-none py-1.5"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="mt-4">
              <label className="text-sm font-medium" htmlFor="password">
                Mật khẩu
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950 focus-within:ring-2 focus-within:ring-neutral-300 dark:focus-within:ring-neutral-700">
                <Lock size={18} className="shrink-0" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="w-full bg-transparent outline-none py-1.5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-neutral-300 dark:border-neutral-700 bg-transparent"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>

              <Link
                href="/forgot-password"
                className="text-sm underline underline-offset-4 hover:opacity-80"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-300/50 text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-medium bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3 text-xs text-neutral-500">
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              hoặc
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Social (mock) */}

            {/* Sign up link */}
            <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
