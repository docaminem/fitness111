import { DailyNutrition } from '../types';

interface NutritionSummaryProps {
  nutrition: DailyNutrition;
  targetCalories: number;
}

function NutritionSummary({ nutrition, targetCalories }: NutritionSummaryProps) {
  const macroTargets = {
    protein: Math.round(targetCalories * 0.3 / 4), // 30% des calories en protéines
    carbs: Math.round(targetCalories * 0.4 / 4),   // 40% des calories en glucides
    fats: Math.round(targetCalories * 0.3 / 9)     // 30% des calories en lipides
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-600">Calories</h4>
        <p className="mt-2 text-2xl font-semibold text-blue-900">
          {nutrition.calories} / {targetCalories}
        </p>
        <div className="mt-2 h-2 bg-blue-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full"
            style={{ width: `${Math.min((nutrition.calories / targetCalories) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-600">Protéines</h4>
        <p className="mt-2 text-2xl font-semibold text-green-900">
          {nutrition.protein}g / {macroTargets.protein}g
        </p>
        <div className="mt-2 h-2 bg-green-200 rounded-full">
          <div
            className="h-2 bg-green-600 rounded-full"
            style={{ width: `${Math.min((nutrition.protein / macroTargets.protein) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-600">Glucides</h4>
        <p className="mt-2 text-2xl font-semibold text-yellow-900">
          {nutrition.carbs}g / {macroTargets.carbs}g
        </p>
        <div className="mt-2 h-2 bg-yellow-200 rounded-full">
          <div
            className="h-2 bg-yellow-600 rounded-full"
            style={{ width: `${Math.min((nutrition.carbs / macroTargets.carbs) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-600">Lipides</h4>
        <p className="mt-2 text-2xl font-semibold text-red-900">
          {nutrition.fats}g / {macroTargets.fats}g
        </p>
        <div className="mt-2 h-2 bg-red-200 rounded-full">
          <div
            className="h-2 bg-red-600 rounded-full"
            style={{ width: `${Math.min((nutrition.fats / macroTargets.fats) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default NutritionSummary;