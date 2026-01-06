
import React, { useState, useEffect } from 'react';
import { Workout, AppState, WorkoutTemplate, LibraryExercise } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import ExerciseLibrary from './components/ExerciseLibrary';
import WorkoutEditor from './components/WorkoutEditor';
import { format, parseISO } from 'date-fns';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const savedWorkouts = localStorage.getItem('otb_workouts');
    const savedTemplates = localStorage.getItem('otb_templates');
    const savedExLibrary = localStorage.getItem('otb_exercises');
    return {
      workouts: savedWorkouts ? JSON.parse(savedWorkouts) : [],
      templates: savedTemplates ? JSON.parse(savedTemplates) : [],
      exerciseLibrary: savedExLibrary ? JSON.parse(savedExLibrary) : [],
      selectedDate: new Date(),
      viewMode: 'dashboard',
    };
  });

  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('otb_workouts', JSON.stringify(state.workouts));
  }, [state.workouts]);

  useEffect(() => {
    localStorage.setItem('otb_templates', JSON.stringify(state.templates));
  }, [state.templates]);

  useEffect(() => {
    localStorage.setItem('otb_exercises', JSON.stringify(state.exerciseLibrary));
  }, [state.exerciseLibrary]);

  // Handle incoming shared links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('wod') || params.get('day') || params.get('blueprint');
    
    if (sharedData) {
      setIsSyncing(true);
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        const items = Array.isArray(decoded) ? decoded : [decoded];

        if (params.has('blueprint')) {
          setState(prev => ({ ...prev, templates: [...prev.templates, ...items] }));
          setToast("BLUEPRINT IMPORTED");
        } else {
          setState(prev => ({ 
            ...prev, 
            workouts: [...prev.workouts.filter(w => !items.find(i => i.id === w.id)), ...items] 
          }));
          if (items[0].date) setState(prev => ({ ...prev, selectedDate: parseISO(items[0].date) }));
          setToast(`${items.length} WOD(s) SYNCED TO TEAM`);
        }
        
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        setToast("SYNC FAILED: INVALID INTEL");
      } finally {
        setTimeout(() => setIsSyncing(false), 1200);
      }
    }
  }, []);

  const handleShare = async (data: any, type: string) => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}${window.location.pathname}?${type}=${encoded}`;
      
      if (url.length > 2000) {
        setToast("WOD TOO HEAVY FOR LINK - USE JSON EXPORT");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `OTB ${type.toUpperCase()}`,
          text: `Here is the OTB program for you:`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("LINK COPIED TO CLIPBOARD");
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setToast("SHARE FAILED");
    }
  };

  const setView = (mode: AppState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode: mode }));
    if (mode !== 'editor') {
      setEditingTemplate(null);
      setEditingWorkout(null);
    }
  };

  if (isSyncing) {
    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center text-center">
        <div className="animate-spin-slow mb-8 opacity-40">
           <ICONS.LionLogo className="w-32 h-32" />
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Syncing OTB Intel...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 dark-bg">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#ED117E] text-white px-8 py-3 rounded-2xl font-black text-[10px] tracking-widest shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      <Header 
        viewMode={state.viewMode} 
        onSetView={setView} 
        onDateChange={(d) => setState(prev => ({ ...prev, selectedDate: d }))} 
        selectedDate={state.selectedDate} 
      />
      
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {state.viewMode === 'dashboard' && (
          <Dashboard 
            workouts={state.workouts}
            selectedDate={state.selectedDate}
            onShare={handleShare}
            onEdit={(w) => { setEditingWorkout(w); setView('editor'); }}
            onClone={(w) => {
               const newW = { ...JSON.parse(JSON.stringify(w)), id: Math.random().toString(36).substr(2, 9) };
               setState(p => ({ ...p, workouts: [...p.workouts, newW] }));
            }}
            onSaveToLibrary={(w) => {
               const t = { ...w, id: Math.random().toString(36).substr(2, 9) };
               setState(p => ({ ...p, templates: [...p.templates, t] }));
               setToast('SAVED TO BLUEPRINTS');
            }}
            onDelete={(id) => setState(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }))}
            onAddSlot={() => setView('library')}
          />
        )}

        {state.viewMode === 'library' && (
          <Library 
            templates={state.templates}
            onShare={handleShare}
            onSelectTemplate={(t) => {
              const newW: Workout = { 
                ...t, 
                id: Math.random().toString(36).substr(2, 9), 
                date: format(state.selectedDate, 'yyyy-MM-dd'),
                timeSlot: '06:00',
                month: format(state.selectedDate, 'MMMM'),
                week: 1,
                day: format(state.selectedDate, 'EEEE')
              };
              setEditingWorkout(newW);
              setView('editor');
            }}
            onEditTemplate={(t) => { setEditingTemplate(t); setView('editor'); }}
            onDeleteTemplate={(id) => setState(prev => ({ ...prev, templates: prev.templates.filter(t => t.id !== id) }))}
            onCreateTemplate={() => setView('editor')}
            onExport={() => {
               const data = JSON.stringify(state.templates);
               const blob = new Blob([data], { type: 'application/json' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = 'OTB_BLUEPRINTS.json';
               a.click();
            }}
            onImport={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onload = (ev) => {
                   try {
                     const imported = JSON.parse(ev.target?.result as string);
                     setState(p => ({ ...p, templates: [...p.templates, ...imported] }));
                     setToast("LIBRARY UPDATED");
                   } catch (err) { setToast("IMPORT ERROR"); }
                 };
                 reader.readAsText(file);
               }
            }}
          />
        )}

        {state.viewMode === 'exercises' && (
          <ExerciseLibrary 
            exercises={state.exerciseLibrary}
            onSaveExercise={(ex) => setState(p => ({ ...p, exerciseLibrary: [...p.exerciseLibrary.filter(item => item.id !== ex.id), ex] }))}
            onDeleteExercise={(id) => setState(p => ({ ...p, exerciseLibrary: p.exerciseLibrary.filter(ex => ex.id !== id) }))}
          />
        )}

        {state.viewMode === 'editor' && (
          <WorkoutEditor 
            initialWorkout={editingWorkout || undefined}
            initialTemplate={editingTemplate || undefined}
            exerciseLibrary={state.exerciseLibrary}
            selectedDate={state.selectedDate}
            onSaveWorkout={(w) => {
               setState(p => ({ ...p, workouts: [...p.workouts.filter(item => item.id !== w.id), w], viewMode: 'dashboard' }));
            }}
            onSaveTemplate={(t) => {
               setState(p => ({ ...p, templates: [...p.templates.filter(item => item.id !== t.id), t], viewMode: 'library' }));
            }}
            onCancel={() => setView('dashboard')}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-4 flex justify-between items-center z-[100] lg:hidden">
        {[
          { id: 'dashboard', label: 'Schedule', icon: '📅' },
          { id: 'library', label: 'Library', icon: '📚' },
          { id: 'exercises', label: 'Lab', icon: '🦁' },
        ].map((item) => (
          <button key={item.id} onClick={() => setView(item.id as any)} className="flex flex-col items-center gap-1">
            <span className="text-xl">{item.icon}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest ${state.viewMode === item.id ? 'text-[#ED117E]' : 'text-gray-500'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
