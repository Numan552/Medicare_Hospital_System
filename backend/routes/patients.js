const express = require('express');
const router = express.Router();
const { getPatients, getPatient, updatePatient } = require('../controllers/resourceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin', 'doctor'), getPatients);
router.get('/:id', auth, getPatient);
router.put('/:id', auth, updatePatient);

module.exports = router;
