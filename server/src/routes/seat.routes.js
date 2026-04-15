const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { getSeats } = require('../controllers/seat.controller');

const router = express.Router();

router.get('/', authMiddleware, getSeats);

module.exports = router;
