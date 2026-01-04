
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User, UserRole, Team, Player, TeamCategory } from '../types';
// Fix: Added User as UserIcon alias from lucide-react to prevent conflict with User type from '../types'
import { ShieldCheck, Key, Search, Trash2, X, Users, Trophy, UserCog, Edit, Camera, ChevronRight, Mail, Phone, Hash, User as UserIcon } from 'lucide-react';

const AdminManagement: React.FC = () => {
  const { users, teams, players, updateUser, deleteUser, updateTeam, deleteTeam, updatePlayer, deletePlayer } = useData();
  const [activeTab, setActiveTab] = useState<'users' | 'teams' | 'players'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.coachName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.grade.includes(searchTerm)
  );

  const handleOpenReset = (user: User) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
  };

  const handleSavePassword = () => {
    if (selectedUserForPassword && newPassword) {
      updateUser({ ...selectedUserForPassword, password: newPassword });
      alert(`Access key for ${selectedUserForPassword.name} updated.`);
      setSelectedUserForPassword(null);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser);
      setEditingUser(null);
    }
  };

  const handleImageUpload = (setter: (url: string) => void) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Admin Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center">
            <ShieldCheck size={14} className="mr-2 text-emerald-600" /> Authorized Systems Access
          </p>
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={`Filter ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl border border-slate-200 w-fit">
        {[
          { id: 'users', label: 'Users', icon: UserCog },
          { id: 'teams', label: 'Sports', icon: Trophy },
          { id: 'players', label: 'Students', icon: Users }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }} 
            className={`px-6 py-3 rounded-xl font-bold text-[13px] transition-all flex items-center ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTab === 'users' && filteredUsers.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}&background=10b981&color=fff`} className="w-16 h-16 rounded-2xl shadow-lg border-2 border-slate-50 object-cover" alt="" />
                <div className="ml-4">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[140px]">{u.name}</h3>
                  <span className={`inline-block px-2 py-0.5 mt-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    u.role === UserRole.ADMIN ? 'bg-red-50 text-red-600' :
                    u.role === UserRole.COACH ? 'bg-blue-50 text-blue-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button onClick={() => setEditingUser(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm border border-slate-100"><Edit size={16} /></button>
                <button onClick={() => handleOpenReset(u)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition shadow-sm border border-slate-100"><Key size={16} /></button>
              </div>
            </div>
            
            <div className="flex-1 space-y-2 mb-6">
              <div className="flex items-center text-[13px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                <Mail size={14} className="mr-3 opacity-40" /> {u.username}
              </div>
              {u.assignedTeamId && (
                <div className="flex items-center text-[13px] font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Trophy size={14} className="mr-3 opacity-40" /> Assigned: {u.assignedTeamId}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Account</span>
               {u.role !== UserRole.ADMIN && (
                 <button onClick={() => { if(confirm('Permanently delete this user?')) deleteUser(u.id); }} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center">
                   <Trash2 size={12} className="mr-1" /> Delete Access
                 </button>
               )}
            </div>
          </div>
        ))}

        {activeTab === 'teams' && filteredTeams.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl overflow-hidden shadow-lg">
                  {t.imageUrl ? <img src={t.imageUrl} className="w-full h-full object-cover" alt="" /> : t.icon}
                </div>
                <div className="ml-4">
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{t.name}</h3>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest">
                    {t.category}
                  </span>
                </div>
              </div>
              <button onClick={() => { if(confirm(`Delete ${t.name}?`)) deleteTeam(t.id); }} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="flex-1 mb-6">
              <p className="text-[13px] font-extrabold text-slate-800 flex items-center mb-1">
                {/* Fix: Updated User icon usage to UserIcon alias to resolve compilation error */}
                <UserIcon size={14} className="mr-3 text-slate-300" /> {t.coachName}
              </p>
              <p className="text-[11px] font-bold text-slate-400 ml-7 uppercase tracking-wider">Assigned Faculty</p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Al Munawwara Sport</span>
              <button className="text-[11px] font-black text-emerald-600 flex items-center group-hover:translate-x-1 transition-transform">
                Team Profile <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'players' && filteredPlayers.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                   <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.name}&background=334155&color=fff`} className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-md object-cover" alt="" />
                   <div className="ml-4">
                     <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[130px]">{p.name}</h3>
                     <span className="text-[11px] font-extrabold text-emerald-600">Grade {p.grade}</span>
                   </div>
                </div>
                <button onClick={() => { if(confirm(`Delete player ${p.name}?`)) deletePlayer(p.id); }} className="p-2 text-slate-300 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
             </div>

             <div className="flex-1 space-y-3 mb-6">
                <div className="flex items-center text-xs font-bold text-slate-600">
                  <Phone size={14} className="mr-3 text-slate-300" /> {p.contactParent}
                </div>
                <div className="flex items-center text-xs font-bold text-slate-600">
                  <Hash size={14} className="mr-3 text-slate-300" /> Student ID: {p.id.split('-').pop()}
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100"></div>)}
                </div>
                <button className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl">View Records</button>
             </div>
          </div>
        ))}
      </div>

      {/* Modern Centered Modals (Example for User Edit) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingUser(null)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Modify User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 rounded-full hover:bg-white text-slate-400 transition shadow-sm border border-slate-100"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-8">
               <div className="flex justify-center">
                  <div className="relative group">
                    <img 
                      src={editingUser.avatarUrl || `https://ui-avatars.com/api/?name=${editingUser.name}&background=10b981&color=fff`} 
                      className="w-28 h-28 rounded-[2rem] border-4 border-slate-50 shadow-xl object-cover" 
                      alt="" 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleImageUpload((url) => setEditingUser({...editingUser, avatarUrl: url}))}
                      className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-emerald-600 transition-colors border-4 border-white"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Official Name</label>
                   <input 
                     type="text" 
                     value={editingUser.name}
                     onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
                     required
                   />
                 </div>
               </div>

               <div className="flex flex-col gap-3 pt-4">
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center group">
                   Save Changes <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </button>
                 <button type="button" onClick={() => setEditingUser(null)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition">Discard Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedUserForPassword(null)}></div>
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Update Credentials</h3>
            <p className="text-sm text-slate-400 font-bold mb-8">Set a new security key for {selectedUserForPassword.name}.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">New Entry Key</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold outline-none"
                  placeholder="Secret passphrase..."
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSavePassword}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-emerald-700 transition-all"
                >
                  Update Access Key
                </button>
                <button 
                  onClick={() => setSelectedUserForPassword(null)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
