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

    // utilization (basic version)
    const completedSeats = await SeatBooking.countDocuments({
        organization: organizationId,
        status: 'COMPLETED',
    });

    const completedRooms = await RoomBooking.countDocuments({
        organization: organizationId,
        status: 'COMPLETED',
    });

    return {
        seats: {
            total: totalSeatBookings,
            completed: completedSeats,
            noShow: noShowSeats,
            utilization: totalSeatBookings
                ? (completedSeats / totalSeatBookings) * 100
                : 0,
        },
        rooms: {
            total: totalRoomBookings,
            completed: completedRooms,
            noShow: noShowRooms,
            utilization: totalRoomBookings
                ? (completedRooms / totalRoomBookings) * 100
                : 0,
        },
    };
};

module.exports = { getAnalytics };