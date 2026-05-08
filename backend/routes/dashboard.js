const express = require('express');
const router = express.Router();
const dashCtrl = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

router.get('/admin', auth, authorize('admin'), dashCtrl.getAdminStats);
router.get('/patient', auth, authorize('patient'), dashCtrl.getPatientStats);
router.get('/doctor', auth, authorize('doctor'), dashCtrl.getDoctorStats);

module.exports = router;
