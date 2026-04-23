const asyncHandler = require('../utils/asyncHandler');
const { createOrganizationWithAdmin } = require('../services/admin.service');
const Organization = require('../models/organization.model');
const User = require('../models/user.model');
const SeatBooking = require('../models/seatBooking.model');
const RoomBooking = require('../models/roomBooking.model');

// get organizations
const getOrganizations = asyncHandler(async (req, res) => {
    // Get all organizations with user count
    const orgs = await Organization.find().lean();
    
    const orgsWithStats = await Promise.all(orgs.map(async (org) => {
        const userCount = await User.countDocuments({ organization: org._id });
        const seatBookings = await SeatBooking.countDocuments({ organization: org._id });
        const roomBookings = await RoomBooking.countDocuments({ organization: org._id });
        
        return {
            ...org,
            usersCount: userCount,
            bookingsCount: seatBookings + roomBookings
        };
    }));

    res.json({
        success: true,
        data: orgsWithStats
    });
});

// get platform metrics
const getPlatformMetrics = asyncHandler(async (req, res) => {
    const totalOrgs = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const totalSeatBookings = await SeatBooking.countDocuments();
    const totalRoomBookings = await RoomBooking.countDocuments();

    res.json({
        success: true,
        data: {
            totalOrganizations: totalOrgs,
            totalUsers,
            totalBookings: totalSeatBookings + totalRoomBookings,
            activeOrganizations: totalOrgs // assuming all are active for now
        }
    });
});

const createOrg = asyncHandler(async (req, res) => {
    const data = await createOrganizationWithAdmin(req.body);

    res.status(201).json({
        success: true,
        data,
    });
});

module.exports = {
    getOrganizations,
    getPlatformMetrics,
    createOrg
};
