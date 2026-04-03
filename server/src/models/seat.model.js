const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true, // e.g. "A1", "F2-12"
            trim: true,
        },
        floor: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['AVAILABLE', 'MAINTENANCE', 'CLOSED'],
            default: 'AVAILABLE',
        },
        position: {
            x: Number, // for floor map (future)
            y: Number,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Seat', seatSchema);