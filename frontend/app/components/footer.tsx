import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/90
                       dark:border-slate-800 dark:bg-slate-950/70">
      {/* thanh gradient mỏng trên footer */}
      <div className="h-[1px] w-full bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900
                      dark:from-slate-100 dark:via-slate-500 dark:to-slate-100" />

      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start sm:justify-between">
          {/* Cột 1: brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* LOGO IMAGE */}
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Image
                  src="/logo.png"
                  alt="LVCV Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  LVCV - AI JobMatch
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  VKIT · IT A2
                </span>
              </div>
            </div>

            <p className="max-w-xs text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Hệ thống phân tích CV &amp; gợi ý việc làm/thực tập bằng AI dành cho
              sinh viên và nhà tuyển dụng.
            </p>
          </div>

          {/* Cột 2: links nhanh */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">
              Điều hướng
            </p>
            <div className="flex flex-col gap-1">
              <Link
                href="/candidate/dashboard"
                className="hover:text-slate-900 dark:hover:text-slate-100"
              >
                Candidate Dashboard
              </Link>
              <Link
                href="/employer/dashboard"
                className="hover:text-slate-900 dark:hover:text-slate-100"
              >
                Employer Dashboard
              </Link>
              <Link
                href="/#how-it-works"
                className="hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cách hệ thống hoạt động
              </Link>
            </div>
          </div>

          {/* Cột 3: info */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">
              Thông tin đồ án
            </p>
            <p className="max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
              Mục tiêu: giúp sinh viên dễ dàng tiếp cận cơ hội nghề nghiệp, đồng
              thời hỗ trợ nhà tuyển dụng lọc &amp; match CV tự động bằng AI.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} · By Hoàng - Minh - Văn
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
