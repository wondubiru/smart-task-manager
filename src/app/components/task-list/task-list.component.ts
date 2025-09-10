import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  allTasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchQuery = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedCategory = '';
  sortBy: 'dueDate' | 'priority' | 'createdDate' | 'title' = 'dueDate';
  sortAscending = true;
  
  private tasksSubscription?: Subscription;

  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'health', label: 'Health' },
    { value: 'learning', label: 'Learning' },
    { value: 'other', label: 'Other' }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.tasksSubscription = this.taskService.getTasksObservable().subscribe(tasks => {
      this.allTasks = tasks;
      this.applyFiltersAndSort();
    });
  }

  ngOnDestroy(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  toggleSortDirection(): void {
    this.sortAscending = !this.sortAscending;
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let tasks = this.allTasks;

    // Apply search
    if (this.searchQuery.trim()) {
      tasks = this.taskService.searchTasks(this.searchQuery);
    }

    // Apply filters
    tasks = this.taskService.filterTasks({
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
      category: this.selectedCategory || undefined
    });

    // Apply sorting
    this.filteredTasks = this.taskService.sortTasks(tasks, this.sortBy, this.sortAscending);
  }

  deleteTask(taskId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  toggleTaskStatus(taskId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const task = this.taskService.getTaskById(taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      this.taskService.updateTask(taskId, { status: newStatus });
    }
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCategory = '';
    this.sortBy = 'dueDate';
    this.sortAscending = true;
    this.applyFiltersAndSort();
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

  isOverdue(task: Task): boolean {
    return task.status !== 'completed' && task.dueDate < new Date();
  }

  getCompletedSubtasksCount(task: Task): number {
    return task.subtasks?.filter(st => st.completed).length || 0;
  }

  getTotalSubtasksCount(task: Task): number {
    return task.subtasks?.length || 0;
  }
}
