// AdminAppointments.js
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatusBadge, Badge, SearchInput, EmptyState, Button, Modal } from '../../components/common/UI';
import { appointmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

const demoAppointments = [
  { id: 1, patient_name: 'John Doe', doctor_name: 'Dr. Sarah Johnson', department_name: 'Cardiology', appointment_date: '2024-06-16', appointment_time: '10:00:00', status: 'confirmed', type: 'consultation', symptoms: 'Chest pain, shortness of breath', payment_amount: 250, payment_status: 'pending' },
  { id: 2, patient_name: 'Jane Smith', doctor_name: 'Dr. Michael Chen', department_name: 'Neurology', appointment_date: '2024-06-16', appointment_time: '14:00:00', status: 'pending', type: 'consultation', symptoms: 'Recurring headaches', payment_amount: 220, payment_status: 'pending' },
  { id: 3, patient_name: 'Bob Martin', doctor_name: 'Dr. Emily Rodriguez', department_name: 'Orthopedics', appointment_date: '2024-06-15', appointment_time: '09:00:00', status: 'completed', type: 'follow_up', symptoms: 'Knee pain', payment_amount: 200, payment_status: 'completed' },
  { id: 4, patient_name: 'Alice Brown', doctor_name: 'Dr. James Wilson', department_name: 'Pediatrics', appointment_date: '2024-06-15', appointment_time: '11:00:00', status: 'completed', type: 'checkup', symptoms: 'Annual checkup', payment_amount: 150, payment_status: 'completed' },
  { id: 5, patient_name: 'Charlie Davis', doctor_name: 'Dr. Aisha Patel', department_name: 'Cardiology', appointment_date: '2024-06-14', appointment_time: '16:00:00', status: 'cancelled', type: 'consultation', symptoms: 'Palpitations', payment_amount: 280, payment_status: 'refunded' },
  { id: 6, patient_name: 'Diana Prince', doctor_name: 'Dr. Robert Kim', department_name: 'Neurology', appointment_date: '2024-06-17', appointment_time: '10:30:00', status: 'pending', type: 'consultation', symptoms: 'Back pain radiating to leg', payment_amount: 190, payment_status: 'pending' },
];

export function AdminAppointments() {
  const [appointments, setAppointments] = useState(demoAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewAppt, setViewAppt] = useState(null);

  const filtered = appointments.filter(a => {
    const matchSearch = !search || a.patient_name.toLowerCase().includes(search.toLowerCase()) || a.doctor_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    try { await appointmentsAPI.updateStatus(id, { status }); } catch {}
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Appointment ${status}`);
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Appointments</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{appointments.length} total appointments</p>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'All', status: '', count: appointments.length, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
            { label: 'Pending', status: 'pending', count: appointments.filter(a => a.status === 'pending').length, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
            { label: 'Confirmed', status: 'confirmed', count: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
            { label: 'Completed', status: 'completed', count: appointments.filter(a => a.status === 'completed').length, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
            { label: 'Cancelled', status: 'cancelled', count: appointments.filter(a => a.status === 'cancelled').length, color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
          ].map(({ label, status, count, color }) => (
            <button key={label} onClick={() => setStatusFilter(status)}
              className={`p-3 rounded-xl text-center transition-all border-2 ${statusFilter === status ? 'border-blue-500' : 'border-transparent'} ${color}`}>
              <p className="font-bold text-xl">{count}</p>
              <p className="text-xs font-medium">{label}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search patient or doctor..." /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Patient', 'Doctor', 'Department', 'Date & Time', 'Type', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white text-sm whitespace-nowrap">{apt.patient_name}</td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">{apt.doctor_name}</td>
                    <td className="px-4 py-4"><Badge variant="info">{apt.department_name}</Badge></td>
                    <td className="px-4 py-4 text-sm">
                      <p className="text-gray-900 dark:text-white font-medium">{apt.appointment_date}</p>
                      <p className="text-gray-400 text-xs">{apt.appointment_time?.slice(0, 5)}</p>
                    </td>
                    <td className="px-4 py-4"><Badge>{apt.type?.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-4"><StatusBadge status={apt.status} /></td>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">${apt.payment_amount}</p>
                      <Badge variant={apt.payment_status === 'completed' ? 'success' : apt.payment_status === 'refunded' ? 'danger' : 'warning'}>{apt.payment_status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewAppt(apt)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                        {apt.status === 'pending' && <>
                          <button onClick={() => updateStatus(apt.id, 'confirmed')} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Confirm"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => updateStatus(apt.id, 'cancelled')} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Cancel"><XCircle className="h-4 w-4" /></button>
                        </>}
                        {apt.status === 'confirmed' && (
                          <button onClick={() => updateStatus(apt.id, 'completed')} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Mark Complete"><CheckCircle className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">No appointments found.</div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!viewAppt} onClose={() => setViewAppt(null)} title="Appointment Details" size="md">
        {viewAppt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Patient', value: viewAppt.patient_name },
                { label: 'Doctor', value: viewAppt.doctor_name },
                { label: 'Department', value: viewAppt.department_name },
                { label: 'Date', value: viewAppt.appointment_date },
                { label: 'Time', value: viewAppt.appointment_time?.slice(0, 5) },
                { label: 'Type', value: viewAppt.type?.replace('_', ' ') },
                { label: 'Status', value: <StatusBadge status={viewAppt.status} /> },
                { label: 'Payment', value: `$${viewAppt.payment_amount}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                </div>
              ))}
            </div>
            {viewAppt.symptoms && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Symptoms / Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewAppt.symptoms}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default AdminAppointments;
