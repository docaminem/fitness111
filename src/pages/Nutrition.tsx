import React, { useState } from 'react';
import { useNutritionStore } from '../store/nutritionStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Meal } from '../types';

const Nutrition = () => {
  const { meals, addMeal } = useNutritionStore();
  const [showForm, setShowForm] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMeal.name && newMeal.calories) {
      addMeal({
        ...newMeal,
        id: Date.now().toString(),
      } as Meal);
      setShowForm(false);
      setNewMeal({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nouveau repas
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom du repas
              </label>
              <input
                type="text"
                value={newMeal.name}
                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Calories
                </label>
                <input
                  type="number"
                  value={newMeal.calories || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Protéines (g)
                </label>
                <input
                  type="number"
                  value={newMeal.protein || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, protein: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Glucides (g)
                </label>
                <input
                  type="number"
                  value={newMeal.carbs || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, carbs: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lipides (g)
                </label>
                <input
                  type="number"
                  value={newMeal.fat || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, fat: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-700 hover:text-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{meal.name}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(meal.date), 'PPP', { locale: fr })}
            </p>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Calories</p>
                <p className="font-semibold">{meal.calories}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Protéines</p>
                <p className="font-semibold">{meal.protein}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Glucides</p>
                <p className="font-semibold">{meal.carbs}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lipides</p>
                <p className="font-semibold">{meal.fat}g</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Nutrition;