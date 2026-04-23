const Seat = require('../models/seat.model');
const SeatBooking = require('../models/seatBooking.model');

const createSeatBooking = async ({ userId, seatId, startTime, endTime, organizationId }) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // validate time
    if (start >= end) {
        const error = new Error('Invalid time range');
        error.statusCode = 400;
        throw error;
    }

    // max duration: 12 hours
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 12) {
        const error = new Error('Booking duration cannot exceed 12 hours');
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
        const error = new Error('Seat is closed or under maintenance');
        error.statusCode = 400;
        throw error;
    }

    // overlap check (clean) - adding 15 min buffer between bookings could be complex here, keeping strict overlap check
    const conflict = await SeatBooking.findOne({
        seat: seatId,
        status: 'BOOKED',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        organization: organizationId
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
        organization: organizationId,
    });

    // emit event (safe check)
    if (global.io) {
        global.io.to(organizationId).emit('seatBooked', {
            bookingId: booking._id,
            seatId,
            userId,
            startTime,
            endTime,
            status: 'BOOKED',
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

    if (global.io) {
        global.io.to(organizationId).emit('seatCheckedIn', {
            bookingId: booking._id,
            seatId: booking.seat,
            checkedInAt: booking.checkedInAt,
        });
    }

    return booking;
};

const getAvailableSeats = async ({ startTime, endTime, organizationId }) => {
    const conflicts = await SeatBooking.find({
        status: 'BOOKED',
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        organization: organizationId,
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

    const now = new Date();
    // Get currently active bookings
    const activeBookings = await SeatBooking.find({
        organization: organizationId,
        status: 'BOOKED',
        startTime: { $lte: now },
        endTime: { $gt: now }
    }).select('seat').lean();

    const bookedSeatIds = activeBookings.map(b => b.seat.toString());

    if (status === 'MAINTENANCE' || status === 'CLOSED') {
        query.status = status;
    } else if (status === 'AVAILABLE') {
        query._id = { $nin: bookedSeatIds };
        query.status = 'AVAILABLE';
    } else if (status === 'BOOKED') {
        query._id = { $in: bookedSeatIds };
    }

    const skip = (page - 1) * limit;

    const [seats, total] = await Promise.all([
        Seat.find(query).skip(skip).limit(Number(limit)).lean(),
        Seat.countDocuments(query),
    ]);

    const mappedSeats = seats.map(seat => {
        if (seat.status === 'AVAILABLE' && bookedSeatIds.includes(seat._id.toString())) {
            return { ...seat, status: 'BOOKED' };
        }
        return seat;
    });

    return {
        seats: mappedSeats,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

const getSeatBookings = async ({ userId, organizationId, page = 1, limit = 10 }) => {
    const query = {
        user: userId,
        organization: organizationId,
    };

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
        SeatBooking.find(query)
            .populate('seat', 'code floor')
            .populate('user', 'name email')
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(Number(limit)),
        SeatBooking.countDocuments(query),
    ]);

    return {
        bookings,
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
    getSeatBookings
};