"use client";

import type { CvEvaluateReport, RateCvApiRes } from "@/app/candidate/cv/types";
import { normalizeRateCv } from "@/app/candidate/cv/types";
import JobDetailModal from "@/app/components/JobDetailModal";
import Toast from "@/app/components/Toast";
import type { Job as GlobalJob } from "@/app/types";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/* ===================== Types ===================== */

type ToastState = { type: "success" | "error"; message: string } | null;

type ApiErrorResponse = { message?: string; detail?: string; error?: string };

type Job = {
  id: number;
  title: string;
  location: string;
  deadline: string | null;
  Employer: { companyName: string };
};


type PendingEvaluation = {
  file: File;
  jobTitleInput: string;
  evaluated: CvEvaluateReport;
  evaluatedAtIso: string;
};

type DraftMeta = {
  jobTitleInput: string;
  evaluatedAtIso: string;
  fileName: string;
  fileType: string; // mime
  report: CvEvaluateReport;
};

type SavedInfo = {
  id: string;
  title: string;
  fileUrl: string | null;
  updatedAt: string; // YYYY-MM-DD
};

type CvCreateResponse = {
  id: number;
  title?: string | null;
  fileUrl?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type Cv = {
  id: number;
  title: string | null;
  isDefault: boolean;
};

/* ===================== Const ===================== */

// const mockJobs: Job[] = [
//   { id: 1, title: "Backend Intern", company: "ABC Software", location: "HCMC", match: 0.91 },
//   { id: 2, title: "Node.js Developer (Junior)", company: "XYZ Tech", location: "Remote", match: 0.84 },
//   { id: 3, title: "Fullstack Intern (React/Node)", company: "Cool Startup", location: "HCMC", match: 0.79 },
// ];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";
const CV_SAVE_ENDPOINT = `${API_BASE}/api/cvs`;
const CV_RATE_ENDPOINT = `${API_BASE}/api/cvs/rate-cv`;
const Recommend_Job = `${API_BASE}/api/jobs/search`;

// base keys (sẽ scope theo email)
const DRAFT_META_KEY = "cv_report_draft";
const FILE_BLOB_KEY = "cv_report_draft_file";
const SAVED_INFO_KEY = "cv_saved_info";

/* ===================== Utils ===================== */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toYMD(iso?: string | null): string {
  if (!iso) return "—";
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function safeTrim(v: unknown, fallback: string): string {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : fallback;
  }
  return fallback;
}

function pickErr(err: unknown, fallback: string): string {
  const e = err as AxiosError<ApiErrorResponse>;
  return (
    e.response?.data?.message ||
    e.response?.data?.detail ||
    e.response?.data?.error ||
    e.message ||
    fallback
  );
}

/* ===================== IndexedDB Helpers ===================== */

const DB_NAME = "lvcv_kv_db";
const DB_VERSION = 1;
const STORE = "kv";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSetBlob(key: string, value: Blob): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGetBlob(key: string): Promise<Blob | null> {
  const db = await openDB();
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

async function idbDel(key: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/* ===================== ApplyCvModal ===================== */

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
  job: GlobalJob | null;
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
                {job.Employer?.companyName || "—"}
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

/* ===================== Inline Alert ===================== */

function InlineAlert({ t }: { t: ToastState }) {
  if (!t) return null;

  const cls =
    t.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200";

  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", cls)}>
      <p className="font-semibold">
        {t.type === "success" ? "✅ Thành công" : "⚠️ Có lỗi xảy ra"}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">{t.message}</p>
    </div>
  );
}

/* ===================== UploadEvaluateModal ===================== */

function UploadEvaluateModal(props: {
  open: boolean;
  onClose: () => void;
  token: string;
  onEvaluated: (pending: PendingEvaluation) => void;

  //  keys scope theo user để không dính dữ liệu
  draftMetaKey: string;
  fileBlobKey: string;
}) {
  const { open, onClose, token, onEvaluated, draftMetaKey, fileBlobKey } = props;

  const [jobTitle, setJobTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [evaluating, setEvaluating] = useState(false);
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
      setInlineMsg({
        type: "error",
        message: "Vui lòng chọn file CV và nhập Job title mong muốn.",
      });
      return;
    }
    if (!token) {
      setInlineMsg({
        type: "error",
        message: "Bạn cần đăng nhập Candidate để đánh giá CV.",
      });
      return;
    }

    try {
      setEvaluating(true);

      const form = new FormData();
      form.append("cvfile", file);
      form.append("job_title", jobTitle.trim());

      const res = await axios.post<RateCvApiRes>(CV_RATE_ENDPOINT, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const report = normalizeRateCv(res.data);
      if (!Number.isFinite(report.score)) {
        setInlineMsg({
          type: "error",
          message: "Kết quả đánh giá lỗi: thiếu/không đúng điểm tổng.",
        });
        return;
      }

      const pending: PendingEvaluation = {
        file,
        jobTitleInput: jobTitle.trim(),
        evaluated: report,
        evaluatedAtIso: new Date().toISOString(),
      };

      //persist draft meta
      const meta: DraftMeta = {
        jobTitleInput: pending.jobTitleInput,
        evaluatedAtIso: pending.evaluatedAtIso,
        fileName: pending.file.name,
        fileType: pending.file.type || "application/octet-stream",
        report: pending.evaluated,
      };

      try {
        sessionStorage.setItem(draftMetaKey, JSON.stringify(meta));
      } catch {
        // ignore
      }

      // persist file blob (IndexedDB)
      try {
        await idbSetBlob(fileBlobKey, pending.file);
      } catch {
        // ignore
      }

      onEvaluated(pending);

      setInlineMsg({ type: "success", message: "Đánh giá CV thành công! Đang đóng..." });
      setTimeout(() => onClose(), 450);
    } catch (err) {
      setInlineMsg({
        type: "error",
        message: pickErr(err, "Đánh giá CV thất bại (server lỗi)."),
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden
                     dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4
                       dark:border-slate-800"
          >
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload CV mới</p>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Đánh giá CV theo Job mong muốn
              </h3>
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

          <div className="p-5 space-y-4">
            {inlineMsg && <InlineAlert t={inlineMsg} />}

            <div className="grid md:grid-cols-2 gap-4">
              {/* File input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  File CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none
                             focus:border-slate-900 focus:bg-white
                             dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-300"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {file ? `Đã chọn: ${file.name}` : "Chọn PDF/DOC/DOCX."}
                </p>
              </div>

              {/* Job title input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Job title mong muốn <span className="text-red-500">*</span>
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ví dụ: Backend Intern / Node.js Junior..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none
                             focus:border-slate-900 focus:bg-white
                             dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-slate-300"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dùng để AI chấm theo mục tiêu cụ thể.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!canEvaluate}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  canEvaluate
                    ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    : "bg-slate-300 text-white cursor-not-allowed dark:bg-slate-700"
                )}
              >
                {evaluating ? "Đang đánh giá..." : "Đánh giá CV"}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Đánh giá xong sẽ tự đóng modal và hiện kết quả trên dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Dashboard ===================== */

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
  // const role = useMemo(() => (Cookies.get("role") || "").toLowerCase(), []);
  const owner = useMemo(() => (Cookies.get("email") || "unknown").toLowerCase().trim(), []);

  // keys scoped theo user
  const draftMetaKey = useMemo(() => `${DRAFT_META_KEY}:${owner}`, [owner]);
  const fileBlobKey = useMemo(() => `${FILE_BLOB_KEY}:${owner}`, [owner]);
  const savedInfoKey = useMemo(() => `${SAVED_INFO_KEY}:${owner}`, [owner]);

  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [cvSaved, setCvSaved] = useState<SavedInfo | null>(null);
  const [pending, setPending] = useState<PendingEvaluation | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<GlobalJob | null>(null);
  const [applyJob, setApplyJob] = useState<GlobalJob | null>(null);
  const [loadingRecommendedJobs, setLoadingRecommendedJobs] = useState(false);

  // cleanup legacy keys
  useEffect(() => {
    try {
      sessionStorage.removeItem("cv_report_draft");
      sessionStorage.removeItem("cv_saved_info");
    } catch {
      // ignore
    }
  }, []);

  // restore saved info + draft theo user
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = safeJsonParse<SavedInfo>(sessionStorage.getItem(savedInfoKey));
    if (saved?.id) setCvSaved(saved);

    const meta = safeJsonParse<DraftMeta>(sessionStorage.getItem(draftMetaKey));
    if (!meta?.report || !meta.fileName) return;

    let cancelled = false;

    (async () => {
      try {
        const blob = await idbGetBlob(fileBlobKey);
        if (cancelled) return;

        const fileType = meta.fileType || blob?.type || "application/octet-stream";
        const fileObj =
          blob != null
            ? new File([blob], meta.fileName, { type: fileType })
            : new File([], meta.fileName, { type: fileType });

        setPending({
          file: fileObj,
          jobTitleInput: meta.jobTitleInput,
          evaluated: meta.report,
          evaluatedAtIso: meta.evaluatedAtIso,
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [draftMetaKey, fileBlobKey, savedInfoKey]);

  useEffect(() => {
    (async () => {
      if (!pending?.evaluated.recommendQuery) return;
      try {
        setLoadingRecommendedJobs(true);
        const res = await axios.get(Recommend_Job, {
          params: { recommendJob: pending?.evaluated.recommendQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('res :>> ', res);
        setRecommendedJobs(res.data);
      } catch (error) {
        console.log('lỗi', error);
      } finally {
        setLoadingRecommendedJobs(false);
      }
    })();
  }, [pending?.evaluated.recommendQuery]);


  // chặn role khác candidate
  // if (role && role !== "candidate") {
  //   return (
  //     <div
  //       className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
  //                  dark:border-slate-800 dark:bg-slate-900/70"
  //     >
  //       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
  //         Không có quyền truy cập
  //       </p>
  //       <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
  //         Trang này chỉ dành cho tài khoản Candidate.
  //       </p>
  //     </div>
  //   );
  // }

  const saveCv = async () => {
    if (!pending) {
      showToast({ type: "error", message: "Bạn chưa đánh giá CV." }, 1500);
      return;
    }
    if (!token) {
      showToast({ type: "error", message: "Bạn cần đăng nhập Candidate để lưu CV." }, 1800);
      return;
    }

    try {
      setSaving(true);

      const form = new FormData();
      form.append("cv", pending.file);
      form.append("title", pending.file.name);

      const res = await axios.post<CvCreateResponse>(CV_SAVE_ENDPOINT, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const saved: SavedInfo = {
        id: String(res.data.id),
        title: safeTrim(res.data.title, pending.file.name),
        fileUrl: res.data.fileUrl ?? null,
        updatedAt: toYMD(res.data.updatedAt ?? new Date().toISOString()),
      };

      setCvSaved(saved);

      try {
        sessionStorage.setItem(savedInfoKey, JSON.stringify(saved));
      } catch {
        // ignore
      }

      try {
        sessionStorage.removeItem(draftMetaKey);
      } catch {
        // ignore
      }
      try {
        await idbDel(fileBlobKey);
      } catch {
        // ignore
      }

      setPending(null);

      showToast({ type: "success", message: `Đã lưu CV: ${saved.title}` }, 1500);
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      showToast({ type: "error", message: pickErr(err, "Lưu CV thất bại.") }, 2200);
    } finally {
      setSaving(false);
    }
  };

  const openApply = (job: GlobalJob) => {
    if (!token) {
      showToast(
        { type: "error", message: "Bạn cần đăng nhập Candidate để apply." },
        2000
      );
      return;
    }
    setApplyJob(job);
  };

  const displayedScore = pending?.evaluated.score ?? null;
  const displayedUpdatedAt = pending?.evaluatedAtIso
    ? toYMD(pending.evaluatedAtIso)
    : cvSaved?.updatedAt ?? "—";

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <UploadEvaluateModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        token={token}
        onEvaluated={(p) => setPending(p)}
        draftMetaKey={draftMetaKey}
        fileBlobKey={fileBlobKey}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Đánh giá CV & Gợi ý việc làm
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload CV → Đánh giá → Hiện kết quả → Lưu CV.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!token) {
                showToast(
                  {
                    type: "error",
                    message: "Bạn cần đăng nhập Candidate để upload CV.",
                  },
                  2000
                );
                return;
              }
              setUploadOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800
                       dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            + Upload CV mới
          </button>
        </div>

        <div className="grid md:grid-cols-[1.25fr,1.75fr] gap-6">
          {/* Left: CV summary */}
          <section
            className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                       dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">CV gần nhất</p>
                <h2 className="text-sm font-semibold text-slate-900 mt-1 dark:text-slate-100">
                  Hồ sơ ứng tuyển của bạn
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 dark:text-slate-400">
                  Lần phân tích: {displayedUpdatedAt}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">CV Score</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {displayedScore !== null ? `${displayedScore}/100` : "—"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Kết quả sẽ xuất hiện ở đây sau khi bạn bấm <b>Đánh giá CV</b>.
            </p>

            {pending ? (
              <div
                className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3
                           dark:border-emerald-900/60 dark:bg-emerald-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-700 font-semibold dark:text-emerald-300">
                      Đánh giá xong
                    </p>
                    <p className="text-[11px] text-slate-600 truncate dark:text-slate-300">
                      Job title:{" "}
                      <span className="font-medium">{pending.jobTitleInput}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 truncate dark:text-slate-300">
                      File: <span className="font-medium">{pending.file.name}</span>
                    </p>
                  </div>

                  <span
                    className="inline-flex rounded-full bg-slate-900 text-white text-[11px] px-2.5 py-1
                               dark:bg-slate-100 dark:text-slate-900"
                  >
                    {pending.evaluated.score}/100
                  </span>
                </div>

                {(pending.evaluated.strengths.length > 0 ||
                  pending.evaluated.weaknesses.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div
                        className="rounded-xl border border-slate-200 bg-white p-3
                                 dark:border-slate-700 dark:bg-slate-900/70"
                      >
                        <p className="font-semibold text-slate-900 mb-1 dark:text-slate-100">
                          Điểm mạnh
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 dark:text-slate-300">
                          {pending.evaluated.strengths.slice(0, 3).map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className="rounded-xl border border-slate-200 bg-white p-3
                                 dark:border-slate-700 dark:bg-slate-900/70"
                      >
                        <p className="font-semibold text-slate-900 mb-1 dark:text-slate-100">
                          Cần cải thiện
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 dark:text-slate-300">
                          {pending.evaluated.weaknesses.slice(0, 3).map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>

                        <p className="font-semibold text-slate-900 mb-1 dark:text-slate-100">
                          {pending.evaluated.recommendQuery}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Hint about annotated PDF in detail page */}
                {pending.evaluated.annotatedPdfB64 && (
                  <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50/50 px-4 py-2 text-xs text-rose-700
                                 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    📝 CV đã được đánh dấu highlight. Bấm <b>Xem chi tiết</b> để xem PDF và danh sách các vị trí cần sửa.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/candidate/cv/draft"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                                 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      type="button"
                      onClick={() => setUploadOpen(true)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                                 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                    >
                      Đánh giá lại
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={saveCv}
                    disabled={saving}
                    className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60
                               dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    {saving ? "Đang lưu..." : "Lưu CV"}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  * Lưu CV: chỉ lưu <b>file</b> lên hệ thống. Lưu xong sẽ reset phần đánh giá
                  và reload trang.
                </p>
              </div>
            ) : cvSaved ? (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 space-y-2
                           dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                <div>
                  Đã lưu CV: <b>{cvSaved.title}</b>
                </div>
                {cvSaved.fileUrl ? (
                  <a
                    href={`${API_BASE}${cvSaved.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                               dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                  >
                    Xem file đã lưu
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bạn chưa có đánh giá. Hãy upload để nhận score.
              </p>
            )}

            <div
              className="mt-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-3 text-[11px] text-slate-500
                         dark:bg-slate-900/60 dark:border-slate-700 dark:text-slate-400"
            >
              Gợi ý: Đánh giá xong bạn có thể bấm <b>Xem chi tiết</b> để xem đầy đủ nhận xét AI.
            </div>
          </section>

          {/* Right: Job suggestions - only show when loading or has jobs */}
          {(loadingRecommendedJobs || recommendedJobs.length > 0) && (
            <section
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                         dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Job gợi ý từ AI
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dựa trên CV hiện tại của bạn
                </span>
              </div>

              {loadingRecommendedJobs ? (
                <div
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                             dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  Đang tải danh sách job gợi ý...
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-slate-900 transition
                                 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-300"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {job.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {job.Employer?.companyName} · {job.location}
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job as unknown as GlobalJob)}
                          className="inline-flex rounded-full bg-slate-900 text-white text-[11px] px-2.5 py-0.5 hover:bg-slate-700 transition cursor-pointer
                                     dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          Chi tiết
                        </button>

                        <button
                          type="button"
                          onClick={() => openApply(job as unknown as GlobalJob)}
                          className="inline-flex items-center justify-center rounded-full bg-white text-[11px] font-medium px-3 py-1 border border-slate-300 hover:border-slate-900
                                     dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                        >
                          Apply ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                * Apply cần CV đã <b>lưu</b> (file). Nếu chưa lưu, hãy bấm "Lưu CV" ở khung bên phải.
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        onApply={() => {
          if (selectedJob) {
            openApply(selectedJob);
            setSelectedJob(null);
          }
        }}
      />

      {/* Apply CV Modal */}
      <ApplyCvModal
        open={!!applyJob}
        onClose={() => setApplyJob(null)}
        job={applyJob}
        token={token}
        onApplied={() =>
          showToast({ type: "success", message: "Apply thành công!" }, 1200)
        }
        toastError={(msg) => showToast({ type: "error", message: msg }, 2000)}
      />
    </>
  );
}