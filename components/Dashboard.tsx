
import React, { useMemo, useState } from 'react';
import { Workout } from '../types';
import { format } from 'date-fns';
import { ICONS, OTB_PINK } from '../constants';
import WorkoutViewer from './WorkoutViewer';

interface DashboardProps {
  workouts: Workout[];
  selectedDate: Date;
  onEdit: (workout: Workout) => void;
  onClone: (workout: Workout) => void;
  onSaveToLibrary: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onAddSlot: () => void;
  onShare: (data: any, type: 'wod' | 'day') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, selectedDate, onEdit, onClone, onSaveToLibrary, onDelete, onAddSlot, onShare }) => {
  const [showLaunchGuide, setShowLaunchGuide] = useState(false);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const daySessions = useMemo(() => {
    return workouts
      .filter(w => w.date === dateStr)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [workouts, dateStr]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">The Schedule</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              Viewing {daySessions.length} sessions for {format(selectedDate, 'EEEE, MMM do')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {daySessions.length > 0 && (
            <button 
              onClick={() => onShare(daySessions, 'day')}
              className="flex-1 md:flex-none glass border-[#ED117E]/50 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-[#ED117E] flex items-center justify-center gap-3 hover:bg-[#ED117E]/10 transition-all"
            >
              <ICONS.Share /> Share Day
            </button>
          )}
          <button 
            onClick={onAddSlot}
            className="flex-1 md:flex-none otb-gradient px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-[#ED117E]/40 active:scale-95 transition-all"
          >
            Program New
          </button>
        </div>
      </div>

      {daySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-white/10">
          <div className="p-6 bg-white/5 rounded-full mb-6">
            <ICONS.Calendar />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Empty Schedule</h2>
          <p className="text-gray-500 mb-8 text-center max-w-xs">Nothing programmed for {format(selectedDate, 'EEEE')} yet.</p>
          <button 
            onClick={onAddSlot}
            className="px-8 py-3 bg-[#ED117E] rounded-2xl font-black uppercase text-xs tracking-widest text-white hover:scale-105 transition-all"
          >
            Assign a WOD
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {daySessions.map(session => (
            <div key={session.id} className="relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#ED117E] text-white px-5 py-2 rounded-2xl font-black text-xl shadow-xl shadow-[#ED117E]/30 relative z-10">
                    {session.timeSlot}
                  </div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter truncate max-w-[200px] md:max-w-md">
                    {session.name}
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => onShare(session, 'wod')}
                    className="p-3 bg-[#ED117E]/10 text-[#ED117E] border border-[#ED117E]/20 hover:bg-[#ED117E] hover:text-white transition-all rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <ICONS.Share /> <span>Share WOD</span>
                  </button>
                  <button 
                    onClick={() => onEdit(session)} 
                    className="p-3 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <ICONS.Edit /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={() => onDelete(session.id)} 
                    className="p-3 text-gray-500 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-xl"
                  >
                    <ICONS.Trash />
                  </button>
                </div>
              </div>
              
              <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-sm group-hover:bg-white/[0.05] transition-all">
                <WorkoutViewer workout={session} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
