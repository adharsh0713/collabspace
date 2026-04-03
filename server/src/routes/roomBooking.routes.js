const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking, checkIn, getAllBookings } = require('../controllers/roomBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.post('/:id/check-in', authMiddleware, checkIn);
router.get('/', authMiddleware, getAllBookings);

module.exports = router;