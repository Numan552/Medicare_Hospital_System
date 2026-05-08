import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar, Badge, Modal, Button, SearchInput, EmptyState, FormInput } from '../../components/common/UI';
import { doctorsAPI, departmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Star, Stethoscope, Phone, Mail, Building2, Eye } from 'lucide-react';

const demoDoctors = [
  { id: 1, first_name: 'Sarah', last_name: 'Johnson', email: 'dr.sarah.johnson@medicare.com', phone: '+1-555-0101', specialization: 'Interventional Cardiologist', qualification: 'MD, FACC', experience_years: 15, consultation_fee: 250, rating: 4.9, total_reviews: 247, is_available: true, department_name: 'Cardiology', available_days: '["Monday","Tuesday","Wednesday","Thursday","Friday"]' },
  { id: 2, first_name: 'Michael', last_name: 'Chen', email: 'dr.michael.chen@medicare.com', phone: '+1-555-0102', specialization: 'Neurologist', qualification: 'MD, PhD, FAAN', experience_years: 12, consultation_fee: 220, rating: 4.8, total_reviews: 189, is_available: true, department_name: 'Neurology', available_days: '["Monday","Wednesday","Friday"]' },
  { id: 3, first_name: 'Emily', last_name: 'Rodriguez', email: 'dr.emily.rodriguez@medicare.com', phone: '+1-555-0103', specialization: 'Orthopedic Surgeon', qualification: 'MD, FAAOS', experience_years: 10, consultation_fee: 200, rating: 4.7, total_reviews: 156, is_available: false, department_name: 'Orthopedics', available_days: '["Tuesday","Thursday","Saturday"]' },
  { id: 4, first_name: 'James', last_name: 'Wilson', email: 'dr.james.wilson@medicare.com', phone: '+1-555-0104', specialization: 'Pediatric Specialist', qualification: 'MD, FAAP', experience_years: 8, consultation_fee: 150, rating: 4.9, total_reviews: 312, is_available: true, department_name: 'Pediatrics', available_days: '["Monday","Tuesday","Wednesday","Thursday","Friday"]' },
  { id: 5, first_name: 'Aisha', last_name: 'Patel', email: 'dr.aisha.patel@medicare.com', phone: '+1-555-0105', specialization: 'Electrophysiologist', qualification: 'MD, FHRS', experience_years: 18, consultation_fee: 280, rating: 4.8, total_reviews: 203, is_available: true, department_name: 'Cardiology', available_days: '["Monday","Wednesday","Friday"]' },
  { id: 6, first_name: 'Robert', last_name: 'Kim', email: 'dr.robert.kim@medicare.com', phone: '+1-555-0106', specialization: 'Pain Specialist', qualification: 'MD, DABPM', experience_years: 9, consultation_fee: 190, rating: 4.6, total_reviews: 134, is_available: true, department_name: 'Neurology', available_days: '["Tuesday","Thursday"]' },
];

