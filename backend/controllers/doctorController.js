const db = require('../config/database');

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const { department_id, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['u.is_active = 1'];
    let params = [];

    if (department_id) {
      whereConditions.push('d.department_id = ?');
      params.push(department_id);
    }
    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR d.specialization LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [doctors] = await db.execute(`
      SELECT d.id, d.specialization, d.qualification, d.experience_years,
        d.consultation_fee, d.rating, d.total_reviews, d.is_available,
        d.available_days, d.available_time_start, d.available_time_end,
        d.bio, d.slot_duration,
        u.first_name, u.last_name, u.email, u.phone, u.avatar,
        dep.name as department_name, dep.id as department_id,
        COUNT(DISTINCT a.id) as total_appointments
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      ${whereClause}
      GROUP BY d.id
      ORDER BY d.rating DESC, d.total_reviews DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await db.execute(`
      SELECT COUNT(*) as total FROM doctors d JOIN users u ON d.user_id = u.id ${whereClause}
    `, params);

    res.json({
      doctors,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors.' });
  }
};

// Get single doctor
exports.getDoctor = async (req, res) => {
  try {
    const [doctors] = await db.execute(`
      SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar, u.created_at as joined_date,
        dep.name as department_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN departments dep ON d.department_id = dep.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (!doctors.length) return res.status(404).json({ error: 'Doctor not found.' });

    // Get reviews
    const [reviews] = await db.execute(`
      SELECT r.rating, r.comment, r.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as patient_name, u.avatar as patient_avatar
      FROM reviews r
      JOIN patients p ON r.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE r.doctor_id = ?
      ORDER BY r.created_at DESC LIMIT 10
    `, [req.params.id]);

    res.json({ doctor: doctors[0], reviews });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor.' });
  }
};

// Create doctor (admin)
exports.createDoctor = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const {
      email, password, first_name, last_name, phone, specialization,
      qualification, experience_years, department_id, consultation_fee,
      license_number, bio, available_days, available_time_start, available_time_end
    } = req.body;

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password || 'Doctor@123', 10);

    const [userResult] = await db.execute(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, "doctor", ?, ?, ?)',
      [email, hashedPassword, first_name, last_name, phone || null]
    );

    await db.execute(
      `INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years,
        consultation_fee, license_number, bio, available_days, available_time_start, available_time_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId, department_id || null, specialization, qualification || null,
        experience_years || 0, consultation_fee || 0, license_number || null, bio || null,
        JSON.stringify(available_days || ['Monday','Tuesday','Wednesday','Thursday','Friday']),
        available_time_start || '09:00:00', available_time_end || '17:00:00'
      ]
    );

    res.status(201).json({ message: 'Doctor created successfully.', userId: userResult.insertId });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Failed to create doctor.' });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const {
      specialization, qualification, experience_years, department_id,
      consultation_fee, bio, available_days, available_time_start,
      available_time_end, is_available, first_name, last_name, phone
    } = req.body;

    const [doctors] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
    if (!doctors.length) return res.status(404).json({ error: 'Doctor not found.' });

    // Update user info
    if (first_name || last_name || phone) {
      await db.execute(
        'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone) WHERE id = ?',
        [first_name, last_name, phone, doctors[0].user_id]
      );
    }

    await db.execute(
      `UPDATE doctors SET
        specialization = COALESCE(?, specialization),
        qualification = COALESCE(?, qualification),
        experience_years = COALESCE(?, experience_years),
        department_id = COALESCE(?, department_id),
        consultation_fee = COALESCE(?, consultation_fee),
        bio = COALESCE(?, bio),
        available_days = COALESCE(?, available_days),
        available_time_start = COALESCE(?, available_time_start),
        available_time_end = COALESCE(?, available_time_end),
        is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [
        specialization, qualification, experience_years, department_id,
        consultation_fee, bio,
        available_days ? JSON.stringify(available_days) : null,
        available_time_start, available_time_end, is_available,
        req.params.id
      ]
    );

    res.json({ message: 'Doctor updated successfully.' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor.' });
  }
};

// Delete doctor (admin)
exports.deleteDoctor = async (req, res) => {
  try {
    const [doctors] = await db.execute('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
    if (!doctors.length) return res.status(404).json({ error: 'Doctor not found.' });

    await db.execute('DELETE FROM users WHERE id = ?', [doctors[0].user_id]);
    res.json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor.' });
  }
};
