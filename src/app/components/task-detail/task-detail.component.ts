import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task: Task | undefined;
  taskId: number = 0;
  newSubtaskTitle = '';
  private tasksSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId = parseInt(id, 10);
      this.loadTask();
      
      // Subscribe to task updates
      this.tasksSubscription = this.taskService.getTasksObservable().subscribe(() => {
        this.loadTask();
      });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  ngOnDestroy(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  private loadTask(): void {
    this.task = this.taskService.getTaskById(this.taskId);
    if (!this.task) {
      this.router.navigate(['/tasks']);
    }
  }

  deleteTask(): void {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      if (this.taskService.deleteTask(this.taskId)) {
        this.router.navigate(['/tasks']);
      }
    }
  }

  toggleTaskStatus(): void {
    if (this.task) {
      let newStatus: 'pending' | 'in-progress' | 'completed' | 'cancelled';
      
      switch (this.task.status) {
        case 'pending':
          newStatus = 'in-progress';
          break;
        case 'in-progress':
          newStatus = 'completed';
          break;
        case 'completed':
          newStatus = 'pending';
          break;
        case 'cancelled':
          newStatus = 'pending';
          break;
        default:
          newStatus = 'pending';
      }
      
      this.taskService.updateTask(this.taskId, { status: newStatus });
    }
  }

  addSubtask(): void {
    if (this.newSubtaskTitle.trim()) {
      this.taskService.addSubtask(this.taskId, this.newSubtaskTitle.trim());
      this.newSubtaskTitle = '';
    }
  }

  toggleSubtask(subtaskId: number): void {
    this.taskService.toggleSubtask(this.taskId, subtaskId);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'in-progress': return '#2563eb';
      case 'pending': return '#ca8a04';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'health': return '🏥';
      case 'learning': return '📚';
      case 'other': return '📋';
      default: return '📋';
    }
  }

  isOverdue(): boolean {
    return this.task ? this.task.status !== 'completed' && this.task.dueDate < new Date() : false;
  }

  getCompletedSubtasksCount(): number {
    return this.task?.subtasks?.filter(st => st.completed).length || 0;
  }

  getTotalSubtasksCount(): number {
    return this.task?.subtasks?.length || 0;
  }

  getProgressPercentage(): number {
    const total = this.getTotalSubtasksCount();
    if (total === 0) return 0;
    return Math.round((this.getCompletedSubtasksCount() / total) * 100);
  }
}
