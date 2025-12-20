"use client";

import type { Job } from "../types";
function StatusPill({ status }: { status: Job["status"] }) {
  const s = String(status).toUpperCase();
  const map: Record<string, string> = { OPEN: "Đang mở", CLOSED: "Đã đóng", DRAFT: "Nháp" };
  const cls =
    s === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : s === "CLOSED"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      {map[s] ?? s}
    </span>
  );
}

export default function JobCard({
  job,
  onView,
  onApply,
  metaRight,
}: {
  job: Job;
  onView: () => void;
  onApply: () => void;
  metaRight?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 hover:border-slate-900 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
            <StatusPill status={job.status} />
          </div>

          <p className="mt-1 text-xs text-slate-600">
            {job.Employer?.companyName || "—"} · {job.location || "—"} · {job.jobType || "—"}
          </p>
        </div>

        {metaRight ? <p className="text-[11px] text-slate-500 shrink-0">{metaRight}</p> : null}
      </div>

      <p className="mt-3 text-xs text-slate-600 line-clamp-3 whitespace-pre-line">
        {job.description || "—"}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] hover:border-slate-900"
        >
          Xem chi tiết
        </button>

        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] hover:bg-slate-800"
        >
          Nộp CV
        </button>
      </div>
    </div>
  );
}