const cron = require('node-cron');
const SeatBooking = require('../models/seatBooking.model');

const startCronJobs = () => {
    // runs every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date();

        const GRACE_PERIOD_MINUTES = 60; // 1 hours

        const cutoff = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60000);

        /** @type {{ modifiedCount: number }} */
        const result = await SeatBooking.updateMany(
            {
                status: 'BOOKED',
                checkedInAt: { $exists: false },
                startTime: { $lt: cutoff },
            },
            {
                $set: { status: 'NO_SHOW' },
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`No-show bookings updated: ${result.modifiedCount}`);
        }
    });
};

module.exports = startCronJobs;