import { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-violet-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Zap size={24} className="text-primary-600" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-white text-3xl tracking-tight">FlowTech</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-slate-800">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isRegister ? 'Join the FlowTech dashboard' : 'Sign in to your dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserPlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="John Smith"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="you@flowtech.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-violet-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-primary-700 hover:to-violet-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          {/* Demo credentials */}
          {!isRegister && (
            <div className="mt-5 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Demo Credentials:</p>
              <div className="space-y-1">
                <button
                  onClick={() => setForm({ ...form, email: 'admin@flowtech.com', password: 'admin123' })}
                  className="text-xs text-primary-600 hover:underline block"
                >
                  Admin: admin@flowtech.com / admin123
                </button>
                <button
                  onClick={() => setForm({ ...form, email: 'alex.j@flowtech.com', password: 'manager123' })}
                  className="text-xs text-primary-600 hover:underline block"
                >
                  Manager: alex.j@flowtech.com / manager123
                </button>
                <button
                  onClick={() => setForm({ ...form, email: 'sarah.m@flowtech.com', password: 'sales123' })}
                  className="text-xs text-primary-600 hover:underline block"
                >
                  Sales Rep: sarah.m@flowtech.com / sales123
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
