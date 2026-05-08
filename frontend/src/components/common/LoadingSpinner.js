import React from 'react';

export default function LoadingSpinner({ fullScreen, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-blue-100" />
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-blue-600 absolute top-0 left-0" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Loading MediCare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-100 border-t-blue-600`} />
  );
}
