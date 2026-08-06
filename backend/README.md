# Backend - LVCV API

Đây là backend của LVCV. Nó xử lý hầu hết nghiệp vụ chính: tài khoản, phân quyền, hồ sơ ứng viên/nhà tuyển dụng, job, CV, ứng tuyển, lịch phỏng vấn, thông báo realtime và chấm điểm CV bằng AI.

Backend được viết bằng Express, dùng Sequelize để làm việc với MySQL và Socket.IO để đẩy thông báo realtime.

## Công nghệ

- Node.js
- Express `5`
- Sequelize `6`
- MySQL
- JWT
- Passport Google OAuth
- Socket.IO
- Multer upload file
- Nodemailer gửi OTP email
- Python worker gọi Gemini để chấm CV

## Cấu trúc chính

```text
backend/
├── app.js                  # Khai báo middleware và routes
├── server.js               # Tạo HTTP server + Socket.IO
├── config/config.json      # Cấu hình Sequelize/MySQL
├── migrations/             # Migration tạo bảng
├── models/                 # Sequelize models
└── src/
    ├── app/
    │   ├── config/         # CORS, Passport, upload
    │   ├── controllers/    # Controller cho từng resource
    │   ├── middlewares/    # Auth, role, Socket.IO, rate limit
    │   ├── python/         # Script chấm CV bằng Gemini
    │   └── services/       # Notification service, CV worker pool
    ├── routes/             # Express routes
    └── utils/              # Email helper
```

## Cài đặt

```bash
cd backend
npm install
```

## Cấu hình database

Mặc định backend dùng MySQL database `lvcv`.

File cấu hình:

```text
backend/config/config.json
```

Config development hiện tại:

```json
{
  "username": "root",
  "password": null,
  "database": "lvcv",
  "host": "127.0.0.1",
  "dialect": "mysql"
}
```

Tạo database:

```sql
CREATE DATABASE lvcv;
```

Chạy migration:

```bash
npx sequelize-cli db:migrate
```

Nếu máy chưa có `sequelize-cli`, có thể cài vào dev dependency:

```bash
npm install -D sequelize-cli
```

