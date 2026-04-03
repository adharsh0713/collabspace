require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

// connect DB first
connectDB();

const SeatBooking = require('./models/seatBooking.model');

(async () => {
    const booking = await SeatBooking.create({
        user: '69ceb7b3b99a3c17fb52fe05',
        seat: '69cf5fa77ff3404ea7531c84',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    console.log(booking);
})();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});