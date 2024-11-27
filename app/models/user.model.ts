export interface UserProfile {
    id: string;
    name: string;
    age: number;
    weight: number;
    height: number;
    goal: 'weightLoss' | 'muscleMass';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
    targetWeight: number;
    dailyCalorieTarget: number;
}

export interface DailyLog {
    date: Date;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    weight: number;
    completedWorkouts: string[];
    waterIntake: number;
}

export interface Meal {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: Date;
}