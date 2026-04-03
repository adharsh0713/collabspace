require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cron');

const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

global.io = io;

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    const { organizationId } = socket.handshake.query;

    if (organizationId) {
        socket.join(organizationId);
        console.log(`Joined org room: ${organizationId}`);
    }

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT;

connectDB().then(() => {
    startCronJobs();
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});