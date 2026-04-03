require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cron');

const PORT = process.env.PORT;

// connect DB first
connectDB();
startCronJobs();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});