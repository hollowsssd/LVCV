
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Filter,
  ChevronRight,
  Heart,
} from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Types & Utils
========================= */
type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;         // public path or external
  location: string;     // "TP.HCM", "Hà Nội", "Remote"...
  mode: "Remote" | "Hybrid" | "Full-time";
  salaryMin: number;    // triệu VND
  salaryMax: number;    // triệu VND
  postedAt: "Hôm nay" | "Hôm qua" | "3 ngày trước" | "1 tuần trước";
  tags: string[];
  desc: string;
};

type FilterState = {
  q: string;
  city: string;
  mode: "" | Job["mode"];
  salaryMin: number; // filter theo mức tối thiểu
};
type SortKey = "newest" | "salaryDesc" | "salaryAsc";

/* =========================
   Mock Data (48 jobs)
========================= */
const COMPANIES = ["NovaTech", "Pixelify", "LiveOne", "Monox", "Hyperbit", "Orbit Labs"];
const LOCATIONS = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Remote"];
const MODES: Job["mode"][] = ["Remote", "Hybrid", "Full-time"];
const TAGS_POOL = ["Next.js", "React", "TypeScript", "Tailwind", "Node.js", "REST", "Design System"];

function makeJobs(count = 48): Job[] {
  const arr: Job[] = [];
  for (let i = 1; i <= count; i++) {
    const company = COMPANIES[i % COMPANIES.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const mode = MODES[i % MODES.length];
    const min = 12 + ((i * 2) % 20); // 12 -> ~50
    const max = min + (i % 6);       // spread 0-5
    const posted: Job["postedAt"][] = ["Hôm nay", "Hôm qua", "3 ngày trước", "1 tuần trước"];
    const k = i % posted.length;
    const tags = Array.from({ length: 3 }, (_, t) => TAGS_POOL[(i + t) % TAGS_POOL.length]);

    arr.push({
      id: String(i),
      title:
        i % 5 === 0
          ? "UI Engineer (Design System)"
          : i % 3 === 0
          ? "Full-stack Developer (Next.js + Node)"
          : "Frontend Developer (Next.js / React)",
      company,
      logo: "/logo.png",
      location,
      mode,
      salaryMin: min,
      salaryMax: max,
      postedAt: posted[k],
      tags,
      desc:
        "Tham gia product team xây dựng web app với Next.js 14 (App Router), tối ưu hiệu năng SSR/ISR, phối hợp backend tích hợp API.",
    });
  }
  return arr;
}
const ALL_JOBS = makeJobs();

/* =========================
   Small bits
========================= */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">
      {children}
    </span>
  );
}
function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3" />
      <p className="text-base font-semibold">{title}</p>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}
function SkeletonCard() {
  return (
    <div className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-black/40 animate-pulse" />
  );
}

/* ========================================================================
   FeaturedJobCard — card nhỏ, giống trang chủ (nút Lưu có animation & đổi màu)
========================================================================= */
type FeaturedCardProps = {
  j: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;          // map từ job.mode
    salary: string;        // map từ salaryMin–salaryMax
    logo: string;
    tags: string[];
  };
};
function FeaturedJobCard({ j }: FeaturedCardProps) {
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

      {/* footer actions */}
      <div className="mt-4 pt-2 flex items-center justify-between">
        <motion.button
          onClick={() => setLiked(!liked)}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: liked ? [1, 1.2, 1] : 1,
            rotate: liked ? [0, -10, 10, 0] : 0,
          }}
          transition={{ duration: 0.35 }}
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
          href={`/detail/${j.id}`}
          className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

