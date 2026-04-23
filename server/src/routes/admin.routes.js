const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { createSeat, createRoom, getRooms, createUser, listUsers, removeUser } = require('../controllers/admin.controller');

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

router.get(
    '/users',
    authMiddleware,
    authorizeRoles('ADMIN'),
    listUsers
);

router.post(
    '/users',
    authMiddleware,
    authorizeRoles('ADMIN'),
    createUser
);

router.delete(
    '/users/:userId',
    authMiddleware,
    authorizeRoles('ADMIN'),
    removeUser
);

router.get('/rooms', authMiddleware, authorizeRoles('ADMIN'), getRooms);

module.exports = router;