const asyncHandler = require('../utils/asyncHandler');
const { createSeatBooking, checkInSeatBooking, getAvailableSeats } = require('../services/seatBooking.service');

const createBooking = asyncHandler(async (req, res) => {
    const booking = await createSeatBooking({
        userId: req.user.userId,
        seatId: req.body.seatId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
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
    });

    res.status(200).json({
        success: true,
        data: booking,
    });
});

const getAvailable = asyncHandler(async (req, res) => {
    const { startTime, endTime } = req.query;

    const seats = await getAvailableSeats({ startTime, endTime });

    res.json({
        success: true,
        data: seats,
    });
});

module.exports = {
    createBooking,
    checkIn,
    getAvailable,
};