import { Observable } from '@nativescript/core';
import { AIService } from '../../services/ai.service';
import { StorageService } from '../../services/storage.service';
import { UserProfile, DailyLog } from '../../models/user.model';
import { format } from 'date-fns';

export class HomeViewModel extends Observable {
    private aiService: AIService;
    private storageService: StorageService;
    private userProfile: UserProfile;
    private todayLogs: DailyLog;

    constructor() {
        super();
        this.aiService = new AIService();
        this.storageService = new StorageService();
        this.initializeData();
    }

    private initializeData() {
        this.userProfile = this.storageService.getUserProfile();
        this.todayLogs = this.getCurrentDayLog();
        this.updateBindings();
    }

    private getCurrentDayLog(): DailyLog {
        const logs = this.storageService.getDailyLogs();
        const today = format(new Date(), 'yyyy-MM-dd');
        return logs.find(log => format(new Date(log.date), 'yyyy-MM-dd') === today) || this.createNewDayLog();
    }

    private createNewDayLog(): DailyLog {
        return {
            date: new Date(),
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            weight: this.userProfile.weight,
            completedWorkouts: [],
            waterIntake: 0
        };
    }

    private updateBindings() {
        this.notifyPropertyChange('welcomeMessage', this.welcomeMessage);
        this.notifyPropertyChange('dailyStats', this.dailyStats);
        this.notifyPropertyChange('calorieTarget', this.calorieTarget);
        this.notifyPropertyChange('todayWorkout', this.todayWorkout);
        this.notifyPropertyChange('weeklyProgress', this.weeklyProgress);
    }

    onAddMeal() {
        // Navigation vers la page d'ajout de repas
    }

    onAddWater() {
        this.todayLogs.waterIntake += 0.25;
        this.storageService.saveDailyLog(this.todayLogs);
        this.updateBindings();
    }

    onExerciseToggle(args) {
        const exercise = args.object.bindingContext;
        exercise.completed = !exercise.completed;
        
        if (exercise.completed) {
            this.todayLogs.completedWorkouts.push(exercise.name);
        } else {
            const index = this.todayLogs.completedWorkouts.indexOf(exercise.name);
            if (index > -1) {
                this.todayLogs.completedWorkouts.splice(index, 1);
            }
        }
        
        this.storageService.saveDailyLog(this.todayLogs);
        this.updateBindings();
    }

    onSettingsTap() {
        // Navigation vers la page des paramètres
    }

    // Getters
    get welcomeMessage(): string {
        const hour = new Date().getHours();
        const name = this.userProfile.name;
        
        if (hour < 12) return `Bonjour ${name} !`;
        if (hour < 18) return `Bon après-midi ${name} !`;
        return `Bonsoir ${name} !`;
    }

    get dailyStats() {
        return {
            calories: this.todayLogs.calories,
            protein: this.todayLogs.protein,
            water: this.todayLogs.waterIntake
        };
    }

    get calorieTarget(): number {
        return this.userProfile.dailyCalorieTarget;
    }

    get todayWorkout(): any[] {
        const workoutPlan = this.aiService.generateWorkoutPlan(
            this.userProfile,
            this.storageService.getDailyLogs()
        );
        const today = format(new Date(), 'EEEE').toLowerCase();
        return workoutPlan[today] || [];
    }

    get weeklyProgress(): any[] {
        return this.storageService.getDailyLogs()
            .slice(-7)
            .map(log => ({
                date: format(new Date(log.date), 'dd/MM'),
                weight: log.weight,
                calories: log.calories
            }));
    }
}