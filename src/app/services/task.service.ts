import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
    { id: 1, title: 'Learn Angular', description: 'Revise basics', dueDate: new Date(), priority: 'high', status: 'pending' }
  ];

  getTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  addTask(taskData: Omit<Task, 'id'>) {  // remove 'id' from type
    const newTask: Task = {
      ...taskData,
      id: this.tasks.length + 1   // auto-generate id
    };
    this.tasks.push(newTask);
  }
  
}
