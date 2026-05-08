const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription } = require('../controllers/resourceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getPrescriptions);
router.post('/', auth, authorize('doctor'), createPrescription);

module.exports = router;
