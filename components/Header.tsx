
import React from 'react';
import { ICONS, OTB_PINK } from '../constants';
import { format, addDays, subDays } from 'date-fns';
import { AppState } from '../types';

interface HeaderProps {
  viewMode: AppState['viewMode'];
  onSetView: (mode: AppState['viewMode']) => void;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

const Header: React.FC<HeaderProps> = ({ viewMode, onSetView, onDateChange, selectedDate }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 p-3 md:p-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <ICONS.LionLogo className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_10px_rgba(237,17,126,0.4)]" />
          <div className="border-l border-white/20 pl-3 md:pl-4">
            <h1 className="font-black text-lg md:text-xl leading-none uppercase tracking-tighter text-white">
              OTB<span style={{ color: OTB_PINK }}>HEALTHCLUB</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">Coach Portal</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'dashboard', label: 'Schedule' },
            { id: 'library', label: 'WOD Library' },
            { id: 'exercises', label: 'Exercises' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => onSetView(tab.id as AppState['viewMode'])}
              className={`px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === tab.id ? 'bg-[#ED117E] text-white shadow-lg shadow-[#ED117E]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
          <button 
            onClick={() => onDateChange(subDays(selectedDate, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ICONS.Back />
          </button>
          
          <div className="px-4 md:px-6 py-1 text-center min-w-[120px] md:min-w-[140px]">
            <span className="block text-[8px] md:text-[9px] uppercase font-black text-gray-500 tracking-widest mb-0.5">
              {format(selectedDate, 'MMMM yyyy')}
            </span>
            <span className="block text-sm md:text-base font-bold text-white leading-none tracking-tight">
              {format(selectedDate, 'EEEE do')}
            </span>
          </div>

          <button 
            onClick={() => onDateChange(addDays(selectedDate, 1))}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors rotate-180 text-gray-400 hover:text-white"
          >
            <ICONS.Back />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
