class userController {
    index(req, res) {
        const temp = "user";
        res.send(temp)
    }
}

module.exports = new userController();