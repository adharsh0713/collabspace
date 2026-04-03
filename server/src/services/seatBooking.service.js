const Seat = require('../models/seat.model');
const SeatBooking = require('../models/seatBooking.model');

const createSeatBooking = async ({ userId, seatId, startTime, endTime, organizationId }) => {
    // validate time
    if (new Date(startTime) >= new Date(endTime)) {
        const error = new Error('Invalid time range');
        error.statusCode = 400;
        throw error;
    }

    const seat = await Seat.findOne({
        _id: seatId,
        organization: organizationId,
    });

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

    // overlap check (clean)
    const conflict = await SeatBooking.findOne({
        seat: seatId,
        status: 'BOOKED',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
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
        organization: organizationId
    });

    // emit event (safe check)
    if (global.io) {
        global.io.emit('seatBooked', {
            seatId,
            startTime,
            endTime,
        });
    }

    return booking;
};

const checkInSeatBooking = async ({ bookingId, userId, organizationId }) => {
    const booking = await SeatBooking.findOne({
        _id: bookingId,
        organization: organizationId,
    });

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

    if (now < booking.startTime || now > booking.endTime) {
        const error = new Error('Not within booking time');
        error.statusCode = 400;
        throw error;
    }

    booking.checkedInAt = now;
    booking.status = 'CHECKED_IN';

    await booking.save();

    return booking;
};

const getAvailableSeats = async ({ startTime, endTime, organizationId }) => {
    const conflicts = await SeatBooking.find({
        status: 'BOOKED',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    })
        .select('seat')
        .lean();

    const bookedSeatIds = conflicts.map((c) => c.seat);

    const seats = await Seat.find({
        organization: organizationId,
        _id: { $nin: bookedSeatIds },
        status: 'AVAILABLE',
    }).lean();

    return seats;
};

const getSeats = async ({ page = 1, limit = 10, floor, status, organizationId }) => {
    const query = {
        organization: organizationId,
    };

    if (floor) query.floor = Number(floor);
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [seats, total] = await Promise.all([
        Seat.find(query).skip(skip).limit(Number(limit)).lean(),
        Seat.countDocuments(query),
    ]);

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