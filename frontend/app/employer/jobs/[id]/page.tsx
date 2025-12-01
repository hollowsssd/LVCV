"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string };

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | string;

type JobDetail = {
  id: number;
  title: string;
  description: string;

  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable?: boolean | null;

  location?: string | null;
  jobType?: string | null;
  experienceRequired?: string | null;
  deadline?: string | null; // YYYY-MM-DD or ISO
  status?: JobStatus | null;

  companyName?: string | null;
  createdAt?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

function formatMoney(v?: number | null) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("vi-VN") + " ₫";
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  // hỗ trợ "YYYY-MM-DD" hoặc ISO
  return v.length >= 10 ? v.slice(0, 10) : v;
}

function formatSalary(job: JobDetail) {
  if (job.isNegotiable) return "Thoả thuận";
  const min = job.salaryMin ?? null;
  const max = job.salaryMax ?? null;

  if (min === null && max === null) return "—";
  if (min !== null && max !== null) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (min !== null) return `Từ ${formatMoney(min)}`;
  return `Đến ${formatMoney(max)}`;
}

function JobStatusBadge({ status }: { status?: JobStatus | null }) {
  const s = String(status || "").toUpperCase();
  const base = "inline-flex rounded-full text-[11px] px-2 py-0.5 border";

  if (s === "OPEN")
    return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Đang mở</span>;
  if (s === "CLOSED")
    return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Đã đóng</span>;
  if (s === "DRAFT")
    return <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>Nháp</span>;

  return <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>{s || "—"}</span>;
}

export default function EmployerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id ?? "";

  const jobId = useMemo(() => {
    if (typeof rawId !== "string") return null;
    if (!/^\d+$/.test(rawId)) return null;
    const n = Number(rawId);
    return Number.isFinite(n) ? n : null;
  }, [rawId]);

  const token = useMemo(() => Cookies.get("token") || "", []);

  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<JobDetail | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (t: ToastState, ms = 1800) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (jobId === null) {
        setLoading(false);
        showToast({ type: "error", message: `Job id không hợp lệ: "${rawId}"` }, 2500);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get<JobDetail>(`${API_BASE_URL}/api/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        setJob(res.data);
      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        showToast(
          {
            type: "error",
            message: err.response?.data?.message ?? `Không thể tải job (HTTP ${err.response?.status ?? "?"})`,
          },
          2600
        );
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [jobId, rawId, token]);

  const metaRows = useMemo(() => {
    if (!job) return [];
    const rows: Array<{ label: string; value: string }> = [];
    rows.push({ label: "Công ty", value: job.companyName || "—" });
    rows.push({ label: "Địa điểm", value: job.location || "—" });
    rows.push({ label: "Hình thức", value: job.jobType || "—" });
    rows.push({ label: "Kinh nghiệm", value: job.experienceRequired || "—" });
    rows.push({ label: "Lương", value: formatSalary(job) });
    rows.push({ label: "Hạn nộp", value: formatDate(job.deadline ?? null) });
    rows.push({ label: "Tạo lúc", value: formatDate(job.createdAt ?? null) });
    return rows;
  }, [job]);

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/employer/dashboard" className="text-sm text-slate-600 hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="text-sm text-slate-600">Đang tải job...</div>
          </section>
        ) : !job ? (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="text-sm text-slate-600">Không có dữ liệu job để hiển thị.</div>
          </section>
        ) : (
          <div className="space-y-8">
            {/* JOB INFO */}
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{job.title}</h1>
                    <JobStatusBadge status={job.status} />
                  </div>

                  <p className="text-sm text-slate-500">
                    {job.location || "—"} · {job.jobType || "—"}
                  </p>
                </div>

             
              </div>

              {/* Meta grid */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold text-slate-900 mb-3">Thông tin job</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {metaRows.map((m) => (
                    <div key={m.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <p className="text-[11px] text-slate-500">{m.label}</p>
                      <p className="mt-0.5 font-medium text-slate-900 break-words">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary details (nếu không negotiable) */}
             

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-900">Mô tả công việc</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description || "—"}</p>
              </div>
            </section>

            {/* (Optional) chỗ này sau nối API applications */}
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 mb-2">Ứng viên</p>
              <p className="text-xs text-slate-500">
                (Chưa nối API applications) 
              </p>
            </section>
          </div>
        )}
      </div>
    </>
  );
}