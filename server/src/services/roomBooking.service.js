const Room = require('../models/room.model');
const RoomBooking = require('../models/roomBooking.model');

const createRoomBooking = async ({
                                     hostId,
                                     roomId,
                                     startTime,
                                     endTime,
                                     participants = [],
                                    organizationId,
                                 }) => {
    const room = await Room.findOne({
        _id: roomId,
        organization: organizationId,
    });

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
        organization: organizationId,
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
        organization: organizationId,
    });

    return booking;
};

const checkInRoomBooking = async ({ bookingId, userId }) => {
    const booking = await RoomBooking.findById(bookingId);

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    // check if user is host or participant
    const isHost = booking.host.toString() === userId;

    const isParticipant = booking.participants.some(
        (p) => p.user && p.user.toString() === userId
    );

    if (!isHost && !isParticipant) {
        const error = new Error('Unauthorized');
        error.statusCode = 403;
        throw error;
    }

    if (booking.status !== 'BOOKED') {
        const error = new Error('Invalid booking state');
        error.statusCode = 400;
        throw error;
    }

    if (booking.checkedInAt) {
        const error = new Error('Already checked in');
        error.statusCode = 400;
        throw error;
    }

    const now = new Date();

    if (now < booking.startTime || now > booking.endTime) {
        const error = new Error('Not within booking time');
        error.statusCode = 400;
        throw error;
    }

    booking.checkedInAt = now;
    await booking.save();

    return booking;
};

const getRoomBookings = async ({
                                   page = 1,
                                   limit = 10,
                                   hostId,
                                   roomId,
                                   status,
                                   organizationId,
                               }) => {
    const query = {
        organization: organizationId,
    };

    if (hostId) query.host = hostId;
    if (roomId) query.room = roomId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const bookings = await RoomBooking.find(query)
        .populate('room', 'name capacity')
        .populate('host', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ startTime: -1 });

    const total = await RoomBooking.countDocuments(query);

    return {
        bookings,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

module.exports = {
    createRoomBooking,
    checkInRoomBooking,
    getRoomBookings,
};