"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/Toast";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function CreateJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("Intern");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // validate đơn giản phía FE
    if (!title || !location || !description) {
      setToast({
        type: "error",
        message:
          "Vui lòng nhập đầy đủ: Tên job, Địa điểm và Mô tả công việc.",
      });
      return;
    }

    // bạn có thể validate skills không bắt buộc, nhưng khuyến khích có
    if (!skills) {
      setToast({
        type: "error",
        message:
          "Vui lòng nhập ít nhất một vài kỹ năng yêu cầu cho job (cách nhau bằng dấu phẩy).",
      });
      return;
    }

    try {
      setLoading(true);

      // TODO: gọi API backend Node.js thật
      // const res = await fetch("/api/employer/jobs", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     title,
      //     location,
      //     level,
      //     skills: skills.split(",").map((s) => s.trim()),
      //     description,
      //   }),
      // });
      // if (!res.ok) throw new Error("Tạo job thất bại");

      // DEMO: giả lập API thành công
      await new Promise((r) => setTimeout(r, 700));

      setToast({
        type: "success",
        message: "Tạo job thành công! Hệ thống có thể bắt đầu dùng job này để AI matching CV.",
      });

      // Sau khi thành công: bạn có thể redirect về dashboard
      // setTimeout(() => {
      //   router.push("/employer/dashboard");
      // }, 1000);

      // Hoặc reset form (nếu không redirect)
      setTitle("");
      setLocation("");
      setLevel("Intern");
      setSkills("");
      setDescription("");
    } catch (err) {
      setToast({
        type: "error",
        message: "Không thể tạo job. Vui lòng thử lại sau.",
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
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Tạo job mới
            </h1>
            <p className="text-sm text-slate-500">
              Nhập thông tin job. Hệ thống sẽ dùng mô tả & kỹ năng để AI sinh
              embedding và matching với CV.
            </p>
          </div>
        </div>

        {/* Form */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Tên job */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Tên job <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Backend Intern (Node.js)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* Địa điểm & Level */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Địa điểm làm việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: HCMC, Hà Nội hoặc Remote"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option value="Intern">Intern</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Junior">Junior</option>
                  <option value="Middle">Middle</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Kỹ năng yêu cầu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Ví dụ: Node.js, Express, PostgreSQL, REST API"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Nhập các kỹ năng, ngăn cách bằng dấu phẩy. Backend có thể tách
                thành mảng để lưu DB & dùng cho AI matching.
              </p>
            </div>

            {/* Mô tả */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Mô tả chi tiết công việc, stack sử dụng, nhiệm vụ chính, yêu cầu cơ bản..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:bg-white resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Mô tả càng rõ ràng, AI sinh embedding & matching CV càng chính
                xác (đây là phần rất quan trọng để trình bày trong đồ án).
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                Các trường có dấu <span className="text-red-500">*</span> là bắt
                buộc. Dữ liệu sau khi submit sẽ được backend lưu và gửi sang AI
                service để sinh embedding cho job.
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
