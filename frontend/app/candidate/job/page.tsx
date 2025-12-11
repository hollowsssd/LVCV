"use client";

import Toast from "@/app/components/Toast";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";

type ToastState = { type: "success" | "error"; message: string } | null;

type ApiErrorResponse = {
  message?: string;
  error?: string;
  detail?: string;
};

type JobStatus = "OPEN" | "CLOSED" | "DRAFT";

type EmployerLite = {
  companyName?: string | null;
};

type Job = {
  id: number;
  title: string;
  description: string;

  salaryMin: number | null;
  salaryMax: number | null;
  isNegotiable: boolean;

  location: string | null;
  jobType: string | null;
  experienceRequired: string | null;
  deadline: string | null;
  status: JobStatus;

  employerId: number;

  companyName?: string | null;
  Employer?: EmployerLite | null;
  employer?: EmployerLite | null;

  createdAt: string;
  updatedAt: string;
};

type Cv = {
  id: number;
  title: string | null;
  isDefault: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function formatMoney(v?: number | null) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("vi-VN") + " ₫";
}

function formatSalary(job: Job) {
  if (job.isNegotiable) return "Thoả thuận";
  const min = job.salaryMin ?? null;
  const max = job.salaryMax ?? null;
  if (min === null && max === null) return "—";
  if (min !== null && max !== null) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (min !== null) return `Từ ${formatMoney(min)}`;
  return `Đến ${formatMoney(max)}`;
}

function pickCompanyName(job: Job): string | null {
  return job.companyName ?? job.Employer?.companyName ?? job.employer?.companyName ?? null;
}

