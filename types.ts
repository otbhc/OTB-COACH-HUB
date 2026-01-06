
export enum ExerciseCategory {
  CARDIO = 'Cardio',
  CROSSFIT = 'CrossFit',
  HYROX = 'Hyrox',
  STRENGTH = 'Strength'
}

export interface Exercise {
  id: string;
  name: string;
  reps?: string;
  time?: string;
  videoUrl?: string;
  isSuperset: boolean;
}

export interface LibraryExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  videoUrl?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  warmup: Exercise[];
  wod1: Exercise[];
  wod2: Exercise[];
  finisher: Exercise[];
  cooldown: Exercise[];
  coachNotes?: string;
}

export interface Workout extends WorkoutTemplate {
  date: string;
  timeSlot: string;
  month: string;
  week: number;
  day: string;
}

export interface AppState {
  workouts: Workout[];
  templates: WorkoutTemplate[];
  exerciseLibrary: LibraryExercise[];
  selectedDate: Date;
  viewMode: 'dashboard' | 'library' | 'exercises' | 'editor';
}
