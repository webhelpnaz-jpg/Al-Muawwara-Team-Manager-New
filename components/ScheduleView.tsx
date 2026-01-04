import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, Plus, FileText, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import { UserRole, ScheduleEvent } from '../types';

interface ScheduleViewProps {
  teamId?: string;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ teamId }) => {
  const { schedule, addEvent, teams } = useData();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  const events = teamId ? schedule.filter(e => e.teamId === teamId) : schedule;
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Management and Admins can edit anywhere. Coaches only their assigned team.
  const isManagement = user?.role === UserRole.ADMIN || 
                       user?.role === UserRole.MASTER_IN_CHARGE || 
                       user?.role === UserRole.PRINCIPAL;

  const canEdit = isManagement || (teamId && user?.role === UserRole.COACH && user.assignedTeamId === teamId);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTeamId = teamId || selectedTeamId;
    if (!finalTeamId) {
      alert("Please select a team for this event.");
      return;
    }
    
    addEvent({
      id: `evt-${Date.now()}`, 
      teamId: finalTeamId, 
      title, 
      date, 
      startTime,
      endTime: '00:00', 
      location, 
      type: 'Practice', 
      note
    });
    
    setShowAdd(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSelectedTeamId(teamId || '');
    setDate('');
    setStartTime('');
    setLocation('');
    setNote('');
  };

  const getTeamInfo = (tId: string) => teams.find(t => t.id === tId);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
             <CalendarIcon size={20} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-800">{teamId ? 'Team Schedule' : 'Master Calendar'}</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{events.length} Upcoming Sessions</p>
           </div>
        </div>
        {canEdit && (
          <button 
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg active:scale-95"
          >
            <Plus size={20} className="mr-2" /> Add Event
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <CalendarIcon size={64} className="mb-4 opacity-20" />
            <p className="font-bold">No sessions scheduled on the calendar.</p>
          </div>
        )}

        {events.map(event => {
          const tInfo = getTeamInfo(event.teamId);
          return (
            <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4 items-start">
                   <div className="flex flex-col items-center justify-center bg-slate-100 rounded-2xl p-4 min-w-[80px] group-hover:bg-emerald-50 transition-colors">
                      <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-slate-800 leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                          {event.type}
                        </span>
                        {!teamId && tInfo && (
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            {tInfo.icon} {tInfo.name}
                          </span>
                        )}
                     </div>
                     <h4 className="font-black text-slate-800 text-xl tracking-tight">{event.title}</h4>
                     <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium text-slate-500 mt-2">
                        <div className="flex items-center"><Clock size={16} className="mr-2 text-slate-300" /> {event.startTime}</div>
                        <div className="flex items-center"><MapPin size={16} className="mr-2 text-slate-300" /> {event.location}</div>
                     </div>
                   </div>
                </div>
              </div>

              {event.note && (
                <div className="mt-6 pt-4 border-t border-slate-50 text-sm font-medium text-slate-600 flex items-start bg-slate-50 p-4 rounded-xl italic">
                  <FileText size={18} className="mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                  " {event.note} "
                </div>
              )}
            </div>
          );
        })}
      </div>

       {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">New Session</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-6">
              {!teamId && (
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Select Team</label>
                  <div className="relative">
                    <select 
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold appearance-none"
                      required
                    >
                      <option value="" disabled>Choose a Team</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Session Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-semibold" placeholder="e.g. Tactical Review" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Venue</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="Court / Pitch Location" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Special Instructions</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold h-24" placeholder="Mention equipment or focus areas..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition">Save to Calendar</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;