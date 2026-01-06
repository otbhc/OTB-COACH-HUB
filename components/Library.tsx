
import React from 'react';
import { WorkoutTemplate } from '../types';
import { ICONS, OTB_PINK } from '../constants';

interface LibraryProps {
  templates: WorkoutTemplate[];
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onEditTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplate: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShare: (data: any, type: 'blueprint') => void;
}

const Library: React.FC<LibraryProps> = ({ 
  templates, 
  onSelectTemplate, 
  onEditTemplate, 
  onDeleteTemplate, 
  onCreateTemplate,
  onExport,
  onImport,
  onShare
}) => {
  return (
    <div className="animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">WOD Library</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">
            Your blueprints for OTB greatness
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={onCreateTemplate}
            className="flex-1 md:flex-none otb-gradient px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-[#ED117E]/40"
          >
            New Blueprint
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-[#ED117E]/10 rounded-xl text-[#ED117E]">
            <ICONS.Copy />
          </div>
          <div>
            <h4 className="font-black text-white uppercase text-xs tracking-widest">Master Backup</h4>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Export your entire library for safe keeping</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <label className="flex-1 md:flex-none cursor-pointer px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 text-center transition-colors">
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={onImport} />
          </label>
          <button 
            onClick={onExport}
            className="flex-1 md:flex-none px-5 py-3 bg-[#ED117E]/10 hover:bg-[#ED117E]/20 border border-[#ED117E]/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ED117E] transition-colors"
          >
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => (
          <div key={t.id} className="group bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] transition-all hover:border-[#ED117E]/30 relative overflow-hidden">
             <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2 group-hover:text-[#ED117E] transition-colors truncate">{t.name}</h3>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">
               {t.warmup.length + t.wod1.length + t.wod2.length + t.finisher.length} Movements
             </p>
             
             <div className="flex flex-wrap gap-2">
               <button 
                 onClick={() => onSelectTemplate(t)}
                 className="flex-grow px-4 py-3 bg-[#ED117E] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#ED117E]/20"
               >
                 Schedule
               </button>
               <button 
                 onClick={() => onShare(t, 'blueprint')}
                 className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                 title="Share Blueprint"
               >
                 <ICONS.Share />
               </button>
               <button 
                 onClick={() => onEditTemplate(t)}
                 className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-white border border-white/5"
               >
                 <ICONS.Edit />
               </button>
               <button 
                 onClick={() => onDeleteTemplate(t.id)}
                 className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-red-500 border border-white/5"
               >
                 <ICONS.Trash />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