const demoDepts = [
  { id: 1, name: 'Cardiology' }, { id: 2, name: 'Neurology' }, { id: 3, name: 'Orthopedics' },
  { id: 4, name: 'Pediatrics' }, { id: 5, name: 'Dentistry' }, { id: 6, name: 'Emergency' },
];

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', specialization: '', qualification: '', experience_years: '', consultation_fee: '', department_id: '', bio: '', license_number: '', available_time_start: '09:00', available_time_end: '17:00' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState(demoDoctors);
  const [departments, setDepartments] = useState(demoDepts);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const [docsRes, deptsRes] = await Promise.all([doctorsAPI.getAll(), departmentsAPI.getAll()]);
        if (docsRes.data.doctors?.length) setDoctors(docsRes.data.doctors);
        if (deptsRes.data.departments?.length) setDepartments(deptsRes.data.departments);
      } catch { /* use demo data */ }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(d => {
    const name = `${d.first_name} ${d.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || d.department_name === filterDept;
    return matchSearch && matchDept;
  });

  const openAdd = () => { setEditDoc(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (doc) => {
    setEditDoc(doc);
    setForm({ first_name: doc.first_name, last_name: doc.last_name, email: doc.email, phone: doc.phone || '', specialization: doc.specialization || '', qualification: doc.qualification || '', experience_years: doc.experience_years || '', consultation_fee: doc.consultation_fee || '', department_id: departments.find(d => d.name === doc.department_name)?.id || '', bio: doc.bio || '', license_number: doc.license_number || '', available_time_start: doc.available_time_start || '09:00', available_time_end: doc.available_time_end || '17:00' });
    setModalOpen(true);
  };
  const openView = (doc) => { setSelectedDoc(doc); setViewModalOpen(true); };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.specialization) return toast.error('Please fill required fields');
    setLoading(true);
    try {
      if (editDoc) {
        await doctorsAPI.update(editDoc.id, form);
        setDoctors(prev => prev.map(d => d.id === editDoc.id ? { ...d, ...form, department_name: departments.find(dep => dep.id == form.department_id)?.name || d.department_name } : d));
        toast.success('Doctor updated successfully');
      } else {
        await doctorsAPI.create(form);
        setDoctors(prev => [...prev, { id: Date.now(), ...form, rating: 0, total_reviews: 0, is_available: true, department_name: departments.find(d => d.id == form.department_id)?.name || '' }]);
        toast.success('Doctor added successfully');
      }
      setModalOpen(false);
    } catch (err) {
      // Demo mode
      if (editDoc) {
        setDoctors(prev => prev.map(d => d.id === editDoc.id ? { ...d, ...form, department_name: departments.find(dep => dep.id == form.department_id)?.name || d.department_name } : d));
        toast.success('Doctor updated (demo mode)');
      } else {
        setDoctors(prev => [...prev, { id: Date.now(), ...form, rating: 0, total_reviews: 0, is_available: true, department_name: departments.find(d => d.id == form.department_id)?.name || '' }]);
        toast.success('Doctor added (demo mode)');
      }
      setModalOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await doctorsAPI.delete(deleteModal.id);
    } catch { /* demo */ }
    setDoctors(prev => prev.filter(d => d.id !== deleteModal.id));
    toast.success('Doctor removed successfully');
    setDeleteModal(null);
  };

  const toggleAvailability = (id) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, is_available: !d.is_available } : d));
  };

  const uniqueDepts = [...new Set(doctors.map(d => d.department_name).filter(Boolean))];

  return (
    <DashboardLayout title="Manage Doctors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Doctors</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{doctors.length} registered doctors</p>
          </div>
          <Button onClick={openAdd} className="flex-shrink-0">
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search doctors..." /></div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Departments</option>
            {uniqueDepts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Doctors', value: doctors.length, color: 'text-blue-600' },
            { label: 'Available Now', value: doctors.filter(d => d.is_available).length, color: 'text-green-600' },
            { label: 'Avg. Rating', value: (doctors.reduce((s, d) => s + parseFloat(d.rating || 0), 0) / doctors.length).toFixed(1), color: 'text-yellow-600' },
            { label: 'Departments', value: uniqueDepts.length, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card border border-gray-100 dark:border-gray-700 text-center">
              <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Doctors Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} title="No doctors found" description="Try adjusting your search or add a new doctor." action={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Doctor</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar name={`${doc.first_name} ${doc.last_name}`} size="lg" />
                      <div>
                        <h3 className="font-display font-bold text-gray-900 dark:text-white">Dr. {doc.first_name} {doc.last_name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{doc.specialization}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAvailability(doc.id)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${doc.is_available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${doc.is_available ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{doc.department_name || 'N/A'}</Badge>
                    <Badge variant={doc.is_available ? 'success' : 'default'}>{doc.is_available ? 'Available' : 'Unavailable'}</Badge>
                    {doc.experience_years && <Badge variant="purple">{doc.experience_years}y exp</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span>{doc.rating} ({doc.total_reviews})</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">${doc.consultation_fee}</span>
                      <span>/ visit</span>
                    </div>
                  </div>

                  {doc.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{doc.email}</span>
                    </div>
                  )}
                  {doc.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{doc.phone}</span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => openView(doc)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button onClick={() => openEdit(doc)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors">
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => setDeleteModal(doc)} className="flex items-center justify-center p-2 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDoc ? 'Edit Doctor' : 'Add New Doctor'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="First Name *" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="Sarah" />
          <FormInput label="Last Name *" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Johnson" />
          <FormInput label="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="dr.name@medicare.com" className="col-span-2" />
          <FormInput label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
            <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <FormInput label="Specialization *" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Cardiologist" className="col-span-2" />
          <FormInput label="Qualification" value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="MD, FACC" />
          <FormInput label="License Number" value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} placeholder="MD-XXXX-001" />
          <FormInput label="Experience (Years)" type="number" value={form.experience_years} onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))} placeholder="10" />
          <FormInput label="Consultation Fee ($)" type="number" value={form.consultation_fee} onChange={e => setForm(p => ({ ...p, consultation_fee: e.target.value }))} placeholder="250" />
          <FormInput label="Available From" type="time" value={form.available_time_start} onChange={e => setForm(p => ({ ...p, available_time_start: e.target.value }))} />
          <FormInput label="Available Until" type="time" value={form.available_time_end} onChange={e => setForm(p => ({ ...p, available_time_end: e.target.value }))} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Brief professional biography..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={loading} className="flex-1">{editDoc ? 'Update Doctor' : 'Add Doctor'}</Button>
        </div>
      </Modal>

      {/* View Modal */}
      {selectedDoc && (
        <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Doctor Details" size="md">
          <div className="text-center mb-6">
            <Avatar name={`${selectedDoc.first_name} ${selectedDoc.last_name}`} size="xl" className="mx-auto mb-3" />
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Dr. {selectedDoc.first_name} {selectedDoc.last_name}</h3>
            <p className="text-blue-600 dark:text-blue-400">{selectedDoc.specialization}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Department', value: selectedDoc.department_name },
              { label: 'Experience', value: `${selectedDoc.experience_years} years` },
              { label: 'Qualification', value: selectedDoc.qualification },
              { label: 'Consultation Fee', value: `$${selectedDoc.consultation_fee}` },
              { label: 'Rating', value: `⭐ ${selectedDoc.rating} (${selectedDoc.total_reviews} reviews)` },
              { label: 'Status', value: selectedDoc.is_available ? '✅ Available' : '❌ Unavailable' },
              { label: 'Email', value: selectedDoc.email },
              { label: 'Phone', value: selectedDoc.phone },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">{label}</p>
                <p className="text-gray-900 dark:text-white font-medium">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
          {selectedDoc.bio && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">Bio</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{selectedDoc.bio}</p>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Doctor" size="sm">
        <div className="text-center">
          <div className="h-14 w-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to remove <strong>Dr. {deleteModal?.first_name} {deleteModal?.last_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">Remove Doctor</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
