import React, { useState } from 'react';
import { Player, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
// Added missing Users import from lucide-react
import { Edit2, Trash2, Phone, Activity, Plus, X, HeartPulse, User, Users, Camera } from 'lucide-react';

interface PlayerListProps {
  teamId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ teamId }) => {
  const { user } = useAuth();
  const { getPlayersByTeam, addPlayer, deletePlayer, updatePlayer } = useData();
  const players = getPlayersByTeam(teamId);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;
  const canEdit = isAdmin || user?.role === UserRole.PRINCIPAL || 
                  user?.role === UserRole.MASTER_IN_CHARGE || 
                  (user?.role === UserRole.COACH && user.assignedTeamId === teamId);

  const initialFormState: Player = {
    id: '', teamId: teamId, name: '', grade: '', position: 'Member',
    contactParent: '', dob: '', joinedDate: new Date().toISOString().split('T')[0],
    emergencyContactName: '', emergencyContactPhone: '', performanceNotes: '',
    medicalNotes: '', attendanceRate: 100, status: 'Active', avatarUrl: ''
  };

  const [formData, setFormData] = useState<Player>(initialFormState);

  const handleOpenAdd = () => {
    setFormData({ ...initialFormState, id: `p-${Date.now()}` });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (player: Player) => {
    setFormData(player);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) updatePlayer(formData);
    else addPlayer(formData);
    setShowModal(false);
  };

  const handleImageUpload = (setter: (url: string) => void) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
             <Users size={20} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-800">Team Roster</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{players.length} Students Registered</p>
           </div>
        </div>
        {canEdit && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg active:scale-95"
          >
            <Plus size={20} className="mr-2" /> Add Player
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <div key={player.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group relative hover:border-emerald-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name}&background=random`} 
                    alt={player.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100"
                  />
                  {player.status === 'Medical' && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-md">
                      <HeartPulse size={12} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{player.name}</h4>
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">{player.position} • Grade {player.grade}</p>
                </div>
              </div>
              
              {canEdit && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(player)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-lg transition">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deletePlayer(player.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance</div>
                  <div className="flex items-center font-bold text-slate-800">
                    <Activity size={14} className="mr-2 text-emerald-500" /> {player.attendanceRate}%
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</div>
                  <div className={`flex items-center font-bold ${player.status === 'Medical' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    <HeartPulse size={14} className="mr-2" /> {player.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Phone size={14} className="mr-3 text-slate-400" /> {player.contactParent}
              </div>

              {player.performanceNotes && (
                 <div className="bg-emerald-50/50 p-4 rounded-xl text-xs italic text-emerald-800 border border-emerald-100/50 relative overflow-hidden">
                    <div className="relative z-10">"{player.performanceNotes}"</div>
                    <User className="absolute -right-2 -bottom-2 opacity-5" size={40} />
                 </div>
              )}
            </div>
          </div>
        ))}
        {players.length === 0 && (
           <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <User size={64} className="mb-4 opacity-20" />
              <p className="font-bold">No players in this roster yet.</p>
           </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-2xl font-black text-slate-800">{isEditing ? 'Edit Profile' : 'Register Player'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
               <div className="flex justify-center mb-6">
                 <div className="relative group">
                    <img 
                      src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                      className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-slate-50" 
                      alt="" 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleImageUpload((url) => setFormData({...formData, avatarUrl: url}))}
                      className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition"
                    >
                      <Camera size={18} />
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-semibold" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Grade/Class</label>
                    <input type="text" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-semibold" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Position/Role</label>
                    <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none">
                      <option value="Member">Member</option>
                      <option value="Captain">Captain</option>
                      <option value="Vice Captain">Vice Captain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Player Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none">
                      <option value="Active">Active</option>
                      <option value="Medical">Medical</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 space-y-4">
                 <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Parent & Contact</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Primary Phone</label>
                      <input type="text" value={formData.contactParent} onChange={(e) => setFormData({...formData, contactParent: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Medical Notes</label>
                      <input type="text" value={formData.medicalNotes || ''} onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="Allergies, etc." />
                    </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Coach Remarks</label>
                  <textarea value={formData.performanceNotes || ''} onChange={(e) => setFormData({...formData, performanceNotes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold h-32" placeholder=" Strengths and improvement areas..." />
               </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition">
                  {isEditing ? 'Save Profile' : 'Complete Registration'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">
                  Discard
                </button>
              </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;