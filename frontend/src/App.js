import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages - Public
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import AppointmentPage from './pages/AppointmentPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminPayments from './pages/admin/AdminPayments';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientProfile from './pages/patient/PatientProfile';
import PatientPayments from './pages/patient/PatientPayments';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorProfile from './pages/doctor/DoctorProfile';

import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return children;
};

const getDashboardPath = (role) => {
  const paths = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
  return paths[role] || '/';
};

// Redirect logged-in users from auth pages
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatients /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PatientPrescriptions /></ProtectedRoute>} />
            <Route path="/patient/payments" element={<ProtectedRoute allowedRoles={['patient']}><PatientPayments /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
