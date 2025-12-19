const ratelimit = require('express-rate-limit')

const apiRateLimit = (request, minute, mess) => {
    return ratelimit({
        max: request,
        windowMs: minute * 60 * 1000,
        message: { success: false, message: mess },
    })
}

module.exports = {
    normal: apiRateLimit(100, 1, "Gửi quá nhiều request"),

    auth: apiRateLimit(5, 2, "Login quá nhiều lần thử lại sau ít phút"),

    apiRateCv: apiRateLimit(2, 1440, "1 Tài khoản chỉ được đánh giá 2 lần/1 tháng, nâng cấp để được đánh giá nhiều hơn "),


    apiRateLimit,
}; 