"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import { Eye, EyeOff } from "lucide-react";

type ToastState = { type: "success" | "error"; message: string } | null;
type Role = "candidate" | "employer";
type ApiErrorResponse = { message?: string; error?: string };

type AuthRegisterResponse = {
  message?: string;
  user: { id: number; email: string; role: string };
  profile: unknown;
  token: string;
};

type CandidateBody = {
  fullName: string;
  phone: string;
  dob: string;
  sex: boolean | null;
  address: string;
  summary: string;
  avatarUrl: string;
};

type EmployerBody = {
  companyName: string;
  logoUrl: string;
  website: string;
  industry: string;
  description: string;
  location: string;
};

const API_AUTH = "http://localhost:8080/api/auth";

function isEmail(v: string) {
  return /\S+@\S+\.\S+/.test(v);
}

function normalizeRole(r: string): Role | "" {
  const x = String(r || "").toLowerCase();
  if (x === "candidate") return "candidate";
  if (x === "employer") return "employer";
  return "";
}

function pickErrorMessage(err: AxiosError<ApiErrorResponse>, fallback: string) {
  return err.response?.data?.message || err.response?.data?.error || fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleFromQuery = useMemo<Role | "">(() => {
    const q = searchParams.get("role");
    return q ? normalizeRole(q) : "";
  }, [searchParams]);

  const [step, setStep] = useState<1 | 2>(roleFromQuery ? 2 : 1);

  // base
  const [role, setRole] = useState<Role | "">(roleFromQuery || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // candidate
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "unknown">("unknown");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // employer
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [employerDescription, setEmployerDescription] = useState("");
  const [employerLocation, setEmployerLocation] = useState("");

  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const roleLocked = step === 2;

  const goNext = () => {
    if (!role) {
      setToast({ type: "error", message: "Vui lòng chọn vai trò trước." });
      return;
    }
    setStep(2);
  };

  const goBack = () => setStep(1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // validate chung
    if (!role || !email || !password || !confirmPassword) {
      setToast({
        type: "error",
        message: "Vui lòng nhập đủ Email, Mật khẩu, Xác nhận mật khẩu và Vai trò.",
      });
      return;
    }
    if (!isEmail(email)) {
      setToast({ type: "error", message: "Email không đúng định dạng." });
      return;
    }
    if (password.length < 6) {
      setToast({ type: "error", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }
    if (password !== confirmPassword) {
      setToast({ type: "error", message: "Mật khẩu và xác nhận mật khẩu không khớp." });
      return;
    }

    // validate theo role
    if (role === "candidate") {
      if (!fullName.trim() || !phone.trim() || !dob || !address.trim()) {
        setToast({
          type: "error",
          message: "Ứng viên: vui lòng nhập Full name, Phone, DOB và Address.",
        });
        return;
      }
    } else {
      if (!companyName.trim() || !industry.trim() || !employerLocation.trim()) {
        setToast({
          type: "error",
          message: "Nhà tuyển dụng: vui lòng nhập Company name, Industry và Location.",
        });
        return;
      }
    }

    try {
      setLoading(true);

      const payload:
        | { email: string; password: string; role: Role; candidate: CandidateBody }
        | { email: string; password: string; role: Role; employer: EmployerBody } =
        role === "candidate"
          ? {
              email: email.trim(),
              password,
              role,
              candidate: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                dob,
                sex: sex === "unknown" ? null : sex === "male",
                address: address.trim(),
                summary: summary.trim(),
                avatarUrl: avatarUrl.trim(),
              },
            }
          : {
              email: email.trim(),
              password,
              role,
              employer: {
                companyName: companyName.trim(),
                logoUrl: logoUrl.trim(),
                website: website.trim(),
                industry: industry.trim(),
                description: employerDescription.trim(),
                location: employerLocation.trim(),
              },
            };

      const regRes = await axios.post<AuthRegisterResponse>(`${API_AUTH}/register`, payload);

      const { token, user } = regRes.data;

      const normalizedRole = normalizeRole(user.role);
      if (!normalizedRole) {
        setToast({ type: "error", message: `Role trả về không hợp lệ: ${user.role}` });
        return;
      }

      const cookieOptions: Cookies.CookieAttributes = {
        expires: 7,
        path: "/",
        sameSite: "lax",
      };

      Cookies.remove("token", { path: "/" });
      Cookies.remove("role", { path: "/" });
      Cookies.remove("email", { path: "/" });

      Cookies.set("token", token, cookieOptions);
      Cookies.set("role", normalizedRole, cookieOptions);
      Cookies.set("email", user.email, cookieOptions);

      setToast({ type: "success", message: "Đăng ký thành công!" });

      const nextPath =
        normalizedRole === "candidate" ? "/candidate/dashboard" : "/employer/dashboard";
      window.setTimeout(() => {
        router.push(nextPath);
        router.refresh();
      }, 1000);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      setToast({
        type: "error",
        message: pickErrorMessage(err, "Không thể đăng ký. Vui lòng thử lại."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="min-h-[72vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-6">
          {/* Title + step indicator */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Đăng ký tài khoản
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chọn vai trò → nhập thông tin → tạo tài khoản.
            </p>

            <div
              className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1
                         text-[11px] text-slate-600
                         dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  step === 1 ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              Bước 1: Chọn vai trò
              <span className="mx-2 h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
              <span
                className={`h-2 w-2 rounded-full ${
                  step === 2 ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              Bước 2: Nhập thông tin
            </div>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5
                       dark:border-slate-800 dark:bg-slate-900/70"
          >
            {/* STEP 1: chọn vai trò */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Vai trò <span className="text-red-500">*</span>
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Candidate card */}
                <button
                  type="button"
                  disabled={roleLocked && role !== "candidate"}
                  onClick={() => setRole("candidate")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition",
                    role === "candidate"
                      ? "border-slate-900 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-200",
                    roleLocked && role !== "candidate"
                      ? "opacity-50 cursor-not-allowed"
                      : "",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold">🎓 Ứng viên</div>
                  <div
                    className={`text-xs mt-1 ${
                      role === "candidate"
                        ? "text-slate-200 dark:text-slate-700"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Upload CV, xem score & job match.
                  </div>
                </button>

                {/* Employer card */}
                <button
                  type="button"
                  disabled={roleLocked && role !== "employer"}
                  onClick={() => setRole("employer")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition",
                    role === "employer"
                      ? "border-slate-900 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-200",
                    roleLocked && role !== "employer"
                      ? "opacity-50 cursor-not-allowed"
                      : "",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold">🏢 Nhà tuyển dụng</div>
                  <div
                    className={`text-xs mt-1 ${
                      role === "employer"
                        ? "text-slate-200 dark:text-slate-700"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Đăng job, xem ứng viên match.
                  </div>
                </button>
              </div>

              {step === 1 ? (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full bg-slate-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-800
                               dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Tiếp tục →
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-slate-900
                               dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-slate-200"
                  >
                    ← Quay lại (đổi vai trò)
                  </button>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vai trò đã khóa. Muốn đổi hãy “Quay lại”.
                  </span>
                </div>
              )}
            </div>

            {/* STEP 2: form chi tiết */}
            {step === 2 && (
              <>
                {/* Email + password */}
                <div className="grid sm:grid-cols-2 gap-4">
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

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm outline-none
                                   focus:border-slate-900 focus:bg-white
                                   dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100
                                   dark:focus:border-slate-300"
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100
                                   dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Candidate / Employer info */}
                {role === "candidate" ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4
                                  dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Thông tin ứng viên
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          SĐT <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="0xxxxxxxxx"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Giới tính
                        </label>
                        <select
                          value={sex}
                          onChange={(e) =>
                            setSex(e.target.value as "male" | "female" | "unknown")
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                        >
                          <option value="unknown">Khác</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="Quận..., TP..."
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Tóm tắt
                        </label>
                        <textarea
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900 resize-none
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="Tóm tắt ngắn..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4
                                  dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Thông tin nhà tuyển dụng
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Tên công ty <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="LVCV Tech"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Ngành <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="IT / Education / ..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={employerLocation}
                          onChange={(e) => setEmployerLocation(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="Hồ Chí Minh / Hà Nội"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Logo URL
                        </label>
                        <input
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Website
                        </label>
                        <input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Mô tả
                        </label>
                        <textarea
                          value={employerDescription}
                          onChange={(e) => setEmployerDescription(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                     focus:border-slate-900 resize-none
                                     dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-300"
                          placeholder="Mô tả công ty..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 shadow-sm
                             disabled:opacity-60 disabled:cursor-not-allowed
                             dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {loading ? "Đang xử lý..." : "Tạo tài khoản"}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Đã có tài khoản?{" "}
            <Link
              href="/auth/login"
              className="text-slate-900 font-medium hover:underline dark:text-slate-100"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
