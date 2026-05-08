const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, phone, avatar } = req.body;
    await db.execute(
      'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
      [first_name, last_name, phone, avatar, req.user.id]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
