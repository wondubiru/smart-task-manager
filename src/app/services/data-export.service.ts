import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

interface ExportData {
  version: string;
  exportDate: string;
  tasks: Task[];
  metadata: {
    totalTasks: number;
    completedTasks: number;
    appVersion: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  private readonly STORAGE_KEY = 'smart-task-manager-tasks';

  constructor() { }

  exportToJSON(): void {
    const tasks = this.getStoredTasks();
    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks,
      metadata: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        appVersion: '1.0.0'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smart-task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  exportToCSV(): void {
    const tasks = this.getStoredTasks();
    const headers = ['Title', 'Description', 'Due Date', 'Created Date', 'Priority', 'Status', 'Category', 'Tags', 'Estimated Hours', 'Actual Hours'];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.dueDate.toISOString().split('T')[0],
        task.createdDate.toISOString().split('T')[0],
        task.priority,
        task.status,
        task.category,
        `"${task.tags.join(', ')}"`,
        task.estimatedHours || '',
        task.actualHours || ''
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smart-task-manager-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  async importFromJSON(file: File): Promise<{ success: boolean; message: string; importedCount?: number }> {
    try {
      const fileText = await file.text();
      const importData: ExportData = JSON.parse(fileText);
      
      if (!importData.tasks || !Array.isArray(importData.tasks)) {
        return { success: false, message: 'Invalid file format: Missing tasks array' };
      }

      // Validate and clean tasks
      const validTasks: Task[] = [];
      for (const task of importData.tasks) {
        if (this.isValidTask(task)) {
          validTasks.push({
            ...task,
            dueDate: new Date(task.dueDate),
            createdDate: new Date(task.createdDate),
            tags: task.tags || [],
            subtasks: task.subtasks || []
          });
        }
      }

      if (validTasks.length === 0) {
        return { success: false, message: 'No valid tasks found in the file' };
      }

      // Get existing tasks and merge
      const existingTasks = this.getStoredTasks();
      const mergedTasks = this.mergeTasks(existingTasks, validTasks);
      
      // Save merged tasks
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedTasks));
      
      return { 
        success: true, 
        message: `Successfully imported ${validTasks.length} tasks`,
        importedCount: validTasks.length
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private isValidTask(task: any): boolean {
    return task &&
           typeof task.title === 'string' &&
           typeof task.description === 'string' &&
           task.dueDate &&
           task.createdDate &&
           ['low', 'medium', 'high', 'urgent'].includes(task.priority) &&
           ['pending', 'in-progress', 'completed', 'cancelled'].includes(task.status) &&
           ['work', 'personal', 'health', 'learning', 'other'].includes(task.category);
  }

  private mergeTasks(existing: Task[], imported: Task[]): Task[] {
    const maxId = existing.length > 0 ? Math.max(...existing.map(t => t.id)) : 0;
    
    // Assign new IDs to imported tasks to avoid conflicts
    const importedWithNewIds = imported.map((task, index) => ({
      ...task,
      id: maxId + index + 1
    }));

    return [...existing, ...importedWithNewIds];
  }

  private getStoredTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdDate: new Date(task.createdDate)
        }));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    return [];
  }

  clearAllData(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm(
        '⚠️ This will permanently delete ALL your tasks and data. This action cannot be undone.\n\nAre you absolutely sure?'
      );
      
      if (confirmed) {
        localStorage.removeItem(this.STORAGE_KEY);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  getDataStats(): { totalTasks: number; completedTasks: number; dataSize: string; lastModified: string } {
    const tasks = this.getStoredTasks();
    const dataStr = localStorage.getItem(this.STORAGE_KEY) || '[]';
    const dataSize = new Blob([dataStr]).size;
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      dataSize: this.formatBytes(dataSize),
      lastModified: tasks.length > 0 ? 
        Math.max(...tasks.map(t => t.createdDate.getTime())).toString() : 
        'Never'
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
