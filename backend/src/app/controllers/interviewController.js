const { v4: uuidv4 } = require('uuid');
const {
    Interview,
    Application,
    Job,
    Employer,
    Candidate,
    User,
} = require('../../../models');
const notificationService = require('../services/notificationService');

// Base URL cho Jitsi Meet (dùng public instance)
const JITSI_BASE_URL = 'https://meet.jit.si';

class InterviewController {
    /**
     * POST /api/interviews
     * Employer tạo lịch phỏng vấn cho 1 ứng viên
     * Body: { applicationId, scheduledAt, notes? }
     */
    async create(req, res) {
        try {
            const { applicationId, scheduledAt, notes } = req.body;

            // Validate required fields
            if (!applicationId || !scheduledAt) {
                return res.status(400).json({
                    message: 'Vui lòng cung cấp applicationId và scheduledAt.',
                });
            }

            // Validate scheduledAt là thời gian hợp lệ và trong tương lai
            const interviewDate = new Date(scheduledAt);
            if (isNaN(interviewDate.getTime())) {
                return res.status(400).json({
                    message: 'scheduledAt không phải là thời gian hợp lệ.',
                });
            }

            if (interviewDate <= new Date()) {
                return res.status(400).json({
                    message: 'Thời gian phỏng vấn phải trong tương lai.',
                });
            }

            // Tìm employer từ user đang login
            const employer = await Employer.findOne({
                where: { userId: req.user.id },
            });

            if (!employer) {
                return res.status(403).json({ message: 'Bạn không phải employer.' });
            }

            // Tìm application và verify nó thuộc về employer này
            const application = await Application.findByPk(applicationId, {
                include: [
                    {
                        model: Job,
                        as: 'Job',
                        include: [{ model: Employer, as: 'Employer' }],
                    },
                    {
                        model: Candidate,
                        as: 'Candidate',
                        include: [{ model: User, as: 'User' }],
                    },
                ],
            });

            if (!application) {
                return res.status(404).json({ message: 'Không tìm thấy application.' });
            }

            if (application.Job?.Employer?.id !== employer.id) {
                return res.status(403).json({
                    message: 'Bạn không có quyền hẹn phỏng vấn cho application này.',
                });
            }

            // Kiểm tra đã có interview chưa
            const existingInterview = await Interview.findOne({
                where: { applicationId, status: 'scheduled' },
            });

            if (existingInterview) {
                return res.status(400).json({
                    message: 'Đã có lịch phỏng vấn cho ứng viên này rồi.',
                    interview: existingInterview,
                });
            }

            // Tạo Jitsi room ID unique
            const jitsiRoomId = `LVCV-Interview-${uuidv4()}`;
            const jitsiRoomUrl = `${JITSI_BASE_URL}/${jitsiRoomId}`;

            // Tạo Interview record
            const interview = await Interview.create({
                applicationId,
                employerId: employer.id,
                candidateId: application.candidateId,
                scheduledAt: interviewDate,
                jitsiRoomId,
                jitsiRoomUrl,
                notes: notes || null,
                status: 'scheduled',
            });

            // Update Application status
            await application.update({ status: 'interview_scheduled' });

            // Gửi notification cho Candidate
            if (application.Candidate) {
                const io = req.app.get('io');
                const candidateUserId = application.Candidate.userId;

                // Format thời gian cho notification
                const formattedDate = interviewDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                const formattedTime = interviewDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                await notificationService.createAndSend(io, {
                    userId: candidateUserId,
                    type: 'interview_scheduled',
                    title: '📅 Lịch phỏng vấn mới!',
                    message: `Bạn được hẹn phỏng vấn vị trí "${application.Job?.title}" vào ${formattedDate} lúc ${formattedTime}.`,
                    data: {
                        applicationId: application.id,
                        jobId: application.jobId,
                        interviewId: interview.id,
                        jitsiRoomUrl,
                        scheduledAt: interviewDate.toISOString(),
                        notes: notes || null,
                    },
                });
            }

            return res.status(201).json({
                message: 'Đã tạo lịch phỏng vấn thành công.',
                interview: {
                    id: interview.id,
                    applicationId: interview.applicationId,
                    scheduledAt: interview.scheduledAt,
                    jitsiRoomUrl: interview.jitsiRoomUrl,
                    notes: interview.notes,
                    status: interview.status,
                },
            });
        } catch (error) {
            console.error('Error creating interview:', error);
            return res.status(500).json({
                error: 'Lỗi tạo lịch phỏng vấn.',
                details: error.message,
            });
        }
    }

