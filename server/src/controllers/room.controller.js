const asyncHandler = require('../utils/asyncHandler');
const Room = require('../models/room.model');

const getRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({
        organization: req.user.organizationId,
    }).select('name capacity floor status amenities');

    res.json({
        success: true,
        data: rooms,
    });
});

module.exports = { getRooms };