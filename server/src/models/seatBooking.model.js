const mongoose = require('mongoose');

const seatBookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        seat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seat',
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
        status: {
            type: String,
            enum: ['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
            default: 'BOOKED',
        },
        checkedInAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SeatBooking', seatBookingSchema);