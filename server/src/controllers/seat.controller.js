const asyncHandler = require('../utils/asyncHandler');
const { getSeats: getSeatsService } = require('../services/seatBooking.service');

const getSeats = asyncHandler(async (req, res) => {
    const { page, limit, floor, status } = req.query;
    
    const data = await getSeatsService({
        page,
        limit,
        floor,
        status,
        organizationId: req.user.organizationId,
    });

    res.json({
        success: true,
        data
    });
});

module.exports = { getSeats };
