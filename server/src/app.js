const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

const seatBookingRoutes = require('./routes/seatBooking.routes');

app.use('/api/seats', seatBookingRoutes);

app.use('/api/seat-bookings', seatBookingRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;