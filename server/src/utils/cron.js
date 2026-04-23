const cron = require('node-cron');
const SeatBooking = require('../models/seatBooking.model');
const RoomBooking = require('../models/roomBooking.model');

const startCronJobs = () => {
    // every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('Cron running at:', new Date());
            const now = new Date();

            const GRACE_PERIOD_MINUTES = 15;
            const cutoff = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60000);

            // Seat bookings
            const expiredSeatBookings = await SeatBooking.find({
                status: 'BOOKED',
                checkedInAt: { $exists: false },
                startTime: { $lt: cutoff },
            });

            for (const booking of expiredSeatBookings) {
                booking.status = 'NO_SHOW';
                await booking.save();

                // emit event
                global.io.emit('seatReleased', {
                    seatId: booking.seat,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                });
            }

            if (expiredSeatBookings.length > 0) {
                console.log(`Seat NO_SHOW updated: ${expiredSeatBookings.length}`);
            }

            // Room bookings
            const { modifiedCount: roomUpdates } = await RoomBooking.updateMany(
                {
                    status: 'BOOKED',
                    checkedInAt: { $exists: false },
                    startTime: { $lt: cutoff },
                },
                {
                    $set: { status: 'NO_SHOW' },
                }
            );

            if (roomUpdates > 0) {
                console.log(`Room NO_SHOW updated: ${roomUpdates}`);
            }

        } catch (err) {
            console.error('Cron job failed:', err.message);
        }
    });
};

module.exports = startCronJobs;