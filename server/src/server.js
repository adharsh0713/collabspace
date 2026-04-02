require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

// connect DB first
connectDB();;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});