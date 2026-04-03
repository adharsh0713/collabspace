const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking, checkIn, getAvailable, getAllSeats } = require('../controllers/seatBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.post('/:id/check-in', authMiddleware, checkIn);
router.get('/available', getAvailable);
router.get('/', getAllSeats);

module.exports = router;