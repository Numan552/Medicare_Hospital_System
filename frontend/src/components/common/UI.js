// src/components/common/LoadingSpinner.js
import React from 'react';

export default function LoadingSpinner({ fullScreen, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-100 border-t-blue-600`} />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading MediCare...</p>
        </div>
      </div>
    );
  }

  return spinner;
}

// src/components/common/StatCard.js - exported separately below
export function StatCard({ icon: Icon, label, value, change, color = 'blue', loading }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change >= 0
              ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
              : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-28" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </>
      )}
    </div>
  );
}

// Badge component
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'Pending', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    no_show: { label: 'No Show', variant: 'default' },
  };
  const { label, variant } = statusMap[status] || { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

// Modal component
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizes[size]} animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Avatar component
export function Avatar({ src, name, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-700`} />;
  }

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-gray-700`}>
      {initials}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-4">
        <Icon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Form Input
export function FormInput({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
        <input
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
            border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all
            ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Button
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// Search Input
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      />
    </div>
  );
}
