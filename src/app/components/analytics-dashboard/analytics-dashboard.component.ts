import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subscription } from 'rxjs';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTimePerTask: number;
  productivityScore: number;
  streakDays: number;
  overdueTasks: number;
  timeEfficiency: number;
  mostProductiveHour: string;
  categoriesBreakdown: { category: string; count: number; percentage: number; }[];
  priorityBreakdown: { priority: string; count: number; percentage: number; }[];
  weeklyProgress: { day: string; completed: number; created: number; }[];
  monthlyTrends: { month: string; productivity: number; }[];
  estimationAccuracy: number;
  burnoutRisk: 'low' | 'medium' | 'high';
  focusTimeRecommendation: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  metrics: ProductivityMetrics | null = null;
  tasks: Task[] = [];
  private tasksSubscription?: Subscription;
  isLoading = true;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.tasksSubscription = this.taskService.getTasksObservable().subscribe(tasks => {
      this.tasks = tasks;
      this.calculateMetrics();
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  private calculateMetrics(): void {
    if (this.tasks.length === 0) {
      this.metrics = this.getEmptyMetrics();
      return;
    }

    const now = new Date();
    const completedTasks = this.tasks.filter(t => t.status === 'completed');
    const overdueTasks = this.tasks.filter(t => t.status !== 'completed' && t.dueDate < now);
    
    this.metrics = {
      totalTasks: this.tasks.length,
      completedTasks: completedTasks.length,
      completionRate: Math.round((completedTasks.length / this.tasks.length) * 100),
      averageTimePerTask: this.calculateAverageTime(),
      productivityScore: this.calculateProductivityScore(),
      streakDays: this.calculateStreakDays(),
      overdueTasks: overdueTasks.length,
      timeEfficiency: this.calculateTimeEfficiency(),
      mostProductiveHour: this.getMostProductiveHour(),
      categoriesBreakdown: this.getCategoriesBreakdown(),
      priorityBreakdown: this.getPriorityBreakdown(),
      weeklyProgress: this.getWeeklyProgress(),
      monthlyTrends: this.getMonthlyTrends(),
      estimationAccuracy: this.calculateEstimationAccuracy(),
      burnoutRisk: this.calculateBurnoutRisk(),
      focusTimeRecommendation: this.getFocusTimeRecommendation()
    };
  }

  private getEmptyMetrics(): ProductivityMetrics {
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      averageTimePerTask: 0,
      productivityScore: 0,
      streakDays: 0,
      overdueTasks: 0,
      timeEfficiency: 0,
      mostProductiveHour: 'N/A',
      categoriesBreakdown: [],
      priorityBreakdown: [],
      weeklyProgress: [],
      monthlyTrends: [],
      estimationAccuracy: 0,
      burnoutRisk: 'low',
      focusTimeRecommendation: 'Start adding tasks to get personalized recommendations!'
    };
  }

  private calculateAverageTime(): number {
    const tasksWithTime = this.tasks.filter(t => t.actualHours && t.actualHours > 0);
    if (tasksWithTime.length === 0) return 0;
    
    const totalTime = tasksWithTime.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    return Math.round((totalTime / tasksWithTime.length) * 10) / 10;
  }

  private calculateProductivityScore(): number {
    const weights = {
      completion: 0.4,
      timeliness: 0.3,
      efficiency: 0.2,
      consistency: 0.1
    };

    const completionScore = (this.tasks.filter(t => t.status === 'completed').length / this.tasks.length) * 100;
    const timelinessScore = this.calculateTimelinessScore();
    const efficiencyScore = this.calculateTimeEfficiency();
    const consistencyScore = this.calculateConsistencyScore();

    return Math.round(
      completionScore * weights.completion +
      timelinessScore * weights.timeliness +
      efficiencyScore * weights.efficiency +
      consistencyScore * weights.consistency
    );
  }

  private calculateTimelinessScore(): number {
    const now = new Date();
    const completedOnTime = this.tasks.filter(t => 
      t.status === 'completed' && t.dueDate >= now
    ).length;
    const total = this.tasks.filter(t => t.status === 'completed').length;
    
    return total > 0 ? (completedOnTime / total) * 100 : 100;
  }

  private calculateTimeEfficiency(): number {
    const tasksWithBothTimes = this.tasks.filter(t => 
      t.estimatedHours && t.actualHours && t.estimatedHours > 0 && t.actualHours > 0
    );
    
    if (tasksWithBothTimes.length === 0) return 100;
    
    const efficiencies = tasksWithBothTimes.map(task => {
      const efficiency = (task.estimatedHours! / task.actualHours!) * 100;
      return Math.min(efficiency, 200); // Cap at 200% to handle super-efficient tasks
    });
    
    const averageEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    return Math.round(averageEfficiency);
  }

  private calculateConsistencyScore(): number {
    // Calculate based on task completion frequency over time
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const dailyCompletions = last7Days.map(day => 
      this.tasks.filter(t => 
        t.status === 'completed' && 
        t.dueDate.toDateString() === day
      ).length
    );

    const average = dailyCompletions.reduce((sum, count) => sum + count, 0) / 7;
    const variance = dailyCompletions.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / 7;
    const consistency = Math.max(0, 100 - (variance * 10)); // Convert variance to consistency score
    
    return Math.round(consistency);
  }

  private calculateStreakDays(): number {
    const sortedTasks = this.tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasCompletion = sortedTasks.some(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });

      if (hasCompletion) {
        streak++;
      } else if (i > 0) { // Allow skipping today if no tasks completed yet
        break;
      }
    }

    return streak;
  }

  private getMostProductiveHour(): string {
    // Simulate based on task creation patterns
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourCounts = hours.map(hour => ({
      hour,
      count: this.tasks.filter(t => t.createdDate.getHours() === hour).length
    }));

    const mostProductive = hourCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    );

    if (mostProductive.count === 0) return 'N/A';
    
    const hour = mostProductive.hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  }

  private getCategoriesBreakdown(): { category: string; count: number; percentage: number; }[] {
    const categories = ['work', 'personal', 'health', 'learning', 'other'];
    return categories.map(category => {
      const count = this.tasks.filter(t => t.category === category).length;
      const percentage = this.tasks.length > 0 ? Math.round((count / this.tasks.length) * 100) : 0;
      return { category, count, percentage };
    }).filter(item => item.count > 0);
  }

  private getPriorityBreakdown(): { priority: string; count: number; percentage: number; }[] {
    const priorities = ['urgent', 'high', 'medium', 'low'];
    return priorities.map(priority => {
      const count = this.tasks.filter(t => t.priority === priority).length;
      const percentage = this.tasks.length > 0 ? Math.round((count / this.tasks.length) * 100) : 0;
      return { priority, count, percentage };
    }).filter(item => item.count > 0);
  }

  private getWeeklyProgress(): { day: string; completed: number; created: number; }[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    
    return days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index)); // Last 7 days
      
      const completed = this.tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return t.status === 'completed' && 
               taskDate.toDateString() === date.toDateString();
      }).length;
      
      const created = this.tasks.filter(t => {
        const taskDate = new Date(t.createdDate);
        return taskDate.toDateString() === date.toDateString();
      }).length;
      
      return { day, completed, created };
    });
  }

  private getMonthlyTrends(): { month: string; productivity: number; }[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      productivity: Math.floor(Math.random() * 40) + 60 // Simulated for now
    }));
  }

  private calculateEstimationAccuracy(): number {
    const tasksWithEstimates = this.tasks.filter(t => 
      t.estimatedHours && t.actualHours && t.estimatedHours > 0 && t.actualHours > 0
    );
    
    if (tasksWithEstimates.length === 0) return 0;
    
    const accuracies = tasksWithEstimates.map(task => {
      const diff = Math.abs(task.estimatedHours! - task.actualHours!);
      const accuracy = Math.max(0, 100 - (diff / task.estimatedHours!) * 100);
      return accuracy;
    });
    
    return Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length);
  }

  private calculateBurnoutRisk(): 'low' | 'medium' | 'high' {
    const now = new Date();
    const last7Days = this.tasks.filter(t => {
      const daysDiff = (now.getTime() - t.createdDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });
    
    const overdueCount = this.tasks.filter(t => t.status !== 'completed' && t.dueDate < now).length;
    const workloadScore = last7Days.length;
    const stressScore = overdueCount * 2;
    
    const totalScore = workloadScore + stressScore;
    
    if (totalScore > 15) return 'high';
    if (totalScore > 8) return 'medium';
    return 'low';
  }

  private getFocusTimeRecommendation(): string {
    const mostProductiveHour = this.getMostProductiveHour();
    const burnoutRisk = this.calculateBurnoutRisk();
    
    if (burnoutRisk === 'high') {
      return "Take a break! Consider reducing your workload and focusing on high-priority tasks.";
    }
    
    if (mostProductiveHour !== 'N/A') {
      return `Your peak productivity is around ${mostProductiveHour}. Schedule important tasks during this time!`;
    }
    
    return "Track your task completion times to discover your peak productivity hours!";
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

  getBurnoutRiskColor(): string {
    if (!this.metrics) return '#16a34a';
    switch (this.metrics.burnoutRisk) {
      case 'high': return '#dc2626';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#16a34a';
    }
  }

  getProductivityScoreColor(): string {
    if (!this.metrics) return '#6b7280';
    const score = this.metrics.productivityScore;
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    return '#dc2626';
  }

  // Make Math available in template
  Math = Math;

  // Helper method for work percentage
  getWorkPercentage(): number {
    if (!this.metrics) return 0;
    return this.metrics.categoriesBreakdown.find(c => c.category === 'work')?.percentage || 0;
  }
}
