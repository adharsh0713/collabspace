const asyncHandler = require('../utils/asyncHandler');
const { getAnalytics } = require('../services/analytics.service');

const getAnalyticsData = asyncHandler(async (req, res) => {
    const data = await getAnalytics({
        organizationId: req.user.organizationId,
    });

    res.json({
        success: true,
        data,
    });
});

module.exports = { getAnalyticsData };