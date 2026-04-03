const Seat = require('../models/seat.model');
const SeatBooking = require('../models/seatBooking.model');

const createSeatBooking = async ({ userId, seatId, startTime, endTime }) => {
    const seat = await Seat.findById(seatId);
    if (!seat) {
        const error = new Error('Seat not found');
        error.statusCode = 404;
        throw error;
    }

    if (seat.status !== 'AVAILABLE') {
        const error = new Error('Seat not available');
        error.statusCode = 400;
        throw error;
    }

    // overlap check
    const conflict = await SeatBooking.findOne({
        seat: seatId,
        status: 'BOOKED',
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            },
        ],
    });

    if (conflict) {
        const error = new Error('Seat already booked for this time');
        error.statusCode = 409;
        throw error;
    }

    const booking = await SeatBooking.create({
        user: userId,
        seat: seatId,
        startTime,
        endTime,
    });

    return booking;
};

module.exports = {
    createSeatBooking,
};