require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

// connect DB first
connectDB();

const { generateToken, verifyToken } = require('./utils/jwt');

const token = generateToken({ userId: '123', role: 'USER' });
console.log('TOKEN:', token);

const decoded = verifyToken(token);
console.log('DECODED:', decoded);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});