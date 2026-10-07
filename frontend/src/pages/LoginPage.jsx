import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Cpu, LogIn, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@smartcart.ai');
      setPassword('Admin@123');
    } else {
      setEmail('user@smartcart.ai');
      setPassword('User@123');
    }
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to SmartCart AI</h2>
          <p className="text-xs text-slate-500">Access your orders, wishlist, and personalized AI feed</p>
        </div>

        {/* Demo Login Shortcuts */}
        <div className="bg-indigo-50/80 rounded-2xl p-3 border border-indigo-100 space-y-2 text-xs">
          <span className="font-bold text-indigo-950 block text-center">⚡ 1-Click Demo Credentials:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => autofillDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('user')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo Customer</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="user@smartcart.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
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
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
