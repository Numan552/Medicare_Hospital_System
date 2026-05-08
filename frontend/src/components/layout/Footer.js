import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Medi<span className="text-blue-400">Care</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Providing world-class healthcare services with cutting-edge technology and compassionate care for over 25 years.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Our Services' },
                { to: '/doctors', label: 'Find a Doctor' },
                { to: '/appointment', label: 'Book Appointment' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="font-display font-bold text-white mb-4">Departments</h3>
            <ul className="space-y-2.5">
              {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dentistry', 'Emergency'].map(dept => (
                <li key={dept}>
                  <Link to="/services" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">{dept}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">123 Healthcare Blvd, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">info@medicare.com</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Emergency Hotline</p>
              <p className="text-white font-bold text-lg">+1 (555) 911-0000</p>
              <p className="text-gray-400 text-xs">Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2024 MediCare Hospital Management System. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
