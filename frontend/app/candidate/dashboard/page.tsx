"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import Toast from "@/app/components/Toast";
import type { CvEvaluateReport, RateCvApiRes } from "@/app/candidate/cv/types";
import { normalizeRateCv } from "@/app/candidate/cv/types";

type ToastState = { type: "success" | "error"; message: string } | null;
type ApiErrorResponse = { message?: string; detail?: string };

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  match: number; // 0–1
};

const mockJobs: Job[] = [
  { id: 1, title: "Backend Intern", company: "ABC Software", location: "HCMC", match: 0.91 },
  { id: 2, title: "Node.js Developer (Junior)", company: "XYZ Tech", location: "Remote", match: 0.84 },
  { id: 3, title: "Fullstack Intern (React/Node)", company: "Cool Startup", location: "HCMC", match: 0.79 },
];

type PendingEvaluation = {
  file: File;
  jobTitleInput: string; // job title user nhập
  evaluated: CvEvaluateReport; // full report
  evaluatedAtIso: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function InlineAlert({ t }: { t: ToastState }) {
  if (!t) return null;
  const cls =
    t.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", cls)}>
      <p className="font-semibold">{t.type === "success" ? "✅ Thành công" : "⚠️ Có lỗi xảy ra"}</p>
      <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">{t.message}</p>
    </div>
  );
}

