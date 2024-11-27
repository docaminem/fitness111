import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Workout } from '../types';

interface WorkoutStore {
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  removeWorkout: (id: string) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workouts: [],
      addWorkout: (workout) => 
        set((state) => ({ workouts: [...state.workouts, workout] })),
      removeWorkout: (id) =>
        set((state) => ({ workouts: state.workouts.filter(w => w.id !== id) })),
    }),
    {
      name: 'workout-storage',
    }
  )
);