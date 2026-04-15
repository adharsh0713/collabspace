const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { getRooms } = require('../controllers/room.controller');

const router = express.Router();

router.get('/', authMiddleware, getRooms);

module.exports = router;