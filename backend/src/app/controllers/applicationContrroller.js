class applicationController {
    index(req, res) {
        const temp = "application";
        res.send(temp)
    }
}

module.exports = new applicationController();