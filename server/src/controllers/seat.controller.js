const asyncHandler = require('../utils/asyncHandler');
const Seat = require('../models/seat.model');

const getSeats = asyncHandler(async (req, res) => {
    const { page, limit, floor, status } = req.query;
    
    const query = {
        organization: req.user.organizationId,
    };
    
    if (floor) query.floor = Number(floor);
    if (status) query.status = status;
    
    const skip = (page - 1) * limit || 0;
    const limitNum = Number(limit) || 10;
    
    const [seats, total] = await Promise.all([
        Seat.find(query)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Seat.countDocuments(query),
    ]);

    res.json({
        success: true,
        data: {
            seats,
            total,
            page: Number(page) || 1,
            pages: Math.ceil(total / limitNum),
        }
    });
});

module.exports = { getSeats };
