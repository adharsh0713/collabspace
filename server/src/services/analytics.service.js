const SeatBooking = require('../models/seatBooking.model');
const RoomBooking = require('../models/roomBooking.model');

const getAnalytics = async ({ organizationId }) => {
    // total bookings
    const totalSeatBookings = await SeatBooking.countDocuments({
        organization: organizationId,
    });

    const totalRoomBookings = await RoomBooking.countDocuments({
        organization: organizationId,
    });

    // no-show count
    const noShowSeats = await SeatBooking.countDocuments({
        organization: organizationId,
        status: 'NO_SHOW',
    });

    const noShowRooms = await RoomBooking.countDocuments({
        organization: organizationId,
        status: 'NO_SHOW',
    });

    // utilization (completed vs total)
    const completedSeats = await SeatBooking.countDocuments({
        organization: organizationId,
        status: 'COMPLETED',
    });

    const completedRooms = await RoomBooking.countDocuments({
        organization: organizationId,
        status: 'COMPLETED',
    });

    // Active Users (distinct users in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeSeatUsers = await SeatBooking.distinct('user', {
        organization: organizationId,
        createdAt: { $gte: thirtyDaysAgo }
    });
    const activeRoomUsers = await RoomBooking.distinct('user', {
        organization: organizationId,
        createdAt: { $gte: thirtyDaysAgo }
    });
    const activeUsersSet = new Set([...activeSeatUsers.map(id => id.toString()), ...activeRoomUsers.map(id => id.toString())]);
    const activeUsers = activeUsersSet.size;

    // Average Booking Duration
    const completedSeatBookingsList = await SeatBooking.find({ organization: organizationId, status: 'COMPLETED' }).select('startTime endTime').lean();
    const completedRoomBookingsList = await RoomBooking.find({ organization: organizationId, status: 'COMPLETED' }).select('startTime endTime').lean();
    
    let totalDurationMs = 0;
    let totalCompleted = completedSeatBookingsList.length + completedRoomBookingsList.length;

    completedSeatBookingsList.forEach(b => {
        totalDurationMs += (new Date(b.endTime) - new Date(b.startTime));
    });
    completedRoomBookingsList.forEach(b => {
        totalDurationMs += (new Date(b.endTime) - new Date(b.startTime));
    });

    let averageBookingDuration = '0 hrs';
    if (totalCompleted > 0) {
        const hrs = (totalDurationMs / totalCompleted) / (1000 * 60 * 60);
        averageBookingDuration = `${hrs.toFixed(1)} hrs`;
    }

    return {
        seats: {
            total: totalSeatBookings,
            completed: completedSeats,
            noShow: noShowSeats,
            utilization: totalSeatBookings
                ? (completedSeats / totalSeatBookings) * 100
                : 0,
            noShowRate: totalSeatBookings ? (noShowSeats / totalSeatBookings) * 100 : 0,
        },
        rooms: {
            total: totalRoomBookings,
            completed: completedRooms,
            noShow: noShowRooms,
            utilization: totalRoomBookings
                ? (completedRooms / totalRoomBookings) * 100
                : 0,
        },
        activeUsers,
        averageBookingDuration,
        growthRate: null, // Removing fake metrics
    };
};

module.exports = { getAnalytics };