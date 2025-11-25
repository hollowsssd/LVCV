import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="grid lg:grid-cols-[1.5fr,1fr] gap-10 items-center">
        {/* LEFT: HERO CONTENT */}
        <div className="space-y-8">
          {/* Badge nhỏ */}
         

          {/* Tiêu đề + mô tả */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Để AI đọc CV của bạn
              <span className="block text-slate-500">
                và kết nối bạn với những cơ hội phù hợp nhất.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
              Hệ thống giúp sinh viên và người tìm việc upload CV, để AI tự động
              phân tích, chấm điểm, nhận xét điểm mạnh – điểm yếu và gợi ý việc làm /
              thực tập phù hợp với ngành, kỹ năng, vị trí và địa điểm mong muốn.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/candidate/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium shadow-sm hover:bg-slate-800"
            >
              Tôi là Candidate
            </Link>
            <Link
              href="/employer/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-slate-300 text-sm font-medium text-slate-700 bg-white/80 hover:border-slate-900 hover:text-slate-900"
            >
              Tôi là Employer
            </Link>
          </div>

          {/* 2 box mô tả tính năng chính */}
          <div
            id="features"
            className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600"
          >
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-1 shadow-sm">
              <p className="font-semibold text-slate-900">
                Phân tích CV bằng AI
              </p>
              <p>
                AI trích xuất thông tin, chấm điểm CV và đưa ra nhận xét chi tiết
                về bố cục, kỹ năng, kinh nghiệm, keyword cho vị trí mong muốn.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-1 shadow-sm">
              <p className="font-semibold text-slate-900">
                Gợi ý việc làm thông minh
              </p>
              <p>
                Sử dụng vector embedding để so khớp CV với mô tả công việc, kết
                hợp kỹ năng, ngành, địa điểm, level để xếp hạng độ phù hợp.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: PREVIEW CARD DEMO KẾT QUẢ AI */}
        <div className="relative">
          {/* vệt sáng nền */}
          <div className="absolute -top-10 -right-4 h-32 w-32 rounded-full bg-slate-200/60 blur-3xl" />

          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Preview kết quả phân tích CV 
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-xl p-6 space-y-4">
              {/* CV Score + badge */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">CV Score (AI đánh giá)</p>
                  <p className="text-3xl font-semibold text-slate-900">82/100</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 border border-emerald-100 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Phù hợp Backend Intern
                  </div>
                  <p className="text-[10px] text-slate-500">
                    *Khi tích hợp AI thật, score & gợi ý này sẽ lấy từ backend.
                  </p>
                </div>
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-900">Điểm mạnh</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    <li>Stack backend rõ ràng (Node.js, SQL).</li>
                    <li>Có project triển khai API thực tế.</li>
                  </ul>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-900">Cần cải thiện</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    <li>Thiếu số liệu định lượng (performance).</li>
                    <li>Nên thêm mục Career Summary.</li>
                  </ul>
                </div>
              </div>

              {/* Suggested jobs */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-900">
                  Job gợi ý từ AI
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-slate-900 transition">
                    <div>
                      <p className="font-medium text-slate-900">
                        Backend Intern
                      </p>
                      <p className="text-slate-500">
                        HCMC · 0–1 năm kinh nghiệm
                      </p>
                    </div>
                    <span className="text-[11px] rounded-full bg-slate-900 text-white px-2 py-0.5">
                      Match 91%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-slate-900 transition">
                    <div>
                      <p className="font-medium text-slate-900">
                        Node.js Developer (Junior)
                      </p>
                      <p className="text-slate-500">Remote · Junior</p>
                    </div>
                    <span className="text-[11px] rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">
                      Match 84%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Card này rất hợp để bạn chụp màn hình bỏ vào slide bảo vệ, minh
              họa rõ: AI chấm CV + gợi ý job.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Hệ thống hoạt động như thế nào?
            </h2>
            <p className="text-xs text-slate-500">
              Tóm tắt pipeline AI từ lúc upload CV đến khi gợi ý job.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <p className="font-semibold text-slate-900">Upload CV</p>
            </div>
            <p>
              Candidate upload CV (PDF/DOCX). Backend gọi AI service để trích
              xuất thông tin, phân tích nội dung, sinh embedding cho CV.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <p className="font-semibold text-slate-900">Đánh giá & feedback</p>
            </div>
            <p>
              AI chấm điểm CV dựa trên cấu trúc, kỹ năng, kinh nghiệm, từ khóa;
              sinh ra feedback gồm điểm mạnh, hạn chế, gợi ý chỉnh sửa cụ thể.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <p className="font-semibold text-slate-900">Matching job</p>
            </div>
            <p>
              Embedding CV được so khớp với embedding Job Description, kết hợp
              ngành, kỹ năng, địa điểm để xếp hạng các job phù hợp nhất.
            </p>
          </div>
        </div>
      </section>

      {/* FOR WHOM */}
      <section
        id="for-whom"
        className="grid md:grid-cols-2 gap-6 items-stretch"
      >
        {/* Candidate */}
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1">
            🎓 Candidate
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Dành cho sinh viên & người tìm việc
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5">
            <li>Đánh giá nhanh CV hiện tại, biết mình đang ở mức nào.</li>
            <li>
              Nhận feedback cụ thể: thiếu gì, nên thêm phần nào, sửa câu chữ ra sao.
            </li>
            <li>Xem danh sách job/thực tập phù hợp nhất với profile.</li>
          </ul>
          <Link
            href="/candidate/dashboard"
            className="inline-flex text-xs font-medium text-slate-900 hover:underline"
          >
            Vào Candidate Dashboard →
          </Link>
        </div>

        {/* Employer */}
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-3 py-1">
            🏢 Employer
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Dành cho nhà tuyển dụng
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5">
            <li>Đăng Job với mô tả & yêu cầu kỹ năng.</li>
            <li>
              Hệ thống tự động gợi ý các CV phù hợp nhất theo match score.
            </li>
            <li>
              Tiết kiệm thời gian lọc CV thủ công, tập trung phỏng vấn ứng viên tốt.
            </li>
          </ul>
          <Link
            href="/employer/dashboard"
            className="inline-flex text-xs font-medium text-slate-900 hover:underline"
          >
            Vào Employer Dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}
