import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut } from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 h-[64px] flex items-center justify-between flex-shrink-0 shadow-sm z-10 relative">
      {/* Left: mobile toggle + greeting */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm font-medium text-slate-500 hidden sm:inline-block">
          Welcome back, <span className="text-slate-900 font-semibold">{user?.name || 'User'}</span>
        </span>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-3 border-r border-slate-200 pr-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 mt-1">{user?.email || ''}</p>
          </div>
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
            <span className="text-primary font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors group"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-danger-500" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
