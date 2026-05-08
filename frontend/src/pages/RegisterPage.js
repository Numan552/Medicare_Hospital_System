import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) return 'Please fill all required fields';
    if (form.password !== form.confirm_password) return 'Passwords do not match';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);
    setLoading(true);
    try {
      const { confirm_password, ...data } = form;
      const user = await register(data);
      toast.success('Account created successfully!');
      const paths = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Book appointments online 24/7',
    'Access your medical records anytime',
    'Get prescriptions digitally',
    'Receive appointment reminders',
    'Secure and private health data',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-700 to-blue-900 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">MediCare</span>
        </Link>
        <div>
          <h2 className="font-display font-bold text-4xl text-white leading-tight mb-6">
            Join 50,000+ patients managing their health digitally
          </h2>
          <ul className="space-y-4">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-3">
                <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-blue-100 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-blue-200 text-sm">© 2024 MediCare Hospital Management System</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">MediCare</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400">Start your health journey with MediCare today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="John"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name *</label>
                <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                {['patient', 'doctor'].map(r => (
                  <button
                    key={r} type="button" onClick={() => setForm(prev => ({ ...prev, role: r }))}
                    className={`py-2.5 px-4 rounded-xl border-2 font-medium text-sm capitalize transition-all ${
                      form.role === r
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {r === 'patient' ? '🏥 Patient' : '👨‍⚕️ Doctor'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="Repeat your password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 mt-2">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
