import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, Avatar, Badge, Button } from '../../components/common/UI';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, FileText, CreditCard, Clock, ArrowRight, Pill, Star, AlertCircle, Activity } from 'lucide-react';

const demoStats = { totalAppointments: 8, upcomingAppointments: 2, totalSpent: 870, prescriptions: 3 };

const demoUpcoming = [
  { id: 1, doctor_name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', department_name: 'Cardiology', appointment_date: '2024-06-16', appointment_time: '10:00:00', status: 'confirmed', type: 'consultation' },
  { id: 2, doctor_name: 'Dr. Michael Chen', specialization: 'Neurologist', department_name: 'Neurology', appointment_date: '2024-06-19', appointment_time: '14:00:00', status: 'pending', type: 'consultation' },
];

const demoRecentPrescriptions = [
  { id: 1, doctor_name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', diagnosis: 'Hypertension Stage 1 - Well controlled', created_at: '2024-06-10', medications: '[{"name":"Amlodipine","dosage":"5mg","frequency":"Once daily"},{"name":"Lisinopril","dosage":"10mg","frequency":"Once daily"}]' },
  { id: 2, doctor_name: 'Dr. James Wilson', specialization: 'Pediatrician', diagnosis: 'Annual health checkup - Normal', created_at: '2024-06-01', medications: '[{"name":"Vitamin D3","dosage":"1000 IU","frequency":"Once daily"}]' },
];

const quickActions = [
  { label: 'Book Appointment', icon: Calendar, to: '/appointment', color: 'bg-blue-500 hover:bg-blue-600', desc: 'Schedule a new visit' },
  { label: 'My Appointments', icon: Clock, to: '/patient/appointments', color: 'bg-teal-500 hover:bg-teal-600', desc: 'View your bookings' },
  { label: 'Prescriptions', icon: Pill, to: '/patient/prescriptions', color: 'bg-purple-500 hover:bg-purple-600', desc: 'View medications' },
  { label: 'Payment History', icon: CreditCard, to: '/patient/payments', color: 'bg-orange-500 hover:bg-orange-600', desc: 'Billing records' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(demoStats);
  const [upcoming, setUpcoming] = useState(demoUpcoming);
  const [prescriptions, setPrescriptions] = useState(demoRecentPrescriptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getPatientStats();
        setStats(res.data.stats);
        setUpcoming(res.data.upcoming || demoUpcoming);
        setPrescriptions(res.data.recentPrescriptions || demoRecentPrescriptions);
      } catch { /* use demo data */ }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout title="My Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-blue-200 mb-1">{getGreeting()},</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">{user?.first_name} {user?.last_name} 👋</h2>
            <p className="text-blue-100 text-sm mb-5">You have {stats.upcomingAppointments} upcoming appointment{stats.upcomingAppointments !== 1 ? 's' : ''} scheduled.</p>
            <Link to="/appointment" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm">
              <Calendar className="h-4 w-4" /> Book New Appointment
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total Appointments" value={stats.totalAppointments} color="blue" loading={loading} />
          <StatCard icon={Clock} label="Upcoming" value={stats.upcomingAppointments} color="teal" loading={loading} />
          <StatCard icon={CreditCard} label="Total Spent" value={`$${stats.totalSpent}`} color="purple" loading={loading} />
          <StatCard icon={FileText} label="Prescriptions" value={stats.prescriptions} color="orange" loading={loading} />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
              <Link key={label} to={to} className={`${color} text-white rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group`}>
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-white/70 text-xs mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Upcoming Appointments</h3>
              <Link to="/patient/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
                <Link to="/appointment" className="mt-3 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Book one now →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {upcoming.map(appt => (
                  <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{appt.doctor_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appt.specialization} · {appt.department_name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                        {appt.appointment_date} at {appt.appointment_time?.slice(0, 5)}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Recent Prescriptions</h3>
              <Link to="/patient/prescriptions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {prescriptions.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No prescriptions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {prescriptions.map(rx => {
                  let meds = [];
                  try { meds = JSON.parse(rx.medications || '[]'); } catch {}
                  return (
                    <div key={rx.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{rx.doctor_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{rx.specialization}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{rx.created_at?.slice(0, 10)}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{rx.diagnosis}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {meds.slice(0, 3).map((m, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                            <Pill className="h-2.5 w-2.5" />{m.name}
                          </span>
                        ))}
                        {meds.length > 3 && <span className="text-xs text-gray-400">+{meds.length - 3} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-teal-100 dark:border-teal-800">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h4 className="font-display font-bold text-gray-900 dark:text-white mb-1">Health Reminder</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Stay hydrated and remember to take your medications as prescribed. Your next appointment is coming up — make sure you're prepared with any questions for your doctor.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
