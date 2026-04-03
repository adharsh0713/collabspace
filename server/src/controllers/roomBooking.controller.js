const asyncHandler = require('../utils/asyncHandler');
const { createRoomBooking, checkInRoomBooking } = require('../services/roomBooking.service');

const createBooking = asyncHandler(async (req, res) => {
    const booking = await createRoomBooking({
        hostId: req.user.userId,
        roomId: req.body.roomId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        participants: req.body.participants,
    });

    res.status(201).json({
        success: true,
        data: booking,
    });
});

const checkIn = asyncHandler(async (req, res) => {
    const booking = await checkInRoomBooking({
        bookingId: req.params.id,
        userId: req.user.userId,
    });

    res.json({
        success: true,
        data: booking,
    });
});

module.exports = {
    createBooking,
    checkIn,
};