"use client";

import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {safeText(email)}
            </p>
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

      {/* Candidate info */}
      <section
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Thông tin ứng viên
          </h2>
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
            {/* avatar (nếu có) */}
            {candidate.avatarUrl && (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE}${candidate.avatarUrl}`}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Avatar từ hồ sơ Candidate.
                </p>
              </div>
            )}

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
    </div>
  );
}