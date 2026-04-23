const asyncHandler = require('../utils/asyncHandler');
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
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
    });
};

// list users
const listUsers = async (req, res) => {
    const users = await User.find({
        organization: req.user.organizationId,
        role: 'USER',
    }).select('-password').lean();

    res.json({
        success: true,
        data: users,
    });
};

// remove user
const removeUser = async (req, res) => {
    const { userId } = req.params;
    await User.findOneAndDelete({
        _id: userId,
        organization: req.user.organizationId,
        role: 'USER'
    });

    res.json({
        success: true,
        data: { id: userId },
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

const getRooms = async (req, res) => {
    const rooms = await Room.find({
        organization: req.user.organizationId,
    });

    res.json({ success: true, data: rooms });
};

module.exports = {
    createSeat,
    createRoom,
    createUser,
    listUsers,
    removeUser,
    getRooms
};