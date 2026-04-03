const asyncHandler = require('../utils/asyncHandler');
const { createRoomBooking } = require('../services/roomBooking.service');

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

module.exports = {
    createBooking,
};