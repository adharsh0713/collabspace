const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const registerUser = async (data) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create({ name, email, password });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

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

    const token = generateToken({
        userId: user._id,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};