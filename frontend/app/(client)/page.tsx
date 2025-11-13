"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, Building2, ChevronRight, Heart } from "lucide-react";

import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

/* =========================
   Types & Mock
========================= */
type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  mode: "Remote" | "Hybrid" | "Full-time";
  salaryMin: number; // triệu
  salaryMax: number; // triệu
  tags: string[];
  desc: string;
};

const BANNERS = [
  {
    id: "b1",
    title: "Tuyển Frontend Next.js — Lương 20–30tr",
    subtitle: "Ưu tiên sinh viên mới tốt nghiệp có project cá nhân",
    image:
      "https://images.unsplash.com/photo-1558624232-75ee22af7e95?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Xem ngay", href: "#jobs" },
  },
  {
    id: "b2",
    title: "Remote jobs cho Developer ở VN",
    subtitle: "Làm tại nhà, phúc lợi đầy đủ, môi trường quốc tế",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Khám phá", href: "#jobs" },
  },
  {
    id: "b3",
    title: "Thực tập sinh Frontend có lộ trình",
    subtitle: "Mentor 1-1, training Next.js/App Router",
    image:
      "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Ứng tuyển", href: "#jobs" },
  },
];

const COMPANIES = ["NovaTech", "Pixelify", "LiveOne", "Monox", "Hyperbit", "Orbit Labs"];
const LOCATIONS = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Remote"];
const MODES: Job["mode"][] = ["Remote", "Hybrid", "Full-time"];
const TAGS_POOL = ["Next.js", "React", "TypeScript", "Tailwind", "Node.js", "REST", "Design System"];

function makeJobs(count = 12): Job[] {
  const arr: Job[] = [];
  for (let i = 1; i <= count; i++) {
    const company = COMPANIES[i % COMPANIES.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const mode = MODES[i % MODES.length];
    const min = 12 + ((i * 2) % 20);
    const max = min + (i % 6);
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
      tags,
      desc:
        "Tham gia product team xây dựng web app với Next.js 14 (App Router), tối ưu hiệu năng SSR/ISR, phối hợp backend tích hợp API.",
    });
  }
  return arr;
}
const FEATURED = makeJobs(12); // hiển thị 12 job nổi bật

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

/* =========================
   Banner Slider (hero)
========================= */
function BannerSlider() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative h-[220px] sm:h-[280px] md:h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={BANNERS[index].id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${BANNERS[index].image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end gap-3 text-white">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow">
                  {BANNERS[index].title}
                </h2>
                <p className="text-sm sm:text-base text-white/90 max-w-2xl drop-shadow">
                  {BANNERS[index].subtitle}
                </p>
                <div>
                  <a
                    href={BANNERS[index].cta.href}
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    {BANNERS[index].cta.label}
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* dots */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Chuyển banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   FeaturedJobCard — card giống trang Việc Làm (nút Lưu animation)
========================================================================= */
type FeaturedCardProps = {
  j: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;     // map từ job.mode
    salary: string;   // map từ salaryMin–salaryMax
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
   Page
========================= */
export default function HomePage() {
  // map Job -> FeaturedJobCard props
  const toFeatured = React.useCallback(
    (job: Job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.mode,
      salary: `${job.salaryMin}–${job.salaryMax} triệu`,
      logo: job.logo,
      tags: job.tags,
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Header />

      {/* Banner slider */}
      <BannerSlider />

      {/* Featured jobs (card giống trang việc làm) */}
      <section id="jobs" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Việc làm nổi bật</h2>
          <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium">
            Xem tất cả việc làm <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnimatePresence>
            {FEATURED.slice(0, 9).map((job) => (
              <div key={job.id} className="h-full">
                <FeaturedJobCard j={toFeatured(job)} />
              </div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/jobs"
            className="rounded-xl px-5 py-2 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Xem thêm việc làm
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}