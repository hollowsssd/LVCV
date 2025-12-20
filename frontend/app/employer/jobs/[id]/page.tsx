"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import ScheduleInterviewModal from "@/app/components/ScheduleInterviewModal";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string };

type JobStatus = "OPEN" | "CLOSED" | string;

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

type JobApplicationItem = {
  id: number;
  status: string;
  appliedAt: string;
  cvId: number | null;
  candidate: {
    id: number;
    fullName: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  // hỗ trợ cả kiểu mới (cvFileUrl) lẫn kiểu cũ (cv)
  cvFileUrl?: string | null;
  cv?: {
    id: number;
    title: string | null;
    fileUrl: string | null;
    fileType: string | null;
    score?: number | null;
    feedback?: string | null;
  } | null;
};

type JobApplicationsResponse = {
  jobId: number;
  jobTitle: string;
  applications: JobApplicationItem[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

function formatMoney(v?: number | null) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("vi-VN") + " ₫";
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  return v.length >= 10 ? v.slice(0, 10) : v;
}

function formatSalary(job: JobDetail) {
  if (job.isNegotiable) return "Thoả thuận";
  const min = job.salaryMin ?? null;
  const max = job.salaryMax ?? null;

  if (min === null && max === null) return "—";
  if (min !== null && max !== null)
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (min !== null) return `Từ ${formatMoney(min)}`;
  return `Đến ${formatMoney(max)}`;
}

function JobStatusBadge({ status }: { status?: JobStatus | null }) {
  const s = String(status || "").toUpperCase();
  const base = "inline-flex rounded-full text-[11px] px-2 py-0.5 border";

  if (s === "OPEN")
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200
                    dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60`}
      >
        Đang mở
      </span>
    );

  if (s === "CLOSED")
    return (
      <span
        className={`${base} bg-red-50 text-red-700 border-red-200
                    dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60`}
      >
        Đã đóng
      </span>
    );

  return (
    <span
      className={`${base} bg-slate-100 text-slate-700 border-slate-200
                  dark:bg-slate-950/40 dark:text-slate-200 dark:border-slate-800`}
    >
      {s || "—"}
    </span>
  );
}

// Badge trạng thái application
function ApplicationStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border";

  if (s === "interview_scheduled") {
    return (
      <span
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700
                    dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300`}
      >
        Đã hẹn phỏng vấn
      </span>
    );
  }

  if (s === "rejected") {
    return (
      <span
        className={`${base} border-rose-200 bg-rose-50 text-rose-700
                    dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300`}
      >
        Đã từ chối
      </span>
    );
  }

  if (s === "accepted") {
    return (
      <span
        className={`${base} border-sky-200 bg-sky-50 text-sky-700
                    dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300`}
      >
        Đã chấp nhận
      </span>
    );
  }

  return (
    <span
      className={`${base} border-slate-200 bg-slate-100 text-slate-700
                  dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200`}
    >
      Đang xử lý
    </span>
  );
}

// helpers dùng cho form
const toDateInput = (v?: string | null) =>
  v ? (v.length >= 10 ? v.slice(0, 10) : v) : "";
