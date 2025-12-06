
const white_list_domain = [
    'http://localhost:3000',
    // 'https://nickname-dialog-return-degree.trycloudflare.com'
    //vv...
]

const options = {
    origin: function (origin, callback) {

        if (!origin || origin === 'null' || white_list_domain.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by Cors'));
    },

    // cho phép trình duyệt gửi cookie hoặc thông tin đăng nhập khác
    credentials: true,
}
module.exports = options