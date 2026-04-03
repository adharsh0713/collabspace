const cron = require('node-cron');
const SeatBooking = require('../models/seatBooking.model');
const RoomBooking = require('../models/roomBooking.model');

const startCronJobs = () => {
    // every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('Cron running at:', new Date());
            const now = new Date();

            const GRACE_PERIOD_MINUTES = 60;
            const cutoff = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60000);

            // Seat bookings
            const { modifiedCount: seatUpdates } = await SeatBooking.updateMany(
                {
                    status: 'BOOKED',
                    checkedInAt: { $exists: false },
                    startTime: { $lt: cutoff },
                },
                {
                    $set: { status: 'NO_SHOW' },
                }
            );

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

            // logs (only when changes happen)
            if (seatUpdates > 0) {
                console.log(`Seat NO_SHOW updated: ${seatUpdates}`);
            }

            if (roomUpdates > 0) {
                console.log(`Room NO_SHOW updated: ${roomUpdates}`);
            }

        } catch (err) {
            console.error('Cron job failed:', err.message);
        }
    });
};

module.exports = startCronJobs;