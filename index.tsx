import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';

// --- OTB BRANDING CONSTANTS ---
const OTB_PINK = '#ED117E';
const DARK_BG = '#000000';
const GLASS_BG = 'rgba(255, 255, 255, 0.03)';

enum ExerciseCategory {
  CARDIO = 'Cardio',
  CROSSFIT = 'CrossFit',
  HYROX = 'Hyrox',
  STRENGTH = 'Strength'
}

interface Exercise {
  id: string;
  name: string;
  reps?: string;
  time?: string;
  videoUrl?: string; // Blob or Public Link
  isSuperset: boolean;
}

interface LibraryExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  videoUrl?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  warmup: Exercise[];
  wod1: Exercise[];
  wod2: Exercise[];
  finisher: Exercise[];
  cooldown: Exercise[];
  coachNotes?: string;
}

interface Workout extends WorkoutTemplate {
  date: string;
  timeSlot: string;
}

// --- ICON SYSTEM ---
const Icon = {
  Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Chevron: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  Share: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Warning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Lion: () => (
    <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
      <path d="M50 10 L90 35 L90 65 L50 90 L10 65 L10 35 Z" stroke={OTB_PINK} strokeWidth="6"/>
      <path d="M35 50 L45 60 L65 40" stroke={OTB_PINK} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// --- CORE APPLICATION ---
const App: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => JSON.parse(localStorage.getItem('otb_workouts_final') || '[]'));
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => JSON.parse(localStorage.getItem('otb_templates_final') || '[]'));
  const [lib, setLib] = useState<LibraryExercise[]>(() => JSON.parse(localStorage.getItem('otb_lib_final') || '[]'));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'dashboard' | 'library' | 'exercises' | 'share' | 'editor'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isTemplateEdit, setIsTemplateEdit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => localStorage.setItem('otb_workouts_final', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('otb_templates_final', JSON.stringify(templates)), [templates]);
  useEffect(() => localStorage.setItem('otb_lib_final', JSON.stringify(lib)), [lib]);

  // --- SYNC / IMPORT LOGIC (THE FIX) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('wod') || params.get('day') || params.get('blueprint');
    
    if (shared) {
      setIsSyncing(true);
      setTimeout(() => {
        try {
          // Robust Base64 Decoding for Special Characters
          const decoded = JSON.parse(decodeURIComponent(escape(atob(shared))));
          const items = Array.isArray(decoded) ? decoded : [decoded];

          if (params.has('blueprint')) {
            setTemplates(prev => {
              const ids = new Set(items.map((i: any) => i.id));
              return [...prev.filter(p => !ids.has(p.id)), ...items];
            });
            setToast("BLUEPRINTS SYNCED TO TEAM LIBRARY");
          } else {
            setWorkouts(prev => {
              const ids = new Set(items.map((i: any) => i.id));
              return [...prev.filter(p => !ids.has(p.id)), ...items];
            });
            if (items[0].date) setSelectedDate(parseISO(items[0].date));
            setToast(`${items.length} SESSIONS SYNCED TO YOUR SCHEDULE`);
          }
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.error("Sync Error:", e);
          setToast("SYNC FAILED: DATA CORRUPT OR TOO LARGE");
        } finally {
          setIsSyncing(false);
        }
      }, 1000);
    }
  }, []);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayWods = useMemo(() => workouts.filter(w => w.date === dateStr).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)), [workouts, dateStr]);

  // --- SHARE ENGINE (THE FIX) ---
  const handleShare = async (data: any, type: 'wod' | 'day' | 'blueprint') => {
    try {
      // Scrub local video blobs (they won't work on other devices)
      const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
        if (key === 'videoUrl' && value && value.startsWith('blob:')) return ''; 
        return value;
      }));

      const payload = btoa(unescape(encodeURIComponent(JSON.stringify(sanitized))));
      const url = `${window.location.origin}${window.location.pathname}?${type}=${payload}`;
      
      if (url.length > 2000) {
        setToast("WOD TOO BIG FOR LINK - USE JSON EXPORT");
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: 'OTB PROGRAMMING', text: `Check this OTB Session:`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("TEAM SYNC LINK COPIED");
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setToast("SHARE FAILED");
    }
  };

  if (isSyncing) {
    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center text-center p-12">
        <div className="animate-pulse mb-8"><Icon.Lion /></div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Establishing Team Sync...</h2>
        <p className="text-[#ED117E] font-black uppercase tracking-[0.4em] text-[10px] mt-4">Connecting to OTB Global Grid</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-black text-white selection:bg-[#ED117E] selection:text-white">
      
      {/* Notifications */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-[#ED117E] text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest shadow-2xl flex items-center gap-3 animate-bounce">
          <Icon.Check /> {toast}
          <button onClick={() => setToast(null)} className="ml-4 opacity-50">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-[100] glass border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
            <Icon.Lion />
            <div className="border-l border-white/20 pl-4 text-left">
              <h1 className="font-black text-xl leading-none uppercase italic tracking-tighter text-white">OTB<span style={{ color: OTB_PINK }}>HEALTHCLUB</span></h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.4em] uppercase mt-1">Tactical Coach Portal</p>
            </div>
          </div>

          <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'dashboard', label: 'Schedule' },
              { id: 'library', label: 'Blueprints' },
              { id: 'exercises', label: 'The Lab' },
              { id: 'share', label: 'SHARE TO TEAM', highlight: true }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setView(tab.id as any)} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                  view === tab.id 
                    ? 'bg-[#ED117E] text-white shadow-lg shadow-[#ED117E]/30' 
                    : tab.highlight 
                      ? 'text-[#ED117E] border border-[#ED117E]/20 hover:bg-[#ED117E]/10' 
                      : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Icon.Chevron /></button>
            <div className="px-5 text-center min-w-[140px]">
              <span className="block text-[8px] uppercase font-black text-[#ED117E] tracking-widest mb-1">{format(selectedDate, 'MMMM yyyy')}</span>
              <span className="block text-sm font-black text-white">{format(selectedDate, 'EEEE do')}</span>
            </div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-white/10 rounded-xl rotate-180 transition-all"><Icon.Chevron /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12 animate-up">
        
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">The Daily</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-3">Engineering Excellence: {dayWods.length} Slots</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {dayWods.length > 0 && (
                  <button 
                    onClick={() => handleShare(dayWods, 'day')}
                    className="flex-1 md:flex-none glass border-[#ED117E]/50 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 text-[#ED117E] shadow-xl hover:bg-[#ED117E] hover:text-white transition-all"
                  >
                    <Icon.Share /> SHARE FULL DAY
                  </button>
                )}
                <button 
                  onClick={() => { setIsTemplateEdit(false); setEditingId(null); setView('editor'); }} 
                  className="flex-1 md:flex-none otb-gradient px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-2xl shadow-[#ED117E]/40 active:scale-95 transition-all"
                >
                  New Program
                </button>
              </div>
            </div>

            {dayWods.length === 0 ? (
              <div className="py-40 text-center glass rounded-[4rem] border-dashed border-2 border-white/5 flex flex-col items-center">
                <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-sm mb-6">Schedule is Dormant</p>
                <button onClick={() => setView('library')} className="text-[#ED117E] text-[10px] font-black uppercase border-b border-[#ED117E] tracking-widest">Deploy Blueprint</button>
              </div>
            ) : (
              <div className="grid gap-12">
                {dayWods.map(wod => (
                  <div key={wod.id} className="glass rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:border-white/10">
                    <div className="p-8 bg-white/[0.03] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="bg-[#ED117E] text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-xl shadow-[#ED117E]/20">{wod.timeSlot}</div>
                        <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter truncate max-w-[200px] sm:max-w-md">{wod.name || 'DAILY WOD'}</h3>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => handleShare(wod, 'wod')} 
                          className="flex-1 sm:flex-none px-6 py-4 bg-[#ED117E]/10 border border-[#ED117E]/20 rounded-2xl text-[#ED117E] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ED117E] hover:text-white transition-all"
                        >
                          <Icon.Share /> SHARE
                        </button>
                        <button onClick={() => { setEditingId(wod.id); setIsTemplateEdit(false); setView('editor'); }} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all"><Icon.Edit /></button>
                        <button onClick={() => setWorkouts(p => p.filter(w => w.id !== wod.id))} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Icon.Trash /></button>
                      </div>
                    </div>
                    
                    <div className="p-10 space-y-16">
                      {['warmup', 'wod1', 'wod2', 'finisher', 'cooldown'].map(sec => {
                        const exes = wod[sec as keyof WorkoutTemplate] as Exercise[];
                        if (exes.length === 0) return null;
                        return (
                          <div key={sec}>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ED117E] mb-8 flex items-center gap-6">
                              {sec.toUpperCase().replace('WARMUP', 'Phase I: Ignite').replace('WOD1', 'Phase II: The Main').replace('WOD2', 'Phase III: Accessory').replace('FINISHER', 'Phase IV: Finish').replace('COOLDOWN', 'Phase V: Restore')}
                              <div className="h-px flex-grow bg-white/5"></div>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {exes.map(ex => (
                                <div key={ex.id} className={`p-6 rounded-[2.5rem] border transition-all ${ex.isSuperset ? 'border-[#ED117E]/40 bg-[#ED117E]/10' : 'border-white/5 bg-white/[0.01]'}`}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                      {ex.isSuperset && <span className="inline-block px-2 py-0.5 bg-[#ED117E] text-[8px] uppercase font-black text-white rounded-md mb-2">SUPERSET</span>}
                                      <h5 className="text-xl font-bold text-white mb-2">{ex.name}</h5>
                                      <div className="flex gap-4">
                                        {ex.reps && <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">Sets: <b className="text-white">{ex.reps}</b></span>}
                                        {ex.time && <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">Work: <b className="text-white">{ex.time}</b></span>}
                                      </div>
                                    </div>
                                    {ex.videoUrl && (
                                      <a href={ex.videoUrl} target="_blank" className="p-4 bg-[#ED117E] text-white rounded-full shadow-lg shadow-[#ED117E]/20 hover:scale-110 transition-transform"><Icon.Play /></a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {wod.coachNotes && (
                        <div className="bg-[#ED117E]/5 p-8 rounded-[2.5rem] border border-[#ED117E]/10">
                           <h5 className="text-[9px] font-black text-[#ED117E] uppercase tracking-widest mb-4">TACTICAL COACH INTEL</h5>
                           <p className="text-xl text-gray-300 italic font-medium leading-relaxed">"{wod.coachNotes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: SHARE TO TEAM TAB */}
        {view === 'share' && (
          <div className="animate-up max-w-3xl mx-auto space-y-16">
             <div className="text-center">
                <div className="inline-block p-10 bg-[#ED117E]/10 rounded-full mb-8 shadow-2xl shadow-[#ED117E]/10">
                  <Icon.Share />
                </div>
                <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-6 text-white">Team Sync</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-xl mx-auto leading-loose">Broadcast your programming to every OTB coach instantly. One link syncs the entire schedule.</p>
             </div>

             <div className="grid gap-8">
                <div className="glass p-10 rounded-[4rem] border border-[#ED117E]/30 flex flex-col md:flex-row items-center justify-between gap-10 bg-[#ED117E]/5">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black uppercase italic text-white mb-4">Daily Distribution</h3>
                    <p className="text-sm text-gray-500 font-medium">Broadcast all {dayWods.length} sessions for {format(selectedDate, 'EEEE')} to the team.</p>
                  </div>
                  <button 
                    disabled={dayWods.length === 0}
                    onClick={() => handleShare(dayWods, 'day')}
                    className="w-full md:w-auto px-10 py-5 bg-[#ED117E] text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#ED117E]/40 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                  >
                    SEND TEAM SYNC LINK
                  </button>
                </div>

                <div className="glass p-10 rounded-[4rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black uppercase italic text-white mb-4">Master Intel Backup</h3>
                    <p className="text-sm text-gray-500 font-medium">Download every WOD, Blueprint, and Lab entry as a single master file.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        const data = JSON.stringify({ workouts, templates, lib });
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `OTB_MASTER_EXPORT.json`; a.click();
                      }}
                      className="px-8 py-5 glass border border-white/20 rounded-[2rem] font-black uppercase text-xs tracking-widest text-white hover:bg-white/10"
                    >
                      Export All
                    </button>
                    <label className="px-8 py-5 glass border border-white/10 rounded-[2rem] font-black uppercase text-xs tracking-widest text-gray-500 text-center cursor-pointer hover:text-white transition-all">
                      Import File
                      <input type="file" accept=".json" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const imp = JSON.parse(ev.target?.result as string);
                              if (imp.workouts) setWorkouts(imp.workouts);
                              if (imp.templates) setTemplates(imp.templates