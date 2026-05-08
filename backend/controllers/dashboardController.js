const db = require('../config/database');

// Admin Dashboard Stats
exports.getAdminStats = async (req, res) => {
  try {
    const [[totalDoctors]] = await db.execute('SELECT COUNT(*) as count FROM doctors');
    const [[totalPatients]] = await db.execute('SELECT COUNT(*) as count FROM patients');
    const [[totalAppointments]] = await db.execute('SELECT COUNT(*) as count FROM appointments');
    const [[pendingAppointments]] = await db.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'");
    const [[totalRevenue]] = await db.execute("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'");
    const [[monthlyRevenue]] = await db.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND MONTH(payment_date) = MONTH(NOW()) AND YEAR(payment_date) = YEAR(NOW())"
    );

    // Appointment stats by status
    const [statusStats] = await db.execute(
      "SELECT status, COUNT(*) as count FROM appointments GROUP BY status"
    );

    // Monthly appointment trend (last 6 months)
    const [monthlyTrend] = await db.execute(`
      SELECT DATE_FORMAT(appointment_date, '%Y-%m') as month, COUNT(*) as count
      FROM appointments
      WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);

    // Department-wise appointments
    const [deptStats] = await db.execute(`
      SELECT dep.name, COUNT(a.id) as count
      FROM departments dep
      LEFT JOIN appointments a ON dep.id = a.department_id
      GROUP BY dep.id, dep.name ORDER BY count DESC LIMIT 6
    `);

    // Revenue by month
    const [revenueByMonth] = await db.execute(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as revenue
      FROM payments WHERE status = 'completed' AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);

    // Recent appointments
    const [recentAppointments] = await db.execute(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.type,
        CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
        CONCAT(du.first_name, ' ', du.last_name) as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN doctors doc ON a.doctor_id = doc.id
      JOIN users du ON doc.user_id = du.id
      ORDER BY a.created_at DESC LIMIT 10
    `);

    // Top doctors by appointments
    const [topDoctors] = await db.execute(`
      SELECT u.first_name, u.last_name, u.avatar, d.specialization, d.rating, COUNT(a.id) as appointment_count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id ORDER BY appointment_count DESC LIMIT 5
    `);

    res.json({
      stats: {
        totalDoctors: totalDoctors.count,
        totalPatients: totalPatients.count,
        totalAppointments: totalAppointments.count,
        pendingAppointments: pendingAppointments.count,
        totalRevenue: parseFloat(totalRevenue.total),
        monthlyRevenue: parseFloat(monthlyRevenue.total)
      },
      statusStats,
      monthlyTrend,
      deptStats,
      revenueByMonth,
      recentAppointments,
      topDoctors
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
};

// Patient Dashboard Stats
exports.getPatientStats = async (req, res) => {
  try {
    const [patients] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
    if (!patients.length) return res.status(404).json({ error: 'Patient profile not found.' });
    const patientId = patients[0].id;

    const [[totalAppointments]] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?', [patientId]
    );
    const [[upcomingAppointments]] = await db.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('pending','confirmed')",
      [patientId]
    );
    const [[totalPayments]] = await db.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE patient_id = ? AND status = 'completed'",
      [patientId]
    );
    const [[prescriptions]] = await db.execute(
      'SELECT COUNT(*) as count FROM prescriptions WHERE patient_id = ?', [patientId]
    );

    // Upcoming appointments
    const [upcoming] = await db.execute(`
      SELECT a.*, 
        CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
        d.specialization, u.avatar as doctor_avatar,
        dep.name as department_name
      FROM appointments a
      JOIN doctors doc ON a.doctor_id = doc.id
      JOIN users u ON doc.user_id = u.id
      LEFT JOIN departments dep ON a.department_id = dep.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending','confirmed')
      ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT 5
    `, [patientId]);

    // Recent prescriptions
    const [recentPrescriptions] = await db.execute(`
      SELECT pr.*, 
        CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
        d.specialization
      FROM prescriptions pr
      JOIN doctors doc ON pr.doctor_id = doc.id
      JOIN users u ON doc.user_id = u.id
      LEFT JOIN doctors d ON pr.doctor_id = d.id
      WHERE pr.patient_id = ?
      ORDER BY pr.created_at DESC LIMIT 5
    `, [patientId]);

    res.json({
      stats: {
        totalAppointments: totalAppointments.count,
        upcomingAppointments: upcomingAppointments.count,
        totalSpent: parseFloat(totalPayments.total),
        prescriptions: prescriptions.count
      },
      upcoming,
      recentPrescriptions
    });
  } catch (error) {
    console.error('Patient stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
};

// Doctor Dashboard Stats
exports.getDoctorStats = async (req, res) => {
  try {
    const [doctors] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (!doctors.length) return res.status(404).json({ error: 'Doctor profile not found.' });
    const doctorId = doctors[0].id;

    const [[totalPatients]] = await db.execute(
      'SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?', [doctorId]
    );
    const [[todayAppointments]] = await db.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE() AND status NOT IN ('cancelled')",
      [doctorId]
    );
    const [[completedToday]] = await db.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE() AND status = 'completed'",
      [doctorId]
    );
    const [[totalRevenue]] = await db.execute(
      "SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN appointments a ON p.appointment_id = a.id WHERE a.doctor_id = ? AND p.status = 'completed'",
      [doctorId]
    );

    // Today's schedule
    const [todaySchedule] = await db.execute(`
      SELECT a.*,
        CONCAT(u.first_name, ' ', u.last_name) as patient_name,
        u.phone as patient_phone, u.avatar as patient_avatar,
        pat.blood_group, pat.allergies
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN patients pat ON a.patient_id = pat.id
      WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
      ORDER BY a.appointment_time ASC
    `, [doctorId]);

    // Recent patients
    const [recentPatients] = await db.execute(`
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.avatar,
        pat.blood_group, pat.date_of_birth,
        MAX(a.appointment_date) as last_visit
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN patients pat ON a.patient_id = pat.id
      WHERE a.doctor_id = ? AND a.status = 'completed'
      GROUP BY u.id ORDER BY last_visit DESC LIMIT 5
    `, [doctorId]);

    // Weekly appointment trend
    const [weeklyTrend] = await db.execute(`
      SELECT DAYNAME(appointment_date) as day, COUNT(*) as count
      FROM appointments
      WHERE doctor_id = ? AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY day ORDER BY appointment_date ASC
    `, [doctorId]);

    res.json({
      stats: {
        totalPatients: totalPatients.count,
        todayAppointments: todayAppointments.count,
        completedToday: completedToday.count,
        totalRevenue: parseFloat(totalRevenue.total)
      },
      todaySchedule,
      recentPatients,
      weeklyTrend
    });
  } catch (error) {
    console.error('Doctor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
};
