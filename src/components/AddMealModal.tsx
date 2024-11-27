import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meal: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

function AddMealModal({ isOpen, onClose, onAdd }: AddMealModalProps) {
  const [meal, setMeal] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(meal);
    onClose();
    setMeal({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">Ajouter un repas</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                value={meal.calories}
                onChange={(e) => setMeal({ ...meal, calories: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Protéines (g)</label>
              <input
                type="number"
                value={meal.protein}
                onChange={(e) => setMeal({ ...meal, protein: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Glucides (g)</label>
              <input
                type="number"
                value={meal.carbs}
                onChange={(e) => setMeal({ ...meal, carbs: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lipides (g)</label>
              <input
                type="number"
                value={meal.fats}
                onChange={(e) => setMeal({ ...meal, fats: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Ajouter
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default AddMealModal;