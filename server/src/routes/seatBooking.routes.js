const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking, checkIn, getAvailable, getAllSeats, getMyBookings } = require('../controllers/seatBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.post('/:id/check-in', authMiddleware, checkIn);
router.get('/available', authMiddleware, getAvailable);
router.get('/', authMiddleware, getAllSeats);
router.get('/my', authMiddleware, getMyBookings);

module.exports = router;