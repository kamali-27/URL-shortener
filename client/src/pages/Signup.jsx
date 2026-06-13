import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Link2 } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden bg-gray-950 text-white">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-75"></div>

      <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative animate-fade-in">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Link2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Get started for free and unlock powerful link analytics.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 chars)"
                className="block w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-white placeholder-gray-600 focus:outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer mt-2"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Get Started'}
          </button>
        </form>

        {/* Login Redirect Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition duration-150">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
