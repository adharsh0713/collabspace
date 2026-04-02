const asyncHandler = require('../utils/asyncHandler');
const { registerUser } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

module.exports = {
    register,
};