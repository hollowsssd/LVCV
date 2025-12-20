"use client";

import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";

type ScheduleInterviewModalProps = {
    open: boolean;
    onClose: () => void;
    applicationId: number;
    candidateName: string;
    jobTitle: string;
    onSuccess: (interview: InterviewData) => void;
    onError: (msg: string) => void;
};

type InterviewData = {
    id: number;
    applicationId: number;
    scheduledAt: string;
    jitsiRoomUrl: string;
    notes: string | null;
    status: string;
};

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080";

export default function ScheduleInterviewModal({
    open,
    onClose,
    applicationId,
    candidateName,
    jobTitle,
    onSuccess,
    onError,
}: ScheduleInterviewModalProps) {
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [createdInterview, setCreatedInterview] = useState<InterviewData | null>(null);

    const token = useMemo(() => Cookies.get("token") || "", []);

    // Keyboard escape to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setScheduledDate("");
            setScheduledTime("");
            setNotes("");
            setCreatedInterview(null);
        }
    }, [open]);

    if (!open) return null;

    // Get minimum date (today)
    const today = new Date().toISOString().split("T")[0];

    const handleSubmit = async () => {
        if (!scheduledDate) {
            onError("Vui lòng chọn ngày phỏng vấn.");
            return;
        }
        if (!scheduledTime) {
            onError("Vui lòng chọn giờ phỏng vấn.");
            return;
        }
        if (!token) {
            onError("Bạn chưa đăng nhập.");
            return;
        }

        // Combine date and time
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);

        if (scheduledAt <= new Date()) {
            onError("Thời gian phỏng vấn phải trong tương lai.");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch(`${API_BASE_URL}/api/interviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationId,
                    scheduledAt: scheduledAt.toISOString(),
                    notes: notes.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Không thể tạo lịch phỏng vấn.");
            }

            setCreatedInterview(data.interview);
            onSuccess(data.interview);
        } catch (err) {
            onError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                📅 Hẹn phỏng vấn
                            </p>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                {candidateName || "Ứng viên"}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Vị trí: {jobTitle}
                            </p>
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
                        {createdInterview ? (
                            // Success state - show Jitsi link
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4
                                dark:border-emerald-900/60 dark:bg-emerald-950/40">
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                        ✅ Đã tạo lịch phỏng vấn thành công!
                                    </p>
                                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                        Ứng viên đã nhận được thông báo kèm link phòng họp.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3
                                dark:border-slate-800 dark:bg-slate-950/25">
                                    <div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Thời gian phỏng vấn
                                        </p>
                                        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {formatDateTime(createdInterview.scheduledAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Link phòng họp Jitsi
                                        </p>
                                        <a
                                            href={createdInterview.jitsiRoomUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium
                                 text-blue-600 hover:text-blue-800 hover:underline
                                 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            🔗 {createdInterview.jitsiRoomUrl}
                                        </a>
                                    </div>

                                    {createdInterview.notes && (
                                        <div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Ghi chú
                                            </p>
                                            <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                                                {createdInterview.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

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
                        ) : (
                            // Form state
                            <>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4
                                dark:border-slate-800 dark:bg-slate-950/25">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                        Chọn thời gian phỏng vấn
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Ngày
                                            </label>
                                            <input
                                                type="date"
                                                min={today}
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2
                                   text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900
                                   dark:text-slate-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Giờ
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2
                                   text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900
                                   dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Ghi chú cho ứng viên (tùy chọn)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="VD: Vui lòng chuẩn bị giới thiệu bản thân và portfolio..."
                                            rows={2}
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2
                                 text-sm text-slate-900 resize-none dark:border-slate-700
                                 dark:bg-slate-900 dark:text-slate-100
                                 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    * Hệ thống sẽ tự động tạo phòng họp Jitsi và gửi link cho ứng viên.
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm
                               hover:border-slate-900 dark:border-slate-600 dark:bg-slate-900
                               dark:text-slate-100 dark:hover:border-slate-400"
                                    >
                                        Huỷ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm
                               hover:bg-emerald-700 disabled:opacity-60
                               dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                    >
                                        {submitting ? "Đang tạo..." : "📅 Tạo lịch phỏng vấn"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
