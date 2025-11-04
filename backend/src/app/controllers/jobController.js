class jobController {
    index(req, res) {
        const temp = "job";
        res.send(temp)
    }
}

module.exports = new jobController();