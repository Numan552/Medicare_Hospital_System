import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, Avatar, Badge, Button, Modal, FormInput, SearchInput, EmptyState } from '../../components/common/UI';
import { dashboardAPI, appointmentsAPI, patientsAPI, prescriptionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, Calendar, CheckCircle, DollarSign, Clock, ArrowRight, Stethoscope, Activity, Pill, FileText, Plus, Save, Star, Phone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── DEMO DATA ────────────────────────────────────────────────
const demoStats = { totalPatients: 89, todayAppointments: 6, completedToday: 3, totalRevenue: 18400 };

const demoTodaySchedule = [
  { id: 1, patient_name: 'John Doe', patient_phone: '+1-555-0201', appointment_time: '09:00:00', status: 'completed', type: 'consultation', symptoms: 'Chest pain, shortness of breath', blood_group: 'O+' },
  { id: 2, patient_name: 'Jane Smith', patient_phone: '+1-555-0202', appointment_time: '10:00:00', status: 'confirmed', type: 'follow_up', symptoms: 'BP monitoring', blood_group: 'A+' },
  { id: 3, patient_name: 'Bob Martin', patient_phone: '+1-555-0203', appointment_time: '11:30:00', status: 'pending', type: 'consultation', symptoms: 'Palpitations', blood_group: 'B-' },
  { id: 4, patient_name: 'Alice Brown', patient_phone: '+1-555-0204', appointment_time: '14:00:00', status: 'pending', type: 'checkup', symptoms: 'Annual cardiac checkup', blood_group: 'AB+' },
  { id: 5, patient_name: 'Charlie Davis', patient_phone: '+1-555-0205', appointment_time: '15:30:00', status: 'confirmed', type: 'consultation', symptoms: 'Irregular heartbeat', blood_group: 'O-' },
];

const demoRecentPatients = [
  { id: 1, first_name: 'John', last_name: 'Doe', blood_group: 'O+', date_of_birth: '1985-03-15', last_visit: '2024-06-15', total_appointments: 5 },
  { id: 2, first_name: 'Jane', last_name: 'Smith', blood_group: 'A+', date_of_birth: '1990-07-22', last_visit: '2024-06-10', total_appointments: 3 },
  { id: 3, first_name: 'Bob', last_name: 'Martin', blood_group: 'B-', date_of_birth: '1978-11-08', last_visit: '2024-06-05', total_appointments: 8 },
];

const demoWeeklyTrend = [
  { day: 'Mon', count: 8 }, { day: 'Tue', count: 5 }, { day: 'Wed', count: 10 },
  { day: 'Thu', count: 7 }, { day: 'Fri', count: 9 }, { day: 'Sat', count: 3 },
];

const demoAllAppointments = [
  ...demoTodaySchedule,
  { id: 6, patient_name: 'Diana Prince', patient_phone: '+1-555-0206', appointment_time: '09:00:00', appointment_date: '2024-06-17', status: 'pending', type: 'consultation', symptoms: 'Fatigue', blood_group: 'A-' },
  { id: 7, patient_name: 'Ethan Hunt', patient_phone: '+1-555-0207', appointment_time: '10:30:00', appointment_date: '2024-06-18', status: 'confirmed', type: 'follow_up', symptoms: 'Post-surgery checkup', blood_group: 'O+' },
];

const demoPatients = [
  { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '+1-555-0201', blood_group: 'O+', gender: 'Male', date_of_birth: '1985-03-15', city: 'New York', chronic_conditions: 'Hypertension', total_appointments: 5, last_visit: '2024-06-15' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@email.com', phone: '+1-555-0202', blood_group: 'A+', gender: 'Female', date_of_birth: '1990-07-22', city: 'Los Angeles', chronic_conditions: 'None', total_appointments: 3, last_visit: '2024-06-10' },
  { id: 3, first_name: 'Bob', last_name: 'Martin', email: 'bob@email.com', phone: '+1-555-0203', blood_group: 'B-', gender: 'Male', date_of_birth: '1978-11-08', city: 'Chicago', chronic_conditions: 'Diabetes', total_appointments: 8, last_visit: '2024-06-05' },
];

const demoDoctorPrescriptions = [
  { id: 1, patient_name: 'John Doe', diagnosis: 'Hypertension Stage 1', medications: JSON.stringify([{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }]), created_at: '2024-06-15', follow_up_date: '2024-07-15' },
  { id: 2, patient_name: 'Jane Smith', diagnosis: 'Anxiety-related hypertension', medications: JSON.stringify([{ name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily' }]), created_at: '2024-06-10', follow_up_date: '2024-06-24' },
];

// ─── DOCTOR DASHBOARD ─────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(demoStats);
  const [todaySchedule, setTodaySchedule] = useState(demoTodaySchedule);
  const [recentPatients, setRecentPatients] = useState(demoRecentPatients);
  const [weeklyTrend, setWeeklyTrend] = useState(demoWeeklyTrend);

  useEffect(() => {
    dashboardAPI.getDoctorStats()
      .then(res => {
        setStats(res.data.stats || demoStats);
        setTodaySchedule(res.data.todaySchedule || demoTodaySchedule);
        setRecentPatients(res.data.recentPatients || demoRecentPatients);
        setWeeklyTrend(res.data.weeklyTrend || demoWeeklyTrend);
      }).catch(() => {});
  }, []);

  const updateApptStatus = async (id, status) => {
    try { await appointmentsAPI.updateStatus(id, { status }); } catch {}
    setTodaySchedule(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Appointment marked as ${status}`);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute bottom-0 right-16 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-teal-100 mb-1">{getGreeting()}, Doctor</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">Dr. {user?.first_name} {user?.last_name} 👨‍⚕️</h2>
            <p className="text-teal-100 text-sm">You have <strong>{stats.todayAppointments}</strong> appointments today · <strong>{stats.completedToday}</strong> completed</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="blue" />
          <StatCard icon={Calendar} label="Today's Appointments" value={stats.todayAppointments} color="teal" />
          <StatCard icon={CheckCircle} label="Completed Today" value={stats.completedToday} color="green" />
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Today's Schedule</h3>
                <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <Link to="/doctor/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                Full Calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {todaySchedule.map(appt => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{appt.appointment_time?.slice(0, 5)}</p>
                    <p className="text-xs text-gray-400">{parseInt(appt.appointment_time) < 12 ? 'AM' : 'PM'}</p>
                  </div>
                  <div className="w-0.5 h-10 bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                  <Avatar name={appt.patient_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{appt.patient_name}</p>
                    <p className="text-xs text-gray-400">{appt.type?.replace('_', ' ')} · {appt.blood_group}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                  {appt.status === 'confirmed' && (
                    <button onClick={() => updateApptStatus(appt.id, 'completed')} className="flex items-center gap-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors flex-shrink-0">
                      <CheckCircle className="h-3.5 w-3.5" /> Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Weekly Overview</h3>
            <p className="text-sm text-gray-400 mb-5">Appointments this week</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyTrend} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" name="Appointments" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-3">Recent Patients</h4>
              <div className="space-y-3">
                {recentPatients.map(p => {
                  const age = p.date_of_birth ? Math.floor((new Date() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <Avatar name={`${p.first_name} ${p.last_name}`} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-400">{p.blood_group}{age ? ` · ${age}y` : ''}</p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">{p.last_visit?.slice(0, 10)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── DOCTOR APPOINTMENTS ──────────────────────────────────────
export function DoctorAppointments() {
  const [appointments, setAppointments] = useState(demoAllAppointments.map(a => ({ ...a, appointment_date: a.appointment_date || new Date().toISOString().slice(0, 10) })));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescribeModal, setPrescribeModal] = useState(null);
  const [rxForm, setRxForm] = useState({ diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], instructions: '', follow_up_date: '' });
  const [savingRx, setSavingRx] = useState(false);

  const filtered = appointments.filter(a => {
    const matchSearch = !search || a.patient_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    try { await appointmentsAPI.updateStatus(id, { status }); } catch {}
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Status updated to ${status}`);
  };

  const addMed = () => setRxForm(p => ({ ...p, medications: [...p.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const updateMed = (i, field, val) => setRxForm(p => ({ ...p, medications: p.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));
  const removeMed = (i) => setRxForm(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));

  const savePrescription = async () => {
    if (!rxForm.diagnosis) return toast.error('Diagnosis is required');
    setSavingRx(true);
    try {
      await prescriptionsAPI.create({ appointment_id: prescribeModal.id, patient_id: 1, ...rxForm });
    } catch {}
    toast.success('Prescription saved successfully');
    updateStatus(prescribeModal.id, 'completed');
    setPrescribeModal(null);
    setSavingRx(false);
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Appointment Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{appointments.length} total appointments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search patients..." /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid gap-3">
          {filtered.map(appt => (
            <div key={appt.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 hover:shadow-card-hover transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar name={appt.patient_name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{appt.patient_name}</h4>
                    <StatusBadge status={appt.status} />
                    <Badge>{appt.type?.replace('_', ' ')}</Badge>
                    {appt.blood_group && <Badge variant="danger">{appt.blood_group}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{appt.symptoms}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{appt.appointment_date}</p>
                  <p className="text-sm text-gray-500">{appt.appointment_time?.slice(0, 5)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {appt.status === 'pending' && (
                    <button onClick={() => updateStatus(appt.id, 'confirmed')} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors">Confirm</button>
                  )}
                  {(appt.status === 'confirmed' || appt.status === 'pending') && (
                    <button onClick={() => { setPrescribeModal(appt); setRxForm({ diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], instructions: '', follow_up_date: '' }); }}
                      className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5" /> Prescribe
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState icon={Calendar} title="No appointments found" description="No appointments match your current filters." />}
        </div>
      </div>

      {/* Prescribe Modal */}
      <Modal isOpen={!!prescribeModal} onClose={() => setPrescribeModal(null)} title={`Prescribe - ${prescribeModal?.patient_name}`} size="lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Diagnosis *</label>
            <textarea value={rxForm.diagnosis} onChange={e => setRxForm(p => ({ ...p, diagnosis: e.target.value }))} rows={2} placeholder="Enter diagnosis..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medications</label>
              <button onClick={addMed} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"><Plus className="h-3.5 w-3.5" />Add Medication</button>
            </div>
            <div className="space-y-3">
              {rxForm.medications.map((med, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput placeholder="Medication name" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} />
                    <FormInput placeholder="Dosage (e.g. 5mg)" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} />
                    <FormInput placeholder="Frequency (e.g. Once daily)" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} />
                    <FormInput placeholder="Duration (e.g. 30 days)" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                  </div>
                  {rxForm.medications.length > 1 && (
                    <button onClick={() => removeMed(i)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instructions</label>
            <textarea value={rxForm.instructions} onChange={e => setRxForm(p => ({ ...p, instructions: e.target.value }))} rows={2} placeholder="Special instructions for the patient..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <FormInput label="Follow-up Date" type="date" value={rxForm.follow_up_date} onChange={e => setRxForm(p => ({ ...p, follow_up_date: e.target.value }))} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setPrescribeModal(null)} className="flex-1">Cancel</Button>
          <Button onClick={savePrescription} loading={savingRx} className="flex-1"><Save className="h-4 w-4" />Save Prescription</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ─── DOCTOR PATIENTS ──────────────────────────────────────────
export function DoctorPatients() {
  const [patients, setPatients] = useState(demoPatients);
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState(null);

  const filtered = patients.filter(p => !search || `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="My Patients">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Patients</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{patients.length} patients under your care</p>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search patients..." />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => {
            const age = p.date_of_birth ? Math.floor((new Date() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;
            return (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 hover:shadow-card-hover transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar name={`${p.first_name} ${p.last_name}`} size="lg" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{p.first_name} {p.last_name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.gender}{age ? ` · ${age} years` : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Blood Group', value: p.blood_group || 'N/A' },
                    { label: 'City', value: p.city || '—' },
                    { label: 'Total Visits', value: p.total_appointments },
                    { label: 'Last Visit', value: p.last_visit || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                {p.chronic_conditions && p.chronic_conditions !== 'None' && (
                  <div className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-2 rounded-lg mb-3">⚠️ {p.chronic_conditions}</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setViewPatient(p)} className="flex-1 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition-colors font-medium">View Details</button>
                  <a href={`tel:${p.phone}`} className="p-2 text-gray-500 hover:text-teal-600 bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition-colors">
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <EmptyState icon={Users} title="No patients found" description="No patients match your search." />}
        </div>
      </div>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="md">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Avatar name={`${viewPatient.first_name} ${viewPatient.last_name}`} size="lg" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{viewPatient.first_name} {viewPatient.last_name}</h3>
                <p className="text-gray-500 text-sm">{viewPatient.email}</p>
                <p className="text-gray-500 text-sm">{viewPatient.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Gender', value: viewPatient.gender },
                { label: 'Blood Group', value: viewPatient.blood_group },
                { label: 'Date of Birth', value: viewPatient.date_of_birth },
                { label: 'City', value: viewPatient.city },
                { label: 'Total Visits', value: viewPatient.total_appointments },
                { label: 'Last Visit', value: viewPatient.last_visit },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
            {viewPatient.chronic_conditions && viewPatient.chronic_conditions !== 'None' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                <p className="text-xs text-orange-500 font-semibold uppercase mb-1">Chronic Conditions</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewPatient.chronic_conditions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

// ─── DOCTOR PRESCRIPTIONS ─────────────────────────────────────
export function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState(demoDoctorPrescriptions);

  useEffect(() => {
    prescriptionsAPI.getAll().then(res => { if (res.data.prescriptions?.length) setPrescriptions(res.data.prescriptions); }).catch(() => {});
  }, []);

  return (
    <DashboardLayout title="Prescriptions">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Prescriptions</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{prescriptions.length} prescriptions written</p>
        </div>

        {prescriptions.length === 0 ? (
          <EmptyState icon={FileText} title="No prescriptions yet" description="Prescriptions you write will appear here." />
        ) : (
          <div className="grid gap-4">
            {prescriptions.map(rx => {
              let meds = [];
              try { meds = JSON.parse(rx.medications || '[]'); } catch {}
              return (
                <div key={rx.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{rx.patient_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{rx.created_at?.slice(0, 10)}</p>
                    </div>
                    {rx.follow_up_date && <Badge variant="info">Follow-up: {rx.follow_up_date}</Badge>}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Diagnosis: <span className="font-normal text-gray-600 dark:text-gray-400">{rx.diagnosis}</span></p>
                  <div className="grid gap-2">
                    {meds.map((med, i) => (
                      <div key={i} className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-3">
                        <Pill className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{med.name}</span>
                        <span className="text-gray-500 text-sm">{med.dosage}</span>
                        <span className="text-gray-400 text-sm ml-auto">{med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── DOCTOR PROFILE ───────────────────────────────────────────
export function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', specialization: 'Cardiologist', qualification: 'MD, FACC', experience_years: 15, consultation_fee: 250, bio: 'Expert cardiologist with 15+ years of experience in interventional cardiology.', available_time_start: '09:00', available_time_end: '17:00', available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] });
  const [saving, setSaving] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const toggleDay = (day) => setForm(p => ({ ...p, available_days: p.available_days.includes(day) ? p.available_days.filter(d => d !== day) : [...p.available_days, day] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser({ first_name: form.first_name, last_name: form.last_name, phone: form.phone });
    toast.success('Profile updated successfully');
    setSaving(false);
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Doctor Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your professional information and availability</p>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-6 text-white flex items-center gap-5">
          <Avatar name={`${user?.first_name} ${user?.last_name}`} size="xl" />
          <div>
            <h3 className="font-display font-bold text-2xl">Dr. {user?.first_name} {user?.last_name}</h3>
            <p className="text-teal-100">{form.specialization}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{form.qualification}</span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{form.experience_years} Years Exp.</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-5">Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="First Name" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
            <FormInput label="Last Name" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
            <FormInput label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <FormInput label="Specialization" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
            <FormInput label="Qualification" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} />
            <FormInput label="Experience (Years)" type="number" value={form.experience_years} onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))} />
            <FormInput label="Consultation Fee ($)" type="number" value={form.consultation_fee} onChange={e => setForm(p => ({ ...p, consultation_fee: e.target.value }))} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-5">Availability</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button key={day} onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border-2 ${form.available_days.includes(day) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Start Time" type="time" value={form.available_time_start} onChange={e => setForm(p => ({ ...p, available_time_start: e.target.value }))} />
            <FormInput label="End Time" type="time" value={form.available_time_end} onChange={e => setForm(p => ({ ...p, available_time_end: e.target.value }))} />
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} size="lg"><Save className="h-5 w-5" />Save Profile</Button>
      </div>
    </DashboardLayout>
  );
}
