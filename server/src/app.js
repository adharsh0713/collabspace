const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const authMiddleware = require('./middleware/auth.middleware');

app.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'Access granted',
        user: req.user,
    });
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;