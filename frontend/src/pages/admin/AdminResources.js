import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar, Badge, SearchInput, EmptyState, Button, Modal, FormInput, StatusBadge } from '../../components/common/UI';
import { patientsAPI, departmentsAPI, paymentsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Eye, Trash2, Edit2, Building2, CreditCard, CheckCircle } from 'lucide-react';

// ─── DEMO DATA ───────────────────────────────────────────────
const demoPatients = [
  { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', phone: '+1-555-0201', date_of_birth: '1985-03-15', gender: 'Male', blood_group: 'O+', city: 'New York', chronic_conditions: 'Hypertension', total_appointments: 5, last_visit: '2024-06-10' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', phone: '+1-555-0202', date_of_birth: '1990-07-22', gender: 'Female', blood_group: 'A+', city: 'Los Angeles', chronic_conditions: 'None', total_appointments: 3, last_visit: '2024-06-11' },
  { id: 3, first_name: 'Bob', last_name: 'Martin', email: 'bob.martin@email.com', phone: '+1-555-0203', date_of_birth: '1978-11-08', gender: 'Male', blood_group: 'B-', city: 'Chicago', chronic_conditions: 'Diabetes Type 2', total_appointments: 8, last_visit: '2024-06-05' },
  { id: 4, first_name: 'Alice', last_name: 'Brown', email: 'alice.brown@email.com', phone: '+1-555-0204', date_of_birth: '2000-02-14', gender: 'Female', blood_group: 'AB+', city: 'Houston', chronic_conditions: 'None', total_appointments: 2, last_visit: '2024-06-14' },
  { id: 5, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@email.com', phone: '+1-555-0205', date_of_birth: '1965-09-30', gender: 'Male', blood_group: 'O-', city: 'Phoenix', chronic_conditions: 'Arthritis, Hypertension', total_appointments: 12, last_visit: '2024-06-01' },
];

const demoDepartments = [
  { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular system specialists', icon: 'Heart', room_count: 12, doctor_count: 5, appointment_count: 842 },
  { id: 2, name: 'Neurology', description: 'Brain and nervous system specialists', icon: 'Brain', room_count: 10, doctor_count: 4, appointment_count: 634 },
  { id: 3, name: 'Orthopedics', description: 'Bone, joint, and muscle specialists', icon: 'Bone', room_count: 15, doctor_count: 6, appointment_count: 521 },
  { id: 4, name: 'Pediatrics', description: 'Medical care for children and adolescents', icon: 'Baby', room_count: 18, doctor_count: 7, appointment_count: 890 },
  { id: 5, name: 'Dentistry', description: 'Oral health and dental care specialists', icon: 'Smile', room_count: 8, doctor_count: 3, appointment_count: 412 },
  { id: 6, name: 'Emergency', description: '24/7 emergency medical services', icon: 'AlertCircle', room_count: 20, doctor_count: 10, appointment_count: 557 },
  { id: 7, name: 'Radiology', description: 'Medical imaging and diagnostic services', icon: 'Scan', room_count: 6, doctor_count: 3, appointment_count: 298 },
];

const demoPayments = [
  { id: 1, patient_name: 'John Doe', doctor_name: 'Dr. Sarah Johnson', appointment_date: '2024-06-16', amount: 250, payment_method: 'card', status: 'pending', invoice_number: 'INV-2024-001', created_at: '2024-06-15' },
  { id: 2, patient_name: 'Jane Smith', doctor_name: 'Dr. Michael Chen', appointment_date: '2024-06-11', amount: 220, payment_method: 'insurance', status: 'completed', invoice_number: 'INV-2024-002', created_at: '2024-06-11' },
  { id: 3, patient_name: 'Bob Martin', doctor_name: 'Dr. Emily Rodriguez', appointment_date: '2024-06-05', amount: 200, payment_method: 'cash', status: 'completed', invoice_number: 'INV-2024-003', created_at: '2024-06-05' },
  { id: 4, patient_name: 'Alice Brown', doctor_name: 'Dr. James Wilson', appointment_date: '2024-06-14', amount: 150, payment_method: 'online', status: 'completed', invoice_number: 'INV-2024-004', created_at: '2024-06-14' },
  { id: 5, patient_name: 'Charlie Davis', doctor_name: 'Dr. Aisha Patel', appointment_date: '2024-06-01', amount: 280, payment_method: 'card', status: 'refunded', invoice_number: 'INV-2024-005', created_at: '2024-06-01' },
  { id: 6, patient_name: 'Diana Prince', doctor_name: 'Dr. Robert Kim', appointment_date: '2024-06-17', amount: 190, payment_method: 'card', status: 'pending', invoice_number: 'INV-2024-006', created_at: '2024-06-16' },
];

// ─── ADMIN PATIENTS ───────────────────────────────────────────
export function AdminPatients() {
  const [patients, setPatients] = useState(demoPatients);
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState(null);

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase());
  });

  const bloodGroupColor = (bg) => {
    const map = { 'O+': 'success', 'O-': 'danger', 'A+': 'info', 'A-': 'info', 'B+': 'purple', 'B-': 'purple', 'AB+': 'warning', 'AB-': 'warning' };
    return map[bg] || 'default';
  };

  return (
    <DashboardLayout title="Manage Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Patients</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{patients.length} registered patients</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients', value: patients.length, color: 'text-blue-600' },
            { label: 'Male', value: patients.filter(p => p.gender === 'Male').length, color: 'text-teal-600' },
            { label: 'Female', value: patients.filter(p => p.gender === 'Female').length, color: 'text-pink-600' },
            { label: 'With Conditions', value: patients.filter(p => p.chronic_conditions && p.chronic_conditions !== 'None').length, color: 'text-orange-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder="Search patients by name, email, city..." />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Patient', 'Contact', 'Blood Group', 'Gender / Age', 'City', 'Visits', 'Last Visit', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(p => {
                  const age = p.date_of_birth ? Math.floor((new Date() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${p.first_name} ${p.last_name}`} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{p.first_name} {p.last_name}</p>
                            {p.chronic_conditions && p.chronic_conditions !== 'None' && (
                              <p className="text-xs text-orange-500 truncate max-w-[120px]">{p.chronic_conditions}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <p className="truncate max-w-[140px]">{p.email}</p>
                        <p className="text-xs">{p.phone}</p>
                      </td>
                      <td className="px-4 py-4"><Badge variant={bloodGroupColor(p.blood_group)}>{p.blood_group || 'N/A'}</Badge></td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{p.gender} {age ? `/ ${age}y` : ''}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{p.city || '—'}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white text-center">{p.total_appointments}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{p.last_visit || '—'}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => setViewPatient(p)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-16 text-center text-gray-400">No patients found.</div>}
          </div>
        </div>
      </div>

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="md">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Avatar name={`${viewPatient.first_name} ${viewPatient.last_name}`} size="lg" />
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{viewPatient.first_name} {viewPatient.last_name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{viewPatient.email}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{viewPatient.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Date of Birth', value: viewPatient.date_of_birth },
                { label: 'Gender', value: viewPatient.gender },
                { label: 'Blood Group', value: viewPatient.blood_group },
                { label: 'City', value: viewPatient.city },
                { label: 'Total Visits', value: viewPatient.total_appointments },
                { label: 'Last Visit', value: viewPatient.last_visit || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
            {viewPatient.chronic_conditions && viewPatient.chronic_conditions !== 'None' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-4">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">Chronic Conditions</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewPatient.chronic_conditions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

// ─── ADMIN DEPARTMENTS ────────────────────────────────────────
export function AdminDepartments() {
  const [departments, setDepartments] = useState(demoDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', room_count: '' });
  const [loading, setLoading] = useState(false);

  const openAdd = () => { setEditDept(null); setForm({ name: '', description: '', room_count: '' }); setModalOpen(true); };
  const openEdit = (d) => { setEditDept(d); setForm({ name: d.name, description: d.description, room_count: d.room_count }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Department name is required');
    setLoading(true);
    try {
      if (editDept) {
        await departmentsAPI.update(editDept.id, form);
        setDepartments(prev => prev.map(d => d.id === editDept.id ? { ...d, ...form } : d));
        toast.success('Department updated');
      } else {
        await departmentsAPI.create(form);
        setDepartments(prev => [...prev, { id: Date.now(), ...form, doctor_count: 0, appointment_count: 0 }]);
        toast.success('Department added');
      }
      setModalOpen(false);
    } catch {
      if (editDept) {
        setDepartments(prev => prev.map(d => d.id === editDept.id ? { ...d, ...form } : d));
      } else {
        setDepartments(prev => [...prev, { id: Date.now(), ...form, doctor_count: 0, appointment_count: 0 }]);
      }
      setModalOpen(false);
      toast.success(editDept ? 'Department updated (demo)' : 'Department added (demo)');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await departmentsAPI.delete(deleteModal.id); } catch {}
    setDepartments(prev => prev.filter(d => d.id !== deleteModal.id));
    toast.success('Department deleted');
    setDeleteModal(null);
  };

  const iconEmojis = { Heart: '❤️', Brain: '🧠', Bone: '🦴', Baby: '👶', Smile: '😁', AlertCircle: '🚨', Scan: '🔬' };

  return (
    <DashboardLayout title="Departments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Departments</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{departments.length} active departments</p>
          </div>
          <Button onClick={openAdd}><Plus className="h-4 w-4" />Add Department</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6 hover:shadow-card-hover transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{iconEmojis[dept.icon] || '🏥'}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteModal(dept)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-1">{dept.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed">{dept.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Doctors', value: dept.doctor_count },
                  { label: 'Rooms', value: dept.room_count },
                  { label: 'Appts', value: dept.appointment_count },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg py-2">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
                    <p className="text-gray-400 text-[10px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <FormInput label="Department Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cardiology" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief description of the department..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <FormInput label="Number of Rooms" type="number" value={form.room_count} onChange={e => setForm(p => ({ ...p, room_count: e.target.value }))} placeholder="e.g. 12" />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={loading} className="flex-1">{editDept ? 'Update' : 'Add Department'}</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Department" size="sm">
        <div className="text-center">
          <div className="h-14 w-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

// ─── ADMIN PAYMENTS ───────────────────────────────────────────
export function AdminPayments() {
  const [payments, setPayments] = useState(demoPayments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.patient_name.toLowerCase().includes(search.toLowerCase()) || p.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const markPaid = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
    toast.success('Payment marked as completed');
  };

  const paymentBadge = (status) => {
    const map = { completed: 'success', pending: 'warning', refunded: 'danger', failed: 'danger' };
    return map[status] || 'default';
  };

  const methodIcon = { card: '💳', cash: '💵', insurance: '🏥', online: '🌐' };

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Payment Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{payments.length} total transactions</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
            { label: 'Pending', value: `$${pendingAmount.toLocaleString()}`, color: 'text-yellow-600' },
            { label: 'Transactions', value: payments.length, color: 'text-blue-600' },
            { label: 'Refunds', value: payments.filter(p => p.status === 'refunded').length, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
              <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search by patient or invoice..." /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Invoice', 'Patient', 'Doctor', 'Date', 'Amount', 'Method', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(pay => (
                  <tr key={pay.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{pay.invoice_number}</td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white text-sm">{pay.patient_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{pay.doctor_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{pay.appointment_date}</td>
                    <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">${pay.amount}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {methodIcon[pay.payment_method]} {pay.payment_method}
                    </td>
                    <td className="px-4 py-4"><Badge variant={paymentBadge(pay.status)}>{pay.status}</Badge></td>
                    <td className="px-4 py-4">
                      {pay.status === 'pending' && (
                        <button onClick={() => markPaid(pay.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-16 text-center text-gray-400">No payments found.</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminPatients;
