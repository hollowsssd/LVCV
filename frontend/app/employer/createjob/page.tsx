"use client";

import { FormEvent, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import Toast from "@/app/components/Toast";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiErrorResponse = {
  message?: string;
};

type CreateJobPayload = {
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  isNegotiable: boolean;
  location: string;
  jobType: string;
  experienceRequired: string;
  deadline: string; // YYYY-MM-DD
  status: string;
};

const API_BASE_URL = "http://localhost:8080";

function toNumberSafe(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// chỉ giữ số 0-9
function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

// chặn các phím có thể tạo ký tự không mong muốn cho số: -, +, e, E, ., ,
function blockBadNumberKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["-", "+", "e", "E", ".", ","].includes(e.key)) e.preventDefault();
}

export default function CreateJobPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Onsite");
  const [experienceRequired, setExperienceRequired] = useState("0-1 year");

  const [salaryMin, setSalaryMin] = useState<string>("0");
  const [salaryMax, setSalaryMax] = useState<string>("0");
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true);

  const [deadline, setDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [status, setStatus] = useState<string>("OPEN");
  const [description, setDescription] = useState("");

  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => Cookies.get("token") || "", []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !description.trim()) {
      setToast({
        type: "error",
        message: "Vui lòng nhập đầy đủ: Title, Location và Description.",
      });
      return;
    }

    // salary
    const min = toNumberSafe(salaryMin);
    const max = toNumberSafe(salaryMax);

    if (!isNegotiable) {
      if (min < 0 || max < 0) {
        setToast({ type: "error", message: "Salary không hợp lệ." });
        return;
      }
      if (max > 0 && min > max) {
        setToast({
          type: "error",
          message: "SalaryMin không được lớn hơn SalaryMax.",
        });
        return;
      }
    }

    if (!deadline) {
      setToast({ type: "error", message: "Vui lòng chọn Deadline." });
      return;
    }

    if (!token) {
      setToast({
        type: "error",
        message: "Bạn chưa đăng nhập. Vui lòng đăng nhập Employer để tạo job.",
      });
      return;
    }

    const payload: CreateJobPayload = {
      title: title.trim(),
      description: description.trim(),
      salaryMin: isNegotiable ? 0 : min,
      salaryMax: isNegotiable ? 0 : max,
      isNegotiable,
      location: location.trim(),
      jobType,
      experienceRequired,
      deadline,
      status,
    };

    try {
      setLoading(true);

      await axios.post(`${API_BASE_URL}/api/jobs`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // NOTE: Origin KHÔNG cần set thủ công, browser tự set.
          // Để đây cũng không sao, nhưng không bắt buộc.
          Origin: "http://localhost:3000",
        },
      });

      setToast({
        type: "success",
        message:
          "Tạo job thành công! Job này sẽ dùng cho AI matching (embedding + % match).",
      });

      // reset
      setTitle("");
      setLocation("");
      setJobType("Onsite");
      setExperienceRequired("0-1 year");
      setSalaryMin("0");
      setSalaryMax("0");
      setIsNegotiable(true);
      setDescription("");
      setStatus("OPEN");

      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDeadline(d.toISOString().slice(0, 10));
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      setToast({
        type: "error",
        message:
          err.response?.data?.message ?? "Không thể tạo job. Vui lòng thử lại.",
      });
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

      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Tạo job mới
          </h1>

        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Backend Intern (Node.js)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* Location + JobType */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Ho Chi Minh / Ha Noi / Remote"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Vị trí ứng tuyển
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Experience + Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Số năm kinh nghiệm
                </label>
                <select
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option value="0-1 year">0–1 year</option>
                  <option value="1-2 years">1–2 years</option>
                  <option value="2-3 years">2–3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Thời hạn nộp <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* Salary + Negotiable */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Mức lương
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Thoả thuận
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Salary Min */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Tối thiểu
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={salaryMin}
                    disabled={isNegotiable}
                    onKeyDown={blockBadNumberKeys}
                    onChange={(e) => setSalaryMin(digitsOnly(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData("text");
                      setSalaryMin(digitsOnly(text));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:bg-slate-100"
                    placeholder="0"
                  />
                </div>

                {/* Salary Max */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Tối đa{" "}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={salaryMax}
                    disabled={isNegotiable}
                    onKeyDown={blockBadNumberKeys}
                    onChange={(e) => setSalaryMax(digitsOnly(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData("text");
                      setSalaryMax(digitsOnly(text));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 disabled:bg-slate-100"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                placeholder="Mô tả chi tiết công việc, yêu cầu kỹ năng, nhiệm vụ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white resize-none"
              />
              
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                Các trường có dấu <span className="text-red-500">*</span> là bắt
                buộc.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo job"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
