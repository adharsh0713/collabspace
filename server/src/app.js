const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());

const adminRoutes = require('./routes/admin.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

const seatBookingRoutes = require('./routes/seatBooking.routes');

app.use('/api/seat-bookings', seatBookingRoutes);

const roomBookingRoutes = require('./routes/roomBooking.routes');

app.use('/api/room-bookings', roomBookingRoutes);

const analyticsRoutes = require('./routes/analytics.routes');

app.use('/api/analytics', analyticsRoutes);

const roomRoutes = require('./routes/room.routes');

app.use('/api/rooms', roomRoutes);

const seatRoutes = require('./routes/seat.routes');

app.use('/api/seats', seatRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;