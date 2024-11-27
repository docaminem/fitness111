import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meal } from '../types';

interface NutritionStore {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set) => ({
      meals: [],
      addMeal: (meal) => 
        set((state) => ({ meals: [...state.meals, meal] })),
      removeMeal: (id) =>
        set((state) => ({ meals: state.meals.filter(m => m.id !== id) })),
    }),
    {
      name: 'nutrition-storage',
    }
  )
);