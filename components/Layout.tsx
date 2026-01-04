import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Shield,
  UserCog,
  ClipboardCheck,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={22} /> },
  ];

  if (user?.role !== UserRole.PARENT) {
    navItems.push({ name: 'School Teams', path: '/teams', icon: <Users size={22} /> });
  }

  navItems.push({ name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={22} /> });
  navItems.push({ name: 'Schedule', path: '/schedule', icon: <Calendar size={22} /> });

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ name: 'Admin Hub', path: '/admin', icon: <UserCog size={22} /> });
  }

  const PageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    if (location.pathname === '/profile') return 'My Account';
    return current?.name || 'Portal';
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col
      `}>
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 block leading-none">Al Munawwara</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center">
                <span className={`transition-colors ${location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className="ml-4 font-bold text-[15px]">{item.name}</span>
              </div>
              <ChevronRight size={14} className={`transition-opacity ${location.pathname === item.path ? 'opacity-100' : 'opacity-0'}`} />
            </NavLink>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <NavLink 
            to="/profile" 
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center p-3 rounded-2xl transition-all ${location.pathname === '/profile' ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
          >
            <img 
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`} 
              alt="User" 
              className="w-11 h-11 rounded-xl border-2 border-emerald-100 object-cover"
            />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-extrabold text-slate-900 truncate leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate">{user?.role}</p>
            </div>
          </NavLink>
          
          <button 
            onClick={logout}
            className="flex items-center w-full mt-4 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-white/70 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="lg:hidden text-slate-600 mr-4 p-2 hover:bg-slate-100 rounded-xl transition">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              <PageTitle />
            </h1>
          </div>
          <div className="flex items-center space-x-3">
             <div className="hidden sm:block text-right mr-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</span>
                <span className="text-xs font-extrabold text-emerald-600 uppercase">System Online</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                <UserCircle size={24} />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;