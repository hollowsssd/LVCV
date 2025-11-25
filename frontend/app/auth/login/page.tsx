"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Toast from "@/app/components/Toast";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"candidate" | "employer" | "">("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      setToast({
        type: "error",
        message: "Vui lòng nhập đầy đủ email, mật khẩu và chọn vai trò.",
      });
      return;
    }

    if (!validateEmail(email)) {
      setToast({
        type: "error",
        message: "Email không đúng định dạng.",
      });
      return;
    }

    if (password.length < 6) {
      setToast({
        type: "error",
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    try {
      setLoading(true);

      // TODO: Gọi API login thật
      // const res = await fetch("/api/auth/login", {...})
      // if (!res.ok) throw new Error("Sai tài khoản hoặc mật khẩu");

      // DEMO: giả lập login success
      await new Promise((r) => setTimeout(r, 700));

      setToast({
        type: "success",
        message:
          role === "candidate"
            ? "Đăng nhập thành công. Chuyển đến Candidate Dashboard."
            : "Đăng nhập thành công. Chuyển đến Employer Dashboard.",
      });

      // TODO: lưu user/token & redirect
      // localStorage.setItem("user", JSON.stringify(...))
      // router.push(role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    } catch (err) {
      setToast({
        type: "error",
        message: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      });
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
            <h1 className="text-2xl font-semibold text-slate-900">
              Đăng nhập
            </h1>
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                placeholder="Ít nhất 6 ký tự"
              />
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
