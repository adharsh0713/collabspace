import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, MonitorSmartphone, DoorOpen, BarChart3, Settings, Menu, X, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [location, isMobile]);

  const menuItems = [];

  if (user?.role === 'SUPER_ADMIN') {
    menuItems.push({ path: '/superadmin', label: 'Platform Admin', icon: LayoutDashboard });
  } else {
    menuItems.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    menuItems.push({ path: '/seats', label: 'Seats', icon: MonitorSmartphone });
    menuItems.push({ path: '/rooms', label: 'Rooms', icon: DoorOpen });
    menuItems.push({ path: '/analytics', label: 'Analytics', icon: BarChart3 });
  }

  if (user?.role === 'ADMIN') {
    menuItems.push({ path: '/employees', label: 'Employees', icon: Users });
    menuItems.push({ path: '/admin', label: 'Space Settings', icon: Settings });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={cn(
        "bg-white border-r border-slate-200 min-h-screen transition-all duration-300 flex flex-col shadow-sm",
        isCollapsed && !isMobile ? 'w-[72px]' : 'w-64',
        isMobile ? 'fixed inset-y-0 left-0 z-50 transform' : 'relative',
        isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between min-h-[64px]">
          {!isCollapsed && (
            <span className="font-bold text-slate-900 text-lg tracking-tight select-none">CollabSpace</span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 flex-shrink-0 hidden md:block"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {isMobile && (
              <button onClick={() => setIsMobileOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 rounded-md">
                  <X className="w-5 h-5" />
              </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-200 text-sm font-medium",
                      isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 space-x-3',
                      active 
                        ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className={cn("flex items-center", isCollapsed ? 'justify-center' : 'space-x-3')}>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
              <span className="text-primary font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate font-medium">
                  {user?.role || 'USER'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
