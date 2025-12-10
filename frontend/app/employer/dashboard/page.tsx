"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/app/components/Pagination";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string };

type JobStatus = "OPEN" | "CLOSED";

type JobListItem = {
  id: number;
  title: string;
  createdAt: string; // ISO
  status: JobStatus;
  candidates?: number;
};

type EmployerJobsResponse = {
  employerId: number;
  companyName: string;
  jobs: JobListItem[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

function StatusPill({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, string> = { OPEN: "Đang mở", CLOSED: "Đã đóng" };

  const cls =
    status === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "CLOSED"
        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200";

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
  const [companyName, setCompanyName] = useState<string>("");

  const pageSize = 5;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));

  const pagedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return jobs.slice(start, start + pageSize);
  }, [jobs, page, pageSize]);

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

      const res = await axios.get<EmployerJobsResponse>(
        `${API_BASE_URL}/api/jobs/showJobEmployer`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          withCredentials: false,
        }
      );

      setCompanyName(res.data?.companyName || "");
      setJobs(Array.isArray(res.data?.jobs) ? res.data.jobs : []);

    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      console.error("FETCH JOBS FAIL:", {
        url: `${API_BASE_URL}/api/jobs/showJobEmployer`,
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
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Employer Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Quản lý job và xem danh sách ứng viên.
            </p>
          </div>

          <Link
            href="/employer/createjob"
            className="shrink-0 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800
                     dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            + Tạo job
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                          dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Doanh nghiệp</p>
              <p className="text-[20px] text-sm font-semibold text-slate-900 dark:text-slate-100">
                {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Job đã đăng</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{jobs.length} job</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                          dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Đang tải danh sách job...
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                          dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Chưa có job nào. Bấm{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">“Tạo job”</span> để đăng tin đầu tiên.
            </div>
          ) : (
            <div className="min-h-[480px] flex flex-col">
              <div className="space-y-2 flex-1">
                {pagedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition
                             hover:border-slate-900 hover:bg-white
                             dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-200 dark:hover:bg-slate-900/60"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 group-hover:underline dark:text-slate-100">
                          {job.title}
                        </p>
                        <StatusPill status={job.status} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tạo ngày {fmtDate(job.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Ứng viên</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {job.candidates ?? 0}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <Pagination page={page} totalPages={totalPages} basePath="/employer/dashboard" maxPagesToShow={3} />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}