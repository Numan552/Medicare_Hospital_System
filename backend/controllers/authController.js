const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'medicare_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role = 'patient' } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin registration not allowed through this endpoint.' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, role, first_name, last_name, phone || null]
    );

    const userId = result.insertId;

    // Create role-specific profile
    if (role === 'patient') {
      await db.execute('INSERT INTO patients (user_id) VALUES (?)', [userId]);
    }

    const token = generateToken(userId, role);

    // Update last login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, email, role, first_name, last_name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await db.execute(
      'SELECT id, email, password, role, first_name, last_name, phone, avatar, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated. Contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.role);
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Get role-specific ID
    let profileId = null;
    if (user.role === 'doctor') {
      const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      profileId = doc.length ? doc[0].id : null;
    } else if (user.role === 'patient') {
      const [pat] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      profileId = pat.length ? pat[0].id : null;
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: { ...userWithoutPassword, profileId }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, role, first_name, last_name, phone, avatar, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    let profile = null;

    if (user.role === 'doctor') {
      const [docs] = await db.execute(
        `SELECT d.*, dep.name as department_name FROM doctors d 
         LEFT JOIN departments dep ON d.department_id = dep.id 
         WHERE d.user_id = ?`,
        [user.id]
      );
      profile = docs.length ? docs[0] : null;
    } else if (user.role === 'patient') {
      const [pats] = await db.execute('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      profile = pats.length ? pats[0] : null;
    }

    res.json({ user, profile });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.execute('SELECT id, email, first_name FROM users WHERE email = ?', [email]);

    // Always return success to prevent email enumeration
    if (!users.length) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, expiry, users[0].id]
    );

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const [users] = await db.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (!users.length) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(current_password, users[0].password);

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};
