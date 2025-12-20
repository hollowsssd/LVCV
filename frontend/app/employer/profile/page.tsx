"use client";

import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, X, Camera, Building2 } from "lucide-react";
import Toast from "@/app/components/Toast";
import InterviewDetailModal from "@/app/components/InterviewDetailModal";

type Role = "candidate" | "employer" | "admin";

type ApiError = {
    message?: string;
    error?: string;
    detail?: string;
};

type EmployerMe = {
    id: number;
    userId: number;
    companyName: string | null;
    logoUrl: string | null;
    website: string | null;
    industry: string | null;
    description: string | null;
    location: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

type InterviewItem = {
    id: number;
    applicationId: number;
    scheduledAt: string;
    jitsiRoomUrl: string;
    notes: string | null;
    status: string;
    isUpcoming: boolean;
    candidate: {
        id: number;
        fullName: string;
        phone?: string;
        email?: string;
        avatarUrl?: string;
    } | null;
    job: {
        id: number;
        title: string;
    } | null;
    createdAt: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function safeText(v: unknown, fallback = "—"): string {
    if (typeof v === "string") {
        const t = v.trim();
        return t.length ? t : fallback;
    }
    if (typeof v === "number") return String(v);
    if (typeof v === "boolean") return String(v);
    return fallback;
}

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function pickErr(err: unknown, fallback: string): string {
    const e = err as AxiosError<ApiError>;
    return (
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.response?.data?.detail ||
        e.message ||
        fallback
    );
}

function InlineAlert(props: { type: "warn" | "error"; message: string }) {
    const base = "rounded-2xl border px-4 py-3 text-sm";
    const cls =
        props.type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100"
            : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100";

    return (
        <div className={cn(base, cls)}>
            <p className="font-semibold">
                {props.type === "error" ? "⚠️ Lỗi" : "⚠️ Cảnh báo"}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line">
                {props.message}
            </p>
        </div>
    );
}

export default function EmployerProfilePage() {
    const token = useMemo(() => Cookies.get("token") || "", []);
    const role = useMemo(
        () => (Cookies.get("role") || "").toLowerCase() as Role,
        []
    );
    const email = useMemo(() => Cookies.get("email") || "", []);

    const [loading, setLoading] = useState(true);
    const [employer, setEmployer] = useState<EmployerMe | null>(null);
    const [errProfile, setErrProfile] = useState<string>("");

    // State chỉnh sửa hồ sơ
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        companyName: "",
        website: "",
        industry: "",
        description: "",
        location: "",
    });
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // State upload logo
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // State for interviews
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    // Xử lý upload logo
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !employer) return;

        // Kiểm tra loại file
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            setToast({ type: "error", message: "Chỉ chấp nhận file JPG, JPEG hoặc PNG" });
            return;
        }

        // Kiểm tra kích thước file (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToast({ type: "error", message: "File quá lớn. Tối đa 5MB" });
            return;
        }

        setLogoUploading(true);
        try {
            const formData = new FormData();
            formData.append("logo", file);

            const res = await axios.put<EmployerMe>(
                `${API_BASE}/api/employers/${employer.id}/logo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setEmployer(res.data);
            setToast({ type: "success", message: "Cập nhật logo thành công!" });
        } catch (err) {
            setToast({ type: "error", message: pickErr(err, "Không thể upload logo") });
        } finally {
            setLogoUploading(false);
            // Reset input sau khi upload
            if (logoInputRef.current) {
                logoInputRef.current.value = "";
            }
        }
    };

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                setLoading(true);
                setErrProfile("");

                const headers = { Authorization: `Bearer ${token}` };

                const meRes = await axios.get<EmployerMe>(`${API_BASE}/api/employers/me`, { headers });

                if (!mounted) return;

                setEmployer(meRes.data ?? null);
            } catch (err) {
                if (!mounted) return;
                setErrProfile(pickErr(err, "Không load được hồ sơ."));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        run();
        return () => {
            mounted = false;
        };
    }, [token, role]);

    // Fetch interviews
    useEffect(() => {
        const fetchInterviews = async () => {
            if (!token) return;
            try {
                setInterviewsLoading(true);
                const res = await axios.get<{ upcoming: InterviewItem[]; past: InterviewItem[] }>(
                    `${API_BASE}/api/interviews/employer-list`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setInterviews([...(res.data.upcoming || []), ...(res.data.past || [])]);
            } catch {
                // ignore - interviews section is optional
            } finally {
                setInterviewsLoading(false);
            }
        };
        fetchInterviews();
    }, [token]);

    // chặn truy cập
    if (!token || (role && role !== "employer")) {
        return (
            <div
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-2
                   dark:border-slate-800 dark:bg-slate-900/70"
            >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Không thể truy cập
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {errProfile || "Bạn không có quyền."}
                </p>
                <Link
                    href="/auth/login"
                    className="inline-flex text-sm font-medium text-slate-900 hover:underline dark:text-slate-100"
                >
                    → Đăng nhập
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm text-sm text-slate-600
                   dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
            >
                Đang tải hồ sơ...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Hồ sơ Doanh nghiệp
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Thông tin công ty và cài đặt.
                        </p>
                    </div>

                    {errProfile ? <InlineAlert type="error" message={errProfile} /> : null}
                </div>
            </div>

            {/* Account */}
            <section
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm
                   dark:border-slate-800 dark:bg-slate-900/70"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tài khoản</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {safeText(email)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Role:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-100">
                                {safeText(role, "employer")}
                            </span>
                            {" · "}
                            UserId:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-100">
                                {employer?.userId ?? "—"}
                            </span>
                        </p>
                    </div>

                    <Link
                        href="/employer/dashboard"
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-slate-900
                       dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-300"
                    >
                        ← Dashboard
                    </Link>
                </div>
            </section>

            {/* Employer info */}
            <section
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                   dark:border-slate-800 dark:bg-slate-900/70"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Thông tin công ty
                    </h2>
                    {employer && (
                        <button
                            onClick={() => {
                                setEditForm({
                                    companyName: employer.companyName || "",
                                    website: employer.website || "",
                                    industry: employer.industry || "",
                                    description: employer.description || "",
                                    location: employer.location || "",
                                });
                                setShowEditModal(true);
                            }}
                            className="cursor-pointer flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            <Pencil size={14} />
                            Cập nhật
                        </button>
                    )}
                </div>

                {!employer ? (
                    <div
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                       dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                    >
                        Không có dữ liệu công ty.
                    </div>
                ) : (
                    <>
                        {/* Logo section with upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={employer.logoUrl?.startsWith('/uploads') ? `${API_BASE}${employer.logoUrl}` : '/placeholder.png'}
                                        alt="Logo"
                                        className="h-full w-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                    />
                                </div>
                                {/* Upload overlay */}
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={logoUploading}
                                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {logoUploading ? (
                                        <span className="text-white text-xs">Đang tải...</span>
                                    ) : (
                                        <Camera size={20} className="text-white" />
                                    )}
                                </button>
                                {/* Hidden file input */}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Logo công ty
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Nhấn vào ảnh để thay đổi. Chấp nhận JPG, PNG (tối đa 5MB)
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tên công ty</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                    {safeText(employer.companyName)}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Ngành</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                    {safeText(employer.industry)}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Địa chỉ</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                    {safeText(employer.location)}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Website</p>
                                {employer.website ? (
                                    <a
                                        href={employer.website.startsWith("http") ? employer.website : `https://${employer.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 font-semibold text-slate-900 hover:underline dark:text-slate-100"
                                    >
                                        {employer.website}
                                    </a>
                                ) : (
                                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">—</p>
                                )}
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Mô tả</p>
                                <p className="mt-1 text-slate-700 whitespace-pre-line dark:text-slate-200">
                                    {safeText(employer.description)}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Ngày tạo</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                    {fmtDate(employer.createdAt)}
                                </p>
                            </div>

                            <div
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4
                           dark:border-slate-700 dark:bg-slate-900/60"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">Cập nhật lần cuối</p>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                                    {fmtDate(employer.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Interview Schedule Section */}
            <section
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4
                   dark:border-slate-800 dark:bg-slate-900/70"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        📋 Lịch phỏng vấn đã hẹn
                    </h2>
                </div>

                {interviewsLoading ? (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Đang tải lịch phỏng vấn...
                    </div>
                ) : interviews.length === 0 ? (
                    <div
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600
                       dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                    >
                        Chưa có lịch phỏng vấn nào.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {interviews.map((iv) => {
                            const scheduleDate = new Date(iv.scheduledAt);
                            const isUpcoming = scheduleDate > new Date() && iv.status === 'scheduled';
                            const dateStr = scheduleDate.toLocaleDateString('vi-VN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                            });
                            const timeStr = scheduleDate.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={iv.id}
                                    className={cn(
                                        "rounded-2xl border p-4 cursor-pointer transition hover:shadow-md",
                                        isUpcoming
                                            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                                            : "border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/60"
                                    )}
                                    onClick={() => {
                                        setSelectedInterview(iv);
                                        setShowInterviewModal(true);
                                    }}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {iv.candidate?.fullName || "Ứng viên không xác định"}
                                                </p>
                                                {isUpcoming && (
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                                                           border border-emerald-500 bg-emerald-500 text-white">
                                                        Sắp diễn ra
                                                    </span>
                                                )}
                                                {iv.status === 'cancelled' && (
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                                                           border border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                                        Đã huỷ
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Vị trí: {iv.job?.title || "—"}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                📅 {dateStr} lúc {timeStr}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {isUpcoming && (
                                                <a
                                                    href={iv.jitsiRoomUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white
                                                     px-3 py-1.5 text-xs font-medium hover:bg-blue-700
                                                     dark:bg-blue-500 dark:hover:bg-blue-600"
                                                >
                                                    🌐 Tham gia
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg mx-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Cập nhật thông tin công ty
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X size={20} className="cursor-pointer text-slate-500" />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!employer) return;

                                setEditLoading(true);
                                try {
                                    const headers = { Authorization: `Bearer ${token}` };
                                    const res = await axios.put<EmployerMe>(
                                        `${API_BASE}/api/employers/${employer.id}`,
                                        {
                                            companyName: editForm.companyName || null,
                                            website: editForm.website || null,
                                            industry: editForm.industry || null,
                                            description: editForm.description || null,
                                            location: editForm.location || null,
                                        },
                                        { headers }
                                    );

                                    setEmployer(res.data);
                                    setShowEditModal(false);
                                    setToast({ type: "success", message: "Cập nhật thành công!" });
                                } catch (err) {
                                    setToast({ type: "error", message: pickErr(err, "Cập nhật thất bại") });
                                } finally {
                                    setEditLoading(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Tên công ty
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.companyName}
                                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Ngành
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.industry}
                                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.website}
                                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Mô tả công ty
                                </label>
                                <textarea
                                    rows={4}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                >
                                    {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Interview Detail Modal */}
            <InterviewDetailModal
                open={showInterviewModal}
                onClose={() => {
                    setShowInterviewModal(false);
                    setSelectedInterview(null);
                }}
                interview={selectedInterview}
                viewAs="employer"
            />
        </div>
    );
}
