const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { getOrganizations, getPlatformMetrics, createOrg } = require('../controllers/superAdmin.controller');

const router = express.Router();

router.get(
    '/organizations',
    authMiddleware,
    authorizeRoles('SUPER_ADMIN'),
    getOrganizations
);

router.post(
    '/organizations',
    authMiddleware,
    authorizeRoles('SUPER_ADMIN'),
    createOrg
);

router.get(
    '/metrics',
    authMiddleware,
    authorizeRoles('SUPER_ADMIN'),
    getPlatformMetrics
);

module.exports = router;
