const {
  Application,
  Job,
  Employer,
  Candidate,
  User,
  Cv,
} = require("../../../models");
const notificationService = require("../services/notificationService");

class applicationController {
  // GET /api/applications/job/:jobId // lay list ung vien cua 1 job nao do
  async getByJobForEmployer(req, res) {
    try {
      const jobId = Number(req.params.jobId);
      if (!Number.isFinite(jobId)) {
        return res.status(400).json({ message: "jobId không hợp lệ" });
      }

      // Tìm employer từ user đang login
      const employer = await Employer.findOne({
        where: { userId: req.user.id },
      });

      if (!employer) {
        return res.status(403).json({ message: "Bạn không phải employer." });
      }

      // Đảm bảo job này thuộc employer đang login
      const job = await Job.findOne({
        where: { id: jobId, employerId: employer.id },
      });

      if (!job) {
        return res
          .status(404)
          .json({ message: "Job không tồn tại hoặc không thuộc về bạn." });
      }

      // Lấy danh sách application của job này
      const applications = await Application.findAll({
        where: { jobId },
        include: [
          {
            model: Candidate,
            as: "Candidate",
            include: [
              {
                model: User,
                as: "User",
              },
            ],
          },
          {
            model: Cv,
            as: "Cv",
            attributes: [
              "id",
              "title",
              "fileUrl",
              "fileType",
              "isDefault",
              "candidateId",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const data = applications.map((app) => ({
        id: app.id,
        status: app.status,
        appliedAt: app.createdAt,
        cvId: app.cvId,
        cvFileUrl: app.Cv?.fileUrl || null,

        candidate: app.Candidate
          ? {
              id: app.Candidate.id,
              fullName: app.Candidate.fullName,
              phone: app.Candidate.phone,
              email: app.Candidate.User?.email || null,
            }
          : null,
          cv: app.Cv
    ? {
        id: app.Cv.id,
        title: app.Cv.title,
        fileUrl: app.Cv.fileUrl,
        fileType: app.Cv.fileType,
        score: app.Cv.score,
        feedback: app.Cv.feedback,
      }
    : null,
      }));

      return res.json({
        jobId: job.id,
        jobTitle: job.title,
        applications: data,
      });
    } catch (error) {
      console.error("Error getByJobForEmployer:", error);
      return res
        .status(500)
        .json({ error: "Lỗi lấy danh sách ứng viên của job." });
    }
  }

  // GET /api/applications
  async index(req, res) {
    try {
      const applications = await Application.findAll();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy danh sách application" });
    }
  }

  // GET /api/applications/:id
  async show(req, res) {
    try {
      const application = await Application.findByPk(req.params.id);
      if (!application)
        return res.status(404).json({ message: "Không tìm thấy application" });
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy application" });
    }
  }

  // POST /api/applications
  async create(req, res) {
    try {
      // Lấy candidate từ user đang login (qua token)
      const candidate = await Candidate.findOne({
        where: { userId: req.user.id },
      });

      if (!candidate) {
        return res
          .status(400)
          .json({ error: "Không tìm thấy hồ sơ candidate" });
      }

      // Tạo application với candidateId từ user login
      const application = await Application.create({
        jobId: req.body.jobId,
        candidateId: candidate.id, // Lấy từ candidate vừa query
        cvId: req.body.cvId,
        coverLetter: req.body.coverLetter,
        status: "pending",
      });

      // Lấy thông tin Job và Employer để gửi thông báo
      const job = await Job.findByPk(req.body.jobId, {
        include: [{ model: Employer, as: "Employer" }],
      });

      if (job && job.Employer) {
        const io = req.app.get("io");

        // Gửi thông báo cho Employer
        await notificationService.createAndSend(io, {
          userId: job.Employer.userId,
          type: "new_application",
          title: "Có ứng viên mới!",
          message: `${
            candidate.fullName || "Một ứng viên"
          } đã ứng tuyển vào vị trí "${job.title}"`,
          data: {
            applicationId: application.id,
            jobId: job.id,
            candidateId: candidate.id,
          },
        });
      }

      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ error: "Lỗi tạo application" });
    }
  }

  // PUT /api/applications/:id
  async update(req, res) {
    try {
      const application = await Application.findByPk(req.params.id, {
        include: [
          { model: Job, as: "Job" },
          { model: Candidate, as: "Candidate" },
        ],
      });

      if (!application) {
        return res.status(404).json({ message: "Không tìm thấy application" });
      }

      const oldStatus = application.status;
      await application.update(req.body);
      const newStatus = req.body.status;

      // Nếu status thay đổi → Gửi notification cho Candidate
      if (newStatus && oldStatus !== newStatus && application.Candidate) {
        const io = req.app.get("io");

        let notificationType, title, message;

        switch (newStatus) {
          case "accepted":
          case "approved":
            notificationType = "application_accepted";
            title = " Chúc mừng! Đơn ứng tuyển được duyệt";
            message = `Đơn ứng tuyển vị trí "${application.Job?.title}" đã được chấp nhận!`;
            break;
          case "rejected":
            notificationType = "application_rejected";
            title = "Thông báo về đơn ứng tuyển";
            message = `Nhà tuyển dụng cho rằng bạn không phù hợp với vị trí "${application.Job?.title}" .`;
            break;
          case "reviewed":
          case "reviewing":
            notificationType = "application_reviewed";
            title = "Đơn ứng tuyển đang được xem xét";
            message = `Nhà tuyển dụng đang xem xét đơn ứng tuyển vị trí "${application.Job?.title}"`;
            break;
          case "interview_scheduled":
            notificationType = "application_interview";
            title = "Lịch phỏng vấn mới";
            message = `Nhà tuyển dụng muốn hẹn phỏng vấn cho vị trí "${application.Job?.title}".`;
            break;

          default:
            notificationType = "application_updated";
            title = "Cập nhật đơn ứng tuyển";
            message = `Trạng thái đơn ứng tuyển vị trí "${application.Job?.title}" đã được cập nhật thành "${newStatus}"`;
        }

        await notificationService.createAndSend(io, {
          userId: application.Candidate.userId,
          type: notificationType,
          title,
          message,
          data: {
            applicationId: application.id,
            jobId: application.jobId,
            newStatus,
          },
        });
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(400).json({ error: "Lỗi cập nhật application" });
    }
  }

  // DELETE /api/applications/:id
  async delete(req, res) {
    try {
      const application = await Application.findByPk(req.params.id);
      if (!application)
        return res.status(404).json({ message: "Không tìm thấy application" });

      await application.destroy();
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi xóa application" });
    }
  }
}

module.exports = new applicationController();
