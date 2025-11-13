"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  MapPin,
  Building2,
  Users,
  Globe,
  Heart,
  ChevronRight,
  Briefcase,
  Phone,
  Mail,
} from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* ========== Types ========== */
type Company = {
  id: string;
  name: string;
  logo: string;
  cover?: string;
  industry: string;
  hq: string;
  size: string;
  website?: string;

  // NEW – thông tin liên hệ
  address: string;
  phone: string;
  email: string;

  stack: string[];
  blurb: string;  // mô tả ngắn
  about: string;  // mô tả dài
  openRoles: Job[];
};
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  logo: string;
  tags: string[];
};

/* ========== Mock getCompany ========== */
function getCompany(id: string): Company {
  return {
    id,
    name: "NovaTech Studio",
    logo: "/logo.png",
    cover:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2400&auto=format&fit=crop",
    industry: "Software",
    hq: "TP.HCM",
    size: "51–200",
    website: "https://example.com",

    // Liên hệ mẫu
    address: "Tầng 8, 123 Nguyễn Văn Thủ, Q.1, TP.HCM",
    phone: "028 3888 8888",
    email: "hr@novatech.vn",

    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Node.js"],
    blurb:
      "Công ty sản phẩm công nghệ, tập trung hiệu năng và trải nghiệm người dùng.",
    about:
      "NovaTech xây dựng các nền tảng web hiện đại dùng Next.js & Node. Văn hoá chủ động, ship nhanh, khuyến khích học hỏi và mentor 1-1. Quy trình code review, CI/CD, theo dõi Web Vitals, data-driven.",
    openRoles: Array.from({ length: 6 }).map((_, i) => ({
      id: String(i + 1),
      title:
        i % 3 === 0
          ? "Frontend Developer (Next.js)"
          : i % 3 === 1
          ? "Full-stack Developer (Next.js + Node)"
          : "UI Engineer (Design System)",
      company: "NovaTech Studio",
      location: ["TP.HCM", "Remote", "Hà Nội"][i % 3],
      type: ["Full-time", "Remote", "Hybrid"][i % 3],
      salary: ["20–30 triệu", "30–45 triệu", "Thoả thuận"][i % 3],
      logo: "/logo.png",
      tags:
        i % 3 === 0
          ? ["Next.js", "React", "Tailwind"]
          : i % 3 === 1
          ? ["Next.js", "Node.js", "PostgreSQL"]
          : ["Design System", "A11y", "Storybook"],
    })),
  };
}

/* ========== Small UI ========== */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">
      {children}
    </span>
  );
}

/* ===== FeaturedJobCard (style y hệt trang chủ) ===== */
function FeaturedJobCard({ j }: { j: Job }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <div className="group flex flex-col h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <Image
          src={j.logo}
          alt={`${j.company} logo`}
          width={44}
          height={44}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold line-clamp-1">{j.title}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
            <Building2 size={16} /> {j.company}
          </p>
          <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {j.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase size={14} /> {j.type}
            </span>
            <span>{j.salary}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {j.tags.map((t) => (
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
          href={`/jobs/${j.id}`}
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

/* ========== Page ========== */
export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "1");

  const [company, setCompany] = React.useState<Company | null>(null);
  const [follow, setFollow] = React.useState(false);

  React.useEffect(() => {
    setCompany(getCompany(id));
  }, [id]);

  if (!company)
    return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* HERO */}
      <section className="relative h-60 md:h-72">
        {company.cover ? (
          <Image src={company.cover} alt="cover" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl text-white">
          <div className="rounded-2xl bg-black/35 backdrop-blur-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-start gap-4">
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl border border-white/30 object-cover"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {company.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={16} /> {company.industry}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={16} /> {company.size}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={16} /> {company.hq}
                  </span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      className="inline-flex items-center gap-1 underline"
                    >
                      <Globe size={16} /> Website
                    </a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {company.stack.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>

              {/* follow (desktop) */}
              <div className="hidden md:flex items-center gap-2">
                <motion.button
                  onClick={() => setFollow((v) => !v)}
                  whileTap={{ scale: 0.9 }}
                  animate={follow ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
                    follow
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-white/40 text-white hover:bg-white/10"
                  }`}
                >
                  <Heart size={16} fill={follow ? "currentColor" : "none"} />
                  {follow ? "Đang theo dõi" : "Theo dõi"}
                </motion.button>
              
              </div>
            </div>

            {/* actions mobile */}
            <div className="mt-3 md:hidden flex justify-end gap-2">
              <motion.button
                onClick={() => setFollow((v) => !v)}
                whileTap={{ scale: 0.9 }}
                animate={follow ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
                  follow
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-white/40 text-white"
                }`}
              >
                <Heart size={16} fill={follow ? "currentColor" : "none"} />
                {follow ? "Đang theo dõi" : "Theo dõi"}
              </motion.button>
              <Link
                href="#open-roles"
                className="rounded-xl px-3 py-2 text-sm font-semibold bg-white text-black"
              >
                Vị trí đang tuyển
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* ===== Giới thiệu + Thông tin công ty (đã thêm địa chỉ/điện thoại/email) ===== */}
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 p-5 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-3">Giới thiệu</h2>

          {/* Tên công ty + blurb */}
          <div className="mb-4">
            <p className="text-lg font-semibold">{company.name}</p>
            <p className="text-neutral-700 dark:text-neutral-300 mt-1">{company.blurb}</p>
          </div>

          {/* Lưới thông tin liên hệ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="text-sm text-neutral-500 mb-2">Thông tin liên hệ</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{company.address}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0" />
                  <a href={`tel:${company.phone}`} className="hover:underline">
                    {company.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0" />
                  <a href={`mailto:${company.email}`} className="hover:underline">
                    {company.email}
                  </a>
                </li>
                {company.website && (
                  <li className="flex items-start gap-2">
                    <Globe size={16} className="mt-0.5 shrink-0" />
                    <a
                      href={company.website}
                      target="_blank"
                      className="hover:underline"
                    >
                      {company.website}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="text-sm text-neutral-500 mb-2">Thông tin chung</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Building2 size={16} className="mt-0.5 shrink-0" />
                  <span>Ngành: {company.industry}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users size={16} className="mt-0.5 shrink-0" />
                  <span>Quy mô: {company.size}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>Trụ sở: {company.hq}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700">
                    Tech stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {company.stack.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* About dài */}
          <div className="mt-4">
            <div className="text-sm text-neutral-500 mb-1">Về {company.name}</div>
            <p className="text-neutral-700 dark:text-neutral-300">{company.about}</p>
          </div>
        </section>

        {/* Open roles */}
        <section
          id="open-roles"
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 p-5 md:p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold">
              Đang tuyển ({company.openRoles.length})
            </h2>
            <Link href="/jobs" className="text-sm font-medium inline-flex items-center gap-1">
              Tất cả việc làm <ChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-4 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {company.openRoles.map((j) => (
              <FeaturedJobCard key={j.id} j={j} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

