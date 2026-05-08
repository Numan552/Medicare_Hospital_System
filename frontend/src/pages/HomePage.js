import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  Heart, Star, ChevronRight, Phone, ArrowRight, Shield,
  Clock, Users, Award, Stethoscope, Brain, Bone, Baby,
  Smile, AlertCircle, Scan, Activity, CheckCircle, Play,
  MapPin, Truck, Quote, ChevronLeft
} from 'lucide-react';

// Dummy data
const stats = [
  { value: '25+', label: 'Years of Excellence', icon: Award },
  { value: '500+', label: 'Expert Doctors', icon: Stethoscope },
  { value: '50K+', label: 'Happy Patients', icon: Users },
  { value: '98%', label: 'Success Rate', icon: CheckCircle },
];

const departments = [
  { name: 'Cardiology', icon: Heart, desc: 'Expert heart care and cardiovascular treatments', color: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', iconColor: 'text-red-500', count: '12 Doctors' },
  { name: 'Neurology', icon: Brain, desc: 'Advanced brain and nervous system treatments', color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', iconColor: 'text-purple-500', count: '8 Doctors' },
  { name: 'Orthopedics', icon: Bone, desc: 'Bone, joint and sports medicine specialists', color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', iconColor: 'text-blue-500', count: '10 Doctors' },
  { name: 'Pediatrics', icon: Baby, desc: 'Comprehensive care for children and teens', color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', iconColor: 'text-green-500', count: '15 Doctors' },
  { name: 'Dentistry', icon: Smile, desc: 'Complete dental and oral health solutions', color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20', iconColor: 'text-yellow-500', count: '6 Doctors' },
  { name: 'Emergency', icon: AlertCircle, desc: '24/7 emergency medical services', color: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20', iconColor: 'text-orange-500', count: '24/7' },
  { name: 'Radiology', icon: Scan, desc: 'Advanced imaging and diagnostic services', color: 'from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20', iconColor: 'text-teal-500', count: '5 Doctors' },
  { name: 'Cardio Care', icon: Activity, desc: 'Intensive cardiac monitoring and care', color: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20', iconColor: 'text-pink-500', count: '9 Doctors' },
];

const featuredDoctors = [
  { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', rating: 4.9, reviews: 247, experience: '15 Years', available: true, initials: 'SJ', color: 'bg-blue-500' },
  { name: 'Dr. Michael Chen', specialty: 'Neurologist', rating: 4.8, reviews: 189, experience: '12 Years', available: true, initials: 'MC', color: 'bg-purple-500' },
  { name: 'Dr. Emily Rodriguez', specialty: 'Orthopedic Surgeon', rating: 4.7, reviews: 156, experience: '10 Years', available: false, initials: 'ER', color: 'bg-teal-500' },
  { name: 'Dr. James Wilson', specialty: 'Pediatrician', rating: 4.9, reviews: 312, experience: '8 Years', available: true, initials: 'JW', color: 'bg-green-500' },
];

const testimonials = [
  { name: 'Robert Anderson', text: 'The care I received at MediCare was exceptional...', rating: 5, role: 'Cardiac Patient' },
  { name: 'Maria Garcia', text: 'Booking an appointment online was so convenient...', rating: 5, role: 'Regular Patient' },
  { name: 'David Kim', text: 'Outstanding emergency care when I needed it most...', rating: 5, role: 'Emergency Patient' },
];

function DoctorCard({ doctor }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-16 w-16 ${doctor.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform`}>
          {doctor.initials}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doctor.available ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
          {doctor.available ? '● Available' : '○ Busy'}
        </span>
      </div>

      <h3 className="font-bold text-lg mb-1">{doctor.name}</h3>
      <p className="text-blue-600 text-sm font-medium mb-3">{doctor.specialty}</p>

      <div className="flex items-center gap-4 text-sm mb-4">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          {doctor.rating}
        </span>
        <span>({doctor.reviews} reviews)</span>
        <span>{doctor.experience}</span>
      </div>

      <Link to="/appointment" className="w-full py-2.5 bg-blue-50 text-blue-600 font-medium text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
        Book Appointment <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setTestimonialIdx(i => (i + 1) % testimonials.length);
        setAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Emergency Section */}
      <section className="py-16 bg-red-50 border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <Truck className="h-8 w-8 text-red-600" />
            </div>

            <div>
              <h3 className="font-bold text-2xl">Emergency Services</h3>
              <p className="text-gray-500">24/7 emergency support available</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="tel:+15559110000" className="text-red-600 font-bold text-2xl flex items-center gap-2">
              <Phone className="h-6 w-6" /> +1 (555) 911-0000
            </a>

            <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl flex items-center gap-2">
              <Truck className="h-5 w-5" /> Request Ambulance
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}