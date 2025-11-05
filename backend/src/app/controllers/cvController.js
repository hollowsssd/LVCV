class cvController {
    index(req, res) {
        const temp = "cv";
        res.send(temp)
    }
}

module.exports = new cvController();