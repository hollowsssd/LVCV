"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import { useRouter, useSearchParams } from "next/navigation";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string };

type JobStatus = "OPEN" | "CLOSED" | "DRAFT";

type JobListItem = {
  id: number;
  title: string;
  createdAt: string; // ISO
  status: JobStatus;
  candidates?: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

function StatusPill({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, string> = { OPEN: "Đang mở", CLOSED: "Đã đóng", DRAFT: "Nháp" };

  const cls =
    status === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "CLOSED"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      {map[status]}
    </span>
  );
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export default function EmployerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCreate = searchParams.get("created");

  const [toast, setToast] = useState<ToastState>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const token = useMemo(() => Cookies.get("token") || "", []);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (t: ToastState, ms = 1400) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await axios.get<JobListItem[]>(`${API_BASE_URL}/api/jobs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: false,
      });

      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      console.error("FETCH JOBS FAIL:", {
        url: `${API_BASE_URL}/api/jobs`,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      showToast(
        { type: "error", message: err.response?.data?.message ?? "Không thể tải danh sách job." },
        2200
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fromCreate === "1") {
      showToast({ type: "success", message: "Tạo job thành công và đã cập nhật dashboard." }, 1400);
      router.replace("/employer/dashboard");
      // (optional) refresh list lần nữa
      fetchJobs();
    }
  }, [fromCreate, router]);

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Employer Dashboard</h1>
            <p className="text-sm text-slate-500">Quản lý job và xem danh sách ứng viên.</p>
          </div>

          <Link
            href="/employer/createjob"
            className="shrink-0 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800"
          >
            + Tạo job
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Job đã đăng</h2>
            <span className="text-[11px] text-slate-500">{jobs.length} job</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
              Đang tải danh sách job...
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
              Chưa có job nào. Bấm <span className="font-medium">“Tạo job”</span> để đăng tin đầu tiên.
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/employer/jobs/${job.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:border-slate-900 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 group-hover:underline">
                        {job.title}
                      </p>
                      <StatusPill status={job.status} />
                    </div>
                    <p className="text-xs text-slate-500">Tạo ngày {fmtDate(job.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Ứng viên</p>
                    <p className="text-sm font-semibold text-slate-900">{job.candidates ?? 0}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}