    /**
     * GET /api/interviews/application/:applicationId
     * Lấy thông tin interview của 1 application
     */
    async getByApplication(req, res) {
        try {
            const applicationId = Number(req.params.applicationId);

            if (!Number.isFinite(applicationId)) {
                return res.status(400).json({ message: 'applicationId không hợp lệ.' });
            }

            const interview = await Interview.findOne({
                where: { applicationId },
                order: [['createdAt', 'DESC']],
            });

            if (!interview) {
                return res.status(404).json({
                    message: 'Chưa có lịch phỏng vấn cho application này.',
                });
            }

            return res.json({
                interview: {
                    id: interview.id,
                    applicationId: interview.applicationId,
                    scheduledAt: interview.scheduledAt,
                    jitsiRoomUrl: interview.jitsiRoomUrl,
                    notes: interview.notes,
                    status: interview.status,
                    createdAt: interview.createdAt,
                },
            });
        } catch (error) {
            console.error('Error getting interview:', error);
            return res.status(500).json({
                error: 'Lỗi lấy thông tin lịch phỏng vấn.',
            });
        }
    }

    /**
     * PUT /api/interviews/:id
     * Cập nhật interview (đổi lịch, huỷ, v.v.)
     */
    async update(req, res) {
        try {
            const interviewId = Number(req.params.id);
            const { scheduledAt, notes, status } = req.body;

            // Tìm employer từ user đang login
            const employer = await Employer.findOne({
                where: { userId: req.user.id },
            });

            if (!employer) {
                return res.status(403).json({ message: 'Bạn không phải employer.' });
            }

            const interview = await Interview.findByPk(interviewId, {
                include: [
                    {
                        model: Application,
                        as: 'Application',
                        include: [{ model: Job, as: 'Job' }],
                    },
                    {
                        model: Candidate,
                        as: 'Candidate',
                    },
                ],
            });

            if (!interview) {
                return res.status(404).json({ message: 'Không tìm thấy interview.' });
            }

            if (interview.employerId !== employer.id) {
                return res.status(403).json({
                    message: 'Bạn không có quyền chỉnh sửa interview này.',
                });
            }

            // Update fields
            const updateData = {};
            if (scheduledAt) {
                const newDate = new Date(scheduledAt);
                if (isNaN(newDate.getTime())) {
                    return res.status(400).json({
                        message: 'scheduledAt không phải là thời gian hợp lệ.',
                    });
                }
                updateData.scheduledAt = newDate;
            }
            if (notes !== undefined) updateData.notes = notes;
            if (status) updateData.status = status;

            await interview.update(updateData);

            // Nếu huỷ interview, update application status
            if (status === 'cancelled') {
                await interview.Application?.update({ status: 'pending' });
            }

            // Gửi notification nếu đổi lịch
            if (scheduledAt && interview.Candidate) {
                const io = req.app.get('io');
                const newDate = new Date(scheduledAt);

                const formattedDate = newDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                const formattedTime = newDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                await notificationService.createAndSend(io, {
                    userId: interview.Candidate.userId,
                    type: 'interview_rescheduled',
                    title: '🔄 Lịch phỏng vấn đã thay đổi',
                    message: `Lịch phỏng vấn vị trí "${interview.Application?.Job?.title}" đã được đổi sang ${formattedDate} lúc ${formattedTime}.`,
                    data: {
                        interviewId: interview.id,
                        applicationId: interview.applicationId,
                        jitsiRoomUrl: interview.jitsiRoomUrl,
                        scheduledAt: newDate.toISOString(),
                    },
                });
            }

            return res.json({
                message: 'Cập nhật interview thành công.',
                interview,
            });
        } catch (error) {
            console.error('Error updating interview:', error);
            return res.status(500).json({
                error: 'Lỗi cập nhật interview.',
            });
        }
    }

