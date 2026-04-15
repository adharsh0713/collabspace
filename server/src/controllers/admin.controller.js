const asyncHandler = require('../utils/asyncHandler');
const { createOrganizationWithAdmin } = require('../services/admin.service');
const Seat = require('../models/seat.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');

//create user
const createUser = async (req, res) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'USER',
        organization: req.user.organizationId,
    });

    res.status(201).json({
        success: true,
        data: user,
    });
};

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

const getRooms = async (req, res) => {
    const rooms = await Room.find({
        organization: req.user.organizationId,
    });

    res.json({ success: true, data: rooms });
};

module.exports = {
    createOrg,
    createSeat,
    createRoom,
    createUser,
    getRooms
};