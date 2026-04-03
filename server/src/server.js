require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cron');

const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: '*', // adjust in production
    },
});

global.io = io;

io.on('connection', (socket) => {
    const { organizationId } = socket.handshake.query;

    if (organizationId) {
        socket.join(organizationId);
    }

    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT;

connectDB().then(() => {
    startCronJobs();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});