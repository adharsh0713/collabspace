const Room = require('../models/room.model');
const RoomBooking = require('../models/roomBooking.model');

const createRoomBooking = async ({
                                     hostId,
                                     roomId,
                                     startTime,
                                     endTime,
                                     participants = [],
                                 }) => {
    const room = await Room.findById(roomId);

    if (!room) {
        const error = new Error('Room not found');
        error.statusCode = 404;
        throw error;
    }

    if (room.status !== 'AVAILABLE') {
        const error = new Error('Room not available');
        error.statusCode = 400;
        throw error;
    }

    // capacity check (host + participants)
    const totalPeople = 1 + participants.length;

    if (totalPeople > room.capacity) {
        const error = new Error('Exceeds room capacity');
        error.statusCode = 400;
        throw error;
    }

    // overlap check
    const conflict = await RoomBooking.findOne({
        room: roomId,
        status: 'BOOKED',
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            },
        ],
    });

    if (conflict) {
        const error = new Error('Room already booked for this time');
        error.statusCode = 409;
        throw error;
    }

    const booking = await RoomBooking.create({
        host: hostId,
        room: roomId,
        startTime,
        endTime,
        participants,
    });

    return booking;
};

module.exports = {
    createRoomBooking,
};