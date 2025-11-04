class employerController {
    index(req, res) {
        const temp = "employer";
        res.send(temp)
    }
}

module.exports = new employerController();