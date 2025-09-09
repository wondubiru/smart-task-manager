import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  taskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    dueDate: new FormControl('', Validators.required),
    priority: new FormControl('medium', Validators.required),
    status: new FormControl('pending', Validators.required)
  });

  constructor(private taskService: TaskService, private router: Router) {}

  onSubmit() {
    if (this.taskForm.valid) {
      const newTask = {
        title: this.taskForm.value.title || '',
        description: this.taskForm.value.description || '',
        dueDate: this.taskForm.value.dueDate ? new Date(this.taskForm.value.dueDate) : new Date(),
        priority: this.taskForm.value.priority as 'low' | 'medium' | 'high',
        status: this.taskForm.value.status as 'pending' | 'completed'
      };

      this.taskService.addTask(newTask);
      this.router.navigate(['/tasks']);
    }
  }
}
