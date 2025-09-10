import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';

export const routes: Routes = [
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: 'add-task', component: TaskFormComponent },
  { path: 'edit-task/:id', component: TaskFormComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
  { path: '', redirectTo: '/tasks', pathMatch: 'full' }
];
