import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, Calendar, CheckCircle, XCircle, Stethoscope, HelpCircle, Filter, Plus, ClipboardCheck, X, ChevronRight } from 'lucide-react';
import { UserRole, Team } from '../types';
import AttendanceTaker from '../components/AttendanceTaker';

const AttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const { players, attendance, teams } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  
  // Taker selection logic
  const [showTaker, setShowTaker] = useState(false);
  const [takerTeamId, setTakerTeamId] = useState<string | null>(null);
  const [showTeamPicker, setShowTeamPicker] = useState(false);

  // Determine which players the current user can see
  const visiblePlayers = useMemo(() => {
    if (user?.role === UserRole.PARENT) {
      return players.filter(p => user.linkedPlayerIds?.includes(p.id) || p.id === user.linkedPlayerId);
    }
    return players;
  }, [user, players]);

  // Determine which teams the user can mark attendance for
  const manageableTeams = useMemo(() => {
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.MASTER_IN_CHARGE || user?.role === UserRole.PRINCIPAL) {
      return teams;
    }
    if (user?.role === UserRole.COACH && user.assignedTeamId) {
      return teams.filter(t => t.id === user.assignedTeamId);
    }
    return [];
  }, [user, teams]);

  // Handle initial selection for parents
  useState(() => {
    if (user?.role === UserRole.PARENT && visiblePlayers.length > 0) {
      setSelectedPlayerId(visiblePlayers[0].id);
    }
  });

  const filteredPlayers = visiblePlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const playerRecords = attendance
    .filter(a => a.playerId === selectedPlayerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'Absent': return <XCircle className="text-red-500" size={18} />;
      case 'Medical': return <Stethoscope className="text-amber-500" size={18} />;
      case 'Other': return <HelpCircle className="text-slate-500" size={18} />;
      default: return null;
    }
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Unknown';

  const startTaker = (teamId: string) => {
    setTakerTeamId(teamId);
    setShowTaker(true);
    setShowTeamPicker(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showTaker && takerTeamId && (
        <AttendanceTaker teamId={takerTeamId} onClose={() => setShowTaker(false)} />
      )}

      {showTeamPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowTeamPicker(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Daily Roll Call</h3>
              <button onClick={() => setShowTeamPicker(false)} className="p-2 rounded-full hover:bg-white text-slate-400 transition shadow-sm border border-slate-100"><X size={24}/></button>
            </div>
            <div className="p-8 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Team to Mark Attendance</p>
              {manageableTeams.map(team => (
                <button 
                  key={team.id}
                  onClick={() => startTaker(team.id)}
                  className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 group transition-all"
                >
                  <div className="flex items-center">
                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">{team.icon}</div>
                    <div className="text-left">
                      <div className="font-black text-slate-800 group-hover:text-emerald-900">{team.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest">{team.coachName}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Attendance History</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center">
            <ClipboardCheck size={14} className="mr-2 text-emerald-600" /> Institution Participation Audit
          </p>
        </div>
        
        {manageableTeams.length > 0 && (
          <button 
            onClick={() => setShowTeamPicker(true)}
            className="flex items-center px-8 py-5 bg-emerald-600 text-white rounded-[2rem] shadow-2xl hover:bg-emerald-700 transition-all font-black text-sm group active:scale-95"
          >
            <Plus size={20} className="mr-3 group-hover:rotate-90 transition-transform" /> Record New Session
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Player Search/Filter */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
              <Filter size={14} className="mr-3 text-emerald-500" /> Student Directory
            </h3>
            
            {user?.role !== UserRole.PARENT && (
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Filter name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                />
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`w-full text-left p-4 rounded-2xl flex items-center transition-all ${
                    selectedPlayerId === p.id 
                      ? 'bg-slate-900 text-white shadow-xl translate-x-2' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.name}&background=f1f5f9&color=64748b`} className="w-10 h-10 rounded-xl mr-4 object-cover" />
                  <div className="overflow-hidden">
                    <p className="font-black truncate text-sm leading-tight">{p.name}</p>
                    <p className={`text-[9px] uppercase font-bold truncate tracking-widest mt-1 ${selectedPlayerId === p.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {getTeamName(p.teamId)}
                    </p>
                  </div>
                </button>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs font-bold italic opacity-50">No students found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Content: Selected Player History */}
        <div className="lg:col-span-2">
          {selectedPlayer ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center w-full">
                  <img src={selectedPlayer.avatarUrl || `https://ui-avatars.com/api/?name=${selectedPlayer.name}&background=10b981&color=fff`} className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white mr-6" />
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPlayer.name}</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center">
                       <Calendar size={14} className="mr-2" /> Activity Log History
                    </p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 min-w-[140px] text-center">
                   <div className="text-3xl font-black text-emerald-600 leading-none">{selectedPlayer.attendanceRate}%</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Retention Rate</div>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {playerRecords.length === 0 ? (
                  <div className="p-24 text-center text-slate-400 flex flex-col items-center">
                    <div className="bg-slate-50 p-8 rounded-full mb-6">
                      <Calendar className="opacity-20" size={64} />
                    </div>
                    <p className="font-bold text-lg italic opacity-50">No historical records available.</p>
                  </div>
                ) : (
                  playerRecords.map(record => (
                    <div key={record.id} className="p-8 hover:bg-slate-50/50 transition flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center mr-6 shadow-sm">
                           <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(record.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                           <span className="text-xl font-black text-slate-800 leading-none">{new Date(record.date).getDate()}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg tracking-tight">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Session Log</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-105">
                        <span className="mr-3">{getStatusIcon(record.status)}</span>
                        <span className="font-black text-xs text-slate-700 uppercase tracking-widest">{record.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-dashed border-slate-200 p-24 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-10 rounded-full mb-8">
                <User size={80} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-2">Select Student Profile</h3>
              <p className="text-slate-300 font-bold text-sm max-w-xs">Audit individual participation and health status history from the left directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;