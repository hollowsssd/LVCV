"use client";

import type { CvEvaluateReport, DraftData } from "@/app/candidate/cv/types";
import Cookie from "js-cookie";
import Link from "next/link";
import { useState } from "react";

/* ================== ĐỌC DRAFT THẬT (NẾU CÓ) ================== */

function readDraftFromSession(): DraftData | null {
  try {
    const owner = Cookie.get("email");
    const raw = sessionStorage.getItem(`cv_report_draft:${owner}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DraftData;
    if (!parsed || !parsed.report) return null;

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

/* ================== UI COMPONENTS NHỎ ================== */

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
  return (text || "").replace(/\r\n/g, "\n").trim();
}

/* ================== TYPES + MOCK DATA ================== */

type CvErrorItem = {
  muc: string;
  noi_dung_goc: string;
  noi_dung_sua: string;
  loai_loi: string;
  giai_thich: string;
  page: number;
  bbox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

type ExtendedCvReport = CvEvaluateReport & {
  loi_cu_the?: CvErrorItem[];
};

const mockReport: ExtendedCvReport = {
  score: 78,
  fitScore: 82,
  jobTitle: "Junior Frontend Developer (React/Next.js)",
  summary:
    "CV khá ổn về phần kinh nghiệm và dự án, tuy nhiên còn thiếu số liệu định lượng và phần mô tả kỹ năng hơi chung chung. Cần chỉnh lại wording cho chuyên nghiệp hơn.",
  strengths: [
    "Có dự án cá nhân dùng React/Next.js rõ ràng.",
    "Trình bày CV gọn, dễ đọc.",
    "Có kinh nghiệm thực tập liên quan trực tiếp đến Frontend.",
  ],
  weaknesses: [
    "Thiếu số liệu cụ thể (ví dụ: tối ưu performance bao nhiêu %, tăng conversion...).",
    "Một số câu tiếng Anh còn sai ngữ pháp/câu chưa tự nhiên.",
    "Mục Kỹ năng liệt kê hơi dài, chưa nhóm rõ thành nhóm Frontend / Tool / Khác.",
  ],
  fixes: `
1. Thêm số liệu định lượng cho các bullet point trong phần kinh nghiệm.
2. Gom nhóm lại phần Kỹ năng theo Frontend / Backend / Tools / Others.
3. Chuẩn hoá lại format ngày tháng, tiêu đề, heading cho đồng nhất.
4. Chỉnh lại các câu tiếng Anh bị sai ngữ pháp / thiếu mạo từ.
`.trim(),
  detailScores: {
    trinh_bay: 80,
    noi_dung: 75,
    kinh_nghiem: 78,
    ky_nang: 82,
    thanh_tuu: 70,
  },
  recommendQuery: "junior frontend developer react nextjs javascript",
  loi_cu_the: [
    {
      muc: "Summary",
      noi_dung_goc: "I am hard-working and responsible person",
      noi_dung_sua: "I am a hard-working and responsible person.",
      loai_loi: "grammar",
      giai_thich:
        "Thiếu mạo từ 'a' trước 'hard-working', và nên thêm dấu chấm kết câu.",
      page: 1,
      bbox: { x: 12, y: 10, w: 76, h: 8 },
    },
    {
      muc: "Experience - Intern Frontend Developer",
      noi_dung_goc: "Improve website speed and user experience.",
      noi_dung_sua:
        "Improved website loading speed by ~25% and reduced bounce rate by 10% by optimizing images and applying code splitting.",
      loai_loi: "lack_of_metrics",
      giai_thich:
        "Câu gốc quá chung chung, chưa nêu rõ kết quả. Nên thêm số liệu định lượng (%, con số) để tăng độ thuyết phục.",
      page: 1,
      bbox: { x: 10, y: 34, w: 80, h: 9 },
    },
    {
      muc: "Skills",
      noi_dung_goc:
        "React, Next.js, HTML, CSS, JavaScript, Git, Figma, Tailwind, Node.js, MySQL",
      noi_dung_sua:
        "Frontend: React, Next.js, HTML, CSS, JavaScript, Tailwind CSS\nTools: Git, Figma\nBackend (basic): Node.js, MySQL",
      loai_loi: "structure",
      giai_thich:
        "Danh sách kỹ năng hơi dài và lẫn lộn. Nên nhóm thành các cụm rõ ràng để nhà tuyển dụng quét nhanh.",
      page: 1,
      bbox: { x: 10, y: 62, w: 80, h: 12 },
    },
  ],
};

const mockDraft: DraftData = {
  fileName: "CV_Nguyen_Van_A.pdf",
  evaluatedAtIso: new Date().toISOString(),
  jobTitle: mockReport.jobTitle, // THÊM CHO KHỚP DraftData
  report: mockReport,
};

/* ================== PAGE CHÍNH ================== */

export default function CvDraftDetailPage() {
  // 1) TẤT CẢ HOOK LUÔN Ở TRÊN CÙNG, KHÔNG SAU RETURN
  const [draft] = useState<DraftData | null>(() => {
    const real = readDraftFromSession();
    if (real) return real;
    return mockDraft; // demo tĩnh
  });

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const report = (draft?.report as ExtendedCvReport) ?? null;

  // 2) RETURN SỚM SAU KHI GỌI HOOK → OK
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

  const updatedAt = draft?.evaluatedAtIso
    ? draft.evaluatedAtIso.slice(0, 10)
    : "—";
  const fixesText = normalizeFixes(report.fixes);
  const errors: CvErrorItem[] = report.loi_cu_the ?? [];
  const activeError = errors[selectedIdx] ?? errors[0] ?? null;

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

      {/* Layout 2 cột */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Cột trái: info AI */}
        <div className="space-y-6">
          {/* Tổng quan */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-3
                          dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Job title
                </p>
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
            <ListBox
              title="Điểm mạnh"
              items={report.strengths || []}
              tone="good"
            />
            <ListBox
              title="Hạn chế"
              items={report.weaknesses || []}
              tone="warn"
            />

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
              ✏️ Góp ý chi tiết tổng quan
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {fixesText || "—"}
            </div>
          </section>
        </div>

        {/* Cột phải: PDF + highlight lỗi */}
        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm space-y-3
                          dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                📝 Xem trước CV & lỗi được khoanh
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500
                               dark:bg-slate-800 dark:text-slate-300">
                Demo tĩnh – sau này gắn PDF thật
              </span>
            </div>

            {/* Khung page PDF (giả lập) */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-[1/1.414]">
                {/* Nền page */}
                <div className="absolute inset-0 rounded-xl border border-slate-300 bg-slate-50
                                shadow-sm dark:border-slate-700 dark:bg-slate-900/90" />

                {/* Nhãn */}
                <div className="absolute inset-x-0 top-3 flex justify-center">
                  <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] text-slate-50 shadow-sm
                                   dark:bg-slate-100 dark:text-slate-900">
                    CV PDF preview
                  </span>
                </div>

                {/* Highlight lỗi */}
                {activeError && (
                  <div
                    className="absolute rounded-lg border-2 border-rose-500/80 bg-rose-500/15
                               shadow-[0_0_0_1px_rgba(248,113,113,0.5)] transition-all"
                    style={{
                      left: `${activeError.bbox.x}%`,
                      top: `${activeError.bbox.y}%`,
                      width: `${activeError.bbox.w}%`,
                      height: `${activeError.bbox.h}%`,
                    }}
                  />
                )}

                {/* Fake text trong CV */}
                <div className="absolute inset-0 p-6 space-y-2 text-[9px] text-slate-500 dark:text-slate-400">
                  <div className="h-3 w-1/3 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                  <div className="h-2 w-4/5 rounded bg-slate-200/80 dark:bg-slate-700/80" />
                  <div className="h-2 w-3/4 rounded bg-slate-200/80 dark:bg-slate-700/80" />

                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full rounded bg-slate-200/70 dark:bg-slate-700/70" />
                    <div className="h-2 w-11/12 rounded bg-slate-200/70 dark:bg-slate-700/70" />
                    <div className="h-2 w-2/3 rounded bg-slate-200/70 dark:bg-slate-700/70" />
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-4/5 rounded bg-slate-200/70 dark:bg-slate-700/70" />
                    <div className="h-2 w-full rounded bg-slate-200/70 dark:bg-slate-700/70" />
                    <div className="h-2 w-10/12 rounded bg-slate-200/70 dark:bg-slate-700/70" />
                  </div>
                </div>
              </div>
            </div>

            {activeError && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Đang hiển thị lỗi ở mục{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {activeError.muc}
                </span>{" "}
                (trang {activeError.page})
              </p>
            )}
          </section>

          {/* List lỗi */}
          {errors.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm space-y-3
                          dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                🩹 Lỗi cụ thể & gợi ý sửa
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bấm vào từng lỗi để xem vùng được khoanh trên CV.
              </p>

              <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                {errors.map((err, idx) => {
                  const isActive = idx === selectedIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full text-left rounded-2xl border px-3 py-2 text-xs transition
                        ${
                          isActive
                            ? "border-rose-400 bg-rose-50/80 dark:border-rose-500 dark:bg-rose-950/50"
                            : "border-slate-200 bg-slate-50/60 hover:border-rose-300 hover:bg-rose-50/60 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-rose-500/60"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                          {err.muc}
                        </span>
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] uppercase tracking-wide text-amber-800
                                       dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                          {err.loai_loi}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[11px] text-rose-700 dark:text-rose-200">
                        “{err.noi_dung_goc}”
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-emerald-700 dark:text-emerald-200">
                        → {err.noi_dung_sua}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </aside>
      </div>

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