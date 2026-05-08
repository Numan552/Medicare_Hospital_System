const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('../controllers/resourceController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markNotificationRead);

module.exports = router;
