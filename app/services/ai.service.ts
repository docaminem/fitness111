import { Observable } from '@nativescript/core';
import { UserProfile, DailyLog } from '../models/user.model';

export class AIService extends Observable {
    calculateDailyCalories(profile: UserProfile): number {
        const { weight, height, age, activityLevel } = profile;
        const bmr = 10 * weight + 6.25 * height - 5 * age;
        const activityFactors = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9
        };
        return Math.round(bmr * activityFactors[activityLevel]);
    }

    generateWorkoutPlan(profile: UserProfile, progressData: DailyLog[]): any {
        const intensity = this.calculateIntensity(profile, progressData);
        const exercises = this.getExercisesByGoal(profile.goal, intensity);
        
        return {
            monday: this.createDayPlan(exercises, 'push'),
            wednesday: this.createDayPlan(exercises, 'pull'),
            friday: this.createDayPlan(exercises, 'legs'),
            saturday: this.createDayPlan(exercises, 'cardio')
        };
    }

    private calculateIntensity(profile: UserProfile, logs: DailyLog[]): string {
        if (logs.length < 7) return 'beginner';
        const recentProgress = this.analyzeProgress(logs);
        return recentProgress > 0.7 ? 'advanced' : 'intermediate';
    }

    private analyzeProgress(logs: DailyLog[]): number {
        const completionRates = logs.map(log => 
            log.completedWorkouts.length / 3
        );
        return completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    }

    adjustNutrition(profile: UserProfile, logs: DailyLog[]): any {
        const recentLogs = logs.slice(-7);
        const avgCalories = recentLogs.reduce((sum, log) => sum + log.calories, 0) / recentLogs.length;
        
        return {
            calories: this.adjustCalorieTarget(profile, avgCalories),
            macros: this.calculateMacros(profile)
        };
    }

    private adjustCalorieTarget(profile: UserProfile, avgCalories: number): number {
        const baseTarget = profile.dailyCalorieTarget;
        const weightDiff = profile.weight - profile.targetWeight;
        
        if (Math.abs(weightDiff) < 0.5) return baseTarget;
        return baseTarget + (weightDiff > 0 ? -200 : 200);
    }

    private calculateMacros(profile: UserProfile): any {
        const { dailyCalorieTarget, goal } = profile;
        return goal === 'muscleMass' 
            ? {
                protein: Math.round(profile.weight * 2.2),
                carbs: Math.round((dailyCalorieTarget * 0.4) / 4),
                fats: Math.round((dailyCalorieTarget * 0.25) / 9)
            }
            : {
                protein: Math.round(profile.weight * 2),
                carbs: Math.round((dailyCalorieTarget * 0.35) / 4),
                fats: Math.round((dailyCalorieTarget * 0.3) / 9)
            };
    }

    private getExercisesByGoal(goal: string, intensity: string): any {
        return {
            weightLoss: {
                push: ['Pompes', 'Développé épaules', 'Extensions triceps'],
                pull: ['Tractions assistées', 'Rowing', 'Curl biceps'],
                legs: ['Squats', 'Fentes', 'Mollets'],
                cardio: ['HIIT 20min', 'Marche rapide 30min']
            },
            muscleMass: {
                push: ['Développé couché', 'Développé militaire', 'Dips'],
                pull: ['Tractions', 'Rowing barre', 'Curl barre'],
                legs: ['Squats barre', 'Presse', 'Soulevé de terre'],
                cardio: ['HIIT 15min']
            }
        }[goal];
    }

    private createDayPlan(exercises: any, type: string): any[] {
        return exercises[type].map(exercise => ({
            name: exercise,
            sets: 4,
            reps: type === 'cardio' ? 1 : 12
        }));
    }
}