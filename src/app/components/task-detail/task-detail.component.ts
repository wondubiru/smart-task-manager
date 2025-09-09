import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="task; else notFound">
      <h2>{{ task.title }}</h2>
      <p>{{ task.description }}</p>
      <p>Due: {{ task.dueDate | date:'shortDate' }}</p>
      <p>Priority: {{ task.priority }}</p>
      <p>Status: {{ task.status }}</p>
      <a routerLink="/tasks">← Back to list</a>
    </div>
    <ng-template #notFound>
      <p>Task not found!</p>
      <a routerLink="/tasks">← Back to list</a>
    </ng-template>
  `
})
export class TaskDetailComponent {
  task: Task | undefined;

  constructor(private route: ActivatedRoute, private taskService: TaskService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.task = this.taskService.getTaskById(id);
  }
}
