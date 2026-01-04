import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
// Added missing Users import from lucide-react
import { ArrowLeft, Calendar, UserCheck, ClipboardList, Settings, Download, Upload, Trash2, Save, X, AlertTriangle, Users, Camera } from 'lucide-react';
import PlayerList from '../components/PlayerList';
import AttendanceTaker from '../components/AttendanceTaker';
import ScheduleView from '../components/ScheduleView';

interface TeamDetailProps {
  teamId: string;
  onBack: () => void;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ teamId, onBack }) => {
  const { teams, getPlayersByTeam, updateTeam, deleteTeam } = useData();
  const { user } = useAuth();
  const team = teams.find(t => t.id === teamId);
  const players = getPlayersByTeam(teamId);
  
  const [activeTab, setActiveTab] = useState<'roster' | 'schedule'>('roster');
  const [showAttendance, setShowAttendance] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for Team Editing
  const [editCoachName, setEditCoachName] = useState('');
  const [editCoachDate, setEditCoachDate] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  if (!team) return <div>Team not found</div>;

  // Admin and Master In-Charge have full management access.
  const isAdmin = user?.role === UserRole.ADMIN;
  const isMIC = user?.role === UserRole.MASTER_IN_CHARGE;
  const isPrincipal = user?.role === UserRole.PRINCIPAL;
  
  const isManagement = isPrincipal || isMIC || isAdmin;
  const isMyTeam = user?.role === UserRole.COACH && user.assignedTeamId === teamId;
  
  // Can mark attendance if assigned coach OR management/admin
  const canMarkAttendance = isMyTeam || isManagement;
  
  // Can edit team details or delete (Admin/MIC only)
  const canModifyTeam = isAdmin || isMIC;

  const handleOpenEditTeam = () => {
    setEditCoachName(team.coachName);
    setEditCoachDate(team.coachJoinedDate || '');
    setEditImageUrl(team.imageUrl || '');
    setShowEditTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam({
      ...team,
      coachName: editCoachName,
      coachJoinedDate: editCoachDate,
      imageUrl: editImageUrl
    });
    setShowEditTeamModal(false);
  };

  const handleDeleteTeam = () => {
    deleteTeam(teamId);
    onBack();
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

  const handleExportData = () => {
    const headers = ['Player Name', 'Grade', 'Position', 'Joined Date', 'Parent Contact', 'Attendance Rate %', 'Status'];
    const rows = players.map(p => [p.name, p.grade, p.position, p.joinedDate, p.contactParent, p.attendanceRate.toString(), p.status]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${team.name}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {showAttendance && (
        <AttendanceTaker teamId={teamId} onClose={() => setShowAttendance(false)} />
      )}

      {/* Team Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete {team.name}?</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              This will permanently remove the team, its roster, and its coach login. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteTeam}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
              >
                Yes, Delete Team
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-slate-800">Team Settings</h3>
               <button onClick={() => setShowEditTeamModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition"><X size={24} /></button>
             </div>
             <form onSubmit={handleSaveTeam} className="space-y-6">
                <div className="flex justify-center">
                   <div className="relative group">
                     <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {editImageUrl ? (
                          <img src={editImageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-4xl">{team.icon}</span>
                        )}
                     </div>
                     <button 
                       type="button" 
                       onClick={() => handleImageUpload((url) => setEditImageUrl(url))}
                       className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition"
                     >
                       <Camera size={18} />
                     </button>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1 uppercase tracking-wide">Coach Title/Name</label>
                    <input 
                        type="text" 
                        value={editCoachName}
                        onChange={(e) => setEditCoachName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-semibold"
                        required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1 uppercase tracking-wide">Coach Joined Date</label>
                    <input 
                        type="date" 
                        value={editCoachDate}
                        onChange={(e) => setEditCoachDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                   <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-xl hover:bg-emerald-700 transition">
                     Update Details
                   </button>
                   {isAdmin && (
                     <button 
                       type="button" 
                       onClick={() => { setShowEditTeamModal(false); setShowDeleteConfirm(true); }}
                       className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center"
                     >
                       <Trash2 size={18} className="mr-2" /> Delete Entire Team
                     </button>
                   )}
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-6 p-3 rounded-2xl hover:bg-slate-100 text-slate-600 transition bg-slate-50 border border-slate-100"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-3xl border border-slate-100 overflow-hidden">
                {team.imageUrl ? (
                  <img src={team.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-5xl">{team.icon}</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                   <span className="flex items-center"><Users size={16} className="mr-2 text-slate-400"/> Coach: <span className="font-bold text-slate-800 ml-1">{team.coachName}</span></span>
                   {team.coachJoinedDate && <span>• Started {new Date(team.coachJoinedDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            {canMarkAttendance && (
                <button 
                  onClick={() => setShowAttendance(true)}
                  className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-xl"
                >
                  <UserCheck size={20} className="mr-2" />
                  Mark Attendance
                </button>
            )}
            {canModifyTeam && (
              <button 
                onClick={handleOpenEditTeam}
                className="p-4 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>

        {canModifyTeam && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
             <button 
               onClick={handleExportData}
               className="flex items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-100 border border-emerald-100 transition"
             >
               <Download size={18} className="mr-2" /> Download Roster
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-100 border border-blue-100 transition"
             >
               <Upload size={18} className="mr-2" /> Import Data
             </button>
             <input type="file" ref={fileInputRef} onChange={(e) => alert('Upload logic simulation complete.')} accept=".csv" className="hidden" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 self-start w-fit">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'roster' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Roster
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'schedule' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Schedule
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'roster' && <PlayerList teamId={teamId} />}
        {activeTab === 'schedule' && <ScheduleView teamId={teamId} />}
      </div>
    </div>
  );
};

export default TeamDetail;