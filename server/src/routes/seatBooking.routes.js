const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking } = require('../controllers/seatBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);

module.exports = router;