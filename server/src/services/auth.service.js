const User = require('../models/user.model');

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

module.exports = {
    registerUser,
};