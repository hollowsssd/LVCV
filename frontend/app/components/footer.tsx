export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/90">
      {/* thanh gradient mỏng trên footer */}
      <div className="h-[1px] w-full bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900" />

      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start sm:justify-between">
          {/* Cột 1: brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
                AI
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  AI JobMatch
                </span>
                <span className="text-[11px] text-slate-500">
                  IT A2· CNTT
                </span>
              </div>
            </div>
            <p className="max-w-xs text-[11px] leading-relaxed">
              Hệ thống phân tích CV &amp; gợi ý việc làm/thực tập bằng AI dành cho
              sinh viên và nhà tuyển dụng.
            </p>
          </div>

          {/* Cột 2: links nhanh */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-900">
              Điều hướng
            </p>
            <div className="flex flex-col gap-1">
              <a href="/candidate/dashboard" className="hover:text-slate-900">
                Candidate Dashboard
              </a>
              <a href="/employer/dashboard" className="hover:text-slate-900">
                Employer Dashboard
              </a>
              <a href="#how-it-works" className="hover:text-slate-900">
                Cách hệ thống hoạt động
              </a>
            </div>
          </div>

          {/* Cột 3: info */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-900">
              Thông tin đồ án
            </p>
            <p className="max-w-xs text-[11px]">
              Mục tiêu: giúp sinh viên dễ dàng tiếp cận cơ hội nghề nghiệp, đồng
              thời hỗ trợ nhà tuyển dụng lọc &match CV tự động bằng AI.
            </p>
            <p className="text-[11px]">
              © {new Date().getFullYear()} · IT A2
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
