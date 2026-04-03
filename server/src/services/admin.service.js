const Organization = require('../models/organization.model');
const User = require('../models/user.model');

const createOrganizationWithAdmin = async ({
                                               orgName,
                                               adminName,
                                               adminEmail,
                                               password,
                                           }) => {
    // create org
    const org = await Organization.create({ name: orgName });

    // create admin user
    const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password,
        role: 'ADMIN',
        organization: org._id,
    });

    return {
        org,
        admin: {
            id: admin._id,
            email: admin.email,
        },
    };
};

module.exports = {
    createOrganizationWithAdmin,
};