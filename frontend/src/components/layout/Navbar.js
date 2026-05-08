import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Menu, X, Sun, Moon, ChevronRight } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/doctors', label: 'Doctors' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const getDashboardPath = () => {
    const paths = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
    return paths[user?.role] || '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Medi<span className="text-blue-600">Care</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Dashboard <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 animate-slide-up">
          {navLinks.map(({ path, label }) => (
            <Link key={path} to={path} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {label}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex flex-col gap-2">
            {user ? (
              <Link to={getDashboardPath()} className="px-4 py-3 bg-blue-600 text-white font-medium rounded-xl text-center">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium text-center border border-gray-200 dark:border-gray-700 rounded-xl">Sign In</Link>
                <Link to="/register" className="px-4 py-3 bg-blue-600 text-white font-medium rounded-xl text-center">Get Started</Link>
              </>
            )}
            <button onClick={toggleTheme} className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-xl border border-gray-200 dark:border-gray-700">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
