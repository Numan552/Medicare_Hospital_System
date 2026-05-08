import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, StatusBadge, Avatar } from '../../components/common/UI';
import { dashboardAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Stethoscope, Calendar, DollarSign, TrendingUp, Clock, Star, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const demoData = {
  stats: { totalDoctors: 48, totalPatients: 1247, totalAppointments: 3856, pendingAppointments: 23, totalRevenue: 284500, monthlyRevenue: 38200 },
  monthlyTrend: [
    { month: '2024-01', count: 210 }, { month: '2024-02', count: 280 }, { month: '2024-03', count: 340 },
    { month: '2024-04', count: 295 }, { month: '2024-05', count: 420 }, { month: '2024-06', count: 380 },
  ],
  revenueByMonth: [
    { month: '2024-01', revenue: 28000 }, { month: '2024-02', revenue: 34500 }, { month: '2024-03', revenue: 41200 },
    { month: '2024-04', revenue: 36800 }, { month: '2024-05', revenue: 52000 }, { month: '2024-06', revenue: 38200 },
  ],
  deptStats: [
    { name: 'Cardiology', count: 842 }, { name: 'Neurology', count: 634 },
    { name: 'Orthopedics', count: 521 }, { name: 'Pediatrics', count: 890 },
    { name: 'Dentistry', count: 412 }, { name: 'Emergency', count: 557 },
  ],
  statusStats: [
    { status: 'completed', count: 2850 }, { status: 'confirmed', count: 520 },
    { status: 'pending', count: 280 }, { status: 'cancelled', count: 206 },
  ],
  recentAppointments: [
    { id: 1, patient_name: 'John Doe', doctor_name: 'Dr. Sarah Johnson', appointment_date: '2024-06-15', appointment_time: '10:00:00', status: 'confirmed', type: 'consultation' },
    { id: 2, patient_name: 'Jane Smith', doctor_name: 'Dr. Michael Chen', appointment_date: '2024-06-15', appointment_time: '11:30:00', status: 'pending', type: 'checkup' },
    { id: 3, patient_name: 'Bob Martin', doctor_name: 'Dr. Emily Rodriguez', appointment_date: '2024-06-14', appointment_time: '14:00:00', status: 'completed', type: 'follow_up' },
    { id: 4, patient_name: 'Alice Brown', doctor_name: 'Dr. James Wilson', appointment_date: '2024-06-14', appointment_time: '09:00:00', status: 'completed', type: 'consultation' },
    { id: 5, patient_name: 'Charlie Davis', doctor_name: 'Dr. Aisha Patel', appointment_date: '2024-06-13', appointment_time: '16:00:00', status: 'cancelled', type: 'consultation' },
  ],
  topDoctors: [
    { first_name: 'Sarah', last_name: 'Johnson', specialization: 'Cardiologist', rating: 4.9, appointment_count: 247 },
    { first_name: 'Michael', last_name: 'Chen', specialization: 'Neurologist', rating: 4.8, appointment_count: 189 },
    { first_name: 'James', last_name: 'Wilson', specialization: 'Pediatrician', rating: 4.9, appointment_count: 312 },
    { first_name: 'Emily', last_name: 'Rodriguez', specialization: 'Orthopedist', rating: 4.7, appointment_count: 156 },
    { first_name: 'Aisha', last_name: 'Patel', specialization: 'Cardiologist', rating: 4.8, appointment_count: 203 },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === 'number' && p.name?.includes('evenue') ? `$${p.value.toLocaleString()}` : p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(demoData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getAdminStats();
        setData(res.data);
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMonth = (m) => {
    if (!m) return '';
    const [year, month] = m.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
  };

  const monthlyTrendFormatted = (data.monthlyTrend || []).map(d => ({ ...d, month: formatMonth(d.month) }));
  const revenueFormatted = (data.revenueByMonth || []).map(d => ({ ...d, month: formatMonth(d.month) }));

  const pieData = (data.statusStats || []).map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: parseInt(s.count),
  }));

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Overview</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            All Systems Operational
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Stethoscope} label="Total Doctors" value={data.stats?.totalDoctors || 0} color="blue" loading={loading} />
          <StatCard icon={Users} label="Total Patients" value={(data.stats?.totalPatients || 0).toLocaleString()} color="teal" loading={loading} />
          <StatCard icon={Calendar} label="Appointments" value={(data.stats?.totalAppointments || 0).toLocaleString()} color="purple" loading={loading} />
          <StatCard icon={Clock} label="Pending" value={data.stats?.pendingAppointments || 0} color="orange" loading={loading} />
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${((data.stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} color="green" loading={loading} />
          <StatCard icon={TrendingUp} label="This Month" value={`$${((data.stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K`} color="blue" change={12} loading={loading} />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointment Trend */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Appointment Trends</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Last 6 months</p>
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><ArrowUpRight className="h-4 w-4" />+18%</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrendFormatted}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Appointments" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorCount)" dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Appointment Status</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue & Departments */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Monthly breakdown</p>
              </div>
              <select className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                <option>2024</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueFormatted} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Department Performance</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Appointments by department</p>
            <div className="space-y-4">
              {(data.deptStats || []).map(({ name, count }, i) => {
                const max = Math.max(...(data.deptStats || []).map(d => d.count));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Recent Appointments</h3>
              <a href="/admin/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View all</a>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {(data.recentAppointments || []).map(apt => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Avatar name={apt.patient_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{apt.patient_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{apt.doctor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{apt.appointment_date}</p>
                    <p className="text-xs text-gray-400">{apt.appointment_time?.slice(0, 5)}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Doctors */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Top Doctors</h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {(data.topDoctors || []).map((doc, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-4">#{i + 1}</span>
                  <Avatar name={`${doc.first_name} ${doc.last_name}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">Dr. {doc.first_name} {doc.last_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{doc.specialization}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{doc.rating}
                    </p>
                    <p className="text-xs text-gray-400">{doc.appointment_count} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
