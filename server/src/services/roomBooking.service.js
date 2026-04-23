const Room = require('../models/room.model');
const RoomBooking = require('../models/roomBooking.model');
const User = require('../models/user.model');
const { sendBookingConfirmation } = require('../utils/emailService');

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

    // domain policies
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);

    if (durationHours > 4) {
        const error = new Error('Max booking duration is 4 hours');
        error.statusCode = 400;
        throw error;
    }

    const now = new Date();
    const daysInAdvance = (start - now) / (1000 * 60 * 60 * 24);
    if (daysInAdvance > 30) {
        const error = new Error('Cannot book more than 30 days in advance');
        error.statusCode = 400;
        throw error;
    }

    // capacity check (host + participants)
    const totalPeople = 1 + participants.length;

    if (totalPeople > room.capacity) {
        const error = new Error(`Exceeds room capacity of ${room.capacity}`);
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

    // Populate room and host details for the email
    await booking.populate('room', 'name');
    const host = await User.findById(hostId);

    // Collect emails
    const emailsToNotify = [];
    if (host && host.email) emailsToNotify.push(host.email);
    
    participants.forEach(p => {
        if (p.email) emailsToNotify.push(p.email);
    });

    // Fire & Forget Emails (do not await so it doesn't block response)
    const uniqueEmails = [...new Set(emailsToNotify)];
    uniqueEmails.forEach(email => {
        sendBookingConfirmation(booking, email).catch(err => {
            console.error(`Failed to send email to ${email}:`, err.message);
        });
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