/* =========================
   Filter + Sort + Pagination
========================= */
function FilterPanel({
  value,
  onChange,
  onSubmit,
}: {
  value: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-black/40 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M10 18a8 8 0 1 1 5.292-2.06l4.384 4.384l-1.414 1.414l-4.384-4.384A7.962 7.962 0 0 1 10 18m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12"
              />
            </svg>
            <input
              value={value.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Vị trí, kỹ năng, công ty..."
              className="w-full bg-transparent outline-none py-2"
            />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <MapPin size={18} className="shrink-0" />
            <input
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="TP.HCM, Hà Nội, Remote..."
              className="w-full bg-transparent outline-none py-2"
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <button
            onClick={onSubmit}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium bg-black text-white dark:bg-white dark:text-black"
          >
            <Filter size={16} /> Lọc
          </button>
        </div>
      </div>

      {/* quick chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["", "Remote", "Hybrid", "Full-time"] as const).map((m) => (
          <button
            key={m || "all"}
            onClick={() => onChange({ mode: m as FilterState["mode"] })}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              value.mode === m
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            {m || "Tất cả chế độ"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Lương tối thiểu:</span>
          <select
            value={value.salaryMin}
            onChange={(e) => onChange({ salaryMin: Number(e.target.value) })}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1"
          >
            {[0, 10, 15, 20, 25, 30, 40].map((v) => (
              <option key={v} value={v}>
                {v === 0 ? "Không lọc" : `${v}+ triệu`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SortBar({
  sort,
  onChange,
  total,
}: {
  sort: SortKey;
  onChange: (s: SortKey) => void;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6">
      <h2 className="text-lg md:text-xl font-semibold">
        Việc làm mới <span className="text-neutral-500 text-sm">({total})</span>
      </h2>
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-xl border text-sm px-3 py-2 bg-transparent border-neutral-300 dark:border-neutral-700"
      >
        <option value="newest">Mới nhất</option>
        <option value="salaryDesc">Lương cao → thấp</option>
        <option value="salaryAsc">Lương thấp → cao</option>
      </select>
    </div>
  );
}

function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="mt-6 flex justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
      >
        Trước
      </button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`rounded-xl px-3 py-2 text-sm border ${
            n === page
              ? "bg-black text-white border-black dark:bg-white dark:text-black"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        disabled={page === pages}
        onClick={() => onPage(page + 1)}
        className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function JobsPage() {
  const [filter, setFilter] = React.useState<FilterState>({
    q: "",
    city: "",
    mode: "",
    salaryMin: 0,
  });
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 9; // 3 cột x 3 hàng cho đẹp

  // simulate loading
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  // derived
  const filtered = React.useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    const city = filter.city.trim().toLowerCase();

    return ALL_JOBS.filter((j) => {
      const qok = q
        ? `${j.title} ${j.company} ${j.location} ${j.tags.join(" ")}`.toLowerCase().includes(q)
        : true;
      const cityOk = city ? j.location.toLowerCase().includes(city) : true;
      const modeOk = filter.mode ? j.mode === filter.mode : true;
      const salaryOk = filter.salaryMin ? j.salaryMin >= filter.salaryMin : true;
      return qok && cityOk && modeOk && salaryOk;
    });
  }, [filter]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sort === "salaryDesc") arr.sort((a, b) => b.salaryMax - a.salaryMax);
    else if (sort === "salaryAsc") arr.sort((a, b) => a.salaryMin - b.salaryMin);
    else {
      const score = (s: Job["postedAt"]) =>
        s === "Hôm nay" ? 3 : s === "Hôm qua" ? 2 : s === "3 ngày trước" ? 1 : 0;
      arr.sort((a, b) => score(b.postedAt) - score(a.postedAt));
    }
    return arr;
  }, [filtered, sort]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  React.useEffect(() => {
    setPage(1);
  }, [filter.q, filter.city, filter.mode, filter.salaryMin, sort]);

  // helper: map Job -> FeaturedJobCard props
  const toFeatured = (job: Job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.mode,
    salary: `${job.salaryMin}–${job.salaryMax} triệu`,
    logo: job.logo,
    tags: job.tags,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Hero nhỏ */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="relative h-[180px] sm:h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop"
              alt="Jobs cover"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/25 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white drop-shadow">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Khám phá việc làm phù hợp
              </h1>
              <p className="text-sm text-white/90">
                Lọc theo kỹ năng, địa điểm, chế độ làm việc và mức lương
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <FilterPanel
          value={filter}
          onChange={(p) => setFilter((s) => ({ ...s, ...p }))}
          onSubmit={() => {}}
        />
      </section>

      {/* List */}
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <SortBar sort={sort} onChange={setSort} total={total} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : total === 0 ? (
          <EmptyState
            title="Không tìm thấy công việc phù hợp"
            subtitle="Thử thay đổi từ khóa, địa điểm hoặc bộ lọc."
          />
        ) : (
          <>
            {/* 3 cột như trang chủ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {pageItems.map((job) => (
                <FeaturedJobCard key={job.id} j={toFeatured(job)} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

