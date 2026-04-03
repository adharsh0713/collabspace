const asyncHandler = require('../utils/asyncHandler');
const { loginUser } = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
    const data = await loginUser(req.body);

    res.status(200).json({
        success: true,
        data,
    });
});

module.exports = {
    login
};