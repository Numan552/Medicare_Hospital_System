const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', auth, authorize('admin'), createDoctor);
router.put('/:id', auth, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', auth, authorize('admin'), deleteDoctor);

module.exports = router;
