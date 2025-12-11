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

function isLikelyJwt(token: string): boolean {
  return token.split(".").length === 3;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token") ?? "";
    const roleCookie = Cookies.get("role") ?? "";

    if (!token || !isLikelyJwt(token)) return;

    const role = normalizeRole(roleCookie);

    let redirectPath = "";
    if (role === "candidate") redirectPath = "/candidate/dashboard";
    else if (role === "employer") redirectPath = "/employer/dashboard";
    else if (role === "admin") redirectPath = "/admin/dashboard";

    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [router]);

  // timeout ẩn toast
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
        err.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Đăng nhập</h1>
            <p className="text-sm text-slate-500">
              Truy cập hệ thống phân tích CV & gợi ý việc làm.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Ít nhất 6 ký tự"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="text-slate-900 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}