"use client";

import Link from "next/link";
import { useState } from "react";
import type { DraftData, CvEvaluateReport } from "@/app/candidate/cv/types";

function readDraftFromSession(): DraftData | null {
  try {
    const raw = sessionStorage.getItem("cv_report_draft");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DraftData;

    if (!parsed) return null;
    if (!parsed.report) return null;

    // validate nhẹ (đủ để tránh crash)
    const r = parsed.report as CvEvaluateReport;
    if (typeof r.score !== "number") return null;
    if (typeof r.fitScore !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-right shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}/100</p>
    </div>
  );
}

function ListBox({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-100 bg-emerald-50/80 text-emerald-900"
      : "border-amber-100 bg-amber-50/80 text-amber-900";

  return (
    <div className={`rounded-3xl border p-5 space-y-2 ${cls}`}>
      <h3 className="text-sm font-semibold">
        {tone === "good" ? "✅ " : "⚠️ "}
        {title}
      </h3>

      {items.length ? (
        <ul className="list-disc list-inside text-xs space-y-1.5">
          {items.map((s, i) => (
            <li key={`${i}-${s.slice(0, 18)}`}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs opacity-80">—</p>
      )}
    </div>
  );
}

function normalizeFixes(text: string) {
  // xuống dòng đúng, giữ nguyên \n để render đẹp với whitespace-pre-line
  return (text || "").replace(/\r\n/g, "\n").trim();
}

export default function CvDraftDetailPage() {
  const [draft] = useState<DraftData | null>(() => readDraftFromSession());

  const report: CvEvaluateReport | null = draft?.report ?? null;

  if (!report) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2">
        <p className="text-sm font-semibold text-slate-900">Không có dữ liệu đánh giá tạm</p>
        <p className="text-sm text-slate-600">Hãy quay lại Dashboard và bấm “Đánh giá CV” trước.</p>
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline"
        >
          ← Về Dashboard
        </Link>
      </div>
    );
  }

  const updatedAt = draft?.evaluatedAtIso ? draft.evaluatedAtIso.slice(0, 10) : "—";
  const fixesText = normalizeFixes(report.fixes);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Báo cáo phân tích CV (Tạm thời)
          </h1>

          <p className="text-sm text-slate-500">
            File: <span className="font-medium text-slate-700">{draft?.fileName}</span> · Lần phân
            tích: {updatedAt}
          </p>

          <p className="text-[11px] text-slate-500 mt-1">
            * Đây là kết quả sau khi đánh giá, chưa lưu vào hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ScoreBox label="CV Score" value={report.score} />
          <ScoreBox label="Mức phù hợp" value={report.fitScore} />
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Job title </p>
            <p className="text-sm font-semibold text-slate-900">{report?.jobTitle || "—"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-900">Nhận xét tổng quan</p>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {report.summary || "—"}
          </p>
        </div>

      
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <ListBox title="Điểm mạnh" items={report.strengths || []} tone="good" />
        <ListBox title="Hạn chế" items={report.weaknesses || []} tone="warn" />

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">📊 Điểm chi tiết</h3>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              Trình bày: <b>{report.detailScores?.trinh_bay ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              Nội dung: <b>{report.detailScores?.noi_dung ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              Kinh nghiệm: <b>{report.detailScores?.kinh_nghiem ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              Kỹ năng: <b>{report.detailScores?.ky_nang ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 col-span-2">
              Thành tựu: <b>{report.detailScores?.thanh_tuu ?? 0}</b>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">✏️ Góp ý chi tiết</h2>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {fixesText || "—"}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline"
        >
          ← Về Dashboard
        </Link>
        <p className="text-[11px] text-slate-500">Lưu CV ở để dùng apply job.</p>
      </div>
    </div>
  );
}