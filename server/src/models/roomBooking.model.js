const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        email: {
            type: String, // for external users
        },
    },
    { _id: false }
);

const roomBookingSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        participants: [participantSchema],
        status: {
            type: String,
            enum: ['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
            default: 'BOOKED',
        },
        checkedInAt: {
            type: Date,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('RoomBooking', roomBookingSchema);