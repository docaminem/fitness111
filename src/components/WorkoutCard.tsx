import { WorkoutExercise } from '../types';

interface WorkoutCardProps {
  exercise: WorkoutExercise;
  onToggle: (id: string) => void;
}

function WorkoutCard({ exercise, onToggle }: WorkoutCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
          <p className="text-sm text-gray-500">
            {exercise.sets} séries × {exercise.reps} répétitions
            {exercise.weight && ` - ${exercise.weight}kg`}
          </p>
        </div>
        <input
          type="checkbox"
          checked={exercise.completed}
          onChange={() => onToggle(exercise.id)}
          className="h-5 w-5 text-blue-600 rounded"
        />
      </div>
    </div>
  );
}

export default WorkoutCard;