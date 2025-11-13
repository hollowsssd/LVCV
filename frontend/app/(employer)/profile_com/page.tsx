"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Eye,
  UserCheck,
  Plus,
  ChevronRight,
} from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Mock data (nhà tuyển dụng)
========================= */
type Mode = "Remote" | "Hybrid" | "Full-time";
type Posting = {
  id: string;
  title: string;
  location: string;
  mode: Mode;
  salaryMin?: number | "";
  salaryMax?: number | "";
  tags: string[];
  views: number;
  applicants: number;
  createdAt: string; // ISO
};

type Applicant = {
  id: string;
  name: string;
  email: string;
  appliedAt: string; // ISO
  jobId: string;
  resume: string;
  status: "Mới" | "Đang xem" | "Hẹn phỏng vấn" | "Từ chối" | "Đã nhận";
};

const COMPANY = {
  name: "NovaTech Studio",
  logo: "/logo.png",
  cover:
    "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2000&auto=format&fit=crop",
  industry: "Software",
  hq: "TP.HCM",
  size: "51–200",
  website: "https://example.com",
  blurb:
    "Công ty sản phẩm công nghệ, tập trung hiệu năng và trải nghiệm người dùng. Văn hoá chủ động, ship nhanh, mentor 1-1.",
};

const POSTINGS: Posting[] = [
  {
    id: "p1",
    title: "Frontend Developer (Next.js)",
    location: "TP.HCM",
    mode: "Full-time",
    salaryMin: 20,
    salaryMax: 30,
    tags: ["Next.js", "React", "Tailwind"],
    views: 412,
    applicants: 18,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "p2",
    title: "Full-stack (Next.js + Node)",
    location: "Remote",
    mode: "Remote",
    salaryMin: "",
    salaryMax: "",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    views: 355,
    applicants: 25,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "p3",
    title: "UI Engineer (Design System)",
    location: "Đà Nẵng",
    mode: "Hybrid",
    salaryMin: 25,
    salaryMax: 35,
    tags: ["Design System", "A11y"],
    views: 220,
    applicants: 9,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Trần B",
    email: "tranb@example.com",
    appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    jobId: "p1",
    resume: "CV_TranB.pdf",
    status: "Mới",
  },
  {
    id: "a2",
    name: "Lê C",
    email: "lec@example.com",
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    jobId: "p1",
    resume: "CV_LeC.pdf",
    status: "Đang xem",
  },
  {
    id: "a3",
    name: "Ngô D",
    email: "ngod@example.com",
    appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    jobId: "p2",
    resume: "CV_NgoD.pdf",
    status: "Hẹn phỏng vấn",
  },
];