## Cấu hình `.env`

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
CV_WORKER_SCRIPT=
CV_WORKER_POOL_SIZE=3
```

Ý nghĩa nhanh:

- `JWT_SECRET`: key ký token đăng nhập.
- `FRONTEND_URL`: nơi backend redirect sau Google OAuth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: cấu hình Google OAuth.
- `EMAIL_USER`, `EMAIL_PASS`: tài khoản gửi OTP email.
- `GEMINI_KEY`: API key để Python worker gọi Gemini.
- `PYTHON_PATH`: lệnh Python backend dùng để spawn worker.
- `CV_WORKER_POOL_SIZE`: số Python worker chạy song song.

## Cài Python cho chấm CV

Chức năng `POST /api/cvs/rate-cv` gọi script Python ở:

```text
src/app/python/rateCv.py
```

Cài package Python:

```bash
pip install google-genai python-dotenv pymupdf python-docx docx2pdf
```

Nếu không dùng chấm CV thì backend vẫn chạy được, nhưng API `rate-cv` sẽ lỗi nếu thiếu `GEMINI_KEY` hoặc package Python.

## Chạy backend

```bash
npm start
```

Server chạy ở:

```text
http://localhost:8080
```

Hiện port đang được khai báo trực tiếp trong `server.js`.

## CORS

Backend hiện chỉ cho phép frontend local:

```text
http://localhost:3000
```

Danh sách này nằm trong:

```text
src/app/config/cors.js
```

Nếu deploy hoặc chạy frontend bằng domain/port khác, cần thêm domain đó vào whitelist.

## API chính

### Auth

- `POST /api/auth/register`: đăng ký tài khoản.
- `POST /api/auth/login`: đăng nhập bằng email/password.
- `GET /api/auth/google`: bắt đầu Google OAuth.
- `GET /api/auth/google/callback`: callback Google OAuth.
- `POST /api/auth/set-role`: chọn role sau OAuth.
- `POST /api/auth/send-otp`: gửi OTP xác thực email.
- `POST /api/auth/verify-otp`: xác thực OTP.
- `GET /api/auth/verification-status`: xem trạng thái xác thực email.

### Users

- `GET /api/users/profile`: lấy profile user hiện tại.
- `GET /api/users`: admin xem danh sách user.
- `GET /api/users/:id`: xem user theo id.
- `POST /api/users`: admin tạo user.
- `PUT /api/users/:id`: cập nhật user.
- `DELETE /api/users/:id`: admin xóa user.

### Candidate

- `GET /api/candidates/me`: lấy hồ sơ candidate hiện tại.
- `GET /api/candidates`: danh sách candidate.
- `GET /api/candidates/:id`: chi tiết candidate.
- `POST /api/candidates`: tạo hồ sơ candidate.
- `PUT /api/candidates/:id`: cập nhật hồ sơ candidate.
- `PUT /api/candidates/:id/avatar`: upload avatar.
- `DELETE /api/candidates/:id`: xóa candidate.

### Employer

- `GET /api/employers/me`: lấy hồ sơ employer hiện tại.
- `GET /api/employers`: danh sách employer.
- `GET /api/employers/:id`: chi tiết employer.
- `POST /api/employers`: tạo hồ sơ employer.
- `PUT /api/employers/:id`: cập nhật hồ sơ employer.
- `PUT /api/employers/:id/logo`: upload logo công ty.
- `DELETE /api/employers/:id`: xóa employer.

### Jobs

- `GET /api/jobs`: danh sách job.
- `GET /api/jobs/search`: tìm kiếm job.
- `GET /api/jobs/showJobEmployer`: employer xem job của mình.
- `GET /api/jobs/:id`: chi tiết job.
- `POST /api/jobs`: employer tạo job.
- `PUT /api/jobs/:id`: employer cập nhật job.
- `DELETE /api/jobs/:id`: employer xóa job.

### CV

- `GET /api/cvs`: danh sách CV.
- `GET /api/cvs/mine`: candidate xem CV của mình.
- `GET /api/cvs/:id`: chi tiết CV.
- `POST /api/cvs`: upload/tạo CV.
- `PUT /api/cvs/:id`: cập nhật CV.
- `PUT /api/cvs/:id/set-default`: đặt CV mặc định.
- `DELETE /api/cvs/:id`: xóa CV.
- `POST /api/cvs/rate-cv`: upload CV để AI chấm điểm.

### Applications

- `POST /api/applications`: candidate ứng tuyển job.
- `GET /api/applications`: danh sách application.
- `GET /api/applications/:id`: chi tiết application.
- `GET /api/applications/job/:jobId`: employer xem ứng viên của một job.
- `PUT /api/applications/:id`: employer cập nhật trạng thái.
- `DELETE /api/applications/:id`: employer xóa application.

### Interviews

- `GET /api/interviews/my-scheduled`: candidate xem lịch phỏng vấn.
- `GET /api/interviews/employer-list`: employer xem lịch đã tạo.
- `POST /api/interviews`: employer tạo lịch phỏng vấn.
- `GET /api/interviews/application/:applicationId`: xem lịch theo application.
- `PUT /api/interviews/:id`: employer cập nhật/hủy lịch.

### Notifications

- `GET /api/notifications`: danh sách thông báo.
- `GET /api/notifications/unread-count`: số thông báo chưa đọc.
- `PUT /api/notifications/read-all`: đánh dấu tất cả đã đọc.
- `PUT /api/notifications/:id/read`: đánh dấu một thông báo đã đọc.
- `DELETE /api/notifications/:id`: xóa thông báo.

## Upload file

Backend nhận:

- CV: `.pdf`, `.doc`, `.docx`, tối đa `10MB`.
- Avatar ứng viên.
- Logo công ty.

File được lưu ở root project:

```text
uploads/
├── cvs/
├── avatars/
└── logos/
```

Và được serve qua:

```text
http://localhost:8080/uploads/...
```

## Socket.IO

Backend tạo Socket.IO server cùng port `8080`.

Client cần gửi JWT khi kết nối. Middleware sẽ verify token, lấy `userId`, rồi join room:

```text
user_<userId>
```

Notification service có thể dùng room này để gửi thông báo realtime cho từng user.

## Lỗi hay gặp

- `Access denied for user`: sai user/password MySQL trong `config/config.json`.
- `Unknown database 'lvcv'`: chưa tạo database.
- `jwt malformed` hoặc `invalid signature`: frontend đang giữ token cũ hoặc `JWT_SECRET` đổi.
- Google OAuth redirect lỗi: callback URL trên Google Console chưa khớp `GOOGLE_CALLBACK_URL`.
- OTP không gửi: thiếu `EMAIL_USER` hoặc `EMAIL_PASS`.
- Chấm CV timeout/lỗi worker: kiểm tra `GEMINI_KEY`, `PYTHON_PATH`, package Python và log `[cvWorker]`.
