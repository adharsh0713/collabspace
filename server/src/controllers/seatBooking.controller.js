const asyncHandler = require('../utils/asyncHandler');
const SeatBooking = require('../models/seatBooking.model');
const { createSeatBooking, checkInSeatBooking, getAvailableSeats, getSeats } = require('../services/seatBooking.service');

const createBooking = asyncHandler(async (req, res) => {
    const booking = await createSeatBooking({
        userId: req.user.userId,
        seatId: req.body.seatId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        organizationId: req.user.organizationId,
    });

    res.status(201).json({
        success: true,
        data: booking,
    });
});

const checkIn = asyncHandler(async (req, res) => {
    const booking = await checkInSeatBooking({
        bookingId: req.params.id,
        userId: req.user.userId,
        organizationId: req.user.organizationId,
    });

    res.status(200).json({
        success: true,
        data: booking,
    });
});

const getAvailable = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const seats = await getAvailableSeats({ startTime, endTime, organizationId: req.user.organizationId });

    res.json({
        success: true,
        data: seats,
    });
});

const getAllSeats = asyncHandler(async (req, res) => {
    const { page, limit, floor, status } = req.query;

    const data = await getSeats({ page, limit, floor, status, organizationId: req.user.organizationId });

    res.json({
        success: true,
        data,
    });
});

const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await SeatBooking.find({
        user: req.user.userId,
        organization: req.user.organizationId,
    }).populate('seat', 'code floor');

    res.json({
        success: true,
        data: bookings,
    });
});

module.exports = {
    createBooking,
    checkIn,
    getAvailable,
    getAllSeats,
    getMyBookings,
};