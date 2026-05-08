// All public pages bundled

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { doctorsAPI, departmentsAPI } from '../services/api';
import { SearchInput, FormInput, Button, Avatar, Badge } from '../components/common/UI';
import { Star, Filter, Heart, Brain, Bone, Baby, Smile, AlertCircle, Scan, Activity,
  MapPin, Phone, Mail, Clock, Shield, Award, Users, CheckCircle, ArrowRight,
  MessageSquare, HelpCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── DOCTOR CARD ──────────────────────────────────────────────
function DoctorPublicCard({ doctor }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 px-6 pt-6 pb-4">
        <div className="flex items-start gap-4">
          <Avatar name={`${doctor.first_name} ${doctor.last_name}`} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Dr. {doctor.first_name} {doctor.last_name}</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{doctor.specialization}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{doctor.department_name}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${doctor.is_available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
            {doctor.is_available ? '● Available' : '○ Busy'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{doctor.rating || 4.8} ({doctor.total_reviews || 0})</span>
          <span>{doctor.experience_years || 0}+ years exp.</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">${doctor.consultation_fee}</span>
        </div>
        {doctor.qualification && <p className="text-xs text-gray-400 mb-4">{doctor.qualification}</p>}
        <div className="flex gap-2">
          <button onClick={() => navigate(`/doctors/${doctor.id}`)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors">View Profile</button>
          <Link to="/appointment" className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-center">Book Now</Link>
        </div>
      </div>
    </div>
  );
}

// ─── DOCTORS PAGE ─────────────────────────────────────────────
const demoDoctorsList = [
  { id: 1, first_name: 'Sarah', last_name: 'Johnson', specialization: 'Interventional Cardiologist', qualification: 'MD, FACC, FSCAI', experience_years: 15, consultation_fee: 250, rating: 4.9, total_reviews: 247, is_available: true, department_name: 'Cardiology' },
  { id: 2, first_name: 'Michael', last_name: 'Chen', specialization: 'Neurologist & Stroke Specialist', qualification: 'MD, PhD, FAAN', experience_years: 12, consultation_fee: 220, rating: 4.8, total_reviews: 189, is_available: true, department_name: 'Neurology' },
  { id: 3, first_name: 'Emily', last_name: 'Rodriguez', specialization: 'Orthopedic Surgeon', qualification: 'MD, FAAOS', experience_years: 10, consultation_fee: 200, rating: 4.7, total_reviews: 156, is_available: false, department_name: 'Orthopedics' },
  { id: 4, first_name: 'James', last_name: 'Wilson', specialization: 'Pediatric Specialist', qualification: 'MD, FAAP', experience_years: 8, consultation_fee: 150, rating: 4.9, total_reviews: 312, is_available: true, department_name: 'Pediatrics' },
  { id: 5, first_name: 'Aisha', last_name: 'Patel', specialization: 'Cardiologist & Electrophysiologist', qualification: 'MD, FHRS', experience_years: 18, consultation_fee: 280, rating: 4.8, total_reviews: 203, is_available: true, department_name: 'Cardiology' },
  { id: 6, first_name: 'Robert', last_name: 'Kim', specialization: 'Neurologist & Pain Specialist', qualification: 'MD, DABPM', experience_years: 9, consultation_fee: 190, rating: 4.6, total_reviews: 134, is_available: true, department_name: 'Neurology' },
  { id: 7, first_name: 'Linda', last_name: 'Foster', specialization: 'Pediatric Cardiologist', qualification: 'MD, FAAP', experience_years: 14, consultation_fee: 230, rating: 4.9, total_reviews: 178, is_available: true, department_name: 'Pediatrics' },
  { id: 8, first_name: 'David', last_name: 'Nguyen', specialization: 'Orthopedic Sports Medicine', qualification: 'MD, FAAOS', experience_years: 11, consultation_fee: 210, rating: 4.7, total_reviews: 143, is_available: false, department_name: 'Orthopedics' },
];

export function DoctorsPage() {
  const [doctors, setDoctors] = useState(demoDoctorsList);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    doctorsAPI.getAll().then(res => { if (res.data.doctors?.length) setDoctors(res.data.doctors); }).catch(() => {});
  }, []);

  const departments = [...new Set(doctors.map(d => d.department_name).filter(Boolean))];
  const filtered = doctors.filter(d => {
    const name = `${d.first_name} ${d.last_name} ${d.specialization}`.toLowerCase();
    return (!search || name.includes(search.toLowerCase())) && (!deptFilter || d.department_name === deptFilter) && (!availableOnly || d.is_available);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-3">Find Your Doctor</h1>
            <p className="text-gray-500 dark:text-gray-400">Choose from {doctors.length}+ expert specialists across all departments</p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-5 mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search doctors by name or specialty..." /></div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Available Now</span>
            </label>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{filtered.length} doctors found</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(doc => <DoctorPublicCard key={doc.id} doctor={doc} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No doctors found matching your criteria.</p>
              <button onClick={() => { setSearch(''); setDeptFilter(''); setAvailableOnly(false); }} className="mt-4 text-blue-600 hover:underline text-sm">Clear filters</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── DOCTOR DETAIL PAGE ───────────────────────────────────────
export function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const demoDoc = demoDoctorsList.find(d => d.id === parseInt(id)) || demoDoctorsList[0];
  const [doctor, setDoctor] = useState(demoDoc);

  useEffect(() => {
    doctorsAPI.getById(id).then(res => { if (res.data.doctor) setDoctor(res.data.doctor); }).catch(() => {});
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 text-sm">
            ← Back to Doctors
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Doctor Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                <div className="text-center mb-5">
                  <Avatar name={`${doctor.first_name} ${doctor.last_name}`} size="xl" />
                  <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mt-4">Dr. {doctor.first_name} {doctor.last_name}</h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{doctor.specialization}</p>
                  <Badge variant="info" className="mt-2">{doctor.department_name}</Badge>
                </div>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="font-medium flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{doctor.rating} ({doctor.total_reviews})</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{doctor.experience_years}+ years</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Consultation</span><span className="font-bold text-blue-600">${doctor.consultation_fee}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-medium ${doctor.is_available ? 'text-green-600' : 'text-gray-400'}`}>{doctor.is_available ? '● Available' : '○ Unavailable'}</span></div>
                </div>
                <Link to="/appointment" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  <Calendar className="h-4 w-4" /> Book Appointment
                </Link>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="lg:col-span-2 space-y-5">
              {doctor.bio && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white mb-3">About</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Professional Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Qualification', value: doctor.qualification },
                    { label: 'Specialization', value: doctor.specialization },
                    { label: 'Department', value: doctor.department_name },
                    { label: 'Experience', value: `${doctor.experience_years}+ years` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Reviews placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Patient Reviews</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="font-display font-bold text-5xl text-gray-900 dark:text-white">{doctor.rating || 4.8}</p>
                    <div className="flex gap-0.5 my-1">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}</div>
                    <p className="text-sm text-gray-400">{doctor.total_reviews} reviews</p>
                  </div>
                </div>
                {[
                  { name: 'Robert A.', text: 'Excellent doctor, very thorough and explained everything clearly.', rating: 5 },
                  { name: 'Maria G.', text: 'Highly professional and caring. Would definitely recommend.', rating: 5 },
                ].map((r, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={r.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                        <div className="flex gap-0.5">{[...Array(r.rating)].map((_, j) => <Star key={j} className="h-3 w-3 text-yellow-400 fill-yellow-400" />)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── APPOINTMENT PAGE ─────────────────────────────────────────
export function AppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ department: '', doctor: '', date: '', time: '', name: '', email: '', phone: '', type: 'consultation', symptoms: '' });

  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dentistry', 'Emergency', 'Radiology'];
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

  const handleSubmit = async () => {
    toast.success('Appointment request submitted! We\'ll confirm shortly.');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-3">Book an Appointment</h1>
            <p className="text-gray-500 dark:text-gray-400">Schedule your visit in just a few easy steps</p>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>{s}</div>
                {i < 2 && <div className={`h-0.5 w-16 sm:w-24 mx-1 transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-16 sm:gap-32 -mt-5 mb-8 text-xs text-gray-400">
            {['Department & Doctor', 'Date & Time', 'Your Information'].map(l => <span key={l}>{l}</span>)}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-8">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Department</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {departments.map(d => (
                      <button key={d} onClick={() => setForm(p => ({ ...p, department: d }))}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${form.department === d ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appointment Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="consultation">Consultation</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="checkup">Routine Checkup</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <Button onClick={() => { if (!form.department) return toast.error('Please select a department'); setStep(2); }} className="w-full" size="lg">Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <FormInput label="Preferred Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                {form.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <button key={slot} onClick={() => setForm(p => ({ ...p, time: slot }))}
                          className={`py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${form.time === slot ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={() => { if (!form.date || !form.time) return toast.error('Please select date and time'); setStep(3); }} className="flex-1">Continue <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                  <FormInput label="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com" />
                  <FormInput label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Symptoms / Reason for Visit</label>
                  <textarea value={form.symptoms} onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))} rows={3} placeholder="Describe your symptoms..."
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>
                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Appointment Summary</p>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p>🏥 Department: <strong>{form.department}</strong></p>
                    <p>📅 Date: <strong>{form.date}</strong></p>
                    <p>⏰ Time: <strong>{form.time}</strong></p>
                    <p>🩺 Type: <strong className="capitalize">{form.type.replace('_', ' ')}</strong></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button onClick={() => { if (!form.name || !form.email) return toast.error('Please fill required fields'); handleSubmit(); }} className="flex-1">Confirm Booking</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display font-bold text-5xl text-white mb-6">About MediCare</h1>
            <p className="text-blue-100 text-xl leading-relaxed">
              For over 25 years, MediCare has been at the forefront of healthcare innovation, delivering world-class medical services with compassion, expertise, and cutting-edge technology.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">Our Mission</span>
                <h2 className="font-display font-bold text-4xl text-gray-900 dark:text-white mt-2 mb-6">Healing Lives, Building Trust</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Our mission is to provide exceptional healthcare services that improve the quality of life for every patient we serve. We combine cutting-edge medical technology with compassionate care to deliver personalized treatment plans.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Founded in 1999, MediCare started as a small clinic and has grown into a full-service hospital serving over 50,000 patients annually across 8 specialized departments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { v: '25+', l: 'Years of Excellence', c: 'bg-blue-50 dark:bg-blue-900/20' },
                  { v: '500+', l: 'Expert Doctors', c: 'bg-teal-50 dark:bg-teal-900/20' },
                  { v: '50K+', l: 'Patients Served', c: 'bg-green-50 dark:bg-green-900/20' },
                  { v: '98%', l: 'Satisfaction Rate', c: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map(({ v, l, c }) => (
                  <div key={l} className={`${c} rounded-2xl p-6 text-center`}>
                    <p className="font-display font-bold text-3xl text-gray-900 dark:text-white">{v}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-display font-bold text-4xl text-gray-900 dark:text-white mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Heart, title: 'Compassion', desc: 'We treat every patient with empathy and dignity, ensuring they feel heard and cared for.', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                { icon: Shield, title: 'Integrity', desc: 'We uphold the highest ethical standards in every aspect of patient care and hospital operations.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                { icon: Award, title: 'Excellence', desc: 'We continuously strive to improve our services and maintain the highest quality of healthcare.', color: 'text-gold-500 bg-yellow-50 dark:bg-yellow-900/20' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card border border-gray-100 dark:border-gray-700">
                  <div className={`h-14 w-14 ${color.split(' ').slice(1).join(' ')} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`h-7 w-7 ${color.split(' ')[0]}`} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

// ─── SERVICES PAGE ────────────────────────────────────────────
export function ServicesPage() {
  const services = [
    { icon: Heart, name: 'Cardiology', desc: 'Complete cardiac care including diagnostics, intervention, and rehabilitation.', features: ['ECG & Echo', 'Cardiac Surgery', 'Heart Failure Management', 'Preventive Cardiology'], color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Brain, name: 'Neurology', desc: 'Advanced neurological care for brain, spine, and nervous system disorders.', features: ['Stroke Treatment', 'Epilepsy Management', 'Memory Disorders', 'Pain Management'], color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Bone, name: 'Orthopedics', desc: 'Expert care for bones, joints, muscles, and sports injuries.', features: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery', 'Fracture Care'], color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Baby, name: 'Pediatrics', desc: 'Comprehensive healthcare for children from birth through adolescence.', features: ['Well-Child Visits', 'Immunizations', 'Developmental Care', 'Pediatric Surgery'], color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Smile, name: 'Dentistry', desc: 'Complete dental care from preventive treatments to complex procedures.', features: ['Dental Implants', 'Orthodontics', 'Root Canal', 'Cosmetic Dentistry'], color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: AlertCircle, name: 'Emergency', desc: '24/7 emergency medical services for life-threatening conditions.', features: ['Trauma Care', 'Critical Care', 'Emergency Surgery', 'Ambulance Services'], color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: Scan, name: 'Radiology', desc: 'Advanced medical imaging and diagnostic services.', features: ['MRI & CT Scan', 'X-Ray & Ultrasound', 'Nuclear Medicine', 'Interventional Radiology'], color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { icon: Activity, name: 'Cardio Care', desc: 'Intensive cardiac monitoring and specialized heart care.', features: ['24hr Monitoring', 'Stress Testing', 'Cardiac Rehab', 'Holter Monitoring'], color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-24">
        <section className="bg-gradient-to-br from-teal-600 to-blue-700 py-20 px-4 text-center">
          <h1 className="font-display font-bold text-5xl text-white mb-4">Our Services</h1>
          <p className="text-teal-100 text-xl max-w-2xl mx-auto">Comprehensive healthcare solutions across {services.length} specialized departments</p>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map(({ icon: Icon, name, desc, features, color, bg }) => (
                <div key={name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-6 hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1">
                  <div className={`h-14 w-14 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-7 w-7 ${color}`} />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-2">{name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [faqs, setFaqs] = useState([
    { q: 'How do I book an appointment online?', a: 'You can book an appointment by visiting our Appointment page, selecting your department and doctor, choosing your preferred date and time, and filling in your details.', open: false },
    { q: 'What insurance plans do you accept?', a: 'We accept most major insurance plans. Please contact our billing department for specific information about your insurance coverage.', open: false },
    { q: 'What are your emergency services hours?', a: 'Our Emergency Department is open 24 hours a day, 7 days a week, including holidays. For life-threatening emergencies, call 911 or our hotline.', open: false },
    { q: 'Can I access my medical records online?', a: 'Yes, registered patients can access their medical records, prescriptions, and appointment history through the patient portal after logging in.', open: false },
  ]);

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields');
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="pt-24">
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 text-center">
          <h1 className="font-display font-bold text-5xl text-white mb-4">Get in Touch</h1>
          <p className="text-blue-100 text-lg">We're here to help. Contact us for appointments, questions, or concerns.</p>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Contact info */}
              <div className="space-y-5">
                {[
                  { icon: MapPin, title: 'Visit Us', info: '123 Healthcare Blvd, Medical District, NY 10001', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                  { icon: Phone, title: 'Call Us', info: '+1 (555) 123-4567\nEmergency: +1 (555) 911-0000', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
                  { icon: Mail, title: 'Email Us', info: 'info@medicare.com\nsupport@medicare.com', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
                  { icon: Clock, title: 'Working Hours', info: 'Mon-Fri: 8:00 AM - 8:00 PM\nSat-Sun: 9:00 AM - 5:00 PM\nEmergency: 24/7', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
                ].map(({ icon: Icon, title, info, color }) => (
                  <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                    <div className={`h-12 w-12 ${color.split(' ').slice(1).join(' ')} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${color.split(' ')[0]}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm whitespace-pre-line">{info}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">Send us a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <FormInput label="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                  <FormInput label="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@email.com" />
                  <FormInput label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0000" />
                  <FormInput label="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="How can we help?" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5} placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
                </div>
                <Button onClick={handleSend} loading={sending} size="lg" className="w-full sm:w-auto">
                  <MessageSquare className="h-4 w-4" /> Send Message
                </Button>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-16">
              <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white text-center mb-10">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, open: !f.open } : f))}>
                      <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                      {faq.open ? <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                    </button>
                    {faq.open && <div className="px-6 pb-5 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-700 pt-4">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

// ─── FORGOT PASSWORD PAGE ─────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-8 w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm mb-6 transition-colors">← Back to login</Link>
        {sent ? (
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Check Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400">We've sent password reset instructions to <strong>{email}</strong>. Check your inbox and follow the link.</p>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send you reset instructions.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} />
              <Button type="submit" loading={loading} size="lg" className="w-full">Send Reset Link</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
