const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { createOrg, createSeat, createRoom, getRooms } = require('../controllers/admin.controller');

const router = express.Router();

router.post(
    '/seats',
    authMiddleware,
    authorizeRoles('ADMIN'),
    createSeat
);

router.post(
    '/rooms',
    authMiddleware,
    authorizeRoles('ADMIN'),
    createRoom
);

router.post(
    '/organizations',
    authMiddleware,
    authorizeRoles('SUPER_ADMIN'),
    createOrg
);

router.get('/rooms', authMiddleware, authorizeRoles('ADMIN'), getRooms);

module.exports = router;