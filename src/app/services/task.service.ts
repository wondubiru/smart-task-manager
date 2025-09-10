import { Injectable } from '@angular/core';
import { Task, Subtask } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'smart-task-manager-tasks';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasksFromStorage();
  }

  private loadTasksFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.initializeDefaultTasks();
      return;
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const tasks = JSON.parse(stored).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdDate: new Date(task.createdDate)
        }));
        this.tasksSubject.next(tasks);
      } catch (error) {
        console.error('Error loading tasks from storage:', error);
        this.initializeDefaultTasks();
      }
    } else {
      this.initializeDefaultTasks();
    }
  }

  private initializeDefaultTasks(): void {
    const defaultTasks: Task[] = [
      {
        id: 1,
        title: 'Learn Angular',
        description: 'Master Angular fundamentals and advanced concepts',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdDate: new Date(),
        priority: 'high',
        status: 'in-progress',
        tags: ['learning', 'frontend', 'typescript'],
        estimatedHours: 20,
        actualHours: 5,
        category: 'learning',
        subtasks: [
          { id: 1, title: 'Complete Angular tutorial', completed: true },
          { id: 2, title: 'Build practice project', completed: false },
          { id: 3, title: 'Study advanced patterns', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Grocery Shopping',
        description: 'Buy weekly groceries and household items',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdDate: new Date(),
        priority: 'medium',
        status: 'pending',
        tags: ['shopping', 'weekly'],
        estimatedHours: 2,
        category: 'personal'
      }
    ];
    this.tasksSubject.next(defaultTasks);
    this.saveTasksToStorage();
  }

  private saveTasksToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tasks = this.tasksSubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    }
  }

  private getNextId(): number {
    const tasks = this.tasksSubject.value;
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  }

  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getTasksObservable(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasksSubject.value.find(t => t.id === id);
  }

  addTask(taskData: Omit<Task, 'id' | 'createdDate'>): void {
    const newTask: Task = {
      ...taskData,
      id: this.getNextId(),
      createdDate: new Date(),
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || []
    };
    const tasks = [...this.tasksSubject.value, newTask];
    this.tasksSubject.next(tasks);
    this.saveTasksToStorage();
  }

  updateTask(id: number, updates: Partial<Task>): boolean {
    const tasks = this.tasksSubject.value;
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.tasksSubject.next([...tasks]);
      this.saveTasksToStorage();
      return true;
    }
    return false;
  }

  deleteTask(id: number): boolean {
    const tasks = this.tasksSubject.value;
    const filteredTasks = tasks.filter(t => t.id !== id);
    if (filteredTasks.length !== tasks.length) {
      this.tasksSubject.next(filteredTasks);
      this.saveTasksToStorage();
      return true;
    }
    return false;
  }

  searchTasks(query: string): Task[] {
    if (!query.trim()) return this.tasksSubject.value;
    
    const lowercaseQuery = query.toLowerCase();
    return this.tasksSubject.value.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  filterTasks(filters: {
    status?: string;
    priority?: string;
    category?: string;
    tags?: string[];
  }): Task[] {
    let tasks = this.tasksSubject.value;

    if (filters.status) {
      tasks = tasks.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters.category) {
      tasks = tasks.filter(task => task.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      tasks = tasks.filter(task =>
        filters.tags!.some(tag => task.tags.includes(tag))
      );
    }

    return tasks;
  }

  sortTasks(tasks: Task[], sortBy: 'dueDate' | 'priority' | 'createdDate' | 'title', ascending = true): Task[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'createdDate':
          comparison = a.createdDate.getTime() - b.createdDate.getTime();
          break;
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return ascending ? comparison : -comparison;
    });
  }

  addSubtask(taskId: number, subtaskTitle: string): boolean {
    const task = this.getTaskById(taskId);
    if (task) {
      const subtasks = task.subtasks || [];
      const newSubtask: Subtask = {
        id: subtasks.length > 0 ? Math.max(...subtasks.map(s => s.id)) + 1 : 1,
        title: subtaskTitle,
        completed: false
      };
      return this.updateTask(taskId, { subtasks: [...subtasks, newSubtask] });
    }
    return false;
  }

  toggleSubtask(taskId: number, subtaskId: number): boolean {
    const task = this.getTaskById(taskId);
    if (task && task.subtasks) {
      const updatedSubtasks = task.subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      return this.updateTask(taskId, { subtasks: updatedSubtasks });
    }
    return false;
  }

  getTaskStats(): { total: number; completed: number; pending: number; inProgress: number; overdue: number } {
    const tasks = this.tasksSubject.value;
    const now = new Date();
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.status !== 'completed' && t.dueDate < now).length
    };
  }
}
