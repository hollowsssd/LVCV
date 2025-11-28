import Link from "next/link";

const mockJobs = [
  { id: 1, title: "Backend Intern", createdAt: "2025-11-18", status: "OPEN" as const, candidates: 12 },
  { id: 2, title: "Frontend React Junior", createdAt: "2025-11-10", status: "OPEN" as const, candidates: 8 },
];

function StatusPill({ status }: { status: "OPEN" | "CLOSED" | "DRAFT" }) {
  const map = {
    OPEN: "Đang mở",
    CLOSED: "Đã đóng",
    DRAFT: "Nháp",
  } as const;

  const cls =
    status === "OPEN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "CLOSED"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      {map[status]}
    </span>
  );
}

export default function EmployerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Employer Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý job và xem danh sách ứng viên.
          </p>
        </div>

        <Link
          href="/employer/createjob"
          className="shrink-0 rounded-full bg-slate-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-slate-800"
        >
          + Tạo job
        </Link>
      </div>

      {/* Jobs */}
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Job đã đăng</h2>
          <span className="text-[11px] text-slate-500">
            {mockJobs.length} job
          </span>
        </div>

        {mockJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
            Chưa có job nào. Bấm <span className="font-medium">“Tạo job”</span> để đăng tin đầu tiên.
          </div>
        ) : (
          <div className="space-y-2">
            {mockJobs.map((job) => (
              <Link
                key={job.id}
                href={`/employer/jobs/${job.id}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:border-slate-900 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 group-hover:underline">
                      {job.title}
                    </p>
                    <StatusPill status={job.status} />
                  </div>
                  <p className="text-xs text-slate-500">Tạo ngày {job.createdAt}</p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Ứng viên</p>
                  <p className="text-sm font-semibold text-slate-900">{job.candidates}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}