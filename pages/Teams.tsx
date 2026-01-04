import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Users, Star, Plus, X, Trophy } from 'lucide-react';
import { TeamCategory, UserRole, Team } from '../types';
import TeamDetail from './TeamDetail';

const Teams: React.FC = () => {
  const { teams, addTeam } = useData();
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new team
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('⚽');
  const [newCategory, setNewCategory] = useState<TeamCategory>(TeamCategory.SPORTS);

  const isManagement = user?.role === UserRole.ADMIN || user?.role === UserRole.MASTER_IN_CHARGE;

  const handleSelectTeam = (id: string) => setSelectedTeamId(id);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam: Team = {
      id: `t-${Date.now()}`,
      name: newName,
      category: newCategory,
      coachName: `${newName} Coach`,
      coachJoinedDate: new Date().toISOString().split('T')[0],
      icon: newIcon,
    };
    addTeam(newTeam);
    setShowAddModal(false);
    setNewName('');
    setNewIcon('⚽');
  };

  if (selectedTeamId) {
    return <TeamDetail teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />;
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Sports & Clubs</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center">
            <Trophy size={14} className="mr-2 text-blue-600" /> Professional School Roster
          </p>
        </div>
        
        {isManagement && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all font-black text-sm group"
          >
            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" /> Register New Activity
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => {
          const isMyTeam = user?.assignedTeamId === team.id;
          return (
            <div 
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              className={`group bg-white rounded-[2.5rem] shadow-sm border p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer relative overflow-hidden flex flex-col ${
                isMyTeam ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-100 hover:border-emerald-200'
              }`}
            >
              {isMyTeam && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-[1.5rem] flex items-center z-10 shadow-lg">
                  <Star size={10} className="mr-2 fill-white animate-pulse" /> My Team
                </div>
              )}
              
              <div className="flex justify-between items-start mb-8">
                <div className="text-5xl bg-slate-50 w-24 h-24 flex items-center justify-center rounded-[2rem] border border-slate-100 group-hover:bg-emerald-50 group-hover:scale-105 transition-all shadow-inner overflow-hidden">
                  {team.imageUrl ? <img src={team.imageUrl} className="w-full h-full object-cover" /> : team.icon}
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:translate-x-2">
                  <ChevronRight size={28} strokeWidth={3} />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest ${
                    team.category === TeamCategory.SPORTS ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {team.category}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">{team.name}</h3>
              </div>
              
              <div className="border-t border-slate-50 mt-8 pt-6 flex items-center justify-between">
                <div className="flex items-center text-sm font-bold text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 border border-white shadow-sm">
                    <Users size={14} className="text-slate-400" />
                  </div>
                  {team.coachName}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTeam} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Activity Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                  placeholder="e.g. Volleyball"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Symbol</label>
                  <input 
                    type="text" 
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-bold"
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Classification</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TeamCategory)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none outline-none"
                  >
                    <option value={TeamCategory.SPORTS}>Sports</option>
                    <option value={TeamCategory.ACTIVITY}>Activity</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start">
                <Star size={18} className="text-emerald-500 mr-3 mt-0.5 shrink-0" />
                <p className="text-[11px] text-emerald-800 font-bold leading-relaxed uppercase tracking-wider">
                  Registering will auto-generate a secure coach profile for faculty access.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center group"
                >
                  Confirm Registration <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition"
                >
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

export default Teams;