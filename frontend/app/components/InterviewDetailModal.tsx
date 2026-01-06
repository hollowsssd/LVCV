"use client";

import { useEffect } from "react";

type InterviewData = {
    id: number;
    applicationId: number;
    scheduledAt: string;
    jitsiRoomUrl: string;
    notes: string | null;
    status: string;
    isUpcoming?: boolean;
    job?: {
        id: number;
        title: string;
        location?: string;
        jobType?: string;
        companyName?: string;
        companyLogo?: string;
    } | null;
    candidate?: {
        id: number;
        fullName: string;
        phone?: string;
        email?: string;
        avatarUrl?: string;
    } | null;
};

type InterviewDetailModalProps = {
    open: boolean;
    onClose: () => void;
    interview: InterviewData | null;
    viewAs: "candidate" | "employer";
};

export default function InterviewDetailModal({
    open,
    onClose,
    interview,
    viewAs,
}: InterviewDetailModalProps) {
    // Keyboard escape to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open || !interview) return null;

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const { date, time } = formatDateTime(interview.scheduledAt);
    const scheduledTime = new Date(interview.scheduledAt);
    const oneHourAfter = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 1 tiếng sau giờ hẹn
    const isLinkActive = new Date() < oneHourAfter; // Link còn hoạt động trong vòng 1 tiếng sau giờ hẹn
    const isPast = new Date() > oneHourAfter;

    const statusBadge = () => {
        if (interview.status === "cancelled") {
            return (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                         border border-rose-200 bg-rose-50 text-rose-700
                         dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                    Đã huỷ
                </span>
            );
        }
        if (interview.status === "completed" || isPast) {
            return (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                         border border-slate-200 bg-slate-100 text-slate-700
                         dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Đã hoàn thành
                </span>
            );
        }
        return (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                       border border-emerald-200 bg-emerald-50 text-emerald-700
                       dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                Sắp diễn ra
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                aria-label="Đóng"
            />

            <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden
                        dark:border-slate-800 dark:bg-slate-950">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4
                          dark:border-slate-800">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    📅 Chi tiết lịch phỏng vấn
                                </p>
                                {statusBadge()}
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                {interview.job?.title || "Vị trí không xác định"}
                            </h3>
                            {viewAs === "candidate" && interview.job?.companyName && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {interview.job.companyName}
                                </p>
                            )}
                            {viewAs === "employer" && interview.candidate?.fullName && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Ứng viên: {interview.candidate.fullName}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs
                         hover:border-slate-900 dark:border-slate-700 dark:bg-slate-900
                         dark:text-slate-100 dark:hover:border-slate-500"
                        >
                            ✕ Đóng
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        {/* Thời gian */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3
                            dark:border-slate-800 dark:bg-slate-950/25">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Ngày</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {date}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Giờ</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {time}
                                    </p>
                                </div>
                            </div>

                            {interview.job?.location && (
                                <div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Địa điểm</p>
                                    <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                                        {interview.job.location} · Phỏng vấn online qua Jitsi Meet
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Link Jitsi */}
                        {isLinkActive && interview.status === "scheduled" ? (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4
                                dark:border-blue-900/60 dark:bg-blue-950/40">
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                    🔗 Link phòng họp Jitsi
                                </p>
                                <a
                                    href={interview.jitsiRoomUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block text-sm text-blue-700 hover:text-blue-900 hover:underline
                                       dark:text-blue-300 dark:hover:text-blue-200 break-all"
                                >
                                    {interview.jitsiRoomUrl}
                                </a>

                                <a
                                    href={interview.jitsiRoomUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white
                                         px-4 py-2 text-sm font-medium hover:bg-blue-700 transition
                                         dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    🎥 Tham gia phòng họp
                                </a>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4
                                dark:border-slate-700 dark:bg-slate-800/40">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    🔒 Link phòng họp
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    {interview.status === "cancelled"
                                        ? "Cuộc phỏng vấn đã bị huỷ. Link không còn khả dụng."
                                        : "Cuộc phỏng vấn đã kết thúc. Link không còn khả dụng."}
                                </p>
                            </div>
                        )}

                        {/* Ghi chú */}
                        {interview.notes && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                              dark:border-slate-800 dark:bg-slate-950/25">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Ghi chú từ nhà tuyển dụng
                                </p>
                                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {interview.notes}
                                </p>
                            </div>
                        )}

                        {/* Thông tin thêm cho employer */}
                        {viewAs === "employer" && interview.candidate && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2
                              dark:border-slate-800 dark:bg-slate-950/25">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    Thông tin ứng viên
                                </p>
                                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p>📧 Email: {interview.candidate.email || "—"}</p>
                                    <p>📱 SĐT: {interview.candidate.phone || "—"}</p>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm
                           hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900
                           dark:hover:bg-slate-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
