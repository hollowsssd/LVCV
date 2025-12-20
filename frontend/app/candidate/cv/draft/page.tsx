"use client";

import type { CvEvaluateReport, DraftData } from "@/app/candidate/cv/types";
import Cookie from "js-cookie";
import Link from "next/link";
import { useState } from "react";
function readDraftFromSession(): DraftData | null {
  try {
    const owner = Cookie.get("email");
    const raw = sessionStorage.getItem(`cv_report_draft:${owner}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DraftData;

    if (!parsed) return null;
    if (!parsed.report) return null;

    // validate để tránh crash
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
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-right shadow-sm
                    dark:border-slate-700 dark:bg-slate-900/80">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {value}/100
      </p>
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
      ? "border-emerald-100 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
      : "border-amber-100 bg-amber-50/80 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100";

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
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                      dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Không có dữ liệu đánh giá tạm
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Hãy quay lại Dashboard và bấm “Đánh giá CV” trước.
        </p>
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Báo cáo phân tích CV (Tạm thời)
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            File:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {draft?.fileName}
            </span>{" "}
            · Lần phân tích:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {updatedAt}
            </span>
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            * Đây là kết quả sau khi đánh giá, chưa lưu vào hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ScoreBox label="CV Score" value={report.score} />
          <ScoreBox label="Mức phù hợp" value={report.fitScore} />
        </div>
      </div>

      {/* Tổng quan */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-3
                          dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Job title</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {report?.jobTitle || "—"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                        dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Nhận xét tổng quan
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {report.summary || "—"}
          </p>
        </div>
      </section>

      {/* Điểm mạnh / yếu / chi tiết */}
      <section className="grid md:grid-cols-3 gap-6">
        <ListBox title="Điểm mạnh" items={report.strengths || []} tone="good" />
        <ListBox title="Hạn chế" items={report.weaknesses || []} tone="warn" />

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-3 shadow-sm
                        dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            📊 Điểm chi tiết
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Trình bày: <b>{report.detailScores?.trinh_bay ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Nội dung: <b>{report.detailScores?.noi_dung ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Kinh nghiệm: <b>{report.detailScores?.kinh_nghiem ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3
                            dark:border-slate-700 dark:bg-slate-900/60">
              Kỹ năng: <b>{report.detailScores?.ky_nang ?? 0}</b>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 col-span-2
                            dark:border-slate-700 dark:bg-slate-900/60">
              Thành tựu: <b>{report.detailScores?.thanh_tuu ?? 0}</b>
            </div>
          </div>
        </div>
      </section>

      {/* Góp ý chi tiết */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                          dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          ✏️ Góp ý chi tiết
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {fixesText || "—"}
        </div>
      </section>

      {/* CV đã đánh dấu + Annotations - Split Layout */}
      {report.annotatedPdfB64 && (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                            dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            📝 CV đã đánh dấu & Các vị trí cần sửa
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: PDF Viewer */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Xem trước CV (có highlight)
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden
                              dark:border-slate-700 dark:bg-slate-900/60">
                <iframe
                  src={`data:application/pdf;base64,${report.annotatedPdfB64}`}
                  className="w-full h-[500px]"
                  title="Annotated CV Preview"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const pdfB64 = report.annotatedPdfB64;
                  if (!pdfB64) return;
                  const blob = new Blob(
                    [Uint8Array.from(atob(pdfB64), c => c.charCodeAt(0))],
                    { type: "application/pdf" }
                  );
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900 transition
                           dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
              >
                🔗 Mở PDF trong tab mới
              </button>
            </div>

            {/* Right: Annotations List */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Các vị trí cần sửa ({report.annotations?.length || 0})
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 max-h-[540px] overflow-y-auto
                              dark:border-slate-700 dark:bg-slate-900/60">
                {report.annotations && report.annotations.length > 0 ? (
                  report.annotations.map((ann, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 border-l-4 ${ann.severity === "critical"
                        ? "border-l-red-500 bg-red-50 dark:bg-red-950/40"
                        : ann.severity === "warning"
                          ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/40"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/40"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200">
                          &quot;{ann.text}&quot;
                        </p>
                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${ann.severity === "critical"
                          ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : ann.severity === "warning"
                            ? "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                            : "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}>
                          {ann.severity === "critical" ? "Phải sửa" : ann.severity === "warning" ? "Nên sửa" : "Gợi ý"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ann.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">
                    Không có annotation nào
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Link
          href="/candidate/dashboard"
          className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
        >
          ← Về Dashboard
        </Link>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Lưu CV ở Dashboard để dùng apply job.
        </p>
      </div>
    </div>
  );
}