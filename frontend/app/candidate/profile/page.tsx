"use client";

import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, X, Camera } from "lucide-react";
import Toast from "@/app/components/Toast";

type Role = "candidate" | "employer" | "admin";

type ApiError = {
  message?: string;
  error?: string;
  detail?: string;
};

type CandidateMe = {
  id: number;
  userId: number;
  fullName: string | null;
  phone: string | null;
  dob: string | null;
  sex: boolean | null; // true=Nam, false=Nữ, null=Khác
  address: string | null;
  summary: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type CvItem = {
  id: number;
  title: string | null;
  fileUrl: string | null; // "/uploads/cvs/xxx.pdf"
  fileType: string | null; // "pdf" | "doc" | "docx"
  isDefault: boolean | null;
  candidateId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeText(v: unknown, fallback = "—"): string {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : fallback;
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  return fallback;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function sexLabel(sex: boolean | null | undefined): string {
  if (sex === true) return "Nam";
  if (sex === false) return "Nữ";
  return "Khác";
}

function pickErr(err: unknown, fallback: string): string {
  const e = err as AxiosError<ApiError>;
  return (
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.response?.data?.detail ||
    e.message ||
    fallback
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span
      className="inline-flex rounded-full bg-slate-900 text-white text-[10px] px-2 py-0.5
                 dark:bg-slate-100 dark:text-slate-900"
    >
      {children}
    </span>
  );
}

function InlineAlert(props: { type: "warn" | "error"; message: string }) {
  const base = "rounded-2xl border px-4 py-3 text-sm";
  const cls =
    props.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100";

  return (
    <div className={cn(base, cls)}>
      <p className="font-semibold">
        {props.type === "error" ? "⚠️ Lỗi" : "⚠️ Cảnh báo"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">
        {props.message}
      </p>
    </div>
  );
}

export default function CandidateProfilePage() {
  const token = useMemo(() => Cookies.get("token") || "", []);
  const role = useMemo(
    () => (Cookies.get("role") || "").toLowerCase() as Role,
    []
  );
  const email = useMemo(() => Cookies.get("email") || "", []);

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateMe | null>(null);
  const [cvs, setCvs] = useState<CvItem[]>([]);

  const [errProfile, setErrProfile] = useState<string>("");
  const [errCvs, setErrCvs] = useState<string>("");

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    dob: "",
    sex: null as boolean | null,
    address: "",
    summary: "",
  });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Email verification state
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // State upload avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Xử lý upload avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !candidate) return;

    // Kiểm tra loại file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setToast({ type: "error", message: "Chỉ chấp nhận file JPG, JPEG hoặc PNG" });
      return;
    }

    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "File quá lớn. Tối đa 5MB" });
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put<CandidateMe>(
        `${API_BASE}/api/candidates/${candidate.id}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCandidate(res.data);
      setToast({ type: "success", message: "Cập nhật avatar thành công!" });
    } catch (err) {
      setToast({ type: "error", message: pickErr(err, "Không thể upload avatar") });
    } finally {
      setAvatarUploading(false);
      // Reset input sau khi upload
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrProfile("");
        setErrCvs("");

        const headers = { Authorization: `Bearer ${token}` };

        const [meRes, cvsRes] = await Promise.all([
          axios.get<CandidateMe>(`${API_BASE}/api/candidates/me`, { headers }),
          axios.get<CvItem[]>(`${API_BASE}/api/cvs/mine`, { headers }),
        ]);

        if (!mounted) return;

        setCandidate(meRes.data ?? null);
        setCvs(Array.isArray(cvsRes.data) ? cvsRes.data : []);
      } catch (err) {
        if (!mounted) return;

        const headers = { Authorization: `Bearer ${token}` };

        try {
          const meRes = await axios.get<CandidateMe>(`${API_BASE}/api/candidates/me`, {
            headers,
          });
          if (mounted) setCandidate(meRes.data ?? null);
        } catch (e1) {
          if (mounted) setErrProfile(pickErr(e1, "Không load được hồ sơ ."));
        }

        try {
          const cvsRes = await axios.get<CvItem[]>(`${API_BASE}/api/cvs/mine`, {
            headers,
          });
          if (mounted) setCvs(Array.isArray(cvsRes.data) ? cvsRes.data : []);
        } catch (e2) {
          if (mounted) setErrCvs(pickErr(e2, "Không load được CV."));
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [token, role]);

  // Fetch email verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/auth/verification-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmailVerified(res.data?.emailVerified || false);
      } catch {
        // ignore
      }
    };
    fetchVerificationStatus();
  }, [token]);

  // Send OTP handler
  const handleSendOtp = async () => {
    setOtpSending(true);
    try {
      await axios.post(`${API_BASE}/api/auth/send-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowOtpModal(true);
      setOtpInput("");
      setToast({ type: "success", message: "Đã gửi mã OTP đến email của bạn" });
    } catch (err) {
      setToast({ type: "error", message: pickErr(err, "Không thể gửi OTP") });
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      setToast({ type: "error", message: "Vui lòng nhập đủ 6 số" });
      return;
    }
    setOtpLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/verify-otp`, { otp: otpInput }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmailVerified(true);
      setShowOtpModal(false);
      setOtpInput("");
      setToast({ type: "success", message: "Xác thực email thành công!" });
    } catch (err) {
      setToast({ type: "error", message: pickErr(err, "Mã OTP không đúng") });
    } finally {
      setOtpLoading(false);
    }
  };

  // chặn truy cập
  if (!token || (role && role !== "candidate")) {
    return (
      <div
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Không thể truy cập
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {errProfile || "Bạn không có quyền."}
        </p>
        <Link
          href="/auth/login"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
        >
          → Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm text-sm text-slate-600
                   dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
      >
        Đang tải hồ sơ...
      </div>
    );
  }

  const totalCv = cvs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Hồ sơ người dùng
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thông tin tài khoản + CV đã lưu.
            </p>
          </div>

          {errProfile ? <InlineAlert type="error" message={errProfile} /> : null}
          {errCvs ? <InlineAlert type="warn" message={errCvs} /> : null}
        </div>
      </div>

      {/* Account */}
      <section
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Tài khoản</p>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {safeText(email)}
              </p>
              {emailVerified === true && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đã xác thực
                </span>
              )}
              {emailVerified === false && (
                <button
                  onClick={handleSendOtp}
                  disabled={otpSending}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                >
                  {otpSending ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Xác thực ngay
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-100">
                {safeText(role, "candidate")}
              </span>
              {" · "}
              UserId:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-100">
                {candidate?.userId ?? "—"}
              </span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng CV đã lưu
            </p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {totalCv}
            </p>
          </div>
        </div>
      </section>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm mx-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nhập mã OTP</h3>
              <button
                onClick={() => setShowOtpModal(false)}
                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Mã OTP 6 số đã được gửi đến email <strong>{email}</strong>
            </p>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Nhập mã 6 số"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-widest font-mono
                         focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900
                         dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400"
              maxLength={6}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50
                           dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpInput.length !== 6}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50
                           dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {otpLoading ? "Đang xác thực..." : "Xác nhận"}
              </button>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={otpSending}
              className="w-full mt-3 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {otpSending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>
          </div>
        </div>
      )}

      {/* Candidate info */}
      <section
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Thông tin ứng viên
          </h2>
          {candidate && (
            <button
              onClick={() => {
                setEditForm({
                  fullName: candidate.fullName || "",
                  phone: candidate.phone || "",
                  dob: candidate.dob ? candidate.dob.slice(0, 10) : "",
                  sex: candidate.sex,
                  address: candidate.address || "",
                  summary: candidate.summary || "",
                });
                setShowEditModal(true);
              }}
              className="cursor-pointer flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Pencil size={14} />
              Cập nhật
            </button>
          )}
        </div>

        {!candidate ? (
          <div
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                       dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
          >
            Không có dữ liệu ứng viên.
          </div>
        ) : (
          <>
            {/* Avatar section with upload */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidate.avatarUrl?.startsWith('/uploads') ? `${API_BASE}${candidate.avatarUrl}` : '/placeholder.png'}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                </div>
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {avatarUploading ? (
                    <span className="text-white text-xs">Đang tải...</span>
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </button>
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Ảnh đại diện
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhấn vào ảnh để thay đổi. Chấp nhận JPG, PNG (tối đa 5MB)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Họ và tên</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(candidate.fullName)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">SĐT</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(candidate.phone)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Ngày sinh</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {fmtDate(candidate.dob)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Giới tính</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {sexLabel(candidate.sex)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Địa chỉ</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(candidate.address)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Tóm tắt</p>
                <p className="mt-1 text-slate-700 whitespace-pre-line dark:text-slate-200">
                  {safeText(candidate.summary)}
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      {/* CV list (REAL) */}
      <section
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            CV đã lưu
          </h2>
        </div>

        {cvs.length === 0 ? (
          <div
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                       dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
          >
            Chưa có CV nào.
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => {
              const title = safeText(cv.title, `CV #${cv.id}`);
              const fileType = safeText(cv.fileType, "—").toUpperCase();
              const created = fmtDate(cv.createdAt);
              const fileHref =
                typeof cv.fileUrl === "string" && cv.fileUrl.trim().length
                  ? `${API_BASE}${cv.fileUrl}`
                  : "";

              return (
                <div
                  key={cv.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-between gap-3
                             dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">
                      {title}{" "}
                      {cv.isDefault ? (
                        <span className="ml-2">
                          <Badge>Mặc định</Badge>
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                      Loại:{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-100">
                        {fileType}
                      </span>
                      {" · "}
                      Tạo: {created}

                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {fileHref ? (
                      <a
                        href={fileHref}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                                   dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                      >
                        Xem file
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Không có fileUrl
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Cập nhật thông tin
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} className="cursor-pointer text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!candidate) return;

                setEditLoading(true);
                try {
                  const headers = { Authorization: `Bearer ${token}` };
                  const res = await axios.put<CandidateMe>(
                    `${API_BASE}/api/candidates/${candidate.id}`,
                    {
                      fullName: editForm.fullName || null,
                      phone: editForm.phone || null,
                      dob: editForm.dob || null,
                      sex: editForm.sex,
                      address: editForm.address || null,
                      summary: editForm.summary || null,
                    },
                    { headers }
                  );

                  setCandidate(res.data);
                  setShowEditModal(false);
                  setToast({ type: "success", message: "Cập nhật thành công!" });
                } catch (err) {
                  setToast({ type: "error", message: pickErr(err, "Cập nhật thất bại") });
                } finally {
                  setEditLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Giới tính
                  </label>
                  <select
                    value={editForm.sex === null ? "" : editForm.sex ? "true" : "false"}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditForm({
                        ...editForm,
                        sex: v === "" ? null : v === "true",
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Khác</option>
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Tóm tắt bản thân
                </label>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}