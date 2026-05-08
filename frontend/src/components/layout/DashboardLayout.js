import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, UserCheck, Calendar, CreditCard,
  FileText, Building2, LogOut, Menu, X, Bell, Sun, Moon,
  ChevronRight, Stethoscope, Heart, Settings, ClipboardList
} from 'lucide-react';

/* =========================
   FIXED AVATAR COMPONENT
========================= */
function Avatar({ name = '', src, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      )}
    </div>
  );
}

const navConfigs = {
  admin: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/admin/patients', label: 'Patients', icon: Users },
    { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { path: '/admin/departments', label: 'Departments', icon: Building2 },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  ],
  patient: [
    { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { path: '/patient/payments', label: 'Payments', icon: CreditCard },
    { path: '/patient/profile', label: 'Profile', icon: Settings },
  ],
  doctor: [
    { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { path: '/doctor/patients', label: 'My Patients', icon: Users },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { path: '/doctor/profile', label: 'Profile', icon: Settings },
  ],
};

const roleLabels = {
  admin: { label: 'Administrator', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  doctor: { label: 'Doctor', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  patient: { label: 'Patient', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' },
};

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = navConfigs[user?.role] || [];
  const role = roleLabels[user?.role] || roleLabels.patient;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">MediCare</span>
              <p className="text-[10px] text-gray-400">Hospital Management</p>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="p-4 mx-3 mt-4 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Avatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="md" />
            <div>
              <p className="font-semibold text-sm">
                {user?.first_name} {user?.last_name}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${role.bg} ${role.color}`}>
                {role.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;

            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            Theme
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="font-bold">{title}</h1>

      <div className="flex items-center gap-3">
        <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" />
        <span className="text-sm">{user?.first_name}</span>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}