const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { createOrg } = require('../controllers/admin.controller');

const router = express.Router();

router.post(
    '/organizations',
    authMiddleware,
    authorizeRoles('SUPER_ADMIN'),
    createOrg
);

module.exports = router;