
function authorization(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({
                Message: 'không có quyền !',
            })
        }
        next();
    }

}
module.exports = authorization;