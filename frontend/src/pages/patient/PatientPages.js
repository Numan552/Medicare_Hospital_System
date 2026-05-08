import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, Badge, SearchInput, EmptyState, Button, Modal, FormInput, Avatar } from '../../components/common/UI';
import { appointmentsAPI, prescriptionsAPI, paymentsAPI, doctorsAPI, departmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, FileText, CreditCard, Clock, Plus, Pill, Download, User, Phone, Mail, MapPin, Save, Eye } from 'lucide-react';

// ─── DEMO DATA ────────────────────────────────────────────────
const demoAppointments = [
  { id: 1, doctor_name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', department_name: 'Cardiology', appointment_date: '2024-06-16', appointment_time: '10:00:00', status: 'confirmed', type: 'consultation', symptoms: 'Chest pain', payment_amount: 250 },
  { id: 2, doctor_name: 'Dr. Michael Chen', specialization: 'Neurologist', department_name: 'Neurology', appointment_date: '2024-06-19', appointment_time: '14:00:00', status: 'pending', type: 'consultation', symptoms: 'Headaches', payment_amount: 220 },
  { id: 3, doctor_name: 'Dr. James Wilson', specialization: 'Pediatrician', department_name: 'Pediatrics', appointment_date: '2024-06-01', appointment_time: '09:00:00', status: 'completed', type: 'checkup', symptoms: 'Annual checkup', payment_amount: 150 },
  { id: 4, doctor_name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', department_name: 'Cardiology', appointment_date: '2024-05-15', appointment_time: '15:00:00', status: 'completed', type: 'follow_up', symptoms: 'Follow up', payment_amount: 250 },
];

const demoPrescriptions = [
  { id: 1, doctor_name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', diagnosis: 'Hypertension Stage 1 - Well controlled', medications: JSON.stringify([{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing' }, { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing' }]), instructions: 'Monitor BP daily. Reduce sodium intake. Exercise 30 mins daily.', follow_up_date: '2024-07-10', created_at: '2024-06-10', is_active: true },
  { id: 2, doctor_name: 'Dr. James Wilson', specialization: 'Pediatrician', diagnosis: 'Annual health checkup - All vitals normal', medications: JSON.stringify([{ name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', duration: '3 months' }, { name: 'Omega-3', dosage: '1g', frequency: 'Once daily', duration: 'Ongoing' }]), instructions: 'Maintain healthy diet. Regular exercise. Adequate sleep.', follow_up_date: '2024-09-01', created_at: '2024-06-01', is_active: true },
];

const demoPayments = [
  { id: 1, invoice_number: 'INV-2024-001', doctor_name: 'Dr. Sarah Johnson', appointment_date: '2024-06-16', amount: 250, payment_method: 'card', status: 'pending', created_at: '2024-06-15' },
  { id: 2, invoice_number: 'INV-2024-002', doctor_name: 'Dr. Michael Chen', appointment_date: '2024-06-01', amount: 220, payment_method: 'insurance', status: 'completed', created_at: '2024-06-01' },
  { id: 3, invoice_number: 'INV-2024-003', doctor_name: 'Dr. James Wilson', appointment_date: '2024-05-15', amount: 150, payment_method: 'cash', status: 'completed', created_at: '2024-05-15' },
];

// ─── PATIENT APPOINTMENTS ─────────────────────────────────────
export function PatientAppointments() {
  const [appointments, setAppointments] = useState(demoAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookModal, setBookModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookForm, setBookForm] = useState({ doctor_id: '', appointment_date: '', appointment_time: '', type: 'consultation', symptoms: '' });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, docRes, deptRes] = await Promise.all([appointmentsAPI.getAll(), doctorsAPI.getAll(), departmentsAPI.getAll()]);
        if (apptRes.data.appointments?.length) setAppointments(apptRes.data.appointments);
        setDoctors(docRes.data.doctors || []);
        setDepartments(deptRes.data.departments || []);
      } catch { /* demo */ }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (bookForm.doctor_id && bookForm.appointment_date) {
      setLoadingSlots(true);
      appointmentsAPI.getSlots({ doctor_id: bookForm.doctor_id, date: bookForm.appointment_date })
        .then(res => setSlots(res.data.slots || ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00']))
        .catch(() => setSlots(['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00']))
        .finally(() => setLoadingSlots(false));
    }
  }, [bookForm.doctor_id, bookForm.appointment_date]);

  const filtered = appointments.filter(a => {
    const matchSearch = !search || a.doctor_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleBook = async () => {
    if (!bookForm.doctor_id || !bookForm.appointment_date || !bookForm.appointment_time) return toast.error('Please fill all required fields');
    setBookingLoading(true);
    try {
      await appointmentsAPI.create(bookForm);
      toast.success('Appointment booked successfully!');
    } catch {
      toast.success('Appointment booked (demo mode)');
    }
    const selectedDoc = doctors.find(d => d.id == bookForm.doctor_id);
    setAppointments(prev => [{
      id: Date.now(), doctor_name: selectedDoc ? `Dr. ${selectedDoc.first_name} ${selectedDoc.last_name}` : 'Doctor',
      specialization: selectedDoc?.specialization || '', department_name: selectedDoc?.department_name || '',
      appointment_date: bookForm.appointment_date, appointment_time: bookForm.appointment_time,
      status: 'pending', type: bookForm.type, symptoms: bookForm.symptoms, payment_amount: selectedDoc?.consultation_fee || 0
    }, ...prev]);
    setBookModal(false);
    setBookForm({ doctor_id: '', appointment_date: '', appointment_time: '', type: 'consultation', symptoms: '' });
    setBookingLoading(false);
  };

  const cancelAppointment = async (id) => {
    try { await appointmentsAPI.updateStatus(id, { status: 'cancelled' }); } catch {}
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    toast.success('Appointment cancelled');
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Appointments</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{appointments.length} total appointments</p>
          </div>
          <Button onClick={() => setBookModal(true)}><Plus className="h-4 w-4" />Book Appointment</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search by doctor name..." /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments found" description="Book your first appointment with one of our expert doctors." action={<Button onClick={() => setBookModal(true)}><Plus className="h-4 w-4" />Book Appointment</Button>} />
        ) : (
          <div className="grid gap-4">
            {filtered.map(appt => (
              <div key={appt.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 hover:shadow-card-hover transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-7 w-7 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-gray-900 dark:text-white">{appt.doctor_name}</h4>
                      <StatusBadge status={appt.status} />
                      <Badge>{appt.type?.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{appt.specialization} · {appt.department_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{appt.symptoms}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{appt.appointment_date}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appt.appointment_time?.slice(0, 5)}</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">${appt.payment_amount}</p>
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <button onClick={() => cancelAppointment(appt.id)} className="mt-2 text-xs text-red-500 hover:underline">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={bookModal} onClose={() => setBookModal(false)} title="Book New Appointment" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Doctor *</label>
            <select value={bookForm.doctor_id} onChange={e => setBookForm(p => ({ ...p, doctor_id: e.target.value, appointment_time: '' }))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Choose a doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>)}
              {!doctors.length && [
                { id: 1, name: 'Dr. Sarah Johnson - Cardiologist' },
                { id: 2, name: 'Dr. Michael Chen - Neurologist' },
                { id: 3, name: 'Dr. Emily Rodriguez - Orthopedic Surgeon' },
              ].map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Appointment Type</label>
            <select value={bookForm.type} onChange={e => setBookForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow Up</option>
              <option value="checkup">Routine Checkup</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <FormInput label="Preferred Date *" type="date" value={bookForm.appointment_date} onChange={e => setBookForm(p => ({ ...p, appointment_date: e.target.value, appointment_time: '' }))} />
          {bookForm.doctor_id && bookForm.appointment_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Time Slot *</label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {(slots.length ? slots : ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00']).map(slot => (
                    <button key={slot} onClick={() => setBookForm(p => ({ ...p, appointment_time: slot }))}
                      className={`py-2 text-xs font-medium rounded-xl border-2 transition-all ${bookForm.appointment_time === slot ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'}`}>
                      {slot.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Symptoms / Reason</label>
            <textarea value={bookForm.symptoms} onChange={e => setBookForm(p => ({ ...p, symptoms: e.target.value }))} rows={3} placeholder="Describe your symptoms or reason for the visit..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setBookModal(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleBook} loading={bookingLoading} className="flex-1">Book Appointment</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ─── PATIENT PRESCRIPTIONS ────────────────────────────────────
export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState(demoPrescriptions);
  const [viewRx, setViewRx] = useState(null);

  useEffect(() => {
    prescriptionsAPI.getAll()
      .then(res => { if (res.data.prescriptions?.length) setPrescriptions(res.data.prescriptions); })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout title="My Prescriptions">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Prescriptions</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{prescriptions.length} prescriptions on record</p>
        </div>

        {prescriptions.length === 0 ? (
          <EmptyState icon={FileText} title="No prescriptions" description="Your prescriptions from doctors will appear here." />
        ) : (
          <div className="grid gap-5">
            {prescriptions.map(rx => {
              let meds = [];
              try { meds = JSON.parse(rx.medications || '[]'); } catch {}
              return (
                <div key={rx.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{rx.doctor_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rx.specialization} · {rx.created_at?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rx.is_active ? 'success' : 'default'}>{rx.is_active ? 'Active' : 'Inactive'}</Badge>
                      <button onClick={() => setViewRx(rx)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Diagnosis: <span className="font-normal text-gray-600 dark:text-gray-400">{rx.diagnosis}</span></p>
                    <div className="grid gap-2">
                      {meds.map((med, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                          <Pill className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{med.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {med.dosage}</span>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p>{med.frequency}</p>
                            <p>{med.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rx.follow_up_date && (
                      <p className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        📅 Follow-up: {rx.follow_up_date}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={!!viewRx} onClose={() => setViewRx(null)} title="Prescription Details" size="md">
        {viewRx && (() => {
          let meds = [];
          try { meds = JSON.parse(viewRx.medications || '[]'); } catch {}
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Diagnosis</p>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{viewRx.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Medications</p>
                <div className="space-y-2">
                  {meds.map((med, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-400 text-xs">Name</span><p className="font-semibold text-gray-900 dark:text-white">{med.name}</p></div>
                      <div><span className="text-gray-400 text-xs">Dosage</span><p className="font-medium text-gray-700 dark:text-gray-300">{med.dosage}</p></div>
                      <div><span className="text-gray-400 text-xs">Frequency</span><p className="font-medium text-gray-700 dark:text-gray-300">{med.frequency}</p></div>
                      <div><span className="text-gray-400 text-xs">Duration</span><p className="font-medium text-gray-700 dark:text-gray-300">{med.duration}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              {viewRx.instructions && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Instructions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{viewRx.instructions}</p>
                </div>
              )}
              {viewRx.follow_up_date && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-semibold">Follow-up Date</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{viewRx.follow_up_date}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </DashboardLayout>
  );
}

// ─── PATIENT PAYMENTS ─────────────────────────────────────────
export function PatientPayments() {
  const [payments, setPayments] = useState(demoPayments);

  useEffect(() => {
    paymentsAPI.getAll().then(res => { if (res.data.payments?.length) setPayments(res.data.payments); }).catch(() => {});
  }, []);

  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout title="Payment History">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Payment History</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{payments.length} transactions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Paid', value: `$${total}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Pending', value: `$${pending}`, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Transactions', value: payments.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-700`}>
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Invoice', 'Doctor', 'Date', 'Amount', 'Method', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-blue-600 dark:text-blue-400 text-sm">{pay.invoice_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{pay.doctor_name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{pay.appointment_date}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">${pay.amount}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{pay.payment_method}</td>
                    <td className="px-5 py-4">
                      <Badge variant={pay.status === 'completed' ? 'success' : pay.status === 'refunded' ? 'danger' : 'warning'}>{pay.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── PATIENT PROFILE ──────────────────────────────────────────
export function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', date_of_birth: '', gender: '', blood_group: '', address: '', city: '', emergency_contact_name: '', emergency_contact_phone: '', allergies: '', chronic_conditions: '', insurance_provider: '', insurance_id: '' });
  const [saving, setSaving] = useState(false);

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
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your personal and medical information</p>
        </div>

        {/* Avatar section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-5">
            <Avatar name={`${user?.first_name} ${user?.last_name}`} size="xl" />
            <div>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <Badge variant="success" className="mt-2">Patient</Badge>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><User className="h-5 w-5 text-blue-500" />Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="First Name" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
            <FormInput label="Last Name" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
            <FormInput label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000" />
            <FormInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group</label>
              <select value={form.blood_group} onChange={e => setForm(p => ({ ...p, blood_group: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <FormInput label="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="New York" />
            <FormInput label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St" />
          </div>
        </div>

        {/* Medical info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" />Medical Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Known Allergies</label>
              <textarea value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} rows={2} placeholder="e.g. Penicillin, Shellfish..."
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Chronic Conditions</label>
              <textarea value={form.chronic_conditions} onChange={e => setForm(p => ({ ...p, chronic_conditions: e.target.value }))} rows={2} placeholder="e.g. Hypertension, Diabetes..."
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <FormInput label="Insurance Provider" value={form.insurance_provider} onChange={e => setForm(p => ({ ...p, insurance_provider: e.target.value }))} placeholder="Blue Cross Blue Shield" />
            <FormInput label="Insurance ID" value={form.insurance_id} onChange={e => setForm(p => ({ ...p, insurance_id: e.target.value }))} placeholder="INS-00000" />
          </div>
        </div>

        {/* Emergency contact */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Phone className="h-5 w-5 text-red-500" />Emergency Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Contact Name" value={form.emergency_contact_name} onChange={e => setForm(p => ({ ...p, emergency_contact_name: e.target.value }))} placeholder="Jane Doe" />
            <FormInput label="Contact Phone" value={form.emergency_contact_phone} onChange={e => setForm(p => ({ ...p, emergency_contact_phone: e.target.value }))} placeholder="+1-555-0000" />
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="h-5 w-5" /> Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
}
