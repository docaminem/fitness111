import create from 'zustand';
import { Progress } from '../types';

interface ProgressStore {
  progress: Progress[];
  addProgress: (entry: Progress) => void;
  removeProgress: (id: string) => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  progress: [],
  addProgress: (entry) => 
    set((state) => ({ progress: [...state.progress, entry] })),
  removeProgress: (id) =>
    set((state) => ({ progress: state.progress.filter(p => p.id !== id) })),
}));