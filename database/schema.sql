-- MediCare Hospital Management System - MySQL Schema
-- Version: 1.0.0

CREATE DATABASE IF NOT EXISTS medicare_db;
USE medicare_db;

-- ============================================================
-- DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  head_doctor_id INT NULL,
  room_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS TABLE (Base for all user types)
-- ============================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- DOCTORS TABLE
-- ============================================================
CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  department_id INT,
  specialization VARCHAR(200) NOT NULL,
  qualification VARCHAR(500),
  experience_years INT DEFAULT 0,
  license_number VARCHAR(100) UNIQUE,
  consultation_fee DECIMAL(10,2) DEFAULT 0.00,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  available_days JSON, -- e.g. ["Monday","Wednesday","Friday"]
  available_time_start TIME DEFAULT '09:00:00',
  available_time_end TIME DEFAULT '17:00:00',
  slot_duration INT DEFAULT 30, -- in minutes
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- PATIENTS TABLE
-- ============================================================
CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  address TEXT,
  city VARCHAR(100),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  allergies TEXT,
  chronic_conditions TEXT,
  insurance_provider VARCHAR(200),
  insurance_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  department_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
  type ENUM('consultation', 'follow_up', 'emergency', 'checkup') DEFAULT 'consultation',
  symptoms TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- PRESCRIPTIONS TABLE
-- ============================================================
CREATE TABLE prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  diagnosis TEXT NOT NULL,
  medications JSON, -- Array of {name, dosage, frequency, duration}
  instructions TEXT,
  follow_up_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ============================================================
-- MEDICAL RECORDS TABLE
-- ============================================================
CREATE TABLE medical_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  record_type ENUM('lab_result', 'imaging', 'surgery', 'vaccination', 'other') DEFAULT 'other',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  patient_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method ENUM('cash', 'card', 'insurance', 'online') DEFAULT 'cash',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  invoice_number VARCHAR(100) UNIQUE,
  payment_date DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('appointment', 'prescription', 'payment', 'system', 'reminder') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_doctors_department ON doctors(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Departments
INSERT INTO departments (name, description, icon, room_count) VALUES
('Cardiology', 'Heart and cardiovascular system specialists', 'Heart', 12),
('Neurology', 'Brain and nervous system specialists', 'Brain', 10),
('Orthopedics', 'Bone, joint, and muscle specialists', 'Bone', 15),
('Pediatrics', 'Medical care for children and adolescents', 'Baby', 18),
('Dentistry', 'Oral health and dental care specialists', 'Smile', 8),
('Emergency', '24/7 emergency medical services', 'AlertCircle', 20),
('Radiology', 'Medical imaging and diagnostic services', 'Scan', 6),
('Dermatology', 'Skin, hair, and nail specialists', 'Sun', 9);

-- Admin User
INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES
('admin@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FADMIN1', 'admin', 'System', 'Administrator', '+1-555-0100');

-- Doctor Users
INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES
('dr.sarah.johnson@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC01', 'doctor', 'Sarah', 'Johnson', '+1-555-0101'),
('dr.michael.chen@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC02', 'doctor', 'Michael', 'Chen', '+1-555-0102'),
('dr.emily.rodriguez@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC03', 'doctor', 'Emily', 'Rodriguez', '+1-555-0103'),
('dr.james.wilson@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC04', 'doctor', 'James', 'Wilson', '+1-555-0104'),
('dr.aisha.patel@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC05', 'doctor', 'Aisha', 'Patel', '+1-555-0105'),
('dr.robert.kim@medicare.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FDOC06', 'doctor', 'Robert', 'Kim', '+1-555-0106');

-- Patient Users
INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES
('john.doe@email.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FPAT01', 'patient', 'John', 'Doe', '+1-555-0201'),
('jane.smith@email.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FPAT02', 'patient', 'Jane', 'Smith', '+1-555-0202'),
('bob.martin@email.com', '$2b$10$rQZ8kVn1mVvlqJX8LdE5F.VJv4jQZ8kVn1mVvlqJX8LdE5FPAT03', 'patient', 'Bob', 'Martin', '+1-555-0203');

-- Doctor Profiles
INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, license_number, consultation_fee, bio, rating, total_reviews, available_days, available_time_start, available_time_end) VALUES
(2, 1, 'Interventional Cardiologist', 'MD, FACC, FSCAI', 15, 'MD-CARD-001', 250.00, 'Dr. Johnson is a leading cardiologist with expertise in interventional cardiology and heart failure management.', 4.9, 247, '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '09:00:00', '17:00:00'),
(3, 2, 'Neurologist & Stroke Specialist', 'MD, PhD, FAAN', 12, 'MD-NEUR-001', 220.00, 'Dr. Chen specializes in stroke treatment, epilepsy, and neurodegenerative diseases.', 4.8, 189, '["Monday","Wednesday","Friday"]', '08:00:00', '16:00:00'),
(4, 3, 'Orthopedic Surgeon', 'MD, FAAOS', 10, 'MD-ORTH-001', 200.00, 'Dr. Rodriguez is an expert in joint replacement surgery and sports medicine.', 4.7, 156, '["Tuesday","Thursday","Saturday"]', '10:00:00', '18:00:00'),
(5, 4, 'Pediatric Specialist', 'MD, FAAP', 8, 'MD-PEDI-001', 150.00, 'Dr. Wilson provides comprehensive pediatric care from newborns to adolescents.', 4.9, 312, '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '09:00:00', '17:00:00'),
(6, 1, 'Cardiologist & Electrophysiologist', 'MD, FHRS', 18, 'MD-CARD-002', 280.00, 'Dr. Patel specializes in cardiac electrophysiology and arrhythmia management.', 4.8, 203, '["Monday","Wednesday","Friday"]', '08:30:00', '16:30:00'),
(7, 2, 'Neurologist & Pain Specialist', 'MD, DABPM', 9, 'MD-NEUR-002', 190.00, 'Dr. Kim focuses on pain management and headache disorders.', 4.6, 134, '["Tuesday","Thursday"]', '09:00:00', '17:00:00');

-- Patient Profiles
INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, city, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions) VALUES
(8, '1985-03-15', 'Male', 'O+', '123 Main Street', 'New York', 'Mary Doe', '+1-555-0301', 'Penicillin', 'Hypertension'),
(9, '1990-07-22', 'Female', 'A+', '456 Oak Avenue', 'Los Angeles', 'Tom Smith', '+1-555-0302', 'None', 'None'),
(10, '1978-11-08', 'Male', 'B-', '789 Pine Road', 'Chicago', 'Lisa Martin', '+1-555-0303', 'Aspirin', 'Diabetes Type 2');

-- Sample Appointments
INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, end_time, status, type, symptoms) VALUES
(1, 1, 1, CURDATE() + INTERVAL 1 DAY, '10:00:00', '10:30:00', 'confirmed', 'consultation', 'Chest pain, shortness of breath'),
(1, 2, 2, CURDATE() + INTERVAL 3 DAY, '14:00:00', '14:30:00', 'pending', 'consultation', 'Recurring headaches'),
(2, 4, 4, CURDATE() - INTERVAL 5 DAY, '09:00:00', '09:30:00', 'completed', 'checkup', 'Routine pediatric checkup'),
(3, 3, 3, CURDATE() + INTERVAL 7 DAY, '11:00:00', '11:30:00', 'confirmed', 'consultation', 'Knee pain after sports injury'),
(2, 1, 1, CURDATE() - INTERVAL 10 DAY, '15:00:00', '15:30:00', 'completed', 'follow_up', 'Follow up for hypertension');

