require("dotenv").config();
const http = require('http');
const app = require('./app');
const { Server } = require("socket.io");
const corsOption = require("./src/app/config/cors");

const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOption,
});

server.listen(port);
module.exports = { io };