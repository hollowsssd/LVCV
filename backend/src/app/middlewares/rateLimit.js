const ratelimit = require('express-rate-limit')

const apiRateLimit = ratelimit({
    max: 5,
    windowMs: 1 * 60 * 1000,
    message: { message: 'Spam à! Đợi 1 phút đi' },
})

module.exports = apiRateLimit;