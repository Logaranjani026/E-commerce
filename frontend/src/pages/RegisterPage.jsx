import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, UserPlus, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      showToast('Account created successfully! Welcome to SmartCart AI 🎉', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
          <p className="text-xs text-slate-500">Join SmartCart AI for smart shopping & personalized discovery</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Confirm Password *</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Re-enter password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
