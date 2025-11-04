class candidateController {
    index(req, res) {
        const temp = "candidate";
        res.send(temp)
    }
}

module.exports = new candidateController();