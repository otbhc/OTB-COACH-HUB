
import React, { useState } from 'react';
import { Workout, Exercise, WorkoutTemplate, LibraryExercise, ExerciseCategory } from '../types';
import { ICONS, OTB_PINK } from '../constants';
import { format } from 'date-fns';

interface WorkoutEditorProps {
  initialWorkout?: Workout;
  initialTemplate?: WorkoutTemplate;
  exerciseLibrary: LibraryExercise[];
  selectedDate: Date;
  onSaveWorkout: (workout: Workout) => void;
  onSaveTemplate: (template: WorkoutTemplate) => void;
  onCancel: () => void;
}

const ExerciseRow = ({ ex, section, updateExercise, removeExercise, handleVideoUpload }: any) => (
  <div className={`p-5 rounded-2xl border border-white/5 transition-all ${ex.isSuperset ? 'bg-[#ED117E]/5 border-[#ED117E]/20' : 'bg-black/40'}`}>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-4">
        <input 
          type="text" 
          placeholder="Exercise Name" 
          value={ex.name}
          onChange={(e) => updateExercise(section, ex.id, { name: e.target.value })}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ED117E] outline-none transition-colors"
        />
      </div>
      <div className="md:col-span-2">
        <input 
          type="text" 
          placeholder="Reps" 
          value={ex.reps}
          onChange={(e) => updateExercise(section, ex.id, { reps: e.target.value })}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ED117E] outline-none transition-colors"
        />
      </div>
      <div className="md:col-span-2">
        <input 
          type="text" 
          placeholder="Time/Dist" 
          value={ex.time}
          onChange={(e) => updateExercise(section, ex.id, { time: e.target.value })}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ED117E] outline-none transition-colors"
        />
      </div>
      <div className="md:col-span-2 flex items-center justify-center">
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${ex.isSuperset ? 'bg-[#ED117E] border-[#ED117E]' : 'border-white/20 group-hover:border-[#ED117E]'}`}>
            {ex.isSuperset && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
          <input 
            type="checkbox" 
            checked={ex.isSuperset}
            onChange={(e) => updateExercise(section, ex.id, { isSuperset: e.target.checked })}
            className="hidden"
          />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Superset</span>
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-3">
        <label className="p-3 bg-blue-500/10 text-blue-400 rounded-xl cursor-pointer hover:bg-blue-500/20 transition-all border border-blue-500/20">
          <input 
            type="file" 
            accept="video/*" 
            className="hidden" 
            onChange={(e) => handleVideoUpload(section, ex.id, e)} 
          />
          <ICONS.Play />
        </label>
        <button 
          onClick={() => removeExercise(section, ex.id)}
          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
        >
          <ICONS.Trash />
        </button>
      </div>
    </div>
    {ex.videoUrl && (
      <div className="mt-4 text-[10px] text-green-400 flex items-center gap-2 font-black tracking-widest uppercase bg-green-400/5 py-1.5 px-3 rounded-lg w-fit">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        VIDEO ATTACHED
      </div>
    )}
  </div>
);

const SectionEditorBlock = ({ section, title, data, onShowLibrary, onAddExercise, onUpdateExercise, onRemoveExercise, onHandleVideoUpload }: any) => (
  <div className="mb-12 bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 shadow-inner">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
      <div className="flex gap-2">
        <button onClick={() => onShowLibrary(section)} className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-400/10 px-4 py-2 rounded-xl border border-blue-400/20">
          BROWSE LIBRARY
        </button>
        <button onClick={() => onAddExercise(section)} className="flex items-center gap-2 text-[10px] font-black text-[#ED117E] bg-[#ED117E]/10 px-4 py-2 rounded-xl border border-[#ED117E]/20">
          QUICK ADD
        </button>
      </div>
    </div>
    <div className="space-y-4">
      {(data[section] as Exercise[]).map((ex) => (
        <ExerciseRow key={ex.id} ex={ex} section={section} updateExercise={onUpdateExercise} removeExercise={onRemoveExercise} handleVideoUpload={onHandleVideoUpload} />
      ))}
    </div>
  </div>
);

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ initialWorkout, initialTemplate, exerciseLibrary, selectedDate, onSaveWorkout, onSaveTemplate, onCancel }) => {
  const isEditingWorkout = !!initialWorkout;
  const [data, setData] = useState<Workout | WorkoutTemplate>(() => {
    if (initialWorkout) return { ...initialWorkout };
    if (initialTemplate) return { ...initialTemplate };
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      warmup: [], wod1: [], wod2: [], finisher: [], cooldown: [],
      coachNotes: '',
      ...(isEditingWorkout ? { date: format(selectedDate, 'yyyy-MM-dd'), timeSlot: '06:00' } : {})
    } as any;
  });

  const [showLibraryPicker, setShowLibraryPicker] = useState<{section: keyof Workout} | null>(null);

  const addExercise = (section: keyof Workout, templateEx?: LibraryExercise) => {
    const newEx: Exercise = { id: Math.random().toString(36).substr(2, 9), name: templateEx ? templateEx.name : '', videoUrl: templateEx?.videoUrl, reps: '', time: '', isSuperset: false };
    setData(prev => ({ ...prev, [section]: [...(prev[section] as Exercise[]), newEx] }));
  };

  const updateExercise = (section: keyof Workout, id: string, updates: Partial<Exercise>) => {
    setData(prev => ({ ...prev, [section]: (prev[section] as Exercise[]).map(e => e.id === id ? { ...e, ...updates } : e) }));
  };

  const handleVideoUpload = async (section: keyof Workout, id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateExercise(section, id, { videoUrl: URL.createObjectURL(file) });
  };

  return (
    <div className="pb-32 animate-in">
      {showLibraryPicker && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-2xl font-black italic uppercase text-white mb-6">Import Exercise</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
              {Object.values(ExerciseCategory).map(cat => (
                <div key={cat}>
                  <h4 className="text-[10px] font-black text-[#ED117E] uppercase tracking-widest mb-2">{cat}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {exerciseLibrary.filter(ex => ex.category === cat).map(ex => (
                      <button key={ex.id} onClick={() => { addExercise(showLibraryPicker.section, ex); setShowLibraryPicker(null); }} className="text-left p-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
                        {ex.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLibraryPicker(null)} className="mt-6 py-4 text-gray-500 font-black uppercase text-xs">Close</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-12">
        <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">{isEditingWorkout ? 'Program Builder' : 'Blueprint'}</h2>
        <div className="flex gap-4">
          <button onClick={onCancel} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs">Cancel</button>
          <button onClick={() => isEditingWorkout ? onSaveWorkout(data as Workout) : onSaveTemplate(data as WorkoutTemplate)} className="px-8 py-3 otb-gradient text-white rounded-2xl font-black uppercase text-xs">Save</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-xl font-bold" placeholder="Workout Name" />
        {isEditingWorkout && <input type="time" value={(data as Workout).timeSlot} onChange={e => setData({...data, timeSlot: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-xl font-bold" />}
      </div>

      <SectionEditorBlock section="warmup" title="Ignite (Warmup)" data={data} onShowLibrary={(s: any) => setShowLibraryPicker({section: s})} onAddExercise={addExercise} onUpdateExercise={updateExercise} onRemoveExercise={(s: any, id: any) => setData(prev => ({...prev, [s]: (prev[s] as Exercise[]).filter(e => e.id !== id)}))} onHandleVideoUpload={handleVideoUpload} />
      <SectionEditorBlock section="wod1" title="WOD Phase I" data={data} onShowLibrary={(s: any) => setShowLibraryPicker({section: s})} onAddExercise={addExercise} onUpdateExercise={updateExercise} onRemoveExercise={(s: any, id: any) => setData(prev => ({...prev, [s]: (prev[s] as Exercise[]).filter(e => e.id !== id)}))} onHandleVideoUpload={handleVideoUpload} />
      <SectionEditorBlock section="wod2" title="WOD Phase II" data={data} onShowLibrary={(s: any) => setShowLibraryPicker({section: s})} onAddExercise={addExercise} onUpdateExercise={updateExercise} onRemoveExercise={(s: any, id: any) => setData(prev => ({...prev, [s]: (prev[s] as Exercise[]).filter(e => e.id !== id)}))} onHandleVideoUpload={handleVideoUpload} />
      <SectionEditorBlock section="finisher" title="Finisher" data={data} onShowLibrary={(s: any) => setShowLibraryPicker({section: s})} onAddExercise={addExercise} onUpdateExercise={updateExercise} onRemoveExercise={(s: any, id: any) => setData(prev => ({...prev, [s]: (prev[s] as Exercise[]).filter(e => e.id !== id)}))} onHandleVideoUpload={handleVideoUpload} />
      <SectionEditorBlock section="cooldown" title="Restore (Cooldown)" data={data} onShowLibrary={(s: any) => setShowLibraryPicker({section: s})} onAddExercise={addExercise} onUpdateExercise={updateExercise} onRemoveExercise={(s: any, id: any) => setData(prev => ({...prev, [s]: (prev[s] as Exercise[]).filter(e => e.id !== id)}))} onHandleVideoUpload={handleVideoUpload} />

      <textarea value={data.coachNotes} onChange={e => setData({...data, coachNotes: e.target.value})} className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-lg italic" placeholder="Tactical Coach Intel..." />
    </div>
  );
};

export default WorkoutEditor;