const toNumberOrNull = (s: string) => {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const norm = (s: string) => s.trim();

type JobFormState = {
  title: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  isNegotiable: boolean;
  location: string;
  jobType: string;
  experienceRequired: string;
  deadline: string; // YYYY-MM-DD
};

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

  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<JobDetail | null>(null);

  // form edit job
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<JobFormState>({
    title: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    isNegotiable: false,
    location: "",
    jobType: "",
    experienceRequired: "",
    deadline: "",
  });
  const [baselineForm, setBaselineForm] = useState<JobFormState | null>(null);
  const [saving, setSaving] = useState(false);

  // ứng viên apply vào job này
  const [apps, setApps] = useState<JobApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<number | null>(null);

  // State cho Schedule Interview Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<JobApplicationItem | null>(null);

  const resetFormFromJob = (j: JobDetail) => {
    setForm({
      title: j.title ?? "",
      description: j.description ?? "",
      salaryMin:
        j.salaryMin !== null && j.salaryMin !== undefined
          ? String(j.salaryMin)
          : "",
      salaryMax:
        j.salaryMax !== null && j.salaryMax !== undefined
          ? String(j.salaryMax)
          : "",
      isNegotiable: Boolean(j.isNegotiable),
      location: j.location ?? "",
      jobType: j.jobType ?? "",
      experienceRequired: j.experienceRequired ?? "",
      deadline: toDateInput(j.deadline),
    });
  };

  // validate dropdown
  const invalidSelect =
    norm(form.jobType) === "" || norm(form.experienceRequired) === "";

  // check form đã thay đổi chưa
  const changed = (() => {
    if (!baselineForm) return false;

    const a = {
      title: norm(form.title),
      description: norm(form.description),
      location: norm(form.location),
      jobType: norm(form.jobType),
      experienceRequired: norm(form.experienceRequired),
      deadline: norm(form.deadline),
      isNegotiable: form.isNegotiable,
      salaryMin: norm(form.salaryMin),
      salaryMax: norm(form.salaryMax),
    };

    const b = {
      title: norm(baselineForm.title),
      description: norm(baselineForm.description),
      location: norm(baselineForm.location),
      jobType: norm(baselineForm.jobType),
      experienceRequired: norm(baselineForm.experienceRequired),
      deadline: norm(baselineForm.deadline),
      isNegotiable: baselineForm.isNegotiable,
      salaryMin: norm(baselineForm.salaryMin),
      salaryMax: norm(baselineForm.salaryMax),
    };

    return JSON.stringify(a) !== JSON.stringify(b);
  })();

  const canConfirm = isEditing && !saving && !invalidSelect && changed;

  // load job detail
  useEffect(() => {
    const run = async () => {
      if (jobId === null) {
        setLoading(false);
        showToast(
          { type: "error", message: `Job id không hợp lệ: "${rawId}"` },
          2500
        );
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get<JobDetail>(
          `${API_BASE_URL}/api/jobs/${jobId}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        );

        setJob(res.data);
      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        showToast(
          {
            type: "error",
            message:
              err.response?.data?.message ??
              `Không thể tải job (HTTP ${err.response?.status ?? "?"})`,
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

  // Khi có job → đổ vào form
  useEffect(() => {
    if (!job) return;
    resetFormFromJob(job);
    setIsEditing(false);
  }, [job]);

  // load danh sách ứng viên apply job này
  useEffect(() => {
    if (jobId === null) return;

    const fetchApps = async () => {
      try {
        setAppsLoading(true);

        const res = await axios.get<JobApplicationsResponse>(
          `${API_BASE_URL}/api/applications/job/${jobId}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          }
        );

        setApps(
          Array.isArray(res.data.applications)
            ? res.data.applications
            : []
        );
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showToast(
          {
            type: "error",
            message:
              err.response?.data?.message ??
              "Không thể tải danh sách ứng viên của job này.",
          },
          2600
        );
      } finally {
        setAppsLoading(false);
      }
    };

    fetchApps();
  }, [jobId, token]);

  const putJob = async (payload: Partial<JobDetail>) => {
    if (jobId === null) throw new Error("Job id không hợp lệ");
    const res = await axios.put<JobDetail>(
      `${API_BASE_URL}/api/jobs/${jobId}`,
      payload,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      }
    );
    return res.data;
  };

  const buildPutPayload = (
    overrides: Partial<JobDetail> = {}
  ): Partial<JobDetail> => ({
    title: form.title,
    description: form.description,
    location: form.location || null,
    jobType: form.jobType || null,
    experienceRequired: form.experienceRequired || null,
    deadline: form.deadline || null,
    isNegotiable: form.isNegotiable,
    salaryMin: form.isNegotiable ? null : toNumberOrNull(form.salaryMin),
    salaryMax: form.isNegotiable ? null : toNumberOrNull(form.salaryMax),
    ...overrides,
  });

  const submitPut = async (overrides: Partial<JobDetail> = {}) => {
    try {
      setSaving(true);
      const updated = await putJob(buildPutPayload(overrides));
      setJob(updated);
      return updated;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      showToast(
        {
          type: "error",
          message:
            err.response?.data?.message ??
            `Thao tác thất bại (HTTP ${err.response?.status ?? "?"})`,
        },
        2600
      );
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const onStartEdit = () => {
    if (!job) return;
    resetFormFromJob(job);

    setBaselineForm({
      title: job.title ?? "",
      description: job.description ?? "",
      salaryMin:
        job.salaryMin !== null && job.salaryMin !== undefined
          ? String(job.salaryMin)
          : "",
      salaryMax:
        job.salaryMax !== null && job.salaryMax !== undefined
          ? String(job.salaryMax)
          : "",
      isNegotiable: Boolean(job.isNegotiable),
      location: job.location ?? "",
      jobType: job.jobType ?? "",
      experienceRequired: job.experienceRequired ?? "",
      deadline: toDateInput(job.deadline),
    });

    setIsEditing(true);
  };

  const onCancelEdit = () => {
    if (!job) return;
    resetFormFromJob(job);
    setBaselineForm(null);
    setIsEditing(false);
  };

  const onConfirmUpdate = async () => {
    if (!job) return;

    if (invalidSelect) {
      showToast(
        {
          type: "error",
          message: "Vui lòng chọn Vị trí ứng tuyển và Số năm kinh nghiệm.",
        },
        2200
      );
      return;
    }
    if (!changed) {
      showToast(
        { type: "error", message: "Bạn chưa thay đổi thông tin nào." },
        2200
      );
      return;
    }

    await submitPut();
    showToast({ type: "success", message: "Cập nhật job thành công." });
    setBaselineForm(null);
    setIsEditing(false);
  };

  const onToggleJobStatus = async () => {
    if (!job) return;

    const current = String(job.status || "").toUpperCase();
    const nextStatus: JobStatus = current === "CLOSED" ? "OPEN" : "CLOSED";

    await submitPut({ status: nextStatus });

    showToast({
      type: "success",
      message:
        nextStatus === "CLOSED"
          ? "Đã đóng công việc (status = CLOSED)."
          : "Đã mở công việc (status = OPEN).",
    });
  };

  // cập nhật trạng thái application (hẹn phỏng vấn / từ chối)
  const updateApplicationStatus = async (
    appId: number,
    newStatus: string
  ) => {
    try {
      setUpdatingAppId(appId);

      await axios.put(
        `${API_BASE_URL}/api/applications/${appId}`,
        { status: newStatus },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      setApps((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: newStatus } : a
        )
      );

      showToast({
        type: "success",
        message:
          newStatus === "interview_scheduled"
            ? "Đã hẹn phỏng vấn ứng viên."
            : newStatus === "rejected"
              ? "Đã từ chối ứng viên."
              : "Cập nhật trạng thái ứng viên thành công.",
      });
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      showToast(
        {
          type: "error",
          message:
            err.response?.data?.message ??
            `Không thể cập nhật trạng thái ứng viên (HTTP ${err.response?.status ?? "?"
            })`,
        },
        2600
      );
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Mở modal hẹn phỏng vấn
  const openInterviewModal = (app: JobApplicationItem) => {
    setSelectedAppForInterview(app);
    setInterviewModalOpen(true);
  };

  // Callback khi tạo interview thành công
  const handleInterviewSuccess = () => {
    if (selectedAppForInterview) {
      setApps((prev) =>
        prev.map((a) =>
          a.id === selectedAppForInterview.id
            ? { ...a, status: "interview_scheduled" }
            : a
        )
      );
    }
    showToast({
      type: "success",
      message: "Đã tạo lịch phỏng vấn và gửi thông báo cho ứng viên.",
    });
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/employer/dashboard"
            className="text-sm text-slate-600 hover:underline dark:text-slate-300 dark:hover:text-slate-100"
          >
            ← Quay lại Dashboard
          </Link>
        </div>

        {loading ? (
          <section
            className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                       dark:border-slate-800 dark:bg-slate-950/30"
          >
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Đang tải job...
            </div>
          </section>
        ) : !job ? (
          <section
            className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                       dark:border-slate-800 dark:bg-slate-950/30"
          >
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Không có dữ liệu job để hiển thị.
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            {/* JOB INFO */}
            <section
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5
                         dark:border-slate-800 dark:bg-slate-950/30"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEditing ? (
                      <input
                        value={form.title}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, title: e.target.value }))
                        }
                        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white px-3 py-2
                                   text-xl md:text-2xl font-semibold text-slate-900
                                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                      />
                    ) : (
                      <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {job.title}
                      </h1>
                    )}

                    <JobStatusBadge status={job.status} />
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {job.location || "—"} · {job.jobType || "—"}
                  </p>
                </div>
              </div>

              {/* Meta grid */}
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-800 dark:bg-slate-950/25"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Thông tin job
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {/* Địa điểm */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Địa điểm
                    </p>
                    {isEditing ? (
                      <input
                        value={form.location}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, location: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                        placeholder="VD: Hà Nội / Remote"
                      />
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                        {job.location || "—"}
                      </p>
                    )}
                  </div>

                  {/* Vị trí ứng tuyển */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Vị trí ứng tuyển
                    </p>
                    {isEditing ? (
                      <select
                        value={form.jobType}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, jobType: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                      >
                        <option value="">-- Chọn vị trí ứng tuyển --</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                        {job.jobType || "—"}
                      </p>
                    )}
                  </div>

                  {/* Kinh nghiệm */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kinh nghiệm
                    </p>
                    {isEditing ? (
                      <select
                        value={form.experienceRequired}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            experienceRequired: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                      >
                        <option value="">-- Chọn số năm kinh nghiệm --</option>
                        <option value="0-1 year">0-1 year</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="2-3 years">2-3 years</option>
                        <option value="3+ years">3+ years</option>
                      </select>
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                        {job.experienceRequired || "—"}
                      </p>
                    )}
                  </div>

                  {/* Hạn nộp */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hạn nộp
                    </p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, deadline: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                   dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                      />
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                        {formatDate(job.deadline ?? null)}
                      </p>
                    )}
                  </div>

                  {/* Lương */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lương
                    </p>

                    {isEditing ? (
                      <div className="mt-1 space-y-2">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={form.isNegotiable}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                isNegotiable: e.target.checked,
                              }))
                            }
                          />
                          Thoả thuận
                        </label>

                        {!form.isNegotiable && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              inputMode="numeric"
                              value={form.salaryMin}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  salaryMin: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                         dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                              placeholder="Min"
                            />
                            <input
                              inputMode="numeric"
                              value={form.salaryMax}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  salaryMax: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900
                                         dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                              placeholder="Max"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                        {formatSalary(job)}
                      </p>
                    )}
                  </div>

                  {/* Tạo lúc */}
                  <div
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2
                               dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tạo lúc
                    </p>
                    <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-words">
                      {formatDate(job.createdAt ?? null)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Mô tả công việc
                </p>
                {isEditing ? (
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 leading-relaxed
                               dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                  />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.description || "—"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={onStartEdit}
                      className="
                        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
                        border border-slate-200 bg-slate-900 text-white shadow-sm
                        hover:bg-slate-800 hover:border-slate-900
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60
                        dark:border-slate-800 dark:bg-slate-100 dark:text-slate-900
                        dark:hover:bg-white dark:hover:border-slate-200
                        dark:focus-visible:ring-slate-500/40
                      "
                    >
                      Cập nhật
                    </button>

                    <button
                      type="button"
                      onClick={onToggleJobStatus}
                      disabled={saving}
                      className={`
                        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
                        border shadow-sm transition
                        focus:outline-none focus-visible:ring-2
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${String(job.status || "").toUpperCase() === "CLOSED"
                          ? `
                              border-emerald-200 bg-emerald-50 text-emerald-700
                              hover:bg-emerald-100 hover:border-emerald-300
                              focus-visible:ring-emerald-300/50
                              dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300
                              dark:hover:bg-emerald-950/55 dark:hover:border-emerald-700
                              dark:focus-visible:ring-emerald-500/30
                            `
                          : `
                              border-rose-200 bg-rose-50 text-rose-700
                              hover:bg-rose-100 hover:border-rose-300
                              focus-visible:ring-rose-300/50
                              dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300
                              dark:hover:bg-rose-950/55 dark:hover:border-rose-700
                              dark:focus-visible:ring-rose-500/30
                            `
                        }
                      `}
                    >
                      {String(job.status || "").toUpperCase() === "CLOSED"
                        ? "Mở công việc"
                        : "Đóng công việc"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onConfirmUpdate}
                      disabled={!canConfirm}
                      className={`
                        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
                        border shadow-sm transition
                        focus:outline-none focus-visible:ring-2
                        disabled:cursor-not-allowed disabled:opacity-50
                        ${canConfirm
                          ? `
                            border-emerald-600 bg-emerald-600 text-white
                            hover:bg-emerald-700 hover:border-emerald-700
                            focus-visible:ring-emerald-500
                            dark:border-emerald-500 dark:bg-emerald-600
                            dark:hover:bg-emerald-700 dark:hover:border-emerald-700
                            dark:focus-visible:ring-emerald-400
                          `
                          : `
                            border-slate-300 bg-slate-200 text-slate-700
                            focus-visible:ring-slate-400/60
                            dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200
                            dark:focus-visible:ring-slate-400/60
                          `
                        }
                      `}
                    >
                      {saving ? "Đang lưu..." : "Xác nhận"}
                    </button>

                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
                               bg-slate-200 text-slate-900 shadow-sm hover:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed
                               dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* APPLICATIONS */}
            <section
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                         dark:border-slate-800 dark:bg-slate-950/30"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Ứng viên đã ứng tuyển
              </p>

              {appsLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Đang tải danh sách ứng viên...
                </p>
              ) : apps.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có ứng viên nào ứng tuyển job này.
                </p>
              ) : (
                <div className="space-y-3">
                  {apps.map((a) => {
                    const isInterviewed =
                      a.status === "interview_scheduled";
                    const isRejected = a.status === "rejected";
                    const isUpdating = updatingAppId === a.id;

                    // ====== BUILD CV URL CHUẨN 8080 ======
                    const rawUrl =
                      a.cv?.fileUrl ?? a.cvFileUrl ?? null;
                    let cvHref: string | null = null;

                    if (rawUrl) {
                      if (
                        rawUrl.startsWith("http://") ||
                        rawUrl.startsWith("https://")
                      ) {
                        cvHref = rawUrl;
                      } else {
                        const base = API_BASE_URL.replace(/\/$/, "");
                        const path = rawUrl.startsWith("/")
                          ? rawUrl
                          : `/${rawUrl}`;
                        cvHref = `${base}${path}`;
                      }
                    }
                    // ======================================

                    return (
                      <div
                        key={a.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3
                                   dark:border-slate-700 dark:bg-slate-900/60"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          {/* Thông tin ứng viên + trạng thái */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {a.candidate?.fullName ||
                                  "Ứng viên chưa có tên"}
                              </p>
                              <ApplicationStatusBadge status={a.status} />
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Email: {a.candidate?.email || "—"} · SĐT:{" "}
                              {a.candidate?.phone || "—"}
                            </p>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Ngày ứng tuyển: {formatDate(a.appliedAt)}
                            </p>



                            {/* Buttons hành động */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {/* Hẹn phỏng vấn */}
                              <button
                                type="button"
                                onClick={() => openInterviewModal(a)}
                                disabled={
                                  isUpdating ||
                                  isInterviewed ||
                                  isRejected
                                }
                                className={`
                                  inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium
                                  border transition
                                  ${isInterviewed
                                    ? "border-emerald-500 bg-emerald-500 text-white opacity-80 cursor-default"
                                    : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600"
                                  }
                                  disabled:opacity-60 disabled:cursor-not-allowed
                                `}
                              >
                                {isInterviewed
                                  ? "Đã hẹn phỏng vấn"
                                  : isUpdating
                                    ? "Đang xử lý..."
                                    : "📅 Hẹn phỏng vấn"}
                              </button>

                              {/* Từ chối */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateApplicationStatus(
                                    a.id,
                                    "rejected"
                                  )
                                }
                                disabled={isUpdating || isRejected}
                                className={`
                                  inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium
                                  border transition
                                  ${isRejected
                                    ? "border-rose-500 bg-rose-500 text-white opacity-80 cursor-default"
                                    : "border-rose-500 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-600"
                                  }
                                  disabled:opacity-60 disabled:cursor-not-allowed
                                `}
                              >
                                {isRejected
                                  ? "Đã từ chối"
                                  : isUpdating
                                    ? "Đang xử lý..."
                                    : "Từ chối"}
                              </button>
                            </div>
                          </div>

                          {/* Thông tin CV */}
                          <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">


                            {a.cv?.title && (
                              <p className="font-medium">
                                {a.cv.title}
                              </p>
                            )}

                            {cvHref && (
                              <a
                                href={cvHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium
                                           border border-slate-300 bg-white text-slate-800
                                           hover:bg-slate-100 hover:border-slate-400
                                           dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                              >
                                Xem CV
                              </a>
                            )}

                            {typeof a.cv?.score === "number" && (
                              <p>Score: {a.cv.score}</p>
                            )}

                            {a.cv?.feedback && (
                              <p className="max-w-[220px] text-[11px] italic">
                                Nhận xét: {a.cv.feedback}
                              </p>
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
        )}
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        open={interviewModalOpen}
        onClose={() => {
          setInterviewModalOpen(false);
          setSelectedAppForInterview(null);
        }}
        applicationId={selectedAppForInterview?.id ?? 0}
        candidateName={selectedAppForInterview?.candidate?.fullName ?? "Ứng viên"}
        jobTitle={job?.title ?? ""}
        onSuccess={handleInterviewSuccess}
        onError={(msg) => showToast({ type: "error", message: msg })}
      />
    </>
  );
}