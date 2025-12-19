require("dotenv").config();
const http = require('http');
const app = require('./app');
const { Server } = require("socket.io");
const corsOption = require("./src/app/config/cors");

const port = 8080;
const server = http.createServer(app);
const socketIo = require('./src/app/middlewares/socketIo');
const io = new Server(server, {
    cors: corsOption,
});

io.use(socketIo);
io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected (socket: ${socket.id})`);

    // Tự động join room dựa vào userId đã verify từ middleware
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
    });
});
// set io vào app để sử dụng toàn cục
app.set('io', io);
server.listen(port);