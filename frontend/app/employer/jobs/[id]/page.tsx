"use client";

import { useMemo, useState } from "react";
import Toast from "@/app/components/Toast";

type ToastState = { type: "success" | "error"; message: string } | null;

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | string;

type Job = {
  // DB fields
  title: string;
  description: string;

  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable?: boolean | null;

  location?: string | null;
  jobType?: string | null;
  experienceRequired?: string | null;
  deadline?: string | null; // YYYY-MM-DD
  status?: JobStatus | null;

  // optional (nếu BE join employer)
  companyName?: string;
};

type Application = {
  id: number;
  candidateName: string;
  cvScore: number;
  status: "applied" | "interview" | "rejected";
  appliedAt: string;
};

// ===== DEMO DATA (sau này thay bằng API) =====
const mockJob: Job = {
  title: "Backend Intern (Node.js)",
  description:
    "Thực tập sinh Backend tham gia phát triển API cho hệ thống nội bộ, sử dụng Node.js, Express, PostgreSQL. Làm việc với team để xây dựng, tối ưu endpoint và xử lý bảo mật cơ bản.",
  companyName: "LVCV Tech",
  salaryMin: null,
  salaryMax: null,
  isNegotiable: true,
  location: "Ho Chi Minh",
  jobType: "Onsite",
  experienceRequired: "0-1 year",
  deadline: "2025-12-31",
  status: "OPEN",
};

const mockApplications: Application[] = [
  {
    id: 101,
    candidateName: "Nguyễn Văn A",
    cvScore: 84,
    status: "applied",
    appliedAt: "2025-11-21 08:00",
  },
  {
    id: 102,
    candidateName: "Lê Văn C",
    cvScore: 76,
    status: "interview",
    appliedAt: "2025-11-20 15:30",
  },
];
// ============================================

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

function JobStatusBadge({ status }: { status?: JobStatus | null }) {
  const s = String(status || "").toUpperCase();
  const base = "inline-flex rounded-full text-[11px] px-2 py-0.5 border";

  if (s === "OPEN")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        Đang mở
      </span>
    );
  if (s === "CLOSED")
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        Đã đóng
      </span>
    );
  if (s === "DRAFT")
    return (
      <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>
        Nháp
      </span>
    );

  return (
    <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>
      {s || "—"}
    </span>
  );
}

function AppStatusBadge({ status }: { status: Application["status"] }) {
  if (status === "applied")
    return (
      <span className="inline-flex rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 border border-slate-200">
        Đã nộp
      </span>
    );
  if (status === "interview")
    return (
      <span className="inline-flex rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 border border-emerald-200">
        Hẹn phỏng vấn
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-red-50 text-red-700 text-[11px] px-2 py-0.5 border border-red-200">
      Đã từ chối
    </span>
  );
}

export default function EmployerJobDetailPage() {
  const job = mockJob;

  const [toast, setToast] = useState<ToastState>(null);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Meta: hiển thị đúng các field DB Jobs + companyName nếu có
  const jobMeta = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];

    if (job.companyName) rows.push({ label: "Công ty", value: job.companyName });

    rows.push({ label: "Địa điểm", value: job.location || "—" });
    rows.push({ label: "Hình thức", value: job.jobType || "—" });
    rows.push({ label: "Kinh nghiệm", value: job.experienceRequired || "—" });
    rows.push({ label: "Lương", value: formatSalary(job) });
    rows.push({ label: "Deadline", value: job.deadline || "—" });

    return rows;
  }, [job]);

  const handleUpdateStatus = async (appId: number, newStatus: Application["status"]) => {
    try {
      setUpdatingId(appId);

      // TODO: CALL API thật (PATCH status)
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));

      const msg =
        newStatus === "interview"
          ? "Đã chuyển trạng thái sang 'Hẹn phỏng vấn'."
          : newStatus === "rejected"
          ? "Đã từ chối ứng viên này."
          : "Đã đặt lại trạng thái 'Đã nộp'.";

      setToast({ type: "success", message: msg });
    } catch {
      setToast({ type: "error", message: "Không thể cập nhật trạng thái. Vui lòng thử lại." });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

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

            <p className="text-[11px] text-slate-500 max-w-[320px] md:text-right">
              Job này dùng mô tả để AI sinh embedding, rồi matching với CV ứng viên.
            </p>
          </div>

          {/* Meta grid */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold text-slate-900 mb-3">Thông tin job</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {jobMeta.map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[11px] text-slate-500">{m.label}</p>
                  <p className="mt-0.5 font-medium text-slate-900 break-words">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Salary details (nếu không negotiable) */}
          {!job.isNegotiable && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] text-slate-500">Salary Min</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatMoney(job.salaryMin)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] text-slate-500">Salary Max</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatMoney(job.salaryMax)}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900">Mô tả công việc</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description || "—"}
            </p>
          </div>
        </section>

        {/* APPLICATIONS */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Ứng viên đã nộp CV</h2>
            <span className="text-[11px] text-slate-500">{applications.length} ứng viên</span>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có ứng viên nào nộp CV.</p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">{app.candidateName}</p>
                    <p className="text-xs text-slate-500">
                      CV Score: {app.cvScore}/100 · Nộp lúc {app.appliedAt}
                    </p>
                    <div className="mt-1">
                      <AppStatusBadge status={app.status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] justify-start md:justify-end">
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 hover:border-slate-900"
                    >
                      Xem CV & AI feedback
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "interview")}
                      disabled={updatingId === app.id}
                      className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 hover:border-emerald-500 disabled:opacity-60"
                    >
                      {updatingId === app.id && app.status !== "interview" ? "Đang..." : "Hẹn PV"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "rejected")}
                      disabled={updatingId === app.id}
                      className="rounded-full border border-red-200 bg-red-50 text-red-700 px-3 py-1 hover:border-red-500 disabled:opacity-60"
                    >
                      {updatingId === app.id && app.status !== "rejected" ? "Đang..." : "Từ chối"}
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