"use client";

import InterviewDetailModal from "@/app/components/InterviewDetailModal";
import Pagination from "@/app/components/Pagination";
import Toast from "@/app/components/Toast";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string };

// ================= Types =================

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

type InterviewItem = {
  id: number;
  applicationId: number;
  scheduledAt: string;
  jitsiRoomUrl: string;
  notes: string | null;
  status: string;
  isUpcoming: boolean;
  candidate: {
    id: number;
    fullName: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  job: {
    id: number;
    title: string;
  } | null;
  createdAt: string;
};

// hồ sơ công ty (tùy BE, dùng các field cơ bản)
type EmployerMe = {
  id: number;
  userId: number;
  companyName: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

// ================= Utils =================

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

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return iso.slice(0, 10);
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ================= Component =================

export default function EmployerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCreate = searchParams.get("created");

  const [toast, setToast] = useState<ToastState>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // hồ sơ công ty
  const [employer, setEmployer] = useState<EmployerMe | null>(null);

  // tên công ty dùng trong header job (ưu tiên từ employer nếu có)
  const [companyName, setCompanyName] = useState<string>("");

  // State for interviews
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

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

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1) Lấy danh sách job employer
      try {
        const res = await axios.get<EmployerJobsResponse>(
          `${API_BASE_URL}/api/jobs/showJobEmployer`,
          {
            headers,
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
      }

      // 2) Lấy hồ sơ công ty (employer profile)
      try {
        const resEmp = await axios.get<EmployerMe>(`${API_BASE_URL}/api/employers/me`, {
          headers,
          withCredentials: false,
        });

        setEmployer(resEmp.data ?? null);
        if (resEmp.data?.companyName) {
          setCompanyName(resEmp.data.companyName);
        }
      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        console.error("FETCH EMPLOYER PROFILE FAIL:", {
          url: `${API_BASE_URL}/api/employers/me`,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        // Không show lỗi to, chỉ log + để UI hiển thị "Không có dữ liệu công ty."
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!token) return;
      try {
        setInterviewsLoading(true);
        const res = await axios.get<{ upcoming: InterviewItem[]; past: InterviewItem[] }>(
          `${API_BASE_URL}/api/interviews/employer-list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInterviews([...(res.data.upcoming || []), ...(res.data.past || [])]);
      } catch {
        // ignore - interviews section is optional
      } finally {
        setInterviewsLoading(false);
      }
    };
    fetchInterviews();
  }, [token]);

  useEffect(() => {
    if (fromCreate === "1") {
      showToast(
        { type: "success", message: "Tạo job thành công và đã cập nhật dashboard." },
        1400
      );
      router.replace("/employer/dashboard");
      fetchDashboardData();
    }
  }, [fromCreate, router]);

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        {/* Header */}
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

        {/* ========== Hồ sơ công ty ========== */}
        <section
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                     dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Hồ sơ công ty
            </h2>
          </div>

          {!employer ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                         dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
            >
              Không có dữ liệu công ty. (Sau này có form chỉnh sửa hồ sơ công ty ở đây)
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                              dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Tên công ty</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(employer.companyName ?? companyName)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                              dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Ngành nghề</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(employer.industry)}
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Địa chỉ</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {safeText(employer.location)}
                </p>
              </div>



              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2
                           dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">Giới thiệu công ty</p>
                <p className="mt-1 text-slate-700 whitespace-pre-line dark:text-slate-200">
                  {safeText(employer.description)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ========== Job đã đăng ========== */}
        <section
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                    dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Doanh nghiệp</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {safeText(companyName)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Job đã đăng</h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {jobs.length} job
            </span>
          </div>

          {loading ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                         dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
            >
              Đang tải danh sách job...
            </div>
          ) : jobs.length === 0 ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600
                         dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
            >
              Chưa có job nào. Bấm{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">“Tạo job”</span> để
              đăng tin đầu tiên.
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="space-y-2">
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
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/employer/dashboard"
                  maxPagesToShow={3}
                />
              </div>
            </div>
          )}
        </section>

        {/* ========== Lịch phỏng vấn đã hẹn ========== */}
        <section
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                    dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              📋 Lịch phỏng vấn đã hẹn
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {interviews.length} lịch hẹn
            </span>
          </div>

          {interviewsLoading ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Đang tải lịch phỏng vấn...
            </div>
          ) : interviews.length === 0 ? (
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                         dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
            >
              Chưa có lịch phỏng vấn nào.
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((iv) => {
                const scheduleDate = new Date(iv.scheduledAt);
                const isUpcoming = scheduleDate > new Date() && iv.status === 'scheduled';
                const dateStr = scheduleDate.toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
                const timeStr = scheduleDate.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={iv.id}
                    className={cn(
                      "rounded-2xl border p-4 cursor-pointer transition hover:shadow-md",
                      isUpcoming
                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                        : "border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/60"
                    )}
                    onClick={() => {
                      setSelectedInterview(iv);
                      setShowInterviewModal(true);
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {iv.candidate?.fullName || "Ứng viên không xác định"}
                          </p>
                          {isUpcoming && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                                             border border-emerald-500 bg-emerald-500 text-white">
                              Sắp diễn ra
                            </span>
                          )}
                          {iv.status === 'cancelled' && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                                             border border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                              Đã huỷ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Vị trí: {iv.job?.title || "—"}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          📅 {dateStr} lúc {timeStr}
                        </p>
                      </div>
                      <div className="text-right">
                        {isUpcoming && (
                          <a
                            href={iv.jitsiRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white
                                       px-3 py-1.5 text-xs font-medium hover:bg-blue-700
                                       dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            🌐 Tham gia
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Interview Detail Modal */}
      <InterviewDetailModal
        open={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedInterview(null);
        }}
        interview={selectedInterview}
        viewAs="employer"
      />
    </>
  );
}