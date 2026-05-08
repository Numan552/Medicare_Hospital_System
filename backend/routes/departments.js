const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/resourceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', getDepartments);
router.post('/', auth, authorize('admin'), createDepartment);
router.put('/:id', auth, authorize('admin'), updateDepartment);
router.delete('/:id', auth, authorize('admin'), deleteDepartment);

module.exports = router;
