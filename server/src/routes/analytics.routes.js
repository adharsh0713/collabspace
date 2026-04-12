const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { getAnalyticsData } = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/', authMiddleware, getAnalyticsData);

module.exports = router;