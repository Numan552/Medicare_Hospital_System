const express = require('express');
const router = express.Router();
const { getPayments, updatePaymentStatus } = require('../controllers/resourceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getPayments);
router.put('/:id', auth, authorize('admin'), updatePaymentStatus);

module.exports = router;
