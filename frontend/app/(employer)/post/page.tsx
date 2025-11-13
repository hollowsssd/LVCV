

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  Heart,
  ChevronRight,
  Globe,
  Users,
  Tag as TagIcon,
  Upload,
  Save,
  CheckCircle2,
} from "lucide-react";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Types
========================= */
type Mode = "Full-time" | "Remote" | "Hybrid";
type JobDraft = {
  title: string;
  company: string;
  logo: string; // URL
  location: string;
  mode: Mode;
  salaryMin: number | "";
  salaryMax: number | "";
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  website?: string;
  size?: string;
  industry?: string;
};

/* =========================
   Small UI
========================= */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">
      {children}
    </span>
  );
}
function SectionCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* =========================
   Inputs
========================= */
function Input({
  label,
  required,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        {...rest}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      />
    </label>
  );
}

/* NumberInput: chặn âm, chặn -, +, e/E, ép >= 0 */
function NumberInput({
  label,
  value,
  onValue,
  required,
  placeholder,
}: {
  label: string;
  value: number | "";
  onValue: (n: number | "") => void;
  required?: boolean;
  placeholder?: string;
}) {
  const disallowedKeys = new Set(["e", "E", "+", "-"]);
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        placeholder={placeholder}
        value={value}
        onKeyDown={(e) => {
          if (disallowedKeys.has(e.key)) e.preventDefault();
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[-+eE]/.test(text)) e.preventDefault();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onValue("");
            return;
          }
          const n = Number(raw.replace(/[^\d]/g, ""));
          onValue(Number.isFinite(n) ? Math.max(0, n) : 0);
        }}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      />
    </label>
  );
}

function Textarea({
  label,
  required,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <textarea
        {...rest}
        className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      />
    </label>
  );
}

