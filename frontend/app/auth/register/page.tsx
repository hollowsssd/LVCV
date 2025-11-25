"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Toast from "@/app/components/Toast";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"candidate" | "employer" | "">("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    // regex đơn giản đủ dùng cho form frontend
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate bắt buộc
    if (!fullName || !email || !password || !role) {
      setToast({
        type: "error",
        message: "Vui lòng điền đầy đủ họ tên, email, mật khẩu và vai trò.",
      });
      return;
    }

    if (!validateEmail(email)) {
      setToast({
        type: "error",
        message: "Email không đúng định dạng. Vui lòng kiểm tra lại.",
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

      // TODO: gọi API backend thật ở đây
      // const res = await fetch("/api/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ fullName, email, password, role }),
      // });
      // if (!res.ok) throw new Error("Đăng ký thất bại");

      // DEMO: giả lập API ok
      await new Promise((r) => setTimeout(r, 700));

      setToast({
        type: "success",
        message: "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
      });

      // Có thể reset form hoặc redirect
      setPassword("");
      // router.push("/auth/login");
    } catch (err) {
      setToast({
        type: "error",
        message: "Không thể đăng ký. Vui lòng thử lại sau.",
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
              Đăng ký tài khoản
            </h1>
            <p className="text-sm text-slate-500">
              Bắt đầu sử dụng hệ thống với vai trò Candidate hoặc Employer.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                placeholder="Nguyễn Văn A"
              />
            </div>

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
              <p className="text-[11px] text-slate-400">
                Mẹo: dùng mật khẩu đủ mạnh nhưng bạn dễ nhớ (ví dụ: tên project + số).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "candidate" | "employer")
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="">-- Chọn vai trò --</option>
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-slate-900 font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
