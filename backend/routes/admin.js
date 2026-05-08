const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, role, first_name, last_name, phone, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Toggle user status
router.put('/users/:id/toggle', auth, authorize('admin'), async (req, res) => {
  try {
    await db.execute('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ message: 'User status updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

module.exports = router;