/* =========================
   Helpers
========================= */
function formatSalary(min?: number | "", max?: number | "") {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  if (hasMin && hasMax) return `${min}–${max} triệu`;
  if (hasMin) return `Từ ${min} triệu`;
  if (hasMax) return `Đến ${max} triệu`;
  return "Thoả thuận";
}
function formatDateShort(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/* =========================
   Page: Nhà tuyển dụng
========================= */
export default function RecruiterDashboardPage() {
  const [selectedJob, setSelectedJob] = React.useState<string>(POSTINGS[0]?.id || "");
  const [rows, setRows] = React.useState<Applicant[]>(APPLICANTS);

  const filteredApplicants = rows.filter((a) => a.jobId === selectedJob);

  function setStatus(id: string, status: Applicant["status"]) {
    setRows((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Hero công ty */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="relative h-[180px] sm:h-[220px]">
            <Image src={COMPANY.cover} alt="cover" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/25 to-transparent" />
            <div className="absolute left-4 right-4 bottom-4 flex items-start gap-3 text-white drop-shadow">
              <Image
                src={COMPANY.logo}
                alt="logo"
                width={60}
                height={60}
                className="rounded-2xl border border-white/30 object-cover"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold">{COMPANY.name}</h1>
                <div className="text-sm text-white/90 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Building2 size={14} /> {COMPANY.industry}</span>
                  <span className="inline-flex items-center gap-1"><Users size={14} /> {COMPANY.size}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={14} /> {COMPANY.hq}</span>
                  <a href={COMPANY.website} target="_blank" className="inline-flex items-center gap-1 underline"><Globe size={14} /> Website</a>
                </div>
              </div>
              <div className="ml-auto">
                <Link
                  href="/post"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-white text-black"
                >
                  <Plus size={16} /> Đăng tin tuyển dụng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar trái: mô tả công ty */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40">
            <h2 className="text-base md:text-lg font-semibold mb-2">Giới thiệu</h2>
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {COMPANY.blurb}
            </p>
          </section>

          {/* Stats */}
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40">
            <h2 className="text-base md:text-lg font-semibold mb-3">Tổng quan</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-2xl font-bold">{POSTINGS.length}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Tin đang mở</div>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-2xl font-bold">
                  {POSTINGS.reduce((s, p) => s + p.applicants, 0)}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Ứng viên</div>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="text-2xl font-bold">
                  {POSTINGS.reduce((s, p) => s + p.views, 0)}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Lượt xem</div>
              </div>
            </div>
          </section>
        </aside>

        {/* Nội dung: tin đã đăng + ứng viên */}
        <section className="lg:col-span-2 space-y-6">
          {/* Danh sách tin đang mở */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">Tin đang tuyển</h2>
              <Link href="/jobs" className="text-sm inline-flex items-center gap-1">
                Xem ngoài trang việc làm <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {POSTINGS.map((p) => {
                const salaryText = formatSalary(p.salaryMin, p.salaryMax);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 bg-white/60 dark:bg-black/40 cursor-pointer ${
                      selectedJob === p.id
                        ? "border-black dark:border-white"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                    onClick={() => setSelectedJob(p.id)}
                  >
                    <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                    <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {p.location}</span>
                      <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {p.mode}</span>
                      <span>{salaryText}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">{t}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="inline-flex items-center gap-1"><Eye size={14} /> {p.views}</span>
                      <span className="inline-flex items-center gap-1"><UserCheck size={14} /> {p.applicants}</span>
                      <span>Đăng: {formatDateShort(p.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bảng ứng viên của tin được chọn */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40">
            <h2 className="text-base md:text-lg font-semibold">Ứng viên đã nộp</h2>
            {filteredApplicants.length === 0 ? (
              <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                Chưa có ứng viên cho tin này.
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left">
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2 pr-3">Tên</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Ngày nộp</th>
                      <th className="py-2 pr-3">CV</th>
                      <th className="py-2 pr-3">Trạng thái</th>
                      <th className="py-2 pr-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((a) => (
                      <tr key={a.id} className="border-b border-neutral-100 dark:border-neutral-900">
                        <td className="py-2 pr-3">{a.name}</td>
                        <td className="py-2 pr-3">
                          <a href={`mailto:${a.email}`} className="underline">{a.email}</a>
                        </td>
                        <td className="py-2 pr-3">{formatDateShort(a.appliedAt)}</td>
                        <td className="py-2 pr-3">
                          <button className="rounded-xl px-3 py-1.5 border border-neutral-300 dark:border-neutral-700">
                            {a.resume}
                          </button>
                        </td>
                        <td className="py-2 pr-3">{a.status}</td>
                        <td className="py-2 pr-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setStatus(a.id, "Đang xem")}
                              className="rounded-xl px-3 py-1.5 border border-neutral-300 dark:border-neutral-700"
                            >
                              Đánh dấu đang xem
                            </button>
                            <button
                              onClick={() => setStatus(a.id, "Hẹn phỏng vấn")}
                              className="rounded-xl px-3 py-1.5 border border-neutral-300 dark:border-neutral-700"
                            >
                              Hẹn phỏng vấn
                            </button>
                            <button
                              onClick={() => setStatus(a.id, "Từ chối")}
                              className="rounded-xl px-3 py-1.5 border border-neutral-300 dark:border-neutral-700"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => setStatus(a.id, "Đã nhận")}
                              className="rounded-xl px-3 py-1.5 border border-neutral-300 dark:border-neutral-700"
                            >
                              Nhận vào
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}