function pickErr(err: unknown, fallback: string): string {
  const e = err as AxiosError<ApiErrorResponse>;
  return (
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.response?.data?.detail ||
    e.message ||
    fallback
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]";

  const cls =
    status === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "CLOSED"
        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200";

  const label = status === "OPEN" ? "Đang mở" : status === "CLOSED" ? "Đã đóng" : "Nháp";

  return <span className={`${base} ${cls}`}>{label}</span>;
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2
                    dark:border-slate-700 dark:bg-slate-900/70">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-900 break-words dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function JobDetailModal({
  open,
  onClose,
  job,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onApply: (job: Job) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !job) return null;

  const meta = [
    { label: "Công ty", value: job.companyName || "—" },
    { label: "Địa điểm", value: job.location || "—" },
    { label: "Hình thức", value: job.jobType || "—" },
    { label: "Kinh nghiệm", value: job.experienceRequired || "—" },
    { label: "Lương", value: formatSalary(job) },
    { label: "Hạn nộp", value: job.deadline || "—" },
    { label: "Trạng thái", value: job.status },
    { label: "Ngày tạo", value: fmtDate(job.createdAt) },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden
                     dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4
                       dark:border-slate-800"
          >
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job.companyName || "—"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {job.title}
                </h3>
                <StatusPill status={job.status} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {job.location || "—"} · {job.jobType || "—"} · Hạn:{" "}
                {job.deadline || "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900
                         dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-300"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                         dark:border-slate-700 dark:bg-slate-900/70"
            >
              <p className="text-xs font-semibold text-slate-900 mb-3 dark:text-slate-100">
                Thông tin job
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                {meta.map((m) => (
                  <MetaCard key={m.label} label={m.label} value={String(m.value)} />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Mô tả
              </p>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed dark:text-slate-300">
                {job.description || "—"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onApply(job)}
                className="rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800
                           dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Apply CV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyCvModal({
  open,
  onClose,
  job,
  token,
  onApplied,
  toastError,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  token: string;
  onApplied: () => void;
  toastError: (msg: string) => void;
}) {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cvId, setCvId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !token) return;

    const fetchCvs = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Cv[]>(`${API_BASE}/api/cvs/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const arr = Array.isArray(res.data) ? res.data : [];
        setCvs(arr);

        const def = arr.find((x) => x.isDefault);
        setCvId(def?.id ?? arr[0]?.id ?? null);
      } catch (err) {
        console.error("[ApplyCvModal] fetch cvs error:", err);
        setCvs([]);
        setCvId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, [open, token]);

  const submit = async () => {
    if (!job) return;
    if (!cvId) {
      toastError("Bạn chưa có CV để apply. Hãy upload CV trước.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${API_BASE}/api/applications`,
        { jobId: job.id, cvId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onApplied();
      onClose();
    } catch (err) {
      toastError(pickErr(err, "Apply thất bại. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden
                     dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4
                       dark:border-slate-800"
          >
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Apply vào</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {job.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {job.companyName || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900
                         dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {loading ? (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                           dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              >
                Đang tải danh sách CV...
              </div>
            ) : cvs.length === 0 ? (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                           dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              >
                Bạn chưa có CV nào. Hãy upload CV trước rồi quay lại apply.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Chọn CV
                </label>
                <select
                  value={cvId ?? ""}
                  onChange={(e) => setCvId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none
                             focus:border-slate-900 focus:bg-white
                             dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-300"
                >
                  {cvs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title ? c.title : `CV #${c.id}`} {c.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                           dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || cvs.length === 0}
                className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60
                           dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {submitting ? "Đang apply..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */

export default function JobsPage() {
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (t: ToastState, ms = 1400) => {
    setToast(t);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const token = useMemo(() => Cookies.get("token") || "", []);
  const role = useMemo(() => Cookies.get("role") || "", []);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJob, setDetailJob] = useState<Job | null>(null);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const url = onlyOpen ? `${API_BASE}/api/jobs?status=OPEN` : `${API_BASE}/api/jobs`;

      const res = await axios.get<Job[]>(url);
      const arr = Array.isArray(res.data) ? res.data : [];

      const normalized: Job[] = arr.map((j) => ({
        ...j,
        companyName: pickCompanyName(j),
      }));

      setJobs(normalized);
    } catch (err) {
      showToast(
        { type: "error", message: pickErr(err, "Không thể tải danh sách việc làm.") },
        2000
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyOpen]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return jobs;
    return jobs.filter((j) => {
      const hay = `${j.title} ${j.companyName ?? ""} ${j.location ?? ""} ${j.jobType ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [jobs, q]);

  // chỉ candidate mới thấy
  if (role && role !== "candidate") {
    return (
      <div
        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                   dark:border-slate-800 dark:bg-slate-900/70"
      >
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Không có quyền truy cập
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Trang “Danh sách việc làm” chỉ dành cho tài khoản Candidate.
        </p>
      </div>
    );
  }

  const openDetail = (job: Job) => {
    setDetailJob(job);
    setDetailOpen(true);
  };

  const openApply = (job: Job) => {
    if (!token) {
      showToast(
        { type: "error", message: "Bạn cần đăng nhập Candidate để apply." },
        2000
      );
      return;
    }
    setApplyJob(job);
    setApplyOpen(true);
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

      <JobDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailJob(null);
        }}
        job={detailJob}
        onApply={(job) => {
          setDetailOpen(false);
          setDetailJob(null);
          openApply(job);
        }}
      />

      <ApplyCvModal
        open={applyOpen}
        onClose={() => {
          setApplyOpen(false);
          setApplyJob(null);
        }}
        job={applyJob}
        token={token}
        toastError={(msg) => showToast({ type: "error", message: msg }, 2000)}
        onApplied={() =>
          showToast({ type: "success", message: "Apply thành công!" }, 1200)
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Danh sách việc làm
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Xem job từ các nhà tuyển dụng và apply bằng CV của bạn.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo title / công ty / địa điểm..."
              className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none
                         focus:border-slate-900 focus:bg-white
                         dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-300"
            />

            {/* filter chỉ job OPEN – dùng luôn onlyOpen state hiện có */}
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 sm:ml-2 dark:text-slate-300">
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={(e) => setOnlyOpen(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900
                           dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              Chỉ hiển thị job đang mở
            </label>
          </div>
        </div>

        <section
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                     dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Jobs
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {filtered.length} job
            </span>
          </div>

          {loading ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                         dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
            >
              Đang tải danh sách job...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                         dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
            >
              Không có job phù hợp.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filtered.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 hover:border-slate-900 transition
                             dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">
                        {job.title}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">
                        {job.companyName || "—"} · {job.location || "—"} ·{" "}
                        {job.jobType || "—"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Kinh nghiệm:{" "}
                        <span className="text-slate-700 font-medium dark:text-slate-100">
                          {job.experienceRequired || "—"}
                        </span>{" "}
                        · Hạn:{" "}
                        <span className="text-slate-700 font-medium dark:text-slate-100">
                          {job.deadline || "—"}
                        </span>
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Lương:{" "}
                        <span className="text-slate-700 font-medium dark:text-slate-100">
                          {formatSalary(job)}
                        </span>{" "}
                        · Tạo ngày {fmtDate(job.createdAt)}
                      </p>
                    </div>

                    <StatusPill status={job.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(job)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] hover:border-slate-900
                                 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                    >
                      Xem chi tiết
                    </button>

                    <button
                      type="button"
                      onClick={() => openApply(job)}
                      className="rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] hover:bg-slate-800
                                 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      Apply CV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}