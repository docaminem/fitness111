import React from 'react';
import { useUserStore } from '../store/userStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useNutritionStore } from '../store/nutritionStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ProfileSetup from '../components/ProfileSetup';

const Dashboard = () => {
  const profile = useUserStore((state) => state.profile);
  const workouts = useWorkoutStore((state) => state.workouts);
  const meals = useNutritionStore((state) => state.meals);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayWorkouts = workouts?.filter(w => w.date === today) || [];
  const todayMeals = meals?.filter(m => m.date === today) || [];

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);

  if (!profile) {
    return <ProfileSetup />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900">Aperçu du jour</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Calories</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-900">
              {totalCalories} / {profile.activityLevel === 'active' ? 2500 : 2000}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Protéines</h3>
            <p className="mt-2 text-3xl font-semibold text-green-900">
              {totalProtein}g / {Math.round(profile.weight * 2)}g
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Entraînements</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-900">
              {todayWorkouts.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Repas d'aujourd'hui</h2>
          {todayMeals.length > 0 ? (
            <div className="space-y-4">
              {todayMeals.map((meal) => (
                <div key={meal.id} className="border-b pb-2">
                  <h3 className="font-medium">{meal.name}</h3>
                  <p className="text-sm text-gray-500">
                    {meal.calories} kcal - {meal.protein}g protéines
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun repas enregistré aujourd'hui</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Entraînements d'aujourd'hui</h2>
          {todayWorkouts.length > 0 ? (
            <div className="space-y-4">
              {todayWorkouts.map((workout) => (
                <div key={workout.id} className="border-b pb-2">
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-gray-500">
                    {workout.exercises.length} exercices
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun entraînement prévu aujourd'hui</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;