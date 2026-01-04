import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { generateAttendanceInsights } from '../services/geminiService';
import { UserRole, Player, Team } from '../types';
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  User,
  Stethoscope,
  HelpCircle,
  UserPlus,
  PlusSquare,
  ClipboardCheck,
  UserCog
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#64748b'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { players, teams, attendance, schedule } = useData();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const navigate = useNavigate();

  // --- PARENT VIEW LOGIC ---
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  useEffect(() => {
    if (user?.role === UserRole.PARENT) {
      if (user.linkedPlayerIds && user.linkedPlayerIds.length > 0) {
        setSelectedPlayerId(user.linkedPlayerIds[0]);
      } else if (user.linkedPlayerId) {
        setSelectedPlayerId(user.linkedPlayerId);
      }
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-100';
      case 'Medical': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Other': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle size={14} className="mr-1" />;
      case 'Absent': return <XCircle size={14} className="mr-1" />;
      case 'Medical': return <Stethoscope size={14} className="mr-1" />;
      case 'Other': return <HelpCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  if (user?.role === UserRole.PARENT) {
    const parentPlayers = players.filter(p => user.linkedPlayerIds?.includes(p.id) || p.id === user.linkedPlayerId);
    const selectedPlayer = parentPlayers.find(p => p.id === selectedPlayerId) || parentPlayers[0];

    if (!selectedPlayer) return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <Users size={48} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 mt-2 max-w-xs">Please contact school administration to link your student's account.</p>
      </div>
    );

    const childTeam = teams.find(t => t.id === selectedPlayer.teamId);
    const childAttendance = attendance
      .filter(a => a.playerId === selectedPlayer.id)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    const nextEvent = schedule
      .filter(e => e.teamId === selectedPlayer.teamId && new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Parent Portal</h1>
                <p className="text-slate-500 font-medium">Monitoring academic and athletic progression.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 min-w-[220px]">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-4 top-2 z-10">Student Profile</label>
                  <select 
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full pl-4 pr-10 pt-6 pb-2 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 appearance-none font-bold text-slate-800 outline-none transition-all"
                  >
                    {parentPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 mt-2 text-slate-400 pointer-events-none" size={18} />
                </div>

                <div className="relative flex-1 min-w-[180px]">
                  <label className="text-[10px] uppercase font-bold text-slate-400 absolute left-4 top-2 z-10">Primary Activity</label>
                  <div className="w-full pl-4 pr-4 pt-6 pb-2 border border-emerald-100 rounded-2xl bg-emerald-50/50 font-bold text-emerald-800 flex items-center h-full">
                    <span className="mr-2 text-xl">{childTeam?.icon}</span>
                    {childTeam?.name}
                  </div>
                </div>
           </div>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                  <img 
                    src={selectedPlayer.avatarUrl || `https://ui-avatars.com/api/?name=${selectedPlayer.name}&background=10b981&color=fff&size=128`} 
                    alt={selectedPlayer.name}
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl relative z-10"
                  />
                  <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border-2 border-white z-20 ${selectedPlayer.status === 'Medical' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                    {selectedPlayer.status === 'Medical' ? <Stethoscope size={18} className="text-white" /> : <Trophy size={18} className="text-white" />}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedPlayer.name}</h3>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-1">Grade {selectedPlayer.grade} Student-Athlete</p>
                
                <div className="mt-8 w-full pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-3xl font-black text-emerald-600 leading-none">{selectedPlayer.attendanceRate}%</div>
                    <div className="text-[10px] uppercase font-extrabold text-slate-400 mt-2">Participation</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className={`text-xl font-black ${selectedPlayer.status === 'Medical' ? 'text-amber-600' : 'text-slate-800'}`}>
                      {selectedPlayer.status}
                    </div>
                    <div className="text-[10px] uppercase font-extrabold text-slate-400 mt-2">Status</div>
                  </div>
                </div>
           </div>

           <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2rem] shadow-xl flex flex-col text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center relative z-10">
                <Calendar className="mr-3 text-emerald-400" /> Training Itinerary
              </h3>
              {nextEvent ? (
                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <div className="text-xs font-black text-emerald-400 uppercase mb-3 tracking-[0.2em]">{nextEvent.type} Session</div>
                    <div className="text-4xl font-black text-white mb-6 tracking-tight group-hover:translate-x-1 transition-transform">{nextEvent.title}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="flex items-center font-bold bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                           <Clock size={20} className="mr-3 text-emerald-400"/> {nextEvent.startTime}
                         </div>
                         <div className="flex items-center font-bold bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                           <Calendar size={20} className="mr-3 text-emerald-400"/> {new Date(nextEvent.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                         </div>
                         <div className="sm:col-span-2 flex items-center font-bold bg-emerald-500 text-slate-900 p-4 rounded-2xl">
                           <HelpCircle size={20} className="mr-3"/> Location: {nextEvent.location}
                         </div>
                    </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-500 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <Clock size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg opacity-50 italic">No scheduled training sessions.</p>
                </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <TrendingUp className="mr-3 text-emerald-500" /> Recent Activity Log
              </h3>
              <div className="space-y-4">
                 {childAttendance.length === 0 && (
                   <div className="text-center py-12 text-slate-400 font-medium italic">No attendance data recorded.</div>
                 )}
                 {childAttendance.map(record => (
                   <div key={record.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 text-slate-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Verified Log</div>
                        </div>
                      </div>
                      <span className={`
                        px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center shadow-sm transition-transform hover:scale-105
                        ${getStatusBadge(record.status)}
                      `}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <Sparkles className="mr-3 text-indigo-500" /> Coach Performance Notes
              </h3>
              <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2rem] border border-indigo-100 min-h-[180px] flex flex-col">
                {selectedPlayer.performanceNotes ? (
                  <p className="text-slate-700 italic leading-relaxed font-bold text-lg flex-1">
                    "{selectedPlayer.performanceNotes}"
                  </p>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-slate-300 italic">
                    <Sparkles size={40} className="mb-2 opacity-20" />
                    <p>First evaluation pending completion.</p>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-indigo-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{childTeam?.name} Team Faculty</span>
                  <div className="flex space-x-1.5">
                    {[1,2,3].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>)}
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- STAFF VIEW LOGIC ---
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = { 
    totalPlayers: players.length, 
    activeTeams: teams.length, 
    attendanceToday: attendance.filter(a => a.date === todayStr && a.status === 'Present').length, 
    upcomingEvents: schedule.filter(e => e.date >= todayStr).length 
  };

  const attendanceByTeam = teams.map(team => {
    const teamPlayers = players.filter(p => p.teamId === team.id);
    const avgRate = teamPlayers.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (teamPlayers.length || 1);
    return { name: team.name, attendance: Math.round(avgRate) };
  }).sort((a,b) => b.attendance - a.attendance).slice(0, 5);

  const statusDistribution = [
    { name: 'Present', value: attendance.filter(a => a.status === 'Present').length },
    { name: 'Absent', value: attendance.filter(a => a.status === 'Absent').length },
    { name: 'Medical', value: attendance.filter(a => a.status === 'Medical').length },
    { name: 'Other', value: attendance.filter(a => a.status === 'Other').length },
  ];

  const handleGetInsights = async () => {
    setLoadingInsight(true);
    const result = await generateAttendanceInsights(stats, teams.slice(0,3));
    setInsight(result);
    setLoadingInsight(false);
  };

  const QuickAction = ({ title, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100 transition-all group active:scale-95"
    >
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
      <span className="font-extrabold text-slate-800 text-sm tracking-tight">{title}</span>
    </button>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Management Portal</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest flex items-center">
            <Clock size={14} className="mr-2" /> Live Snapshot • {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={handleGetInsights}
          disabled={loadingInsight}
          className="flex items-center px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 font-black text-sm group"
        >
          {loadingInsight ? <Loader2 className="animate-spin mr-3" size={20}/> : <Sparkles className="mr-3 text-emerald-400 group-hover:scale-125 transition-transform" size={20}/>}
          Generate AI Report
        </button>
      </div>

      {insight && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-emerald-900 text-[15px] font-bold leading-relaxed shadow-sm animate-in slide-in-from-top duration-500">
          <div className="flex items-center mb-2">
            <Sparkles size={18} className="mr-2 text-emerald-500" />
            <span className="uppercase text-[10px] tracking-widest text-emerald-600">Executive Summary</span>
          </div>
          {insight}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <QuickAction title="Check Teams" icon={Trophy} onClick={() => navigate('/teams')} color="bg-blue-600" />
        <QuickAction title="Roll Call" icon={ClipboardCheck} onClick={() => navigate('/attendance')} color="bg-emerald-600" />
        <QuickAction title="Plan Practice" icon={Calendar} onClick={() => navigate('/schedule')} color="bg-purple-600" />
        {user?.role === UserRole.ADMIN && <QuickAction title="User Hub" icon={UserCog} onClick={() => navigate('/admin')} color="bg-orange-600" />}
      </div>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Players', val: stats.totalPlayers, icon: Users, col: 'emerald' },
          { label: 'Active Teams', val: stats.activeTeams, icon: Trophy, col: 'blue' },
          { label: 'Today Presence', val: stats.attendanceToday, icon: TrendingUp, col: 'orange' },
          { label: 'Upcoming', val: stats.upcomingEvents, icon: Calendar, col: 'purple' }
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{s.val}</h3>
            </div>
            <div className={`p-4 rounded-2xl bg-${s.col}-50 text-${s.col}-600 group-hover:rotate-12 transition-transform`}>
              <s.icon size={26} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
            <TrendingUp className="mr-3 text-emerald-500" /> Performance Index by Team
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByTeam}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={11} fontWeight={700} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}} />
                <Bar dataKey="attendance" fill="#10b981" radius={[12, 12, 12, 12]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-900 mb-8 w-full text-left">Engagement Mix</h3>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 leading-none">{attendance.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Logs</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-full mt-6">
            {statusDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs font-bold text-slate-500">{entry.name}</span>
                <span className="ml-auto text-xs font-black text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;