import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined') {
      this.requestPermission();
      this.startNotificationScheduler();
    }
  }

  async requestPermission(): Promise<void> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  startNotificationScheduler(): void {
    // Check for due tasks every 30 minutes
    setInterval(() => {
      this.checkDueTasks();
    }, 30 * 60 * 1000);

    // Initial check after 5 seconds
    setTimeout(() => {
      this.checkDueTasks();
    }, 5000);
  }

  private checkDueTasks(): void {
    const tasks = this.getStoredTasks();
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      if (task.status === 'completed') return;

      const dueDate = new Date(task.dueDate);
      
      // Overdue tasks
      if (dueDate < now) {
        this.showNotification(
          '⚠️ Overdue Task!',
          `"${task.title}" was due ${this.getTimeAgo(dueDate)}`,
          'overdue'
        );
      }
      // Due within 1 hour
      else if (dueDate <= oneHourFromNow) {
        this.showNotification(
          '🔔 Task Due Soon!',
          `"${task.title}" is due in ${this.getTimeUntil(dueDate)}`,
          'urgent'
        );
      }
      // Due within 24 hours
      else if (dueDate <= oneDayFromNow) {
        this.showNotification(
          '📅 Upcoming Task',
          `"${task.title}" is due ${this.getTimeUntil(dueDate)}`,
          'reminder'
        );
      }
    });
  }

  private getStoredTasks(): Task[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    
    try {
      const stored = localStorage.getItem('smart-task-manager-tasks');
      if (stored) {
        return JSON.parse(stored).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdDate: new Date(task.createdDate)
        }));
      }
    } catch (error) {
      console.error('Error loading tasks for notifications:', error);
    }
    return [];
  }

  private showNotification(title: string, body: string, type: 'overdue' | 'urgent' | 'reminder'): void {
    if (typeof window === 'undefined' || this.notificationPermission !== 'granted') return;

    const icon = this.getNotificationIcon(type);
    const tag = `task-${type}-${Date.now()}`;

    const notification = new Notification(title, {
      body,
      icon,
      tag,
      badge: '/favicon.ico',
      silent: type === 'reminder',
      requireInteraction: type === 'overdue',
      // actions: [
      //   { action: 'view', title: '👀 View Task', icon: '/favicon.ico' },
      //   { action: 'complete', title: '✅ Mark Complete', icon: '/favicon.ico' }
      // ]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to tasks page
      window.location.href = '/tasks';
    };

    // Auto-close after 10 seconds for reminders
    if (type === 'reminder') {
      setTimeout(() => notification.close(), 10000);
    }
  }

  private getNotificationIcon(type: string): string {
    switch (type) {
      case 'overdue': return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
      case 'urgent': return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ea580c"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
      default: return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    }
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  private getTimeUntil(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'very soon';
  }

  // Manual notification methods
  showTaskCreated(taskTitle: string): void {
    this.showNotification(
      '✅ Task Created!',
      `"${taskTitle}" has been added to your tasks`,
      'reminder'
    );
  }

  showTaskCompleted(taskTitle: string): void {
    this.showNotification(
      '🎉 Task Completed!',
      `Great job! You completed "${taskTitle}"`,
      'reminder'
    );
  }

  showProductivityMilestone(message: string): void {
    this.showNotification(
      '🏆 Productivity Milestone!',
      message,
      'reminder'
    );
  }

  isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }
}
