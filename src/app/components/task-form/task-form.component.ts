import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskTemplatesService, TaskTemplate } from '../../services/task-templates.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
    dueDate: new FormControl('', Validators.required),
    priority: new FormControl('medium', Validators.required),
    status: new FormControl('pending', Validators.required),
    category: new FormControl('other', Validators.required),
    estimatedHours: new FormControl('', [Validators.min(0.5), Validators.max(1000)]),
    actualHours: new FormControl('', [Validators.min(0), Validators.max(1000)]),
    tags: new FormControl(''),
    subtasks: new FormArray([])
  });

  isEditMode = false;
  taskId?: number;
  newSubtaskTitle = '';
  templates: TaskTemplate[] = [];
  showTemplates = false;

  priorityOptions = [
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'urgent', label: 'Urgent', icon: '🔴' }
  ];

  statusOptions = [
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'in-progress', label: 'In Progress', icon: '🔄' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];

  categoryOptions = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  constructor(
    private taskService: TaskService,
    private taskTemplatesService: TaskTemplatesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = parseInt(id, 10);
      this.loadTaskForEdit();
    } else {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.taskForm.patchValue({
        dueDate: tomorrow.toISOString().split('T')[0]
      });
    }
  }

  get subtasksFormArray(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  private loadTaskForEdit(): void {
    if (this.taskId) {
      const task = this.taskService.getTaskById(this.taskId);
      if (task) {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate.toISOString().split('T')[0],
          priority: task.priority,
          status: task.status,
          category: task.category,
          estimatedHours: task.estimatedHours?.toString() || '',
          actualHours: task.actualHours?.toString() || '',
          tags: task.tags.join(', ')
        });

        // Load subtasks
        if (task.subtasks) {
          task.subtasks.forEach(subtask => {
            this.subtasksFormArray.push(new FormGroup({
              id: new FormControl(subtask.id),
              title: new FormControl(subtask.title, Validators.required),
              completed: new FormControl(subtask.completed)
            }));
          });
        }
      } else {
        this.router.navigate(['/tasks']);
      }
    }
  }

  addSubtask(): void {
    if (this.newSubtaskTitle.trim()) {
      const subtaskGroup = new FormGroup({
        id: new FormControl(this.subtasksFormArray.length + 1),
        title: new FormControl(this.newSubtaskTitle.trim(), Validators.required),
        completed: new FormControl(false)
      });
      
      this.subtasksFormArray.push(subtaskGroup);
      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number): void {
    this.subtasksFormArray.removeAt(index);
  }

  toggleSubtaskCompletion(index: number): void {
    const subtask = this.subtasksFormArray.at(index);
    subtask.patchValue({
      completed: !subtask.value.completed
    });
  }

  private parseTagsString(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData = {
        title: formValue.title || '',
        description: formValue.description || '',
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : new Date(),
        priority: formValue.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: formValue.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
        category: formValue.category as 'work' | 'personal' | 'health' | 'learning' | 'other',
        estimatedHours: formValue.estimatedHours ? parseFloat(formValue.estimatedHours) : undefined,
        actualHours: formValue.actualHours ? parseFloat(formValue.actualHours) : undefined,
        tags: this.parseTagsString(formValue.tags || ''),
        subtasks: this.subtasksFormArray.value.map((subtask: any) => ({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed
        }))
      };

      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, taskData);
      } else {
        this.taskService.addTask(taskData);
      }

      this.router.navigate(['/tasks']);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(field => {
      const control = this.taskForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    // Mark subtask controls as touched
    this.subtasksFormArray.controls.forEach(group => {
      Object.keys((group as FormGroup).controls).forEach(field => {
        const control = group.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} cannot exceed ${field.errors['max'].max}`;
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
