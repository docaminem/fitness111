import React, { useState } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Workout as WorkoutType, Exercise } from '../types';

const Workout = () => {
  const { workouts, addWorkout } = useWorkoutStore();
  const [showForm, setShowForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutType>>({
    name: '',
    exercises: [],
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleAddExercise = () => {
    const exercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 0,
      reps: 0,
      weight: 0,
    };
    setNewWorkout({
      ...newWorkout,
      exercises: [...(newWorkout.exercises || []), exercise],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkout.name && newWorkout.exercises?.length) {
      addWorkout({
        ...newWorkout,
        id: Date.now().toString(),
      } as WorkoutType);
      setShowForm(false);
      setNewWorkout({
        name: '',
        exercises: [],
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Entraînements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nouvel entraînement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom de l'entraînement
              </label>
              <input
                type="text"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exercices</label>
              {newWorkout.exercises?.map((exercise, index) => (
                <div key={exercise.id} className="mt-2 grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={exercise.name}
                    onChange={(e) => {
                      const exercises = [...(newWorkout.exercises || [])];
                      exercises[index].name = e.target.value;
                      setNewWorkout({ ...newWorkout, exercises });
                    }}
                    className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Séries"
                    value={exercise.sets || ''}
                    onChange={(e) => {
                      const exercises = [...(newWorkout.exercises || [])];
                      exercises[index].sets = parseInt(e.target.value);
                      setNewWorkout({ ...newWorkout, exercises });
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Répétitions"
                    value={exercise.reps || ''}
                    onChange={(e) => {
                      const exercises = [...(newWorkout.exercises || [])];
                      exercises[index].reps = parseInt(e.target.value);
                      setNewWorkout({ ...newWorkout, exercises });
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddExercise}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                + Ajouter un exercice
              </button>
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
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{workout.name}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(workout.date), 'PPP', { locale: fr })}
            </p>
            <div className="mt-4">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="mt-2">
                  <p className="text-gray-700">
                    {exercise.name} - {exercise.sets} x {exercise.reps} répétitions
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workout;