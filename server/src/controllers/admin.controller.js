const asyncHandler = require('../utils/asyncHandler');
const { createOrganizationWithAdmin } = require('../services/admin.service');

const createOrg = asyncHandler(async (req, res) => {
    const data = await createOrganizationWithAdmin(req.body);

    res.status(201).json({
        success: true,
        data,
    });
});

module.exports = {
    createOrg,
};