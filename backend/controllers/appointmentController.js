const db = require('../config/database');

// Get all appointments (admin) or filtered by role
exports.getAppointments = async (req, res) => {
  try {
    const { status, date, doctor_id, patient_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (req.user.role === 'doctor') {
      const [doc] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (!doc.length) return res.status(404).json({ error: 'Doctor profile not found.' });
      whereConditions.push('a.doctor_id = ?');
      params.push(doc[0].id);
    } else if (req.user.role === 'patient') {
      const [pat] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
      if (!pat.length) return res.status(404).json({ error: 'Patient profile not found.' });
      whereConditions.push('a.patient_id = ?');
      params.push(pat[0].id);
    } else {
      // Admin filters
      if (doctor_id) { whereConditions.push('a.doctor_id = ?'); params.push(doctor_id); }
      if (patient_id) { whereConditions.push('a.patient_id = ?'); params.push(patient_id); }
    }

    if (status) { whereConditions.push('a.status = ?'); params.push(status); }
    if (date) { whereConditions.push('a.appointment_date = ?'); params.push(date); }

    const whereClause = whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        du.avatar as doctor_avatar,
        pu.avatar as patient_avatar,
        d.specialization,
        dep.name as department_name,
        pay.status as payment_status,
        pay.amount as payment_amount
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors doc ON a.doctor_id = doc.id
      JOIN users du ON doc.user_id = du.id
      LEFT JOIN departments dep ON a.department_id = dep.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN payments pay ON a.id = pay.appointment_id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const [appointments] = await db.execute(query, params);

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors doc ON a.doctor_id = doc.id
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, params.slice(0, -2));

    res.json({
      appointments,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const [appointments] = await db.execute(`
      SELECT a.*,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        pu.phone as patient_phone, pu.email as patient_email,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name,
        du.phone as doctor_phone, du.email as doctor_email,
        d.specialization, d.consultation_fee,
        dep.name as department_name,
        pat.blood_group, pat.allergies, pat.date_of_birth,
        pay.status as payment_status, pay.amount as payment_amount, pay.invoice_number
      FROM appointments a
      JOIN patients pat ON a.patient_id = pat.id
      JOIN users pu ON pat.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      LEFT JOIN departments dep ON a.department_id = dep.id
      LEFT JOIN payments pay ON a.id = pay.appointment_id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!appointments.length) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ appointment: appointments[0] });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment.' });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, type = 'consultation', symptoms, notes } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Doctor, date, and time are required.' });
    }

    // Get patient ID
    const [patients] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
    if (!patients.length) return res.status(404).json({ error: 'Patient profile not found.' });
    const patientId = patients[0].id;

    // Get doctor info and check availability
    const [doctors] = await db.execute(
      'SELECT d.*, dep.id as dep_id FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.id WHERE d.id = ?',
      [doctor_id]
    );
    if (!doctors.length) return res.status(404).json({ error: 'Doctor not found.' });
    const doctor = doctors[0];

    // Check for conflicts
    const [conflicts] = await db.execute(
      `SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? 
       AND appointment_time = ? AND status NOT IN ('cancelled')`,
      [doctor_id, appointment_date, appointment_time]
    );
    if (conflicts.length) {
      return res.status(409).json({ error: 'This time slot is already booked.' });
    }

    // Calculate end time
    const [timeH, timeM] = appointment_time.split(':').map(Number);
    const endMinutes = timeH * 60 + timeM + (doctor.slot_duration || 30);
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}:00`;

    const [result] = await db.execute(
      `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, end_time, status, type, symptoms, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [patientId, doctor_id, doctor.dep_id, appointment_date, appointment_time, endTime, type, symptoms || null, notes || null]
    );

    // Create payment record
    if (doctor.consultation_fee > 0) {
      const invoiceNum = `INV-${Date.now()}`;
      await db.execute(
        'INSERT INTO payments (appointment_id, patient_id, amount, invoice_number) VALUES (?, ?, ?, ?)',
        [result.insertId, patientId, doctor.consultation_fee, invoiceNum]
      );
    }

    // Create notification for doctor
    await db.execute(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [doctor.user_id, 'New Appointment Request', `New appointment scheduled for ${appointment_date} at ${appointment_time}`, 'appointment']
    );

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointmentId: result.insertId
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellation_reason, notes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const [appts] = await db.execute('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!appts.length) return res.status(404).json({ error: 'Appointment not found.' });

    await db.execute(
      'UPDATE appointments SET status = ?, cancellation_reason = ?, notes = COALESCE(?, notes) WHERE id = ?',
      [status, cancellation_reason || null, notes || null, req.params.id]
    );

    res.json({ message: 'Appointment updated successfully.' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment.' });
  }
};

// Get available time slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    const [doctors] = await db.execute(
      'SELECT available_time_start, available_time_end, slot_duration, available_days FROM doctors WHERE id = ?',
      [doctor_id]
    );

    if (!doctors.length) return res.status(404).json({ error: 'Doctor not found.' });
    const doctor = doctors[0];

    // Generate all slots
    const slots = [];
    const [startH, startM] = doctor.available_time_start.split(':').map(Number);
    const [endH, endM] = doctor.available_time_end.split(':').map(Number);
    const duration = doctor.slot_duration || 30;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const timeStr = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}:00`;
      slots.push(timeStr);
      current += duration;
    }

    // Remove booked slots
    const [booked] = await db.execute(
      `SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('cancelled')`,
      [doctor_id, date]
    );

    const bookedTimes = booked.map(b => b.appointment_time);
    const available = slots.filter(s => !bookedTimes.includes(s));

    res.json({ slots: available, booked: bookedTimes });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to fetch time slots.' });
  }
};