    /**
     * GET /api/interviews/my-scheduled
     * Candidate lấy danh sách interview của mình (sắp tới và đã qua)
     */
    async getMyScheduled(req, res) {
        try {
            // Tìm candidate từ user đang login
            const candidate = await Candidate.findOne({
                where: { userId: req.user.id },
            });

            if (!candidate) {
                return res.status(403).json({ message: 'Bạn không phải candidate.' });
            }

            const interviews = await Interview.findAll({
                where: { candidateId: candidate.id },
                include: [
                    {
                        model: Application,
                        as: 'Application',
                        include: [
                            {
                                model: Job,
                                as: 'Job',
                                attributes: ['id', 'title', 'location', 'jobType'],
                                include: [
                                    {
                                        model: Employer,
                                        as: 'Employer',
                                        attributes: ['id', 'companyName', 'logoUrl'],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [['scheduledAt', 'DESC']],
            });

            const now = new Date();
            const data = interviews.map((iv) => ({
                id: iv.id,
                applicationId: iv.applicationId,
                scheduledAt: iv.scheduledAt,
                jitsiRoomUrl: iv.jitsiRoomUrl,
                notes: iv.notes,
                status: iv.status,
                isUpcoming: new Date(iv.scheduledAt) > now,
                job: iv.Application?.Job
                    ? {
                        id: iv.Application.Job.id,
                        title: iv.Application.Job.title,
                        location: iv.Application.Job.location,
                        jobType: iv.Application.Job.jobType,
                        companyName: iv.Application.Job.Employer?.companyName,
                        companyLogo: iv.Application.Job.Employer?.logoUrl,
                    }
                    : null,
                createdAt: iv.createdAt,
            }));

            return res.json({
                interviews: data,
                upcoming: data.filter((d) => d.isUpcoming && d.status === 'scheduled'),
                past: data.filter((d) => !d.isUpcoming || d.status !== 'scheduled'),
            });
        } catch (error) {
            console.error('Error getting candidate interviews:', error);
            return res.status(500).json({
                error: 'Lỗi lấy danh sách lịch phỏng vấn.',
            });
        }
    }

    /**
     * GET /api/interviews/employer-list
     * Employer lấy danh sách interview mình đã tạo
     */
    async getEmployerList(req, res) {
        try {
            // Tìm employer từ user đang login
            const employer = await Employer.findOne({
                where: { userId: req.user.id },
            });

            if (!employer) {
                return res.status(403).json({ message: 'Bạn không phải employer.' });
            }

            const interviews = await Interview.findAll({
                where: { employerId: employer.id },
                include: [
                    {
                        model: Candidate,
                        as: 'Candidate',
                        attributes: ['id', 'fullName', 'phone', 'avatarUrl'],
                        include: [
                            {
                                model: User,
                                as: 'User',
                                attributes: ['email'],
                            },
                        ],
                    },
                    {
                        model: Application,
                        as: 'Application',
                        include: [
                            {
                                model: Job,
                                as: 'Job',
                                attributes: ['id', 'title'],
                            },
                        ],
                    },
                ],
                order: [['scheduledAt', 'DESC']],
            });

            const now = new Date();
            const data = interviews.map((iv) => ({
                id: iv.id,
                applicationId: iv.applicationId,
                scheduledAt: iv.scheduledAt,
                jitsiRoomUrl: iv.jitsiRoomUrl,
                notes: iv.notes,
                status: iv.status,
                isUpcoming: new Date(iv.scheduledAt) > now,
                candidate: iv.Candidate
                    ? {
                        id: iv.Candidate.id,
                        fullName: iv.Candidate.fullName,
                        phone: iv.Candidate.phone,
                        email: iv.Candidate.User?.email,
                        avatarUrl: iv.Candidate.avatarUrl,
                    }
                    : null,
                job: iv.Application?.Job
                    ? {
                        id: iv.Application.Job.id,
                        title: iv.Application.Job.title,
                    }
                    : null,
                createdAt: iv.createdAt,
            }));

            return res.json({
                interviews: data,
                upcoming: data.filter((d) => d.isUpcoming && d.status === 'scheduled'),
                past: data.filter((d) => !d.isUpcoming || d.status !== 'scheduled'),
            });
        } catch (error) {
            console.error('Error getting employer interviews:', error);
            return res.status(500).json({
                error: 'Lỗi lấy danh sách lịch phỏng vấn.',
            });
        }
    }
}

module.exports = new InterviewController();
