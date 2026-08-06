# LVCV

LVCV là một nền tảng tuyển dụng có tích hợp AI. Ứng viên có thể upload CV để được chấm điểm, nhận góp ý và tìm job phù hợp. Nhà tuyển dụng có thể đăng tin, xem ứng viên ứng tuyển, cập nhật trạng thái hồ sơ và đặt lịch phỏng vấn.

## Folder

- [Frontend Next.js](frontend/README.md): giao diện web cho candidate/employer, cách chạy và cấu hình API URL.
- [Backend Express](backend/README.md): API, database, upload file, auth, Socket.IO và chấm điểm CV bằng Python/Gemini.

## Project này có gì?

### Cho ứng viên

- Đăng ký, đăng nhập, đăng nhập Google.
- Tạo/chỉnh sửa hồ sơ cá nhân.
- Upload CV dạng `PDF`, `DOC`, `DOCX`.
- Chấm điểm CV bằng AI theo vị trí ứng tuyển.
- Xem báo cáo CV: điểm tổng, độ phù hợp, điểm mạnh, điểm yếu, gợi ý sửa.
- Tìm job và ứng tuyển bằng CV đã lưu.
- Theo dõi lịch phỏng vấn và thông báo.

### Cho nhà tuyển dụng

- Tạo/chỉnh sửa hồ sơ công ty.
- Đăng tin tuyển dụng.
- Xem danh sách job đã đăng.
- Xem ứng viên ứng tuyển vào từng job.
- Duyệt, từ chối hoặc cập nhật trạng thái application.
- Tạo lịch phỏng vấn, có link phòng Jitsi.
- Nhận thông báo realtime qua Socket.IO.

## Cấu trúc project

```text
LVCV/
├── frontend/       # Next.js app
└── backend/        # Express API + Sequelize + Socket.IO
```

Luồng chạy chính:

```text
Browser
  │
  └── Next.js frontend
        │
        └── Express backend ──> MySQL
               │
               ├── Socket.IO notification
               ├── Google OAuth
               ├── Nodemailer OTP
               └── Python worker ──> Gemini API
```

## Công nghệ 
| Phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, Socket.IO Client |
| Backend | Node.js, Express 5, Sequelize, MySQL, JWT, Passport Google OAuth, Socket.IO |
| AI CV | Python, Gemini API, PyMuPDF, python-docx |

## Chạy project

Nên chạy backend trước, sau đó chạy frontend.

### 1. database

Tạo database MySQL:

```sql
CREATE DATABASE lvcv;
```

Config mặc định đang ở `backend/config/config.json`:

```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "lvcv",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Nếu máy bạn dùng user/password khác, sửa file này hoặc dùng biến môi trường theo cách bạn triển khai.

### 2. Chạy backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:

```env
JWT_SECRET=replace-with-a-long-secret

FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

EMAIL_USER=
EMAIL_PASS=

GEMINI_KEY=
PYTHON_PATH=python
CV_WORKER_POOL_SIZE=3
```

Chạy migration:

```bash
npx sequelize-cli db:migrate
```

Chạy server:

```bash
npm start
```

Backend chạy ở:

```text
http://localhost:8080
```

### 3. Cài Python cho chức năng chấm CV

Nếu chỉ chạy web và API cơ bản thì có thể bỏ qua bước này. Nếu muốn dùng API chấm CV, cài thêm thư viện Python:

```bash
pip install google-genai python-dotenv pymupdf python-docx docx2pdf
```

Trong đó:

- `google-genai` dùng để gọi Gemini.
- `pymupdf` dùng để đọc/highlight PDF.
- `python-docx` và `docx2pdf` hỗ trợ file Word.

### 4. Chạy frontend

```bash
cd frontend
npm install
```

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy ở:

```text
http://localhost:3000
```

## Các màn hình chính

- `/`: landing page.
- `/auth/login`: đăng nhập.
- `/auth/register`: đăng ký.
- `/auth/select-role`: chọn role sau OAuth.
- `/candidate/dashboard`: dashboard ứng viên, upload/chấm CV và gợi ý job.
- `/candidate/job`: danh sách job cho ứng viên.
- `/candidate/profile`: hồ sơ ứng viên.
- `/candidate/cv/draft`: xem báo cáo CV vừa chấm.
- `/candidate/cv/[id]`: xem CV đã lưu.
- `/employer/dashboard`: dashboard nhà tuyển dụng.
- `/employer/createjob`: tạo job.
- `/employer/jobs/[id]`: chi tiết job và danh sách ứng viên.
- `/employer/profile`: hồ sơ công ty.

## API chính

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/auth/set-role`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/users/profile`
- `GET /api/jobs`
- `GET /api/jobs/search`
- `POST /api/jobs`
- `GET /api/jobs/showJobEmployer`
- `POST /api/cvs`
- `POST /api/cvs/rate-cv`
- `POST /api/applications`
- `GET /api/applications/job/:jobId`
- `POST /api/interviews`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`

Chi tiết hơn nằm trong [backend README](backend/README.md).

## File upload

Backend lưu file upload ngoài thư mục backend, ở root project:

```text
uploads/
├── cvs/
├── avatars/
└── logos/
```

Các file này được serve qua:

```text
http://localhost:8080/uploads/...
```
