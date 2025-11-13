
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  X,
  Paperclip,
  Heart,
  Globe,
  Users,
  ChevronRight,
} from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Types
========================= */
type Mode = "Full-time" | "Remote" | "Hybrid";

type JobDetailRecord = {
  id: string;
  title: string;
  company: string;
  logo: string;              // URL
  location: string;
  mode: Mode;
  salaryMin?: number | "";
  salaryMax?: number | "";
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  website?: string;
  size?: string;
  industry?: string;
  cover?: string;
  postedAtISO?: string;      // ISO
};

/* =========================
   Seed dữ liệu tĩnh (4 job)
========================= */
const JOBS: JobDetailRecord[] = [
  {
    id: "1",
    title: "Frontend Developer (Next.js)",
    company: "NovaTech Studio",
    logo: "/logo.png",
    location: "TP.HCM · Bình Thạnh",
    mode: "Full-time",
    salaryMin: 20,
    salaryMax: 30,
    tags: ["Next.js", "React", "Tailwind"],
    summary:
      "Tham gia đội ngũ phát triển sản phẩm web trên Next.js, tập trung tối ưu SEO (SSR/ISR), hiệu năng và trải nghiệm người dùng cho nền tảng thương mại điện tử nội bộ.",
    responsibilities: [
      "Phát triển UI theo thiết kế Figma, bảo đảm pixel-perfect.",
      "Tối ưu tốc độ tải trang, SEO (SSR/ISR) và Core Web Vitals.",
      "Kết nối REST API/GraphQL, quản lý state (Zustand/Redux).",
      "Viết unit test (RTL/Vitest), review code theo checklist.",
      "Phối hợp Backend/Design/PM, tham gia grooming & retro."
    ],
    requirements: [
      "≥ 1 năm làm việc với React/Next.js, nắm chắc Hooks.",
      "TypeScript, TailwindCSS, hiểu CSR/SSR/SSG, dynamic routes.",
      "Biết tối ưu SEO/OG tags, prefetching, image optimization.",
      "Hiểu Git flow, biết tạo PR rõ ràng, code style nhất quán.",
      "Lợi thế: A11y, Storybook, Zustand/Redux Toolkit."
    ],
    benefits: [
      "Lương 20–30tr + thưởng theo quý.",
      "Cấp MacBook/thiết bị, budget học tập.",
      "Làm việc hybrid, giờ linh hoạt, 12 ngày phép/năm."
    ],
    website: "https://novatech.example",
    size: "11–50",
    industry: "Software",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2400&auto=format&fit=crop",
    postedAtISO: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "2",
    title: "Junior Frontend Engineer",
    company: "Pixelify",
    logo: "/logo.png",
    location: "Hà Nội · Cầu Giấy",
    mode: "Hybrid",
    salaryMin: 12,
    salaryMax: 18,
    tags: ["React", "Vite", "CSS Modules"],
    summary:
      "Xây dựng component library nội bộ, cải thiện DX và tốc độ build (Vite) cho hệ thống landing đa chiến dịch.",
    responsibilities: [
      "Tạo component tái sử dụng theo Design System.",
      "Tối ưu bundle size, split code, lazy-load hình ảnh.",
      "Viết test cơ bản cho component (RTL).",
      "Hỗ trợ vận hành CI (lint/test)."
    ],
    requirements: [
      "Nắm vững JS/TS cơ bản, React hooks.",
      "CSS Modules/Tailwind, responsive tốt.",
      "Git cơ bản, biết tạo PR và xử lý review."
    ],
    benefits: [
      "Lương 12–18tr + thưởng hiệu suất.",
      "On-the-job training 1–1, lộ trình rõ ràng.",
      "Hybrid 3–2, phụ cấp gửi xe/ăn trưa."
    ],
    website: "https://pixelify.example",
    size: "51–200",
    industry: "Software",
    cover:
      "https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2?q=80&w=2400&auto=format&fit=crop",
    postedAtISO: new Date().toISOString()
  },
  {
    id: "3",
    title: "Full-stack (Next.js + NestJS)",
    company: "LiveOne",
    logo: "/logo.png",
    location: "Remote · Toàn quốc",
    mode: "Remote",
    salaryMin: 18,
    salaryMax: 28,
    tags: ["Next.js", "NestJS", "PostgreSQL"],
    summary:
      "Phát triển end-to-end: API với NestJS, giao diện Next.js (SSR/ISR), triển khai lên Vercel/Render.",
    responsibilities: [
      "Thiết kế REST API, auth JWT.",
      "Xây dựng trang SSR/ISR, tối ưu SEO và caching.",
      "Tích hợp DB (Prisma) và viết migration.",
      "Viết tài liệu API, tự động hoá deploy đơn giản."
    ],
    requirements: [
      "Kinh nghiệm TS/Node.js, hiểu NestJS/Express.",
      "ORM (Prisma/TypeORM), PostgreSQL.",
      "Biết Docker cơ bản là lợi thế."
    ],
    benefits: [
      "Remote 100%, giờ linh hoạt.",
      "Thưởng theo kết quả sprint.",
      "Hỗ trợ chi phí Internet/công cụ."
    ],
    website: "https://liveone.example",
    size: "11–50",
    industry: "SaaS",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2400&auto=format&fit=crop",
    postedAtISO: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "4",
    title: "UI Engineer",
    company: "Monox Labs",
    logo: "/logo.png",
    location: "Đà Nẵng · Hải Châu",
    mode: "Full-time",
    salaryMin: 25,
    salaryMax: 35,
    tags: ["Design System", "Storybook", "Accessibility"],
    summary:
      "Xây dựng Design System và tiêu chuẩn hoá UI/UX, đảm bảo A11y cơ bản cho sản phẩm nội bộ.",
    responsibilities: [
      "Thiết kế & xuất bản DS bằng Storybook.",
      "Thiết lập tiêu chuẩn A11y (keyboard, contrast).",
      "Phối hợp Design thống nhất token/variants."
    ],
    requirements: [
      "CSS vững, animation mượt, layout hiện đại.",
      "Kinh nghiệm Storybook, kiểm thử component.",
      "Hiểu guideline WCAG cơ bản."
    ],
    benefits: [
      "Lương 25–35tr, review 6 tháng.",
      "Thiết bị cao cấp, phòng lab UI.",
      "Team văn hoá open, career path rõ."
    ],
    website: "https://monox.example",
    size: "201–500",
    industry: "Product",
    cover:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=2400&auto=format&fit=crop",
    postedAtISO: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

/* =========================
   Helpers
========================= */
function formatSalary(min?: number | "", max?: number | ""): string {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  if (hasMin && hasMax) return `${min}–${max} triệu`;
  if (hasMin) return `Từ ${min} triệu`;
  if (hasMax) return `Đến ${max} triệu`;
  return "Thoả thuận";
}

function formatPostedAt(iso?: string): string {
  if (!iso) return "Mới đăng";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Mới đăng";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

/* =========================
   Reusable UI
========================= */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs border border-neutral-300/70 dark:border-neutral-700/70">
      {children}
    </span>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 p-5 md:p-6">
      <h2 className="text-base md:text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

/* =========================
   SmallJobCard (liên quan)
========================= */
function SmallJobCard({
  id,
  title,
  company,
  logo,
  location,
  mode,
  salaryMin,
  salaryMax,
  tags = [],
}: {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  mode: Mode;
  salaryMin?: number | "";
  salaryMax?: number | "";
  tags?: string[];
}) {
  const [liked, setLiked] = React.useState(false);
  const salaryText = formatSalary(salaryMin, salaryMax);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-black/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <Image
          src={logo || "/logo.png"}
          alt={`${company} logo`}
          width={44}
          height={44}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold line-clamp-1">{title}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Building2 size={16} /> {company}
          </p>
          <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase size={14} /> {mode}
            </span>
            <span>{salaryText}</span>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <motion.button
          onClick={() => setLiked((v) => !v)}
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
          href={`/jobs/${id}`}
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

/* =========================
   Apply Modal
========================= */
function ApplyModal({
  open,
  onClose,
  jobTitle,
}: {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canSubmit = name.trim().length > 1 && validEmail(email) && !!fileName;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">Ứng tuyển</p>
            <h3 className="text-lg font-semibold">{jobTitle}</h3>
          </div>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-sm">
            ✅ Hồ sơ đã được gửi. Nhà tuyển dụng sẽ sớm liên hệ bạn.
          </div>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              setSent(true);
            }}
          >
            <div>
              <label className="text-sm">Họ tên *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-sm">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-sm">CV (PDF/DOCX) *</label>
              <label className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-3 cursor-pointer">
                <Paperclip size={18} /> {fileName ?? "Chọn tệp..."}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFileName(f.name);
                  }}
                />
              </label>
            </div>
            <div>
              <label className="text-sm">Ghi chú (tuỳ chọn)</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                Huỷ
              </button>
              <button
                disabled={!canSubmit}
                className="rounded-xl px-3 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
              >
                Gửi hồ sơ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================
   Hero save button (Heart)
========================= */
function SaveHeroButton() {
  const [liked, setLiked] = React.useState(false);
  return (
    <motion.button
      onClick={() => setLiked((v) => !v)}
      whileTap={{ scale: 0.95 }}
      animate={liked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
        liked
          ? "bg-rose-500 text-white border-rose-500"
          : "border-white/40 text-white hover:bg-white/10"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {liked ? "Đã lưu" : "Lưu tin"}
    </motion.button>
  );
}

/* =========================
   Page
========================= */
export default function JobDetailPage() {
  const p = useParams<{ id: string }>();
  const id = String(p?.id ?? "");

  const [record, setRecord] = React.useState<JobDetailRecord | null>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const found = JOBS.find((j) => j.id === id) ?? JOBS[0];
    setRecord(found);
    setLoading(false);
  }, [id]);

  if (loading || !record) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-neutral-500">
        Đang tải...
      </div>
    );
  }

  const salaryText = formatSalary(record.salaryMin, record.salaryMax);
  const postedAtText = formatPostedAt(record.postedAtISO);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950">
      <Header />

      {/* HERO */}
      <section className="relative h-72 md:h-96">
        {record.cover && (
          <Image src={record.cover} alt="cover" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl text-white">
          <div className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-start gap-4">
              <Image
                src={record.logo || "/logo.png"}
                alt={record.company}
                width={72}
                height={72}
                className="rounded-2xl border border-white/30 object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">{record.title}</h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={16} /> {record.company}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={16} /> {record.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase size={16} /> {record.mode}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={16} /> {postedAtText}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {record.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Actions phải (desktop) */}
              <div className="hidden md:flex flex-col gap-2 items-end">
                <div className="font-semibold">{salaryText}</div>
                <div className="flex gap-2">
                  <SaveHeroButton />
                  <button
                    onClick={() => setOpen(true)}
                    className="rounded-xl px-3 py-2 text-sm bg-white text-black font-semibold"
                  >
                    Ứng tuyển
                  </button>
                </div>
              </div>
            </div>

            {/* Actions mobile */}
            <div className="mt-3 md:hidden flex justify-end gap-2">
              <SaveHeroButton />
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl px-3 py-2 text-sm bg-white text-black font-semibold"
              >
                Ứng tuyển
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6 text-neutral-800 dark:text-neutral-200">
          <SectionCard title="Tổng quan">
            <p className="text-sm leading-6">
              {record.summary && record.summary.trim().length > 0
                ? record.summary
                : "Mô tả ngắn gọn về sản phẩm/đội ngũ/công việc (nội dung mẫu)."}
            </p>
          </SectionCard>

          <SectionCard title="Trách nhiệm">
            {record.responsibilities.length > 0 ? (
              <ul className="space-y-2">
                {record.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span className="text-sm leading-6">{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {[
                  "Phát triển UI theo thiết kế.",
                  "Tối ưu hiệu năng và SEO.",
                  "Kết nối API và viết test cơ bản.",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <span className="text-sm leading-6">{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Yêu cầu">
            {(record.requirements?.length ?? 0) > 0 ? (
              <ul className="list-disc pl-6 space-y-2 text-sm leading-6">
                {record.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <ul className="list-disc pl-6 space-y-2 text-sm leading-6">
                {[
                  "Kinh nghiệm React/Next.js cơ bản.",
                  "TypeScript/TailwindCSS.",
                  "Hiểu CSR/SSR/SSG, Git flow.",
                ].map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quyền lợi">
            {(record.benefits?.length ?? 0) > 0 ? (
              <ul className="list-disc pl-6 space-y-2 text-sm leading-6">
                {record.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : (
              <ul className="list-disc pl-6 space-y-2 text-sm leading-6">
                {[
                  "Lương + thưởng theo quý.",
                  "Thiết bị làm việc, budget học tập.",
                  "Giờ giấc linh hoạt/hybrid.",
                ].map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <SectionCard title="Thông tin công ty">
            <div className="flex items-start gap-3">
              <Image
                src={record.logo || "/logo.png"}
                alt="logo"
                width={48}
                height={48}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
              />
              <div className="min-w-0">
                <div className="font-semibold line-clamp-1">{record.company}</div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 flex flex-wrap items-center gap-3">
                  {record.industry && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={14} /> {record.industry}
                    </span>
                  )}
                  {record.size && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} /> {record.size}
                    </span>
                  )}
                  {record.website && (
                    <a
                      href={record.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline"
                    >
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Việc làm liên quan">
            <div className="grid gap-3">
              {JOBS.filter((j) => j.id !== record.id).slice(0, 3).map((j) => (
                <SmallJobCard
                  key={j.id}
                  id={j.id}
                  title={j.title}
                  company={j.company}
                  logo={j.logo}
                  location={j.location}
                  mode={j.mode}
                  salaryMin={j.salaryMin}
                  salaryMax={j.salaryMax}
                  tags={j.tags}
                />
              ))}
            </div>

            <Link
              href="/jobs"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
            >
              Xem thêm việc khác <ChevronRight size={16} />
            </Link>
          </SectionCard>
        </aside>
      </main>

      <ApplyModal open={open} onClose={() => setOpen(false)} jobTitle={record.title} />
      <Footer />
    </div>
  );
}

