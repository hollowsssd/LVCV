"use client";

import { useEffect } from "react";
import type { Job } from "../types";
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

export default function JobDetailModal({
  open,
  onClose,
  job,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onApply: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Đóng"
      />

      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">{job.companyName || "—"}</p>
              <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
              <p className="text-[11px] text-slate-500">
                {job.location || "—"} · {job.jobType || "—"} · {job.experienceRequired || "—"}
              </p>
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
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[11px] text-slate-500">Lương</p>
                <p className="mt-0.5 font-medium text-slate-900">{formatSalary(job)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[11px] text-slate-500">Hạn nộp</p>
                <p className="mt-0.5 font-medium text-slate-900">{job.deadline?.slice(0, 10) || "—"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Mô tả</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description || "—"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-slate-900"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={onApply}
                className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
              >
                Nộp CV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}