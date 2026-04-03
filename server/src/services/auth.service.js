const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const organizationId = user.organization?.toString();

    const token = generateToken({
        userId: user._id,
        role: user.role,
        organizationId,
    });

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId,
        },
    };
};

module.exports = {
    loginUser,
};