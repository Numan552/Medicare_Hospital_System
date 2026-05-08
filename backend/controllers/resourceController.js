const db = require('../config/database');

// ============================================================
// PRESCRIPTIONS
// ============================================================
exports.getPrescriptions = async (req, res) => {
  try {
    let whereClause = '';
    let params = [];

    if (req.user.role === 'patient') {
      const [p] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
      if (!p.length) return res.status(404).json({ error: 'Patient not found.' });
      whereClause = 'WHERE pr.patient_id = ?';
      params = [p[0].id];
    } else if (req.user.role === 'doctor') {
      const [d] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (!d.length) return res.status(404).json({ error: 'Doctor not found.' });
      whereClause = 'WHERE pr.doctor_id = ?';
      params = [d[0].id];
    }

    const [prescriptions] = await db.execute(`
      SELECT pr.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        d.specialization, a.appointment_date
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors doc ON pr.doctor_id = doc.id
      JOIN users du ON doc.user_id = du.id
      LEFT JOIN doctors d ON pr.doctor_id = d.id
      LEFT JOIN appointments a ON pr.appointment_id = a.id
      ${whereClause}
      ORDER BY pr.created_at DESC
    `, params);

    res.json({ prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions.' });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { appointment_id, patient_id, diagnosis, medications, instructions, follow_up_date } = req.body;

    const [d] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (!d.length) return res.status(403).json({ error: 'Only doctors can write prescriptions.' });

    const [result] = await db.execute(
      `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, medications, instructions, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [appointment_id, patient_id, d[0].id, diagnosis, JSON.stringify(medications || []), instructions || null, follow_up_date || null]
    );

    // Update appointment status to completed
    if (appointment_id) {
      await db.execute("UPDATE appointments SET status = 'completed' WHERE id = ?", [appointment_id]);
    }

    // Notify patient
    const [pat] = await db.execute('SELECT user_id FROM patients WHERE id = ?', [patient_id]);
    if (pat.length) {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [pat[0].user_id, 'New Prescription', 'Your doctor has written a new prescription for you.', 'prescription']
      );
    }

    res.status(201).json({ message: 'Prescription created successfully.', id: result.insertId });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription.' });
  }
};

// ============================================================
// PATIENTS
// ============================================================
exports.getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (req.user.role === 'doctor') {
      const [d] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
      whereConditions.push('EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = pat.id AND a.doctor_id = ?)');
      params.push(d[0].id);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [patients] = await db.execute(`
      SELECT pat.id, pat.date_of_birth, pat.gender, pat.blood_group, pat.city, pat.chronic_conditions,
        u.first_name, u.last_name, u.email, u.phone, u.avatar, u.created_at,
        COUNT(DISTINCT a.id) as total_appointments,
        MAX(a.appointment_date) as last_visit
      FROM patients pat
      JOIN users u ON pat.user_id = u.id
      LEFT JOIN appointments a ON pat.id = a.patient_id
      ${whereClause}
      GROUP BY pat.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients.' });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const [patients] = await db.execute(`
      SELECT pat.*, u.first_name, u.last_name, u.email, u.phone, u.avatar
      FROM patients pat JOIN users u ON pat.user_id = u.id WHERE pat.id = ?
    `, [req.params.id]);

    if (!patients.length) return res.status(404).json({ error: 'Patient not found.' });

    const [appointments] = await db.execute(`
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as doctor_name, d.specialization
      FROM appointments a
      JOIN doctors doc ON a.doctor_id = doc.id JOIN users u ON doc.user_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ? ORDER BY a.appointment_date DESC LIMIT 10
    `, [req.params.id]);

    const [prescriptions] = await db.execute(`
      SELECT pr.*, CONCAT(u.first_name, ' ', u.last_name) as doctor_name
      FROM prescriptions pr JOIN doctors d ON pr.doctor_id = d.id JOIN users u ON d.user_id = u.id
      WHERE pr.patient_id = ? ORDER BY pr.created_at DESC LIMIT 5
    `, [req.params.id]);

    res.json({ patient: patients[0], appointments, prescriptions });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient.' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const {
      date_of_birth, gender, blood_group, address, city,
      emergency_contact_name, emergency_contact_phone,
      allergies, chronic_conditions, insurance_provider, insurance_id,
      first_name, last_name, phone
    } = req.body;

    const [patients] = await db.execute('SELECT user_id FROM patients WHERE id = ?', [req.params.id]);
    if (!patients.length) return res.status(404).json({ error: 'Patient not found.' });

    if (first_name || last_name || phone) {
      await db.execute(
        'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone) WHERE id = ?',
        [first_name, last_name, phone, patients[0].user_id]
      );
    }

    await db.execute(
      `UPDATE patients SET
        date_of_birth = COALESCE(?, date_of_birth), gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group), address = COALESCE(?, address),
        city = COALESCE(?, city), emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        allergies = COALESCE(?, allergies), chronic_conditions = COALESCE(?, chronic_conditions),
        insurance_provider = COALESCE(?, insurance_provider), insurance_id = COALESCE(?, insurance_id)
       WHERE id = ?`,
      [date_of_birth, gender, blood_group, address, city, emergency_contact_name,
       emergency_contact_phone, allergies, chronic_conditions, insurance_provider, insurance_id, req.params.id]
    );

    res.json({ message: 'Patient profile updated successfully.' });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient.' });
  }
};

// ============================================================
// DEPARTMENTS
// ============================================================
exports.getDepartments = async (req, res) => {
  try {
    const [departments] = await db.execute(`
      SELECT dep.*,
        CONCAT(u.first_name, ' ', u.last_name) as head_doctor_name,
        COUNT(DISTINCT d.id) as doctor_count,
        COUNT(DISTINCT a.id) as appointment_count
      FROM departments dep
      LEFT JOIN doctors d ON dep.id = d.department_id
      LEFT JOIN users u ON d.user_id = u.id AND d.id = dep.head_doctor_id
      LEFT JOIN appointments a ON dep.id = a.department_id
      GROUP BY dep.id ORDER BY dep.name ASC
    `);
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, icon, room_count } = req.body;
    const [result] = await db.execute(
      'INSERT INTO departments (name, description, icon, room_count) VALUES (?, ?, ?, ?)',
      [name, description || null, icon || null, room_count || 0]
    );
    res.status(201).json({ message: 'Department created.', id: result.insertId });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department.' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, icon, room_count, head_doctor_id } = req.body;
    await db.execute(
      `UPDATE departments SET name = COALESCE(?, name), description = COALESCE(?, description),
       icon = COALESCE(?, icon), room_count = COALESCE(?, room_count), head_doctor_id = COALESCE(?, head_doctor_id)
       WHERE id = ?`,
      [name, description, icon, room_count, head_doctor_id, req.params.id]
    );
    res.json({ message: 'Department updated successfully.' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department.' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await db.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Failed to delete department.' });
  }
};

// ============================================================
// PAYMENTS
// ============================================================
exports.getPayments = async (req, res) => {
  try {
    let whereConditions = [];
    let params = [];

    if (req.user.role === 'patient') {
      const [p] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
      whereConditions.push('pay.patient_id = ?');
      params.push(p[0].id);
    }

    const whereClause = whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const [payments] = await db.execute(`
      SELECT pay.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        a.appointment_date, a.appointment_time
      FROM payments pay
      JOIN patients p ON pay.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN appointments a ON pay.appointment_id = a.id
      JOIN doctors doc ON a.doctor_id = doc.id
      JOIN users du ON doc.user_id = du.id
      ${whereClause}
      ORDER BY pay.created_at DESC
    `, params);

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, transaction_id, payment_method } = req.body;
    await db.execute(
      `UPDATE payments SET status = ?, transaction_id = COALESCE(?, transaction_id),
       payment_method = COALESCE(?, payment_method), payment_date = IF(? = 'completed', NOW(), payment_date)
       WHERE id = ?`,
      [status, transaction_id, payment_method, status, req.params.id]
    );
    res.json({ message: 'Payment updated successfully.' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment.' });
  }
};

// ============================================================
// NOTIFICATIONS
// ============================================================
exports.getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const [[{ unread }]] = await db.execute(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ notifications, unread });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    } else {
      await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    }
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
};
