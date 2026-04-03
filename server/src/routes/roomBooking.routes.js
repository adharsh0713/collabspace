const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { createBooking } = require('../controllers/roomBooking.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);

module.exports = router;