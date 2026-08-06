# Frontend - LVCV

Đây là phần giao diện web của LVCV. Frontend được viết bằng Next.js App Router, chia luồng rõ cho ứng viên và nhà tuyển dụng.

Frontend không tự xử lý nghiệp vụ chính; nó gọi backend ở `http://localhost:8080` để đăng nhập, lấy job, upload CV, ứng tuyển, đặt lịch phỏng vấn và nhận thông báo.

## Công nghệ

- Next.js `16`
- React `19`
- TypeScript
- Tailwind CSS `4`
- Axios
- Socket.IO Client
- next-themes
- js-cookie
- lucide-react

## Cấu trúc chính

```text
frontend/
├── app/
│   ├── auth/             # Login, register, OAuth callback, select role
│   ├── candidate/        # Dashboard, job, profile, CV
│   ├── employer/         # Dashboard, create job, job detail, profile
│   ├── components/       # Modal, card, toast, header, footer
│   ├── hooks/            # Hook Socket.IO
│   ├── utils/            # Axios API helper, auth guard utils
│   ├── layout.tsx
│   └── page.tsx
├── public/               # Logo, placeholder, icon
├── proxy.ts              # Guard route theo token/role
└── package.json
```

## Chạy frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Chạy dev server:

```bash
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
```

Chạy môi trường development.

```bash
npm run build
```

Build production.

```bash
npm run start
```

Chạy bản production sau khi build.

```bash
npm run lint
```

Kiểm tra lint.

## Các màn hình chính

### Public / Auth

- `/`: landing page giới thiệu LVCV.
- `/auth/login`: đăng nhập.
- `/auth/register`: đăng ký.
- `/auth/oauth-callback`: nhận token sau Google OAuth.
- `/auth/select-role`: chọn role nếu tài khoản OAuth chưa có role.

### Candidate

- `/candidate/dashboard`: upload CV, chấm CV, lưu CV và xem job gợi ý.
- `/candidate/job`: xem/tìm kiếm job.
- `/candidate/profile`: cập nhật hồ sơ ứng viên.
- `/candidate/cv/draft`: xem báo cáo CV vừa chấm.
- `/candidate/cv/[id]`: xem CV đã lưu.

### Employer

- `/employer/dashboard`: xem job đã đăng và lịch phỏng vấn.
- `/employer/createjob`: tạo tin tuyển dụng.
- `/employer/jobs/[id]`: xem chi tiết job và ứng viên apply.
- `/employer/profile`: cập nhật hồ sơ công ty.

## Auth guard

File `proxy.ts` kiểm tra cookie `token` và role người dùng:

- Chưa đăng nhập mà vào `/candidate`, `/employer`, `/admin` thì chuyển về login.
- Role `CANDIDATE` chỉ được vào route candidate.
- Role `EMPLOYER` chỉ được vào route employer.
- Nếu đăng nhập rồi mà vào login/register thì chuyển về dashboard tương ứng.

## Kết nối backend

Frontend lấy base URL từ:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Nếu không có env này, code sẽ fallback về:

```text
http://localhost:8080
```

Các file đang dùng cấu hình này gồm `app/utils/api.ts` và một số page gọi API trực tiếp bằng Axios.

Riêng Socket.IO hiện đang hardcode URL trong `app/hooks/useSocket.ts`:

```text
http://localhost:8080
```

Nếu đổi port/domain backend, nhớ sửa cả chỗ này.
