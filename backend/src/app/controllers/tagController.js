class tagController {
    index(req, res) {
        const temp = "Tag";
        res.send(temp)
    }
}

module.exports = new tagController();