"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Users,
  Globe,
  ChevronRight,
  Heart,
  Briefcase,
  Filter,
} from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Types & Mock
========================= */
type Company = {
  id: string;
  name: string;
  logo: string;
  cover?: string;
  industry: string;
  hq: string;
  size: string;
  website?: string;
  stack: string[];
  openRoles: number;
  blurb: string;
};

const INDUSTRIES = ["Software", "Fintech", "E-commerce", "AI/ML", "Data", "Mobile"];
const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

const COMPANIES: Company[] = Array.from({ length: 24 }).map((_, i) => {
  const name = ["NovaTech", "Pixelify", "LiveOne", "Monox", "Hyperbit", "Orbit Labs"][i % 6];
  const industry = INDUSTRIES[i % INDUSTRIES.length];
  const hq = ["TP.HCM", "Hà Nội", "Đà Nẵng"][i % 3];
  const size = SIZES[i % SIZES.length];
  const open = (i % 6) + 1;
  const stacks = [
    ["Next.js", "React", "TypeScript", "Tailwind"],
    ["Node.js", "NestJS", "PostgreSQL"],
    ["Flutter", "Dart", "Firebase"],
    ["Python", "FastAPI", "Airflow"],
    ["AWS", "Kubernetes", "Terraform"],
  ][i % 5];

  return {
    id: String(i + 1),
    name,
    logo: "/logo.png",
    cover:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1600&auto=format&fit=crop",
    industry,
    hq,
    size,
    website: "https://example.com",
    stack: stacks,
    openRoles: open,
    blurb:
      "Sản phẩm số cho hàng triệu người dùng. Văn hoá chủ động, ship nhanh, khuyến khích học hỏi.",
  };
});

/* =========================
   Small UI
========================= */
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2 py-1 rounded-full text-[11px] border border-neutral-300 dark:border-neutral-700">
    {children}
  </span>
);

const SkeletonCard = () => (
  <div className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/60 dark:bg-black/40 animate-pulse" />
);

const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-10 text-center">
    <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-3" />
    <p className="text-base font-semibold">{title}</p>
    {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
  </div>
);

/* =========================
   CompanyCard (compact như FeaturedJobCard)
========================= */
function CompanyCard({ c }: { c: Company }) {
  const [follow, setFollow] = React.useState(false);

  return (
    <div className="group flex flex-col h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white/70 dark:bg-black/40 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start gap-3">
        <Image
          src={c.logo}
          alt={`${c.name} logo`}
          width={44}
          height={44}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight line-clamp-1">{c.name}</p>

          <div className="mt-1 text-[13px] text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1">
              <Building2 size={14} /> {c.industry}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={14} /> {c.size}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {c.hq}
            </span>
          </div>

          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
            {c.blurb}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {c.stack.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-1 flex items-center justify-between">
        <span className="text-sm text-neutral-600 dark:text-neutral-400 inline-flex items-center gap-1">
          <Briefcase size={14} /> {c.openRoles} vị trí 
        </span>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setFollow((v) => !v)}
            whileTap={{ scale: 0.9 }}
            animate={follow ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
              follow
                ? "bg-rose-500 text-white border-rose-500"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            <Heart size={16} fill={follow ? "currentColor" : "none"} />
            {follow ? "Đang theo dõi" : "Theo dõi"}
          </motion.button>

          <Link
            href={`/detail_com/${c.id}`}
            className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Filters & Sort
========================= */
type FilterState = { q: string; city: string; industry: string; size: string };
type SortKey = "mostRoles" | "nameAZ";

function FilterBar({
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.292-2.06l4.384 4.384l-1.414 1.414l-4.384-4.384A7.962 7.962 0 0 1 10 18m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/></svg>
            <input
              value={value.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Tên công ty, tech stack..."
              className="w-full bg-transparent outline-none py-2"
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-950">
            <MapPin size={18} />
            <input
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="TP.HCM, Hà Nội..."
              className="w-full bg-transparent outline-none py-2"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <select
            value={value.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          >
            <option value="">Ngành nghề</option>
            {INDUSTRIES.map((it) => <option key={it} value={it}>{it}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={value.size}
            onChange={(e) => onChange({ size: e.target.value })}
            className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          >
            <option value="">Quy mô</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-neutral-500">Tech nổi bật:</span>
        {["Next.js", "Node.js", "Flutter", "AWS", "Kubernetes"].map((t) => (
          <button
            key={t}
            onClick={() => onChange({ q: (value.q ? value.q + " " : "") + t })}
            className="px-3 py-1.5 rounded-full text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            {t}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black"
          >
            <Filter size={16} /> Lọc
          </button>
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
        Công ty <span className="text-neutral-500 text-sm">({total})</span>
      </h2>
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-xl border text-sm px-3 py-2 bg-transparent border-neutral-300 dark:border-neutral-700"
      >
        <option value="mostRoles">Đang tuyển nhiều</option>
        <option value="nameAZ">Tên A → Z</option>
      </select>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function CompaniesPage() {
  const [filter, setFilter] = React.useState<FilterState>({ q: "", city: "", industry: "", size: "" });
  const [sort, setSort] = React.useState<SortKey>("mostRoles");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 9;

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    const city = filter.city.trim().toLowerCase();
    return COMPANIES.filter((c) => {
      const qok = q ? `${c.name} ${c.industry} ${c.stack.join(" ")}`.toLowerCase().includes(q) : true;
      const cityOk = city ? c.hq.toLowerCase().includes(city) : true;
      const indOk = filter.industry ? c.industry === filter.industry : true;
      const sizeOk = filter.size ? c.size === filter.size : true;
      return qok && cityOk && indOk && sizeOk;
    });
  }, [filter]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sort === "nameAZ") arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr.sort((a, b) => b.openRoles - a.openRoles);
    return arr;
  }, [filtered, sort]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = React.useMemo(() => sorted.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE), [sorted, page]);

  React.useEffect(() => { setPage(1); }, [filter.q, filter.city, filter.industry, filter.size, sort]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* hero nhỏ */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="relative h-[180px] sm:h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop"
              alt="Companies cover"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/25 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white drop-shadow">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Khám phá các công ty đang tuyển</h1>
              <p className="text-sm text-white/90">Card nhỏ, 3 cột — giống “Featured” ở trang chủ</p>
            </div>
          </div>
        </div>
      </section>

      {/* filters */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <FilterBar value={filter} onChange={(p) => setFilter((s) => ({ ...s, ...p }))} onSubmit={() => {}} />
      </section>

      {/* list */}
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <SortBar sort={sort} onChange={setSort} total={total} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : total === 0 ? (
          <EmptyState title="Chưa tìm thấy công ty phù hợp" subtitle="Thử đổi bộ lọc hoặc từ khoá tìm kiếm." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {pageItems.map((c) => <CompanyCard key={c.id} c={c} />)}
            </div>

            {/* pagination */}
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-xl px-3 py-2 text-sm border ${
                    n === page
                      ? "bg-black text-white border-black dark:bg-white dark:text-black"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium">
                Xem việc đang tuyển <ChevronRight size={16} />
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

