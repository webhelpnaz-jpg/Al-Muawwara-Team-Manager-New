import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Shield, Lock, User, AlertCircle, ChevronDown } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { users } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUsername = e.target.value;
    if (selectedUsername) {
      setUsername(selectedUsername);
      // For demo convenience, autofill the default password
      setPassword(selectedUsername === 'admin' ? 'admin' : 'password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <Shield className="mx-auto text-emerald-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-white tracking-tight">Al Munawwara Teams</h1>
        <p className="text-slate-400 mt-2">Sports & Activities Management Portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Account Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex items-center text-red-700 text-sm">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Select Position / Team</label>
              <div className="relative">
                <select 
                  onChange={handleRoleSelect}
                  className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>--- Select Position ---</option>
                  <optgroup label="School Administration">
                    {users.filter(u => u.role !== 'Coach' && u.role !== 'Parent').map(u => (
                      <option key={u.id} value={u.username}>{u.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sports & Activity Leads">
                    {users.filter(u => u.role === 'Coach').map(u => (
                      <option key={u.id} value={u.username}>{u.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Portal Access">
                     {users.filter(u => u.role === 'Parent').map(u => (
                      <option key={u.id} value={u.username}>{u.name} Portal</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg mt-4"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100">
           <p className="text-xs text-center text-slate-500">
             Official Al Munawwara School Management System. <br/>
             Authorized Personnel Only.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;