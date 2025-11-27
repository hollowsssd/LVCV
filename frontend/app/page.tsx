"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useMemo, useState, type ReactNode } from "react";

type Role = "candidate" | "employer";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function IconCheck() {
  return (
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] text-slate-600">
      {children}
    </span>
  );
}

export default function HomePage() {
  const authedRole = useMemo<Role | null>(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    if (!token) return null;
    return role === "candidate" || role === "employer" ? role : null;
  }, []);

  const [selectedRole, setSelectedRole] = useState<Role>(
    authedRole ?? "candidate"
  );

  // CTA Hero 1: đã login thì vào dashboard đúng role; chưa login thì qua register role
  const primaryHref = authedRole
    ? authedRole === "candidate"
      ? "/candidate/dashboard"
      : "/employer/dashboard"
    : `/auth/register?role=${selectedRole}`;

  const primaryLabel = "Bắt đầu";

  const roleBullets =
    selectedRole === "candidate"
      ? [
          "AI chấm điểm CV và góp ý cụ thể nên sửa gì.",
          "Gợi ý job phù hợp dựa trên kỹ năng/ngành/địa điểm.",
          "Apply bằng CV snapshot đúng thời điểm nộp.",
        ]
      : [
          "Đăng job, hệ thống tạo embedding từ mô tả công việc.",
          "Gợi ý ứng viên match cao + xem người đã apply.",
          "Duyệt/từ chối/hẹn phỏng vấn ngay trong hệ thống.",
        ];

  // ✅ Hero 2: CTA KHÔNG trùng “Bắt đầu” nữa — đổi theo role (Upload CV / Tạo job)
  const roleForAction: Role = authedRole ?? selectedRole;

  const secondaryCta =
    roleForAction === "candidate"
      ? {
          title: "Thử với CV của bạn",
          desc: "Upload CV để nhận CV score/feedback thật (không phải demo).",
          label: "Upload CV thật",
          href: authedRole === "candidate"
            ? "/candidate/dashboard"
            : "/auth/register?role=candidate",
        }
      : {
          title: "Thử với Job của bạn",
          desc: "Tạo job để nhận matching ứng viên theo % phù hợp.",
          label: "Tạo job thật",
          href: authedRole === "employer"
            ? "/employer/dashboard"
            : "/auth/register?role=employer",
        };

  return (
    <div className="space-y-16">
      {/* HERO 1 */}
      <section className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/70 shadow-sm">
        <div className="absolute inset-0">
          <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_55%)]" />
        </div>

        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <div className="grid lg:grid-cols-[1.25fr,0.75fr] gap-10 items-center">
            {/* Left */}
            <div className="space-y-7">


              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
                  AI chấm điểm CV
                  <span className="block text-slate-500">
                    và gợi ý cơ hội phù hợp
                  </span>
                </h1>

                <p className="text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
                  Upload CV để AI phân tích, nhận xét điểm mạnh/điểm thiếu và gợi
                  ý việc làm/thực tập theo kỹ năng, ngành và địa điểm.
                </p>
              </div>

              {/* Role switch */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("candidate")}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-medium transition",
                      selectedRole === "candidate"
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    🎓 Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("employer")}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-medium transition",
                      selectedRole === "employer"
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    🏢 Employer
                  </button>
                </div>

                
              </div>

              {/* Bullets */}
              <ul className="space-y-2 text-sm text-slate-600">
                {roleBullets.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <IconCheck />
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {primaryLabel}
                </Link>

                <a
                  href="#demo-hero"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
                >
                  Xem demo
                </a>

                {!authedRole && (
                  <span className="text-[11px] text-slate-500">
                    <Link
                      href="/auth/login"
                      className="text-slate-900 underline"
                    >
                    </Link>
                  </span>
                )}
              </div>
            </div>

            {/* Right mini summary */}
            <div className="hidden lg:block">
              <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Kết quả bạn sẽ thấy:
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <IconCheck /> <span>CV Score + feedback chỉnh CV</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <IconCheck /> <span>Danh sách phù hợp theo % match</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <IconCheck /> <span>Apply / duyệt / hẹn phỏng vấn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO 2 */}
      <section
        id="demo-hero"
        className="scroll-mt-20 relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/70 shadow-sm"
      >
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.05),transparent_55%)]" />
        </div>

        <div className="relative px-6 py-10 md:px-12 md:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                Demo kết quả từ AI
              </h2>
              <p className="text-sm text-slate-600">
                Đây là preview UI. Kết quả thật sẽ có sau khi upload CV / tạo Job.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Demo card */}
            <div className="relative rounded-[30px] border border-slate-200 bg-white/95 shadow-xl">
              <div className="p-6 md:p-7 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Demo từ AI
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">CV Score</p>
                    <p className="text-4xl font-semibold text-slate-900 leading-none">
                      82<span className="text-base text-slate-500">/100</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700">
                      Match Backend Intern · 91%
                    </span>
                   
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="font-semibold text-slate-900 mb-2">Điểm mạnh</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      <li>Node.js + SQL rõ ràng</li>
                      <li>Project API thực tế</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="font-semibold text-slate-900 mb-2">
                      Cần cải thiện
                    </p>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      <li>Thiếu metric định lượng</li>
                      <li>Thiếu Summary</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-900">Job gợi ý</p>
                  <div className="space-y-2">
                    {[
                      {
                        title: "Backend Intern",
                        meta: "HCMC · Intern",
                        match: "91%",
                      },
                      {
                        title: "Node.js Junior",
                        meta: "Remote · Junior",
                        match: "84%",
                      },
                    ].map((j) => (
                      <div
                        key={j.title}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-900 transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {j.title}
                          </p>
                          <p className="text-[11px] text-slate-500">{j.meta}</p>
                        </div>
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] text-white">
                          {j.match}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Legend + CTA (KHÔNG trùng “Bắt đầu”) */}
            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Giải thích nhanh
                </p>
               

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-slate-900">
                      CV Score (0–100)
                    </p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      Điểm tổng quan do AI đánh giá dựa trên cấu trúc, nội dung,
                      keyword và độ phù hợp với vị trí.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-slate-900">Match %</p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      % tương đồng giữa embedding CV và embedding Job Description
                      (có thể cộng thêm filter ngành/địa điểm/level).
                    </p>
                  </div>

               
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  {secondaryCta.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{secondaryCta.desc}</p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    {secondaryCta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Tính năng chính</h2>
          
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "AI Review CV",
              tag: "Scoring",
              desc: "Trích xuất nội dung, chấm điểm, nhận xét điểm mạnh/điểm thiếu và gợi ý chỉnh sửa.",
            },
            {
              title: "AI Job Matching",
              tag: "Similarity",
              desc: "Embedding CV & job description → similarity → quy đổi % match để xếp hạng.",
            },
            {
              title: "Apply / Tuyển dụng",
              tag: "Workflow",
              desc: "Apply lưu CV snapshot. Employer xem ứng tuyển theo job và duyệt/từ chối/hẹn phỏng vấn.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                  {f.tag}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (✅ id đúng) */}
      <section id="how-it-works" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Cách hoạt động</h2>
         
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Upload CV / Tạo Job",
              desc: "Lưu file + metadata phục vụ phân tích & matching.",
            },
            {
              step: "2",
              title: "AI phân tích & embedding",
              desc: "AI tạo feedback, CV score và embedding cho CV/Job.",
            },
            {
              step: "3",
              title: "Matching & xếp hạng",
              desc: "Tính similarity → % match → đề xuất job/candidate phù hợp.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  {s.step}
                </span>
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR WHOM */}
      <section id="for-whom" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Đối tượng sử dụng</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidate */}
          <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1">
              🎓 Candidate
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              Dành cho sinh viên & người tìm việc
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Xem CV score và feedback chi tiết.",
                "Xem job phù hợp theo % match, lọc theo địa điểm.",
                "Apply nhanh bằng CV snapshot.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <IconCheck />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>

            <Link
              href={
                authedRole === "candidate"
                  ? "/candidate/dashboard"
                  : "/auth/login"
              }
              className="inline-flex text-sm font-medium text-slate-900 hover:underline"
            >
              Trải nghiệm Candidate →
            </Link>
          </div>

          {/* Employer */}
          <div className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1">
              🏢 Employer
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              Dành cho nhà tuyển dụng
            </h3>

            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Đăng job và nhận gợi ý ứng viên theo % match.",
                "Xem danh sách ứng viên đã apply theo từng job.",
                "Duyệt/từ chối/hẹn phỏng vấn ngay trong hệ thống.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <IconCheck />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>

            <Link
              href={
                authedRole === "employer"
                  ? "/employer/dashboard"
                  : "/auth/login"
              }
              className="inline-flex text-sm font-medium text-slate-900 hover:underline"
            >
              Trải nghiệm Employer →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}