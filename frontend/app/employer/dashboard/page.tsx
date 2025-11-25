import Link from "next/link";

const mockJobs = [
  {
    id: 1,
    title: "Backend Intern",
    createdAt: "2025-11-18",
    candidates: 12,
  },
  {
    id: 2,
    title: "Frontend React Junior",
    createdAt: "2025-11-10",
    candidates: 8,
  },
];

export default function EmployerDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Employer Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Đăng job và xem danh sách CV mà AI đánh giá là phù hợp nhất.
          </p>
        </div>
  <Link
    href="/employer/createjob"
    className="rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800"
  >
    + Tạo job mới
  </Link>

      </div>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Job đã đăng
          </h2>
          <span className="text-[11px] text-slate-500">
            AI sẽ sinh embedding từ description & skills của job để matching.
          </span>
        </div>

        <div className="space-y-2">
          {mockJobs.map((job) => (
            <Link
              key={job.id}
              href={`/employer/jobs/${job.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:border-slate-900 transition"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-900">
                  {job.title}
                </p>
                <p className="text-xs text-slate-500">
                  Ngày tạo: {job.createdAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500">
                  Candidate được AI gợi ý
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {job.candidates}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
