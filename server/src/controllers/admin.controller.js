const asyncHandler = require('../utils/asyncHandler');
const { createOrganizationWithAdmin } = require('../services/admin.service');
const Seat = require('../models/seat.model');
const Room = require('../models/room.model');

// create seat
const createSeat = async (req, res) => {
    const seat = await Seat.create({
        ...req.body,
        organization: req.user.organizationId,
    });

    res.status(201).json({ success: true, data: seat });
};

// create room
const createRoom = async (req, res) => {
    const room = await Room.create({
        ...req.body,
        organization: req.user.organizationId,
    });

    res.status(201).json({ success: true, data: room });
};

const createOrg = asyncHandler(async (req, res) => {
    const data = await createOrganizationWithAdmin(req.body);

    res.status(201).json({
        success: true,
        data,
    });
});

module.exports = {
    createOrg,
    createSeat,
    createRoom,
};