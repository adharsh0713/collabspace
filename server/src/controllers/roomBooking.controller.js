const asyncHandler = require('../utils/asyncHandler');
const { createRoomBooking, checkInRoomBooking, getRoomBookings } = require('../services/roomBooking.service');

const createBooking = asyncHandler(async (req, res) => {
    const booking = await createRoomBooking({
        hostId: req.user.userId,
        roomId: req.body.roomId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        participants: req.body.participants,
        organizationId: req.user.organizationId,
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

const getAllBookings = asyncHandler(async (req, res) => {
    const { page, limit, roomId, status } = req.query;

    const data = await getRoomBookings({
        page,
        limit,
        roomId,
        status,
        hostId: req.user.userId,
        organizationId: req.user.organizationId,
    });

    res.json({
        success: true,
        data,
    });
});

module.exports = {
    createBooking,
    checkIn,
    getAllBookings,
};