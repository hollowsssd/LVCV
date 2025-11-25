const mockCvDetail = {
  score: 84,
  summary:
    "Sinh viên năm 4 CNTT, định hướng Backend, có kinh nghiệm Node.js, REST API, PostgreSQL. Đã tham gia nhiều project môn học và 1–2 dự án cá nhân.",
  strengths: [
    "Đã liệt kê rõ ràng stack backend: Node.js, Express, PostgreSQL, REST API.",
    "Có project mô tả chi tiết chức năng, kiến trúc API.",
    "Bố cục CV gọn gàng, dễ đọc, có phân chia section hợp lý.",
  ],
  weaknesses: [
    "Thiếu mục Career Objective / Summary ở phần đầu CV.",
    "Câu chữ trong phần kinh nghiệm còn chung chung, thiếu số liệu.",
    "Chưa nhấn mạnh những kỹ năng quan trọng nhất cho vị trí Backend Intern.",
  ],
  fixes: [
    "Thêm 2–3 dòng Summary ở đầu: giới thiệu ngắn gọn background + vị trí mong muốn.",
    "Bổ sung số liệu định lượng (thời gian response, số user, tỉ lệ lỗi…) vào phần project.",
    "Tách riêng mục Skills: Languages, Frameworks, Databases, Tools để nhà tuyển dụng nhìn lướt là hiểu.",
  ],
};

export default function CvDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Báo cáo phân tích CV
          </h1>
          <p className="text-sm text-slate-500">
            Kết quả AI chấm điểm và nhận xét chi tiết CV của bạn.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-right shadow-sm">
          <p className="text-xs text-slate-500">CV Score</p>
          <p className="text-2xl font-semibold text-slate-900">
            {mockCvDetail.score}/100
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Tóm tắt hồ sơ (AI diễn giải)
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {mockCvDetail.summary}
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-emerald-900">
            ✅ Điểm mạnh
          </h3>
          <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1.5">
            {mockCvDetail.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-amber-900">
            ⚠️ Hạn chế
          </h3>
          <ul className="list-disc list-inside text-xs text-amber-900 space-y-1.5">
            {mockCvDetail.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        {/* Fixes */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-2 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            ✏️ Gợi ý chỉnh sửa cụ thể
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5">
            {mockCvDetail.fixes.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            *Bạn có thể sử dụng các bullet trên để chỉnh sửa CV, sau đó upload lại
            và so sánh điểm số, rất phù hợp để minh chứng hiệu quả AI trong báo cáo
            đồ án.
          </p>
        </div>
      </section>
    </div>
  );
}
