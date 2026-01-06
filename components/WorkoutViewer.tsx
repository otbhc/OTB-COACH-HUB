
import React, { useState } from 'react';
import { Workout, Exercise } from '../types';
import { ICONS } from '../constants';

const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className={`p-5 rounded-2xl border transition-all ${exercise.isSuperset ? 'border-[#ED117E]/40 bg-[#ED117E]/10' : 'border-white/10 bg-white/5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {exercise.isSuperset && (
            <span className="inline-block px-2 py-0.5 bg-[#ED117E] text-[9px] uppercase font-black tracking-widest text-white rounded mb-2">Superset</span>
          )}
          <h4 className="text-xl font-bold text-white tracking-tight">{exercise.name}</h4>
          <div className="flex gap-4 mt-2">
            {exercise.reps && <span className="text-sm text-gray-400 font-medium">Reps: <span className="text-white font-bold">{exercise.reps}</span></span>}
            {exercise.time && <span className="text-sm text-gray-400 font-medium">Work: <span className="text-white font-bold">{exercise.time}</span></span>}
          </div>
        </div>
        {exercise.videoUrl && (
          <button 
            onClick={() => setShowVideo(!showVideo)} 
            className={`p-3 rounded-full transition-all ${showVideo ? 'bg-white text-black' : 'bg-[#ED117E] text-white'}`}
          >
            <ICONS.Play />
          </button>
        )}
      </div>
      {showVideo && exercise.videoUrl && (
        <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-black shadow-inner">
          <video src={exercise.videoUrl} controls className="w-full h-full object-cover" autoPlay muted loop playsInline />
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, color }: { title: string, color: string }) => (
  <div className="flex items-center gap-4 mb-5 mt-8">
    <div className={`w-1 h-6 rounded-full ${color}`}></div>
    <h3 className="text-sm font-black italic uppercase tracking-widest text-white/90">{title}</h3>
    <div className="flex-grow h-[1px] bg-white/10"></div>
  </div>
);

const WorkoutViewer: React.FC<{ workout: Workout }> = ({ workout }) => (
  <div className="space-y-4">
    {workout.warmup.length > 0 && (
      <section>
        <SectionHeader title="Ignite (Warmup)" color="bg-blue-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workout.warmup.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
        </div>
      </section>
    )}
    
    {workout.wod1.length > 0 && (
      <section>
        <SectionHeader title="WOD Phase I" color="bg-[#ED117E]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workout.wod1.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
        </div>
      </section>
    )}

    {workout.wod2.length > 0 && (
      <section>
        <SectionHeader title="WOD Phase II" color="bg-[#ED117E]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workout.wod2.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
        </div>
      </section>
    )}

    {workout.finisher.length > 0 && (
      <section>
        <SectionHeader title="The Finisher" color="bg-yellow-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workout.finisher.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
        </div>
      </section>
    )}

    {workout.coachNotes && (
      <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10">
        <h4 className="text-[#ED117E] font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
          Tactical Intel
        </h4>
        <p className="text-gray-300 italic text-lg leading-relaxed">"{workout.coachNotes}"</p>
      </div>
    )}
  </div>
);

export default WorkoutViewer;