-- Sample Payments
INSERT INTO payments (appointment_id, patient_id, amount, payment_method, status, transaction_id, invoice_number, payment_date) VALUES
(3, 2, 150.00, 'card', 'completed', 'TXN-2024-001', 'INV-2024-001', NOW() - INTERVAL 5 DAY),
(5, 2, 250.00, 'insurance', 'completed', 'TXN-2024-002', 'INV-2024-002', NOW() - INTERVAL 10 DAY),
(1, 1, 250.00, 'online', 'pending', 'TXN-2024-003', 'INV-2024-003', NOW());

-- Sample Prescriptions
INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, medications, instructions, follow_up_date) VALUES
(3, 2, 4, 'Routine health checkup - all vitals normal', 
 '[{"name":"Vitamin D3","dosage":"1000 IU","frequency":"Once daily","duration":"3 months"},{"name":"Omega-3","dosage":"1g","frequency":"Once daily","duration":"Ongoing"}]',
 'Maintain healthy diet, regular exercise, adequate sleep', CURDATE() + INTERVAL 90 DAY),
(5, 2, 1, 'Hypertension - Stage 1, well controlled',
 '[{"name":"Amlodipine","dosage":"5mg","frequency":"Once daily","duration":"Ongoing"},{"name":"Lisinopril","dosage":"10mg","frequency":"Once daily","duration":"Ongoing"}]',
 'Monitor blood pressure daily. Reduce sodium intake. Exercise 30 mins daily.', CURDATE() + INTERVAL 30 DAY);

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(8, 'Appointment Confirmed', 'Your appointment with Dr. Sarah Johnson on tomorrow at 10:00 AM has been confirmed.', 'appointment', FALSE),
(8, 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Michael Chen in 3 days.', 'reminder', FALSE),
(9, 'Prescription Ready', 'Your prescription from Dr. James Wilson is now available.', 'prescription', TRUE),
(10, 'Payment Due', 'Payment of $200.00 is pending for your upcoming appointment.', 'payment', FALSE);
