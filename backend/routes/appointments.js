const express = require('express');
const router = express.Router();
const apptCtrl = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, apptCtrl.getAppointments);
router.get('/slots', apptCtrl.getAvailableSlots);
router.get('/:id', auth, apptCtrl.getAppointment);
router.post('/', auth, authorize('patient'), apptCtrl.createAppointment);
router.put('/:id/status', auth, apptCtrl.updateAppointmentStatus);
router.delete('/:id', auth, authorize('admin'), apptCtrl.deleteAppointment);

module.exports = router;
