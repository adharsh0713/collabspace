const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: true,
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
        amenities: [
            {
                type: String, // e.g. "PROJECTOR", "WHITEBOARD"
            },
        ],
        position: {
            x: Number,
            y: Number,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);