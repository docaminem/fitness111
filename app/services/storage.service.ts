import { ApplicationSettings } from '@nativescript/core';

export class StorageService {
    private readonly USER_KEY = 'user_profile';
    private readonly LOGS_KEY = 'daily_logs';

    saveUserProfile(profile: any): void {
        ApplicationSettings.setString(this.USER_KEY, JSON.stringify(profile));
    }

    getUserProfile(): any {
        const data = ApplicationSettings.getString(this.USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    saveDailyLog(log: any): void {
        const logs = this.getDailyLogs();
        logs.push(log);
        ApplicationSettings.setString(this.LOGS_KEY, JSON.stringify(logs));
    }

    getDailyLogs(): any[] {
        const data = ApplicationSettings.getString(this.LOGS_KEY);
        return data ? JSON.parse(data) : [];
    }

    clearData(): void {
        ApplicationSettings.remove(this.USER_KEY);
        ApplicationSettings.remove(this.LOGS_KEY);
    }
}