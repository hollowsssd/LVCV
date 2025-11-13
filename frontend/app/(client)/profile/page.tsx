// app/profile/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Briefcase, Clock, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";

/* ========= Types ========= */
type Mode = "Remote" | "Hybrid" | "Full-time";

type Job = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  mode: Mode;
  salaryMin: number | ""; // cho phép "" nếu chưa có
  salaryMax: number | "";
  postedAt: "Hôm nay" | "Hôm qua" | "3 ngày trước" | "1 tuần trước";
  tags: string[];
};

type Applied = Job & {
  appliedAtISO: string;
  status: "Đã nộp" | "Đang review" | "Đã phỏng vấn" | "Từ chối";
};

/* ========= Dummy data ========= */
const SAVED_JOBS: Job[] = [
  {
    id: "1",
    title: "Frontend Developer (Next.js)",
    company: "NovaTech Studio",
    logo: "/logo.png",
    location: "TP.HCM · Bình Thạnh",
    mode: "Full-time",
    salaryMin: 20,
    salaryMax: 30,
    postedAt: "Hôm qua",
    tags: ["Next.js", "React", "Tailwind"],
  },
  {
    id: "2",
    title: "Full-stack (Next.js + NestJS)",
    company: "LiveOne JSC",
    logo: "/logo.png",
    location: "Remote",
    mode: "Remote",
    salaryMin: "",
    salaryMax: "",
    postedAt: "Hôm nay",
    tags: ["Next.js", "NestJS", "PostgreSQL"],
  },
];

const APPLIED_JOBS: Applied[] = [
  {
    id: "3",
    title: "UI Engineer (Design System)",
    company: "Monox Labs",
    logo: "/logo.png",
    location: "Đà Nẵng",
    mode: "Hybrid",
    salaryMin: 25,
    salaryMax: 35,
    postedAt: "3 ngày trước",
    tags: ["Design System", "Storybook"],
    appliedAtISO: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Đang review",
  },
  {
    id: "4",
    title: "Junior Frontend Engineer",
    company: "Pixelify",
    logo: "/logo.png",
    location: "Hà Nội · Cầu Giấy",
    mode: "Full-time",
    salaryMin: 12,
    salaryMax: 18,
    postedAt: "1 tuần trước",
    tags: ["React", "REST"],
    appliedAtISO: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: "Đã nộp",
  },
];

/* ========= Helpers ========= */
function formatSalary(min: number | "", max: number | "") {
  if (min === "" && max === "") return "Thoả thuận";
  if (min !== "" && max !== "") return `${min}–${max} triệu`;
  if (min !== "") return `${min}+ triệu`;
  return `${max} triệu`;
}
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

/* ========= Page ========= */
export default function ProfilePage() {
  // likedMap: id -> boolean
  const [likedMap, setLikedMap] = React.useState<Record<string, boolean>>({
    // có thể khởi tạo theo dữ liệu server
    "1": true,
  });

  // tab: saved / applied
  const [tab, setTab] = React.useState<"saved" | "applied">("saved");

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Header đơn giản */}
<Header/>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white/60 dark:bg-black/40">
          <div className="flex items-start gap-4">
            <Image
              src="/logo.png"
              alt="avatar"
              width={64}
              height={64}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">Nguyễn Văn A</h1>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Frontend (Next.js/React). 1+ năm kinh nghiệm, quan tâm vị trí Hybrid/Remote.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Next.js", "TypeScript", "Tailwind", "REST"].map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => setTab("saved")}
              className={`px-3 py-2 rounded-xl text-sm border ${
                tab === "saved"
                  ? "bg-black text-white border-black dark:bg-white dark:text-black"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              Việc đã lưu
            </button>
            <button
              onClick={() => setTab("applied")}
              className={`px-3 py-2 rounded-xl text-sm border ${
                tab === "applied"
                  ? "bg-black text-white border-black dark:bg-white dark:text-black"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              Đã ứng tuyển
            </button>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "saved" ? (
          <section>
            <h2 className="text-lg md:text-xl font-semibold">Việc đã lưu</h2>

            {SAVED_JOBS.length === 0 ? (
              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Chưa có việc lưu.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <AnimatePresence>
                  {SAVED_JOBS.map((j: Job) => {
                    const salaryText = formatSalary(j.salaryMin, j.salaryMax);
                    const isLiked = !!likedMap[j.id]; // ✅ dùng isLiked, không “đè” state

                    return (
                      <motion.div
                        key={j.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="h-full flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-black/40"
                      >
                        <div className="flex items-start gap-3">
                          <Image
                            src={j.logo || "/logo.png"}
                            alt="logo"
                            width={44}
                            height={44}
                            className="rounded-xl border border-neutral-200 dark:border-neutral-800 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight line-clamp-1">{j.title}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                              <Building2 size={16} /> {j.company}
                            </p>
                            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 flex flex-wrap gap-3">
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={14} /> {j.location}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Briefcase size={14} /> {j.mode}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock size={14} /> {j.postedAt}
                              </span>
                              <span>{salaryText}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {j.tags.slice(0, 4).map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <motion.button
                            onClick={() =>
                              setLikedMap((s) => ({ ...s, [j.id]: !s[j.id] }))
                            }
                            whileTap={{ scale: 0.9 }}
                            animate={isLiked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className={`rounded-xl px-3 py-2 text-sm border transition flex items-center gap-1 ${
                              isLiked
                                ? "bg-rose-500 text-white border-rose-500"
                                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            }`}
                          >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                            {isLiked ? "Bỏ lưu" : "Lưu"}
                          </motion.button>

                          <Link
                            href={`/detail/${j.id}`}
                            className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-4">
              <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-medium">
                Tìm thêm việc <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-lg md:text-xl font-semibold">Đã ứng tuyển</h2>

            {APPLIED_JOBS.length === 0 ? (
              <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Bạn chưa ứng tuyển công việc nào.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {APPLIED_JOBS.map((j) => (
                  <div
                    key={j.id}
                    className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-black/40"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={j.logo || "/logo.png"}
                        alt="logo"
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
                            <Briefcase size={14} /> {j.mode}
                          </span>
                          <span>{formatSalary(j.salaryMin, j.salaryMax)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {j.tags.slice(0, 4).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-700">
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 size={16} />
                            Trạng thái: <strong className="ml-1">{j.status}</strong>
                          </span>
                          <span className="opacity-60">•</span>
                          <span>Đã nộp: {formatDate(j.appliedAtISO)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/detail/${j.id}`}
                        className="rounded-xl px-3 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                      >
                        Xem chi tiết
                      </Link>
                      <button className="rounded-xl px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                        Thu hồi hồ sơ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer đơn giản */}
     <Footer/>
    </div>
  );
}