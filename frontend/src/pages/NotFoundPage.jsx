import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <span className="text-6xl font-black text-indigo-600 block">404</span>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The page you requested could not be located. It may have been moved or doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
