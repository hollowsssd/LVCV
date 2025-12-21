"use client";

import type { CvEvaluateReport, DraftData } from "@/app/candidate/cv/types";
import Cookie from "js-cookie";
import Link from "next/link";
import { useState } from "react";

/* ================== ĐỌC DRAFT ================== */

function readDraftFromSession(): DraftData | null {
  try {
    // Phải khớp với cách dashboard lưu: scope theo email (lowercase, trim)
    const owner = (Cookie.get("email") || "").toLowerCase().trim();
    if (!owner) return null; // Chưa login thì không có draft

    const raw = sessionStorage.getItem(`cv_report_draft:${owner}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftData;
    if (!parsed?.report) return null;
    const r = parsed.report as CvEvaluateReport;
    if (typeof r.score !== "number" || typeof r.fitScore !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ================== TYPES ================== */

type CvAnnotation = {
  text: string;
  reason: string;
  severity: "critical" | "warning" | "info";
};

type ExtendedCvReport = CvEvaluateReport & {
  annotatedPdfB64?: string;
  annotations?: CvAnnotation[];
};

/* ================== MOCK DATA ================== */

const mockReport: ExtendedCvReport = {
  score: 78,
  fitScore: 82,
  jobTitle: "Junior Frontend Developer (React/Next.js)",
  summary: "CV khá ổn về phần kinh nghiệm và dự án, tuy nhiên còn thiếu số liệu định lượng và phần mô tả kỹ năng hơi chung chung.",
  strengths: [
    "Có dự án cá nhân dùng React/Next.js rõ ràng.",
    "Trình bày CV gọn, dễ đọc.",
    "Có kinh nghiệm thực tập liên quan trực tiếp đến Frontend.",
  ],
  weaknesses: [
    "Thiếu số liệu cụ thể về kết quả đạt được.",
    "Một số câu tiếng Anh còn sai ngữ pháp.",
    "Mục Kỹ năng chưa nhóm rõ ràng.",
  ],
  fixes: `1. Thêm số liệu định lượng cho phần kinh nghiệm.
2. Nhóm kỹ năng theo Frontend / Backend / Tools.
3. Chuẩn hoá format ngày tháng, tiêu đề.
4. Sửa lỗi ngữ pháp tiếng Anh.`,
  detailScores: { trinh_bay: 80, noi_dung: 75, kinh_nghiem: 78, ky_nang: 82, thanh_tuu: 70 },
  recommendQuery: "junior frontend developer react nextjs",
  annotatedPdfB64: "",
  annotations: [
    { text: "I am hard-working and responsible person", reason: "Thiếu mạo từ 'a'. Sửa: \"I am a hard-working and responsible person.\"", severity: "warning" },
    { text: "Programming: Java (basic), JavaScript (basic) Frontend: ReactJS...", reason: "Việc liệt kê 'basic' cho hầu hết các kỹ năng, gây khó khăn đánh giá năng lực.", severity: "critical" },
    { text: "Researched and explored different AI tools...", reason: "Mô tả quá chung chung, thiếu hành động cụ thể và kết quả định lượng.", severity: "critical" },
  ],
};

const mockDraft: DraftData = {
  fileName: "CV_Nguyen_Van_A.pdf",
  evaluatedAtIso: new Date().toISOString(),
  jobTitle: mockReport.jobTitle,
  report: mockReport,
};

/* ================== PAGE ================== */

export default function CvDraftDetailPage() {
  // Chỉ đọc data thật từ session, không dùng mock data
  const [draft] = useState<DraftData | null>(() => readDraftFromSession());
  const report = (draft?.report as ExtendedCvReport) ?? null;

  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <p className="font-medium text-slate-900 dark:text-white mb-2">Chưa có dữ liệu đánh giá</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Vui lòng đánh giá CV trước.</p>
        <Link href="/candidate/dashboard" className="text-sm text-slate-900 dark:text-white font-medium hover:underline">← Về Dashboard</Link>
      </div>
    );
  }

  const fixes = (report.fixes || "").split("\n").filter(Boolean);
  const annotations = report.annotations || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Báo cáo phân tích CV (Tạm thời)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            File: <span className="text-slate-700 dark:text-slate-200">{draft?.fileName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">CV Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{report.score}/100</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">Mức phù hợp</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{report.fitScore}/100</p>
          </div>
        </div>
      </div>

      {/* Job Title & Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">Job title</p>
        <p className="font-medium text-slate-900 dark:text-white mb-3">{report.jobTitle}</p>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Nhận xét tổng quan</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{report.summary}</p>
        </div>
      </div>

      {/* Row: Strengths, Weaknesses, Detail Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Điểm mạnh */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-3">✅ Điểm mạnh</h3>
          <ul className="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            {report.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>

        {/* Hạn chế */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">⚠️ Hạn chế</h3>
          <ul className="space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
            {report.weaknesses?.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>

        {/* Điểm chi tiết */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">📊 Điểm chi tiết</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
              Trình bày: <b className="text-slate-900 dark:text-white">{report.detailScores?.trinh_bay ?? 0}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
              Nội dung: <b className="text-slate-900 dark:text-white">{report.detailScores?.noi_dung ?? 0}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
              Kinh nghiệm: <b className="text-slate-900 dark:text-white">{report.detailScores?.kinh_nghiem ?? 0}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
              Kỹ năng: <b className="text-slate-900 dark:text-white">{report.detailScores?.ky_nang ?? 0}</b>
            </div>
            <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800">
              Thành tựu: <b className="text-slate-900 dark:text-white">{report.detailScores?.thanh_tuu ?? 0}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Góp ý */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">✏️ Góp ý chi tiết</h3>
        <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {fixes.join('\n')}
        </div>
      </div>

      {/* CV Preview & Annotations */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">📝 CV đã đánh dấu & Các vị trí cần sửa</h2>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
          {/* PDF */}
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Xem trước CV (có highlight)</p>
            {report.annotatedPdfB64 ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <iframe src={`data:application/pdf;base64,${report.annotatedPdfB64}`} className="w-full h-[400px]" title="CV" />
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([Uint8Array.from(atob(report.annotatedPdfB64!), c => c.charCodeAt(0))], { type: "application/pdf" });
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}
                  className="w-full py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
                >
                  🔗 Mở PDF trong tab mới
                </button>
              </div>
            ) : (
              <div className="h-[400px] rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400">PDF sẽ hiển thị khi có dữ liệu</p>
              </div>
            )}
          </div>

          {/* Annotations */}
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Các vị trí cần sửa ({annotations.length})</p>
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {annotations.length > 0 ? annotations.map((ann, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-4 ${ann.severity === "critical" ? "border-l-red-500 bg-red-50 dark:bg-red-950/30" :
                  ann.severity === "warning" ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30" :
                    "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  }`}>
                  <div className="flex justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100 line-clamp-2">"{ann.text}"</p>
                    <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-medium ${ann.severity === "critical" ? "bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200" :
                      ann.severity === "warning" ? "bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-200" :
                        "bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      }`}>
                      {ann.severity === "critical" ? "Phải sửa" : ann.severity === "warning" ? "Nên sửa" : "Gợi ý"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{ann.reason}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-8">Chưa có danh sách lỗi</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <Link href="/candidate/dashboard" className="text-sm text-slate-900 dark:text-white font-medium hover:underline">← Về Dashboard</Link>
        <p className="text-xs text-slate-400">Lưu CV ở Dashboard để dùng apply job.</p>
      </div>
    </div>
  );
}