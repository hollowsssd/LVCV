"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";
import { User, Briefcase } from "lucide-react";

type ToastState = {
    type: "success" | "error";
    message: string;
} | null;

type ApiErrorResponse = {
    message?: string;
};

type Role = "candidate" | "employer";

const API_BASE_URL = "http://localhost:8080/api/auth";

export default function SelectRolePage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [toast, setToast] = useState<ToastState>(null);
    const [loading, setLoading] = useState(false);

    // Candidate fields
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [sex, setSex] = useState<"male" | "female" | "unknown">("unknown");
    const [address, setAddress] = useState("");
    const [summary, setSummary] = useState("");

    // Employer fields
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [location, setLocation] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");

    const goNext = () => {
        if (!selectedRole) {
            setToast({ type: "error", message: "Vui lòng chọn loại tài khoản" });
            return;
        }
        setStep(2);
    };

    const goBack = () => setStep(1);

    const handleSubmit = async () => {
        const token = Cookies.get("token");
        if (!token) {
            router.push("/auth/login?error=no_token");
            return;
        }

        // Validate theo role
        if (selectedRole === "candidate") {
            if (!fullName.trim() || !phone.trim() || !dob || !address.trim()) {
                setToast({
                    type: "error",
                    message: "Vui lòng nhập đủ: Họ tên, SĐT, Ngày sinh và Địa chỉ.",
                });
                return;
            }
        } else {
            if (!companyName.trim() || !industry.trim() || !location.trim()) {
                setToast({
                    type: "error",
                    message: "Vui lòng nhập đủ: Tên công ty, Ngành và Địa chỉ.",
                });
                return;
            }
        }

        try {
            setLoading(true);

            const profileData =
                selectedRole === "candidate"
                    ? {
                        fullName: fullName.trim(),
                        phone: phone.trim(),
                        dob,
                        sex: sex === "unknown" ? null : sex === "male",
                        address: address.trim(),
                        summary: summary.trim(),
                    }
                    : {
                        companyName: companyName.trim(),
                        industry: industry.trim(),
                        location: location.trim(),
                        website: website.trim(),
                        description: description.trim(),
                    };

            const res = await axios.post(
                `${API_BASE_URL}/set-role`,
                {
                    role: selectedRole,
                    profileData,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data;
            const role = data.user.role.toLowerCase();

            // Update cookies
            const cookieOptions: Cookies.CookieAttributes = {
                expires: 7,
                path: "/",
                sameSite: "lax",
            };

            Cookies.set("token", data.token, cookieOptions);
            Cookies.set("role", role, cookieOptions);

            setToast({ type: "success", message: "Đăng ký thành công!" });

            // Redirect to dashboard
            setTimeout(() => {
                const redirectPath =
                    role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard";
                router.push(redirectPath);
            }, 1000);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            const msg =
                err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            setToast({ type: "error", message: msg });
        } finally {
            setLoading(false);
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

            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="w-full max-w-xl space-y-6">
                    {/* Title */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Hoàn tất đăng ký
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Chọn loại tài khoản và nhập thông tin của bạn.
                        </p>

                        {/* Step indicator */}
                        <div
                            className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1
                         text-[11px] text-slate-600
                         dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${step === 1
                                        ? "bg-slate-900 dark:bg-slate-100"
                                        : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                            />
                            Bước 1: Chọn loại tài khoản
                            <span className="mx-2 h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
                            <span
                                className={`h-2 w-2 rounded-full ${step === 2
                                        ? "bg-slate-900 dark:bg-slate-100"
                                        : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                            />
                            Bước 2: Nhập thông tin
                        </div>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-5
                       dark:border-slate-800 dark:bg-slate-900/70"
                    >
                        {/* STEP 1: Role Selection */}
                        {step === 1 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Candidate */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("candidate")}
                                        className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all
                      ${selectedRole === "candidate"
                                                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                                                : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                                            }`}
                                    >
                                        <div
                                            className={`rounded-full p-3 ${selectedRole === "candidate"
                                                    ? "bg-white/20 dark:bg-slate-900/20"
                                                    : "bg-slate-100 dark:bg-slate-800"
                                                }`}
                                        >
                                            <User size={28} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold">Ứng viên</h3>
                                            <p
                                                className={`text-xs mt-1 ${selectedRole === "candidate"
                                                        ? "text-slate-300 dark:text-slate-600"
                                                        : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            >
                                                Tìm kiếm việc làm phù hợp
                                            </p>
                                        </div>
                                    </button>

                                    {/* Employer */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole("employer")}
                                        className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all
                      ${selectedRole === "employer"
                                                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                                                : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                                            }`}
                                    >
                                        <div
                                            className={`rounded-full p-3 ${selectedRole === "employer"
                                                    ? "bg-white/20 dark:bg-slate-900/20"
                                                    : "bg-slate-100 dark:bg-slate-800"
                                                }`}
                                        >
                                            <Briefcase size={28} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold">Nhà tuyển dụng</h3>
                                            <p
                                                className={`text-xs mt-1 ${selectedRole === "employer"
                                                        ? "text-slate-300 dark:text-slate-600"
                                                        : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            >
                                                Tìm kiếm ứng viên tiềm năng
                                            </p>
                                        </div>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!selectedRole}
                                    className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-3 shadow-sm
                             hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
                             dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                >
                                    Tiếp tục
                                </button>
                            </>
                        )}

                        {/* STEP 2: Profile Form */}
                        {step === 2 && (
                            <>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    >
                                        ← Quay lại
                                    </button>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedRole === "candidate" ? "Ứng viên" : "Nhà tuyển dụng"}
                                    </span>
                                </div>

                                {selectedRole === "candidate" ? (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Thông tin ứng viên
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Họ và tên <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="0xxxxxxxxx"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Ngày sinh <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => setDob(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Giới tính
                                                </label>
                                                <select
                                                    value={sex}
                                                    onChange={(e) =>
                                                        setSex(e.target.value as "male" | "female" | "unknown")
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                >
                                                    <option value="unknown">Khác</option>
                                                    <option value="male">Nam</option>
                                                    <option value="female">Nữ</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Địa chỉ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Quận..., TP..."
                                                />
                                            </div>

                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Tóm tắt bản thân
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={summary}
                                                    onChange={(e) => setSummary(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                                                    placeholder="Tóm tắt ngắn về bản thân..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Thông tin nhà tuyển dụng
                                        </p>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Tên công ty <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="LVCV Tech"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Ngành <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="IT / Education / ..."
                                                />
                                            </div>

                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Địa chỉ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="Hồ Chí Minh / Hà Nội"
                                                />
                                            </div>

                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Website
                                                </label>
                                                <input
                                                    type="text"
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                                    placeholder="https://..."
                                                />
                                            </div>

                                            <div className="space-y-1 sm:col-span-2">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    Mô tả công ty
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                                                    placeholder="Mô tả về công ty..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full rounded-xl bg-slate-900 text-white text-sm font-medium py-3 shadow-sm
                             hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
                             dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                >
                                    {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
