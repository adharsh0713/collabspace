const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

const seatBookingRoutes = require('./routes/seatBooking.routes');

app.use('/api/seat-bookings', seatBookingRoutes);

const roomBookingRoutes = require('./routes/roomBooking.routes');

app.use('/api/room-bookings', roomBookingRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;