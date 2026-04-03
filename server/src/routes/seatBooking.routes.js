const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking, checkIn } = require('../controllers/seatBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.post('/:id/check-in', authMiddleware, checkIn);

module.exports = router;