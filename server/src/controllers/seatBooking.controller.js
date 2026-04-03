const asyncHandler = require('../utils/asyncHandler');
const { createSeatBooking } = require('../services/seatBooking.service');

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

module.exports = {
    createBooking,
};