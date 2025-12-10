const { Application, Job, Employer, Candidate } = require('../../../models');
const notificationService = require('../services/notificationService');

class applicationController {
    // GET /api/applications
    async index(req, res) {
        try {
            const applications = await Application.findAll();
            res.json(applications);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách application' });
        }
    }

    // GET /api/applications/:id
    async show(req, res) {
        try {
            const application = await Application.findByPk(req.params.id);
            if (!application) return res.status(404).json({ message: 'Không tìm thấy application' });
            res.json(application);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy application' });
        }
    }

    // POST /api/applications
    async create(req, res) {
        try {
            // Lấy candidate từ user đang login (qua token)
            const candidate = await Candidate.findOne({
                where: { userId: req.user.id }
            });

            if (!candidate) {
                return res.status(400).json({ error: 'Không tìm thấy hồ sơ candidate' });
            }

            // Tạo application với candidateId từ user login
            const application = await Application.create({
                jobId: req.body.jobId,
                candidateId: candidate.id,  // Lấy từ candidate vừa query
                cvId: req.body.cvId,
                coverLetter: req.body.coverLetter,
                status: 'pending'
            });

            // Lấy thông tin Job và Employer để gửi thông báo
            const job = await Job.findByPk(req.body.jobId, {
                include: [{ model: Employer, as: 'Employer' }]
            });

            if (job && job.Employer) {
                const io = req.app.get('io');

                // Gửi thông báo cho Employer (chủ job)
                await notificationService.createAndSend(io, {
                    userId: job.Employer.userId,
                    type: 'new_application',
                    title: 'Có ứng viên mới!',
                    message: `${candidate.fullName || 'Một ứng viên'} đã ứng tuyển vào vị trí "${job.title}"`,
                    data: {
                        applicationId: application.id,
                        jobId: job.id,
                        candidateId: candidate.id
                    }
                });
            }

            res.status(201).json(application);
        } catch (error) {
            console.error('Error creating application:', error);
            res.status(400).json({ error: 'Lỗi tạo application' });
        }
    }

    // PUT /api/applications/:id
    // Employer cập nhật trạng thái → Thông báo cho Candidate
    async update(req, res) {
        try {
            const application = await Application.findByPk(req.params.id, {
                include: [
                    { model: Job, as: 'Job' },
                    { model: Candidate, as: 'Candidate' }
                ]
            });

            if (!application) {
                return res.status(404).json({ message: 'Không tìm thấy application' });
            }

            const oldStatus = application.status;
            await application.update(req.body);
            const newStatus = req.body.status;

            // Nếu status thay đổi → Gửi notification cho Candidate
            if (newStatus && oldStatus !== newStatus && application.Candidate) {
                const io = req.app.get('io');

                let notificationType, title, message;

                switch (newStatus) {
                    case 'accepted':
                    case 'approved':
                        notificationType = 'application_accepted';
                        title = ' Chúc mừng! Đơn ứng tuyển được duyệt';
                        message = `Đơn ứng tuyển vị trí "${application.Job?.title}" đã được chấp nhận!`;
                        break;
                    case 'rejected':
                        notificationType = 'application_rejected';
                        title = 'Thông báo về đơn ứng tuyển';
                        message = `Đơn ứng tuyển vị trí "${application.Job?.title}" không được chọn lần này.`;
                        break;
                    case 'reviewed':
                    case 'reviewing':
                        notificationType = 'application_reviewed';
                        title = 'Đơn ứng tuyển đang được xem xét';
                        message = `Nhà tuyển dụng đang xem xét đơn ứng tuyển vị trí "${application.Job?.title}"`;
                        break;
                    default:
                        notificationType = 'application_updated';
                        title = 'Cập nhật đơn ứng tuyển';
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
                        newStatus
                    }
                });
            }

            res.json(application);
        } catch (error) {
            console.error('Error updating application:', error);
            res.status(400).json({ error: 'Lỗi cập nhật application' });
        }
    }

    // DELETE /api/applications/:id
    async delete(req, res) {
        try {
            const application = await Application.findByPk(req.params.id);
            if (!application) return res.status(404).json({ message: 'Không tìm thấy application' });

            await application.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa application' });
        }
    }
}

module.exports = new applicationController();
