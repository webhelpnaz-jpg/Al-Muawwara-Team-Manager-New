import React, { useState, useEffect } from 'react';
import { Player, AttendanceRecord } from '../types';
import { useData } from '../contexts/DataContext';
import { Check, X, Stethoscope, HelpCircle, Save, ArrowLeft, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceTakerProps {
  teamId: string;
  onClose: () => void;
}

const AttendanceTaker: React.FC<AttendanceTakerProps> = ({ teamId, onClose }) => {
  const { getPlayersByTeam, markAttendance, attendance } = useData();
  const players = getPlayersByTeam(teamId);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Medical' | 'Other'>>({});

  useEffect(() => {
    // Check if there are existing records for this date/team
    const existing = attendance.filter(a => a.teamId === teamId && a.date === selectedDate);
    const initial: any = {};
    
    players.forEach(p => {
      const match = existing.find(e => e.playerId === p.id);
      initial[p.id] = match ? match.status : 'Present';
    });
    
    setRecords(initial);
  }, [players, selectedDate, teamId, attendance]);

  const setStatus = (playerId: string, status: 'Present' | 'Absent' | 'Medical' | 'Other') => {
    setRecords(prev => ({ ...prev, [playerId]: status }));
  };

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = Object.keys(records).map(playerId => ({
      id: `${playerId}-${selectedDate}`,
      playerId,
      teamId,
      date: selectedDate,
      status: records[playerId]
    }));
    markAttendance(recordsToSave);
    
    // Visual feedback would be nice, but simple onClose works too
    alert(`Successfully synced ${recordsToSave.length} records for ${selectedDate}`);
    onClose();
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const StatusButton = ({ status, active, onClick, icon: Icon, colorClass }: any) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all active:scale-95
        ${active ? `${colorClass} shadow-lg scale-105 ring-2 ring-white/20` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
      `}
    >
      <Icon size={20} strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-widest mt-2">{status}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-white border-b border-slate-200 px-6 h-28 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl mr-4 hover:bg-slate-200 transition">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xl font-black text-slate-900 leading-none">Attendance Log</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Team Roll Call</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors"><ChevronLeft size={18} /></button>
           <div className="relative">
             <input 
               type="date" 
               value={selectedDate} 
               onChange={(e) => setSelectedDate(e.target.value)}
               className="bg-transparent font-black text-sm uppercase tracking-tight text-slate-800 outline-none cursor-pointer px-2"
             />
           </div>
           <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white rounded-xl transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="hidden md:flex bg-emerald-50 px-5 py-2.5 rounded-2xl text-emerald-700 font-black text-xs border border-emerald-100">
          {players.length} Students Assigned
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {players.map(player => (
          <div 
            key={player.id} 
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center mb-8">
              <img src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name}&background=f1f5f9&color=64748b`} className="w-14 h-14 rounded-2xl object-cover mr-4 shadow-sm" />
              <div className="flex-1">
                <div className="font-black text-slate-900 text-lg leading-none">{player.name}</div>
                <div className="flex items-center mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{player.position}</span>
                  <span className="mx-2 w-1 h-1 rounded-full bg-slate-200"></span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Grade {player.grade}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <StatusButton 
                status="Present" 
                active={records[player.id] === 'Present'} 
                onClick={() => setStatus(player.id, 'Present')} 
                icon={Check} 
                colorClass="bg-emerald-500 border-emerald-500 text-white" 
              />
              <StatusButton 
                status="Absent" 
                active={records[player.id] === 'Absent'} 
                onClick={() => setStatus(player.id, 'Absent')} 
                icon={X} 
                colorClass="bg-red-500 border-red-500 text-white" 
              />
              <StatusButton 
                status="Medical" 
                active={records[player.id] === 'Medical'} 
                onClick={() => setStatus(player.id, 'Medical')} 
                icon={Stethoscope} 
                colorClass="bg-amber-500 border-amber-500 text-white" 
              />
              <StatusButton 
                status="Other" 
                active={records[player.id] === 'Other'} 
                onClick={() => setStatus(player.id, 'Other')} 
                icon={HelpCircle} 
                colorClass="bg-slate-700 border-slate-700 text-white" 
              />
            </div>
          </div>
        ))}
        {players.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="bg-slate-100 p-8 rounded-full mb-6">
                <Users size={64} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold italic">No students assigned to this team.</p>
            </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-100 p-8 flex flex-col gap-4 safe-area-bottom shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.08)]">
        <button 
          onClick={handleSave}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl flex justify-center items-center hover:bg-emerald-600 transition-all active:scale-95 group"
        >
          <Save size={20} className="mr-3 group-hover:rotate-12 transition-transform" /> Sync {selectedDate} Records
        </button>
        <button 
          onClick={onClose}
          className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition uppercase text-xs tracking-widest"
        >
          Cancel and Exit
        </button>
      </div>
    </div>
  );
};

export default AttendanceTaker;