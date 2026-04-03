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

    // after booking is created

    const booking = await SeatBooking.create({
        user: userId,
        seat: seatId,
        startTime,
        endTime,
    });

    // emit event
    global.io.emit('seatBooked', {
        seatId,
        startTime,
        endTime,
    });

    return booking;

    return booking;
};

const checkInSeatBooking = async ({ bookingId, userId }) => {
    const booking = await SeatBooking.findById(bookingId);

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    if (booking.user.toString() !== userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 403;
        throw error;
    }

    if (booking.status !== 'BOOKED') {
        const error = new Error('Invalid booking state');
        error.statusCode = 400;
        throw error;
    }

    if (booking.checkedInAt) {
        const error = new Error('Already checked in');
        error.statusCode = 400;
        throw error;
    }

    const now = new Date();

    // basic window check (can refine later)
    if (now < booking.startTime || now > booking.endTime) {
        const error = new Error('Not within booking time');
        error.statusCode = 400;
        throw error;
    }

    booking.checkedInAt = now;
    await booking.save();

    return booking;
};

const getAvailableSeats = async ({ startTime, endTime }) => {
    // find conflicting bookings
    const conflicts = await SeatBooking.find({
        status: 'BOOKED',
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            },
        ],
    }).select('seat');

    const bookedSeatIds = conflicts.map((c) => c.seat);

    // return seats not in conflict + available status
    const seats = await Seat.find({
        _id: { $nin: bookedSeatIds },
        status: 'AVAILABLE',
    });

    return seats;
};

const getSeats = async ({ page = 1, limit = 10, floor, status }) => {
    const query = {};

    if (floor) query.floor = Number(floor);
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const seats = await Seat.find(query)
        .skip(skip)
        .limit(Number(limit));

    const total = await Seat.countDocuments(query);

    return {
        seats,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

module.exports = {
    createSeatBooking,
    checkInSeatBooking,
    getAvailableSeats,
    getSeats,
};