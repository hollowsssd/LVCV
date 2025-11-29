"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Toast from "@/app/components/Toast";

type ToastState = { type: "success" | "error"; message: string } | null;

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | string;

type Job = {
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

  companyName?: string;
};

type Application = {
  id: number;
  candidateName: string;
  cvScore: number;
  status: "applied" | "interview" | "rejected";
  appliedAt: string;

  // file CV snapshot lúc apply
  cvFileUrl?: string | null; // ví dụ "/uploads/cvs/CVTTDN.pdf"
  cvFileType?: string | null; // "pdf"
};

// ===== DEMO DATA (tĩnh) =====
const mockJob: Job = {
  title: "Backend Intern (Node.js)",
  description:
    "Thực tập sinh Backend tham gia phát triển API cho hệ thống nội bộ, sử dụng Node.js, Express, PostgreSQL.",
  companyName: "LVCV Tech",
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
    // ✅ ĐÚNG file bạn vừa đưa vào public/uploads/cvs
    cvFileUrl: "/cvs/CVTTDN.pdf",
    cvFileType: "pdf",
  },
  {
    id: 102,
    candidateName: "Lê Văn C",
    cvScore: 76,
    status: "interview",
    appliedAt: "2025-11-20 15:30",
    // demo file khác (nếu chưa có thì để null cũng được)
    cvFileUrl: null,
    cvFileType: "pdf",
  },
];
// ============================

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
    return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Đang mở</span>;
  if (s === "CLOSED")
    return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Đã đóng</span>;
  if (s === "DRAFT")
    return <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>Nháp</span>;

  return <span className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>{s || "—"}</span>;
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

/** ✅ Modal xem CV PDF */
function CvPdfModal({
  open,
  onClose,
  app,
}: {
  open: boolean;
  onClose: () => void;
  app: Application | null;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !app) return null;

  const resolved = app.cvFileUrl || "";
  const type = (app.cvFileType || "").toLowerCase();
  const isPdf = type === "pdf" || resolved.toLowerCase().includes(".pdf");

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">CV Snapshot lúc ứng viên nộp</p>
              <h3 className="text-base font-semibold text-slate-900">{app.candidateName}</h3>
              <p className="text-[11px] text-slate-500">CV Score: {app.cvScore}/100</p>
            </div>

            <div className="flex items-center gap-2">
              {resolved ? (
                <>
                  <a
                    href={resolved}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
                  >
                    Mở tab mới
                  </a>
                  <a
                    href={resolved}
                    download
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
                  >
                    Tải xuống
                  </a>
                </>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
              >
                ✕ Đóng
              </button>
            </div>
          </div>

          {/* body */}
          <div className="p-4">
            {!resolved ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Ứng viên này chưa có cvFileUrl.
              </div>
            ) : isPdf ? (
              <div className="h-[72vh] rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                <iframe title="CV PDF" src={resolved} className="h-full w-full" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                File không phải PDF. Hãy bấm “Mở tab mới”.
              </div>
            )}
          </div>

          <div className="px-5 pb-4 text-[11px] text-slate-500">
            * Nếu không mở được: kiểm tra file nằm đúng <b>public/uploads/cvs/CVTTDN.pdf</b> và truy cập thử trực tiếp URL.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployerJobDetailPage() {
  const job = mockJob;

  const [toast, setToast] = useState<ToastState>(null);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // modal state
  const [cvOpen, setCvOpen] = useState(false);
  const [cvTarget, setCvTarget] = useState<Application | null>(null);

  // toast auto close
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (next: ToastState, autoCloseMs = 1200) => {
    setToast(next);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), autoCloseMs);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const jobMeta = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];
    if (job.companyName) rows.push({ label: "Công ty", value: job.companyName });
    rows.push({ label: "Địa điểm", value: job.location || "—" });
    rows.push({ label: "Hình thức", value: job.jobType || "—" });
    rows.push({ label: "Kinh nghiệm", value: job.experienceRequired || "—" });
    rows.push({ label: "Lương", value: formatSalary(job) });
    rows.push({ label: "Hạn nộp", value: job.deadline || "—" });
    return rows;
  }, [job]);

  const openCv = (app: Application) => {
    if (!app.cvFileUrl) {
      showToast({ type: "error", message: "Ứng viên này chưa có file CV." }, 1500);
      return;
    }
    setCvTarget(app);
    setCvOpen(true);
  };

  const closeCv = () => {
    setCvOpen(false);
    setCvTarget(null);
  };

  const handleUpdateStatus = async (appId: number, newStatus: Application["status"]) => {
    try {
      setUpdatingId(appId);

      // demo update local
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));

      const msg =
        newStatus === "interview"
          ? "Đã chuyển trạng thái sang 'Hẹn phỏng vấn'."
          : newStatus === "rejected"
          ? "Đã từ chối ứng viên này."
          : "Đã đặt lại 'Đã nộp'.";

      showToast({ type: "success", message: msg }, 1200);
    } catch {
      showToast({ type: "error", message: "Không thể cập nhật trạng thái." }, 1500);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <CvPdfModal open={cvOpen} onClose={closeCv} app={cvTarget} />

      <div className="space-y-8">
        {/* JOB INFO */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5">
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
              Demo tĩnh: bấm “Xem CV” để mở PDF snapshot.
            </p>
          </div>

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

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900">Mô tả công việc</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description || "—"}</p>
          </div>
        </section>

        {/* APPLICATIONS */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Ứng viên đã nộp CV</h2>
            <span className="text-[11px] text-slate-500">{applications.length} ứng viên</span>
          </div>

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
                    onClick={() => openCv(app)}
                  >
                    Xem CV (PDF)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(app.id, "interview")}
                    disabled={updatingId === app.id}
                    className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 hover:border-emerald-500 disabled:opacity-60"
                  >
                    {updatingId === app.id ? "Đang..." : "Hẹn PV"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(app.id, "rejected")}
                    disabled={updatingId === app.id}
                    className="rounded-full border border-red-200 bg-red-50 text-red-700 px-3 py-1 hover:border-red-500 disabled:opacity-60"
                  >
                    {updatingId === app.id ? "Đang..." : "Từ chối"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}