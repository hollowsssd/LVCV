"use client";

import { useState } from "react";
import Toast from "@/app/components/Toast";
// Mock job info
const mockJob = {
  id: 1,
  title: "Backend Intern",
  location: "HCMC",
  level: "Intern",
  skills: ["Node.js", "Express", "PostgreSQL", "REST API"],
  description:
    "Thực tập sinh Backend tham gia phát triển API cho hệ thống nội bộ, sử dụng Node.js, Express, PostgreSQL. Làm việc với team để xây dựng, tối ưu endpoint và xử lý bảo mật cơ bản.",
};

// Ứng viên được AI gợi ý (không chắc đã apply)

// Ứng viên đã nộp CV (applications)
type Application = {
  id: number;
  candidateName: string;
  cvScore: number;
  status: "applied" | "interview" | "rejected";
  appliedAt: string;
};

const mockApplications: Application[] = [
  {
    id: 101,
    candidateName: "Nguyễn Văn A",
    cvScore: 84,
    status: "applied",
    appliedAt: "2025-11-21 08:00",
  },
  {
    id: 102,
    candidateName: "Lê Văn C",
    cvScore: 76,
    status: "interview",
    appliedAt: "2025-11-20 15:30",
  },
];

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function EmployerJobDetailPage() {
  const [applications, setApplications] =
    useState<Application[]>(mockApplications);
  const [toast, setToast] = useState<ToastState>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdateStatus = async (
    appId: number,
    newStatus: Application["status"]
  ) => {
    try {
      setUpdatingId(appId);

      // TODO: gọi API thật
      // const res = await fetch(`/api/employer/applications/${appId}/status`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      // if (!res.ok) throw new Error("Cập nhật thất bại");

      // DEMO: update state local
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: newStatus,
              }
            : a
        )
      );

      let msg = "";
      if (newStatus === "interview")
        msg = "Đã chuyển trạng thái sang 'Hẹn phỏng vấn'.";
      if (newStatus === "rejected") msg = "Đã từ chối ứng viên này.";
      if (newStatus === "applied") msg = "Đã đặt lại trạng thái 'Đã nộp'.";

      setToast({
        type: "success",
        message: msg,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusBadge = (status: Application["status"]) => {
    if (status === "applied")
      return (
        <span className="inline-flex rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 border border-slate-200">
          Đã nộp
        </span>
      );
    if (status === "interview")
      return (
        <span className="inline-flex rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 border border-emerald-200">
          Hẹn phỏng vấn
        </span>
      );
    return (
      <span className="inline-flex rounded-full bg-red-50 text-red-700 text-[11px] px-2 py-0.5 border border-red-200">
        Đã từ chối
      </span>
    );
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
        {/* JOB INFO */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                {mockJob.title}
              </h1>
              <p className="text-sm text-slate-500">
                {mockJob.location} · {mockJob.level}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 max-w-[260px] text-right">
              Embedding cho job này được sinh từ description & kỹ năng. Hệ thống
              sử dụng embedding này để matching với CV của ứng viên.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {mockJob.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {mockJob.description}
          </p>
        </section>

       

        {/* APPLICATIONS: ỨNG VIÊN ĐÃ NỘP CV */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Ứng viên đã nộp CV cho job này
            </h2>
            <span className="text-[11px] text-slate-500">
              Dữ liệu lấy từ bảng applications (Candidate → Apply).
            </span>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-slate-500">
              Chưa có ứng viên nào nộp CV cho job này.
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">
                      {app.candidateName}
                    </p>
                    <p className="text-xs text-slate-500">
                      CV Score: {app.cvScore}/100 · Nộp lúc {app.appliedAt}
                    </p>
                    <div className="mt-1">{renderStatusBadge(app.status)}</div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    {/* Nút xem chi tiết CV / AI feedback (sau này có thể mở modal hoặc link riêng) */}
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 hover:border-slate-900"
                    >
                      Xem CV & AI feedback
                    </button>

                    {/* Set trạng thái Hẹn phỏng vấn */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "interview")}
                      disabled={updatingId === app.id}
                      className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 hover:border-emerald-500 disabled:opacity-60"
                    >
                      {updatingId === app.id && app.status !== "interview"
                        ? "Đang cập nhật..."
                        : "Hẹn phỏng vấn"}
                    </button>

                    {/* Set trạng thái Từ chối */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, "rejected")}
                      disabled={updatingId === app.id}
                      className="rounded-full border border-red-200 bg-red-50 text-red-700 px-3 py-1 hover:border-red-500 disabled:opacity-60"
                    >
                      {updatingId === app.id && app.status !== "rejected"
                        ? "Đang cập nhật..."
                        : "Từ chối"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 text-[11px] text-slate-500">
            Sau khi chuyển trạng thái sang <b>Hẹn phỏng vấn</b>, hệ thống có thể
            mở rộng thêm tính năng gửi email lịch, hoặc lưu thời gian phỏng vấn
            ngay trong application (phần này bạn có thể mô tả trong báo cáo).
          </p>
        </section>
      </div>
    </>
  );
}
