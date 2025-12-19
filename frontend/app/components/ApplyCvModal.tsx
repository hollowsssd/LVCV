"use client";

import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Job } from "../types";

export default function ApplyCvModal({
  open,
  onClose,
  job,
  onSubmitted,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmitted: () => void;
  onError: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const role = useMemo(() => Cookies.get("role") || "", []);
  const token = useMemo(() => Cookies.get("token") || "", []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [open]);

  if (!open || !job) return null;

  const pickFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const name = (f.name || "").toLowerCase();
    if (!name.endsWith(".pdf")) {
      onError("Chỉ test PDF thôi nha (chọn file .pdf).");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    // Guard role candidate
    if (role && role !== "candidate") {
      onError("Chỉ Candidate mới được nộp CV.");
      return;
    }
    if (!token) {
      onError("Bạn chưa đăng nhập (thiếu token).");
      return;
    }
    if (!file) {
      onError("Bạn chưa chọn file PDF.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 500));
      onSubmitted();
    } catch {
      onError("Không thể nộp CV. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Nộp CV</p>
              <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
              <p className="text-[11px] text-slate-500">{job.Employer?.companyName || "—"}</p>
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold text-slate-900">Chọn file CV (PDF)</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Demo UI: chọn file PDF local để test.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs"
                />

                <div className="text-[11px] text-slate-600">
                  {file ? (
                    <span>
                      Đã chọn: <b className="text-slate-900">{file.name}</b> ({Math.round(file.size / 1024)} KB)
                    </span>
                  ) : (
                    <span>Chưa chọn file</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-slate-900"
              >
                Huỷ
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Đang nộp..." : "Nộp CV"}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              * Khi tích hợp BE, modal này sẽ upload file và lưu “CV snapshot” theo jobId.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}