import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, User, Phone, Briefcase, Activity, KeyRound } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    adminSecretKey: '' // Added Secret Key field to state
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    if (isLogin) {
      const result = await login(formData.email, formData.password);
      
      if (result && result.success) {
        // Updated Role-Based Navigation
        if (result.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (result.role === 'admin' || result.role === 'system admin') {
          navigate('/admin-dashboard');
        } else if (result.role === 'receptionist') {
          navigate('/receptionist-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } else {
        setError(result?.message || 'Login failed! Please check credentials.');
      }
    } else {
      const result = await signup(formData);
      
      if (result && result.success) {
        setIsLogin(true);
        alert('Registration successful! Please login.');
      } else {
        setError(result?.message || 'Signup failed! Please try again.');
      }
    }
  } catch (err) {
    console.error("Auth error:", err);
    setError(err.response?.data?.message || err.message || 'Something went wrong. Server might be waking up!');
  } finally {
    // Ye block HAMESHA chalega, chaotic network drops ya errors ke bawajood loading state band kar dega!
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center text-white relative">
          <div className="absolute top-4 right-4 animate-pulse">
            <Activity className="h-5 w-5 text-indigo-200" />
          </div>
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl backdrop-blur-md mb-3">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Clinic System</h2>
          <p className="text-sm text-indigo-100 mt-1">
            {isLogin ? 'Sign in to your medical portal account' : 'Create a new clinical gateway account'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Account Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm cursor-pointer"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                </div>

                {/* 🔒 Dynamic Secret Admin Key Field (Sirf tabhi dikhega jab Admin select hoga) */}
                {(formData.role === 'admin' || formData.role === 'System Admin') && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 animate-fadeIn">
                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Master Admin Secret Passkey *
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                      <input
                        type="password"
                        name="adminSecretKey"
                        required
                        value={formData.adminSecretKey}
                        onChange={handleChange}
                        placeholder="Enter Clinic Master Key"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    <p className="text-[10px] text-amber-700 pt-0.5">
                      Restricted to authorized system administrators only.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@clinic.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all text-sm shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Form Type */}
          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Need a new account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
            >
              {isLogin ? 'Register Here' : 'Login Here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;