function UploadEvaluateModal(props: {
  open: boolean;
  onClose: () => void;
  token: string;
  toast: (t: ToastState, ms?: number) => void; // toast global (ngoài modal)
  onEvaluated: (pending: PendingEvaluation) => void;
}) {
  const { open, onClose, token, toast, onEvaluated } = props;

  const [jobTitle, setJobTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // ✅ message hiển thị ngay trong modal
  const [inlineMsg, setInlineMsg] = useState<ToastState>(null);

  useEffect(() => {
    if (!open) return;
    setJobTitle("");
    setFile(null);
    setEvaluating(false);
    setInlineMsg(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canEvaluate = Boolean(file) && jobTitle.trim().length > 0 && !evaluating;

  const handleEvaluate = async () => {
    setInlineMsg(null);

    if (!file || !jobTitle.trim()) {
      setInlineMsg({ type: "error", message: "Vui lòng chọn file CV và nhập Job title mong muốn." });
      return;
    }
    if (!token) {
      setInlineMsg({ type: "error", message: "Bạn cần đăng nhập Candidate để đánh giá CV." });
      return;
    }

    try {
      setEvaluating(true);

      const form = new FormData();
      form.append("cvfile", file);
      form.append("job_title", jobTitle.trim());

      const res = await axios.post<RateCvApiRes>(`${API_BASE}/api/cvs/rate-cv`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const report = normalizeRateCv(res.data);

      if (Number.isNaN(report.score)) {
        setInlineMsg({ type: "error", message: "Kết quả đánh giá lỗi (thiếu diem_tong)." });
        return;
      }

      const pending: PendingEvaluation = {
        file,
        jobTitleInput: jobTitle.trim(),
        evaluated: report,
        evaluatedAtIso: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(
          "cv_report_draft",
          JSON.stringify({
            jobTitleInput: pending.jobTitleInput,
            evaluatedAtIso: pending.evaluatedAtIso,
            fileName: pending.file.name,
            report: pending.evaluated,
          })
        );
      } catch {
        // ignore
      }

      onEvaluated(pending);

      // ✅ Hiện success ngay trong modal trước khi đóng
      setInlineMsg({ type: "success", message: "Đánh giá CV thành công!" });

      // Đóng modal luôn (nếu muốn nhìn success 0.6s rồi đóng)
      setTimeout(() => {
        onClose();
        toast({ type: "success", message: "Đánh giá CV thành công!" }, 1200); // toast global để user thấy ngoài dashboard
      }, 450);
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      const msg =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        "Đánh giá CV thất bại.";
      setInlineMsg({ type: "error", message: msg });
    } finally {
      setEvaluating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Upload CV mới</p>
              <h3 className="text-base font-semibold text-slate-900">Đánh giá CV theo Job mong muốn</h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:border-slate-900"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* ✅ Alert trong form */}
            {inlineMsg && <InlineAlert t={inlineMsg} />}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  File CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  {file ? `Đã chọn: ${file.name}` : "Chọn PDF/DOC/DOCX."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Job title mong muốn <span className="text-red-500">*</span>
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ví dụ: Backend Intern / Node.js Junior..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500">Dùng để AI chấm theo mục tiêu cụ thể.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!canEvaluate}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium",
                  canEvaluate
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-300 text-white cursor-not-allowed"
                )}
              >
                {evaluating ? "Đang đánh giá..." : "Đánh giá CV"}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              * Sau khi đánh giá xong, form sẽ tự đóng và kết quả hiển thị ở dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (t: ToastState, ms = 1800) => {
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

  const [cvSaved, setCvSaved] = useState<{ id: string; updatedAt: string } | null>(null);
  const [pending, setPending] = useState<PendingEvaluation | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState<number | null>(null);

  const saveCv = async () => {
    if (!pending) {
      showToast({ type: "error", message: "Bạn chưa đánh giá CV." }, 1500);
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append("cv", pending.file);
      form.append("title", pending.file.name);

      const res = await axios.post<{ id: number; updatedAt?: string }>(`${API_BASE}/api/cvs`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const saved = res.data;

      setCvSaved({
        id: String(saved.id),
        updatedAt: saved.updatedAt ? saved.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });

      showToast({ type: "success", message: "Lưu CV (file) thành công!" }, 1200);

      // reset trang sau khi lưu xong (như bạn yêu cầu)
      window.location.reload();
    } catch (err) {
      const e = err as AxiosError<ApiErrorResponse>;
      showToast({ type: "error", message: e.response?.data?.message ?? "Lưu CV thất bại." }, 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (job: Job) => {
    try {
      setLoadingJobId(job.id);

      if (!cvSaved?.id) {
        showToast({ type: "error", message: "Bạn chưa lưu CV. Hãy đánh giá rồi bấm Lưu CV." }, 1800);
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
      showToast({ type: "success", message: `Đã nộp CV cho "${job.title}" thành công.` }, 1000);
    } catch {
      showToast({ type: "error", message: "Không thể nộp CV lúc này. Vui lòng thử lại." }, 1200);
    } finally {
      setLoadingJobId(null);
    }
  };

  if (role && role !== "candidate") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Không có quyền truy cập</p>
        <p className="mt-1 text-sm text-slate-600">Trang này chỉ dành cho tài khoản Candidate.</p>
      </div>
    );
  }

  const displayedScore = pending?.evaluated.score ?? null;
  const displayedUpdatedAt = pending?.evaluatedAtIso?.slice(0, 10) ?? cvSaved?.updatedAt ?? "—";

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <UploadEvaluateModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        token={token}
        toast={showToast}
        onEvaluated={(p) => setPending(p)}
      />

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Candidate Dashboard</h1>
            <p className="text-sm text-slate-500">Upload CV → Đánh giá → Hiện kết quả → Lưu CV.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!token) {
                showToast({ type: "error", message: "Bạn cần đăng nhập Candidate để upload CV." }, 2000);
                return;
              }
              setUploadOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800"
          >
            + Upload CV mới
          </button>
        </div>

        <div className="grid md:grid-cols-[1.25fr,1.75fr] gap-6">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">CV gần nhất</p>
                <h2 className="text-sm font-semibold text-slate-900 mt-1">Hồ sơ ứng tuyển của bạn</h2>
                <p className="text-[11px] text-slate-500 mt-1">Lần phân tích: {displayedUpdatedAt}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">CV Score</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {displayedScore !== null ? `${displayedScore}/100` : "—"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Kết quả sẽ xuất hiện ở đây sau khi bạn bấm <b>Đánh giá CV</b>.
            </p>

            {pending ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-700 font-semibold">Đánh giá xong</p>
                    <p className="text-[11px] text-slate-600 truncate">
                      Job title: <span className="font-medium">{pending.jobTitleInput}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      File: <span className="font-medium">{pending.file.name}</span>
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-slate-900 text-white text-[11px] px-2.5 py-1">
                    {pending.evaluated.score}/100
                  </span>
                </div>

                {(pending.evaluated.strengths.length || pending.evaluated.weaknesses.length) && (
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-900 mb-1">Điểm mạnh</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        {pending.evaluated.strengths.slice(0, 3).map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-900 mb-1">Cần cải thiện</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        {pending.evaluated.weaknesses.slice(0, 3).map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/candidate/cv/draft"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900"
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      type="button"
                      onClick={() => setUploadOpen(true)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900"
                    >
                      Đánh giá lại
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={saveCv}
                    disabled={saving}
                    className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Đang lưu..." : "Lưu CV"}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  * Lưu CV: hiện tại chỉ lưu <b>file</b> lên hệ thống (không lưu điểm).
                </p>
              </div>
            ) : cvSaved ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
                Đã lưu CV file. CV ID: <b>{cvSaved.id}</b>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Bạn chưa có CV. Hãy upload để nhận score.</p>
            )}

            <div className="mt-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-3 text-[11px] text-slate-500">
              Gợi ý: Đánh giá xong bạn có thể bấm <b>Xem chi tiết</b> để xem đầy đủ nhận xét AI.
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Job gợi ý từ AI</h2>
              <span className="text-[11px] text-slate-500">Dựa trên CV hiện tại của bạn</span>
            </div>

            <div className="space-y-3">
              {mockJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-slate-900 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {job.company} · {job.location}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-flex rounded-full bg-slate-900 text-white text-[11px] px-2.5 py-0.5">
                      Match {(job.match * 100).toFixed(0)}%
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApply(job)}
                      disabled={loadingJobId === job.id}
                      className="inline-flex items-center justify-center rounded-full bg-white text-[11px] font-medium px-3 py-1 border border-slate-300 hover:border-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingJobId === job.id ? "Đang nộp..." : "Apply ngay"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              * Apply cần CV đã <b>lưu</b> (file). Nếu chưa lưu, hãy bấm “Lưu CV” ở khung bên trái.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}