function ChipsInput({
  label,
  value,
  onChange,
  placeholder = "Nhập thẻ, Enter để thêm (VD: Next.js)",
  icon,
  max = 8,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  max?: number;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-neutral-500">
          {value.length}/{max}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2">
        {icon}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Thêm
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((t) => (
            <span
              key={t}
              className="group inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700"
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== t))}
                className="opacity-60 group-hover:opacity-100"
                aria-label={`Xoá ${t}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BulletsInput({
  label,
  value,
  onChange,
  placeholder = "Gõ nội dung rồi Enter để thêm",
  max = 12,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-neutral-500">
          {value.length}/{max}
        </span>
      </div>
      <div className="mt-1 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Thêm
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 space-y-2">
          {value.map((it, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-1 shrink-0" />
              <span className="flex-1">{it}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                className="text-xs opacity-60 hover:opacity-100"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================
   FeaturedJobCard (Preview) — giống trang chủ
========================= */
function FeaturedJobCardPreview({ j }: { j: JobDraft }) {
  const [liked, setLiked] = React.useState(false);

  const salaryText =
    j.salaryMin !== "" && j.salaryMax !== ""
      ? `${j.salaryMin}–${j.salaryMax} triệu`
      : "Thoả thuận";

  return (
    <div className="group flex flex-col h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <Image
          src={j.logo || "/logo.png"}
          alt={`${j.company || "Company"} logo`}
          width={44}
          height={44}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold line-clamp-1">
            {j.title || "Tiêu đề công việc"}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Building2 size={16} /> {j.company || "Tên công ty"}
          </p>
          <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {j.location || "Địa điểm"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase size={14} /> {j.mode || "Hình thức"}
            </span>
            <span>{salaryText}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(j.tags.length ? j.tags : ["Next.js", "React"]).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 flex items-center justify-between">
        <motion.button
          onClick={() => setLiked(!liked)}
          whileTap={{ scale: 0.9 }}
          animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
            liked
              ? "bg-rose-500 text-white border-rose-500"
              : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          }`}
          aria-label="Lưu việc"
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          {liked ? "Đã lưu" : "Lưu"}
        </motion.button>

        <Link
          href="#"
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
const STORAGE_KEY = "job_draft_v1";

export default function EmployerPostPage() {
  const [saving, setSaving] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<null | "ok" | "err">(null);

  const [draft, setDraft] = React.useState<JobDraft>({
    title: "",
    company: "",
    logo: "/logo.png",
    location: "",
    mode: "Full-time",
    salaryMin: "",
    salaryMax: "",
    tags: [],
    summary: "",
    responsibilities: [],
    requirements: [],
    benefits: [],
    website: "",
    size: "",
    industry: "",
  });

  // Load from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDraft((d) => ({ ...d, ...parsed }));
      }
    } catch {}
  }, []);

  // Auto-save
  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, [draft]);

  const set = <K extends keyof JobDraft>(key: K, val: JobDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  // Validation
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push("Tiêu đề công việc là bắt buộc.");
  if (!draft.company.trim()) errors.push("Tên công ty là bắt buộc.");
  if (!draft.location.trim()) errors.push("Địa điểm làm việc là bắt buộc.");
  if (!draft.summary.trim()) errors.push("Tóm tắt mô tả là bắt buộc.");
  if (draft.salaryMin !== "" && draft.salaryMax !== "" && Number(draft.salaryMin) > Number(draft.salaryMax)) {
    errors.push("Mức lương tối thiểu không được lớn hơn mức lương tối đa.");
  }

  const handleSubmit = async () => {
    if (errors.length) return;
    setSaving(true);
    setSubmitted(null);
    try {
      // TODO: Gọi API thật
      await new Promise((r) => setTimeout(r, 800));
      setSaving(false);
      setSubmitted("ok");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } catch {
      setSaving(false);
      setSubmitted("err");
    }
  };

  // Mock upload
  const onPickLogo = (file: File | undefined | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("logo", url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Đăng tuyển việc làm</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Điền thông tin chi tiết bên dưới. Bạn có thể xem trước tin ở cột bên phải và lưu nháp tự động.
            </p>
          </div>
          <Link href="/jobs" className="hidden md:inline-flex items-center gap-1 text-sm font-medium">
            Tất cả việc làm <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT: form */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard
              title="Thông tin công việc"
              right={
                <span className="text-xs text-neutral-500">
                  Bắt buộc: <span className="text-rose-500">*</span>
                </span>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tiêu đề công việc"
                  required
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="VD: Frontend Developer (Next.js)"
                />
                <Input
                  label="Tên công ty"
                  required
                  value={draft.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="VD: NovaTech Studio"
                />
                <Input
                  label="Địa điểm làm việc"
                  required
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="VD: TP.HCM · Bình Thạnh"
                />

                <label className="block">
                  <span className="text-sm font-medium">Hình thức làm việc</span>
                  <select
                    value={draft.mode}
                    onChange={(e) => set("mode", e.target.value as Mode)}
                    className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
                  >
                    {(["Full-time", "Remote", "Hybrid"] as const).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>

                <NumberInput
                  label="Lương tối thiểu (triệu)"
                  value={draft.salaryMin}
                  onValue={(v) => set("salaryMin", v)}
                  placeholder="VD: 20"
                />
                <NumberInput
                  label="Lương tối đa (triệu)"
                  value={draft.salaryMax}
                  onValue={(v) => set("salaryMax", v)}
                  placeholder="VD: 30"
                />

                {/* Logo */}
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium">Logo công ty</span>
                  <div className="mt-1 flex items-center gap-3">
                    <Image
                      src={draft.logo || "/logo.png"}
                      alt="logo"
                      width={56}
                      height={56}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-2 cursor-pointer text-sm">
                      <Upload size={16} />
                      Chọn tệp
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onPickLogo(e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => set("logo", "/logo.png")}
                      className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                    >
                      Dùng mặc định
                    </button>
                  </div>
                </label>

                <div className="md:col-span-2">
                  <ChipsInput
                    label="Tags / Kỹ năng nổi bật"
                    value={draft.tags}
                    onChange={(v) => set("tags", v)}
                    icon={<TagIcon size={16} />}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Tóm tắt mô tả"
                    required
                    rows={3}
                    value={draft.summary}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Mô tả ngắn gọn về sản phẩm/đội ngũ/công việc..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Chi tiết">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <BulletsInput
                    label="Trách nhiệm chính"
                    value={draft.responsibilities}
                    onChange={(v) => set("responsibilities", v)}
                  />
                </div>
                <div className="md:col-span-1">
                  <BulletsInput
                    label="Yêu cầu"
                    value={draft.requirements}
                    onChange={(v) => set("requirements", v)}
                  />
                </div>
                <div className="md:col-span-2">
                  <BulletsInput
                    label="Quyền lợi"
                    value={draft.benefits}
                    onChange={(v) => set("benefits", v)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Thông tin công ty">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Website"
                  type="url"
                  placeholder="https://company.example"
                  value={draft.website}
                  onChange={(e) => set("website", e.target.value)}
                />
                <Input
                  label="Quy mô"
                  placeholder="VD: 51–200"
                  value={draft.size}
                  onChange={(e) => set("size", e.target.value)}
                />
                <Input
                  label="Ngành"
                  placeholder="VD: Software"
                  value={draft.industry}
                  onChange={(e) => set("industry", e.target.value)}
                />
              </div>
            </SectionCard>

            {/* Errors + Submit */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {errors.length > 0 && (
                <div className="flex-1 rounded-xl border border-rose-300/60 bg-rose-50/60 dark:bg-rose-900/20 p-3 text-sm">
                  <div className="font-semibold mb-1">Vui lòng kiểm tra:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 md:ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
                >
                  <Save size={16} /> Lưu nháp
                </button>
                <button
                  disabled={saving || errors.length > 0}
                  onClick={handleSubmit}
                  className="rounded-xl px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
                >
                  {saving ? "Đang đăng..." : "Đăng tin"}
                </button>
              </div>
            </div>

            {submitted === "ok" && (
              <div className="mt-3 rounded-xl border border-emerald-300/60 bg-emerald-50/70 dark:bg-emerald-900/20 p-3 text-sm">
                🎉 Đăng tin thành công! (Mock) — Bạn có thể chuyển tới{" "}
                <Link href="/jobs" className="underline font-medium">
                  danh sách việc làm
                </Link>
                .
              </div>
            )}
            {submitted === "err" && (
              <div className="mt-3 rounded-xl border border-rose-300/60 bg-rose-50/70 dark:bg-rose-900/20 p-3 text-sm">
                Có lỗi xảy ra khi đăng. Vui lòng thử lại.
              </div>
            )}
          </div>

          {/* RIGHT: Preview card */}
          <div className="lg:col-span-1 space-y-4">
            <SectionCard title="Xem trước (Preview)">
              <FeaturedJobCardPreview j={draft} />
            </SectionCard>

            <SectionCard title="Thông tin công ty (hiển thị tóm tắt)">
              <div className="flex items-start gap-3">
                <Image
                  src={draft.logo || "/logo.png"}
                  alt="logo"
                  width={48}
                  height={48}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
                />
                <div className="min-w-0">
                  <div className="font-semibold line-clamp-1">
                    {draft.company || "Tên công ty"}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                    {draft.industry && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={14} /> {draft.industry}
                      </span>
                    )}
                    {draft.size && (
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} /> {draft.size}
                      </span>
                    )}
                    {draft.website && (
                      <a
                        href={draft.website}
                        target="_blank"
                        className="inline-flex items-center gap-1 underline"
                      >
                        <Globe size={14} /> Website
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(draft.tags.length ? draft.tags.slice(0, 3) : ["Next.js", "React"]).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}