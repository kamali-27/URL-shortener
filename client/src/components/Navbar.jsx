import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={token ? "/dashboard" : "/login"} className="flex items-center space-x-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              SnapLink
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* User Profile Info */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-xs border border-indigo-500/30 uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="font-medium truncate max-w-[120px]">{user.name || 'User'}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-150"
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/25 transition duration-150"
                  >
                    Sign Up
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
