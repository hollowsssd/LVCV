"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import { Eye, EyeOff } from "lucide-react";

type ToastState =
  | {
    type: "success" | "error";
    message: string;
  }
  | null;

type ApiErrorResponse = {
  message?: string;
};

type Role = "candidate" | "employer" | "admin";

type ApiLoginResponse = {
  message?: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  token: string;
};

const API_BASE_URL = "http://localhost:8080/api/auth";

function normalizeRole(input: string): Role {
  const r = (input || "").toLowerCase();
  if (r === "candidate") return "candidate";
  if (r === "employer") return "employer";
  if (r === "admin") return "admin";
  return "candidate";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setToast({ type: "error", message: "Vui lòng nhập đầy đủ email và mật khẩu." });
      return;
    }

    if (!validateEmail(email)) {
      setToast({ type: "error", message: "Email không đúng định dạng." });
      return;
    }

    if (password.length < 6) {
      setToast({ type: "error", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post<ApiLoginResponse>(`${API_BASE_URL}/login`, {
        email: email.trim(),
        password,
      });

      const data = res.data;
      const role = normalizeRole(data.user.role);

      const cookieOptions: Cookies.CookieAttributes = {
        expires: 7,
        path: "/",
        sameSite: "lax",
      };

      Cookies.set("token", data.token, cookieOptions);
      Cookies.set("role", role, cookieOptions);
      Cookies.set("email", data.user.email, cookieOptions);

      const redirectPath =
        role === "candidate"
          ? "/candidate/dashboard"
          : role === "employer"
            ? "/employer/dashboard"
            : "/admin/dashboard";

      setToast({ type: "success", message: "Đăng nhập thành công! " });

      window.setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1000);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const msg =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Đăng nhập
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Truy cập hệ thống phân tích CV &amp; gợi ý việc làm.
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm
                       dark:border-slate-800 dark:bg-slate-900/70"
          >
            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none
                           focus:border-slate-900 focus:bg-white
                           dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100
                           dark:focus:border-slate-300"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Mật khẩu <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm outline-none
                             focus:border-slate-900 focus:bg-white
                             dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100
                             dark:focus:border-slate-300"
                  placeholder="Ít nhất 6 ký tự"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100
                             dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 shadow-sm
                         hover:bg-slate-800
                         disabled:opacity-60 disabled:cursor-not-allowed
                         dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <a
              href="http://localhost:8080/api/auth/google"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập bằng Google
            </a>
          </form>

          {/* Footer text */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/register"
              className="text-slate-900 font-medium hover:underline dark:text-slate-100"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
