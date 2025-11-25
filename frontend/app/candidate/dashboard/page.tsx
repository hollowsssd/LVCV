"use client";

import { useState } from "react";
import Link from "next/link";
import Toast from "@/app/components/Toast";
type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  match: number; // 0–1
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

// mock CV & job – sau này bạn thay bằng dữ liệu từ API
const mockCv = {
  id: "1",
  score: 84,
  updatedAt: "2025-11-20",
};

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Backend Intern",
    company: "ABC Software",
    location: "HCMC",
    match: 0.91,
  },
  {
    id: 2,
    title: "Node.js Developer (Junior)",
    company: "XYZ Tech",
    location: "Remote",
    match: 0.84,
  },
  {
    id: 3,
    title: "Fullstack Intern (React/Node)",
    company: "Cool Startup",
    location: "HCMC",
    match: 0.79,
  },
];

export default function CandidateDashboard() {
  const [toast, setToast] = useState<ToastState>(null);
  const [loadingJobId, setLoadingJobId] = useState<number | null>(null);

  const handleApply = async (job: Job) => {
    try {
      setLoadingJobId(job.id);

      // TODO: lấy cvId thật (ví dụ lấy từ API CV mới nhất của user)
      const cvId = mockCv.id;

      // TODO: gọi API apply thật
      // const res = await fetch("/api/candidate/apply", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify({ jobId: job.id, cvId }),
      // });
      // if (!res.ok) throw new Error("Apply thất bại");

      // DEMO: giả lập call API
      await new Promise((r) => setTimeout(r, 600));

      setToast({
        type: "success",
        message: `Đã nộp CV cho công việc "${job.title}" thành công.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          "Không thể nộp CV lúc này. Vui lòng thử lại hoặc kiểm tra kết nối.",
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Candidate Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý CV, xem đánh giá từ AI và job gợi ý phù hợp để ứng tuyển.
            </p>
          </div>

          {/* Nút upload CV mới (chưa nối backend, chỉ UI) */}
          <form>
            <label className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 cursor-pointer shadow-sm hover:bg-slate-800">
              <span>+ Upload CV mới</span>
              <input type="file" className="hidden" />
            </label>
          </form>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-[1.25fr,1.75fr] gap-6">
          {/* CV card */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">CV gần nhất</p>
                <h2 className="text-sm font-semibold text-slate-900 mt-1">
                  Hồ sơ ứng tuyển của bạn
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lần phân tích: {mockCv.updatedAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">CV Score</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {mockCv.score}/100
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              AI đã phân tích CV của bạn dựa trên cấu trúc, kỹ năng, kinh nghiệm
              và mức độ phù hợp với vị trí backend/web developer.
            </p>

            <Link
              href={`/candidate/cv/${mockCv.id}`}
              className="inline-flex text-xs font-medium text-slate-900 hover:underline"
            >
              Xem báo cáo phân tích chi tiết →
            </Link>

            <div className="mt-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-3 text-[11px] text-slate-500">
              Gợi ý: mỗi khi bạn có project/kỹ năng mới, hãy cập nhật CV và upload
              lại. Hệ thống sẽ chấm điểm lại & gợi ý job chính xác hơn.
            </div>
          </section>

          {/* Suggested Jobs + Apply */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Job gợi ý từ AI
              </h2>
              <span className="text-[11px] text-slate-500">
                Dựa trên CV hiện tại của bạn
              </span>
            </div>

            {mockJobs.length === 0 ? (
              <p className="text-xs text-slate-500">
                Hiện chưa có job nào phù hợp. Hãy thử cập nhật CV hoặc quay lại
                sau.
              </p>
            ) : (
              <div className="space-y-3">
                {mockJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-slate-900 transition"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">
                        {job.title}
                      </p>
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
            )}

            <p className="mt-2 text-[11px] text-slate-500">
              Khi bạn bấm <span className="font-medium">Apply ngay</span>, hệ
              thống sẽ lưu lại đơn ứng tuyển (job + CV + thời gian) để nhà
              tuyển dụng xem trong trang Job Detail.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
