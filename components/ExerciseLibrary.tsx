
import React, { useState } from 'react';
import { LibraryExercise, ExerciseCategory } from '../types';
import { ICONS, OTB_PINK } from '../constants';

interface ExerciseLibraryProps {
  exercises: LibraryExercise[];
  onSaveExercise: (ex: LibraryExercise) => void;
  onDeleteExercise: (id: string) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ exercises, onSaveExercise, onDeleteExercise }) => {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'All'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEx, setNewEx] = useState<Partial<LibraryExercise>>({ category: ExerciseCategory.STRENGTH });

  const categories = Object.values(ExerciseCategory);

  const filtered = activeCategory === 'All' 
    ? exercises 
    : exercises.filter(ex => ex.category === activeCategory);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewEx({ ...newEx, videoUrl: url });
    }
  };

  const handleSave = () => {
    if (!newEx.name) return;
    onSaveExercise({
      id: Math.random().toString(36).substr(2, 9),
      name: newEx.name,
      category: newEx.category as ExerciseCategory,
      videoUrl: newEx.videoUrl
    });
    setNewEx({ category: ExerciseCategory.STRENGTH });
    setShowAddForm(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">Exercise Lab</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">
            Building the OTB movement encyclopedia
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="otb-gradient px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-[#ED117E]/30"
        >
          Add New Movement
        </button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setActiveCategory('All')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-white'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-[#ED117E]/10 text-[#ED117E] border-[#ED117E]/30' : 'text-gray-500 hover:text-white border-transparent'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black italic uppercase text-white mb-6">New Movement</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Exercise Name</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ED117E]"
                  value={newEx.name || ''}
                  onChange={e => setNewEx({...newEx, name: e.target.value})}
                  placeholder="e.g. Kettlebell Swings"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ED117E]"
                  value={newEx.category}
                  onChange={e => setNewEx({...newEx, category: e.target.value as ExerciseCategory})}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Demo Video</label>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl hover:border-[#ED117E]/50 transition-colors cursor-pointer group">
                  <div className="text-center">
                    <div className="mb-2 flex justify-center text-gray-500 group-hover:text-[#ED117E]">
                      <ICONS.Play />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {newEx.videoUrl ? 'Video Attached' : 'Upload Video'}
                    </span>
                  </div>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-[#ED117E] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#ED117E]/20">Save Exercise</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#ED117E]">
                {ex.videoUrl ? <ICONS.Play /> : <ICONS.Plus />}
              </div>
              <div>
                <h4 className="font-bold text-lg text-white leading-tight">{ex.name}</h4>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">{ex.category}</p>
              </div>
            </div>
            <button 
              onClick={() => onDeleteExercise(ex.id)}
              className="p-2 text-gray-700 hover:text-red-500 transition-colors"
            >
              <ICONS.Trash />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
             <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No movements found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
