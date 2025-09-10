import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags: string[];
  subtasks?: { title: string; }[];
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskTemplatesService {
  private readonly STORAGE_KEY = 'smart-task-manager-templates';
  private defaultTemplates: TaskTemplate[] = [
    {
      id: 'daily-standup',
      name: 'Daily Standup Meeting',
      description: 'Attend team standup meeting and share updates',
      category: 'work',
      priority: 'medium',
      estimatedHours: 0.5,
      tags: ['meeting', 'team', 'scrum'],
      subtasks: [
        { title: 'Prepare yesterday\'s accomplishments' },
        { title: 'List today\'s goals' },
        { title: 'Identify any blockers' }
      ],
      isRecurring: true,
      recurringPattern: 'daily',
      icon: '👥'
    },
    {
      id: 'code-review',
      name: 'Code Review',
      description: 'Review pull requests and provide feedback',
      category: 'work',
      priority: 'high',
      estimatedHours: 1,
      tags: ['development', 'quality', 'collaboration'],
      subtasks: [
        { title: 'Check code quality and standards' },
        { title: 'Test functionality' },
        { title: 'Provide constructive feedback' }
      ],
      icon: '🔍'
    },
    {
      id: 'workout',
      name: 'Daily Workout',
      description: 'Complete daily exercise routine',
      category: 'health',
      priority: 'medium',
      estimatedHours: 1,
      tags: ['fitness', 'health', 'routine'],
      subtasks: [
        { title: 'Warm up (10 minutes)' },
        { title: 'Main workout (40 minutes)' },
        { title: 'Cool down and stretch (10 minutes)' }
      ],
      isRecurring: true,
      recurringPattern: 'daily',
      icon: '💪'
    },
    {
      id: 'learning-session',
      name: 'Learning Session',
      description: 'Dedicated time for skill development',
      category: 'learning',
      priority: 'medium',
      estimatedHours: 2,
      tags: ['education', 'growth', 'skills'],
      subtasks: [
        { title: 'Review learning materials' },
        { title: 'Practice exercises' },
        { title: 'Take notes and reflect' }
      ],
      icon: '📚'
    },
    {
      id: 'weekly-planning',
      name: 'Weekly Planning',
      description: 'Plan and organize tasks for the upcoming week',
      category: 'personal',
      priority: 'high',
      estimatedHours: 1,
      tags: ['planning', 'organization', 'productivity'],
      subtasks: [
        { title: 'Review previous week\'s accomplishments' },
        { title: 'Set priorities for upcoming week' },
        { title: 'Schedule important tasks' },
        { title: 'Block time for focused work' }
      ],
      isRecurring: true,
      recurringPattern: 'weekly',
      icon: '📅'
    },
    {
      id: 'project-setup',
      name: 'New Project Setup',
      description: 'Initialize a new development project',
      category: 'work',
      priority: 'high',
      estimatedHours: 3,
      tags: ['development', 'setup', 'initialization'],
      subtasks: [
        { title: 'Create project repository' },
        { title: 'Set up development environment' },
        { title: 'Configure build tools' },
        { title: 'Create initial documentation' },
        { title: 'Set up CI/CD pipeline' }
      ],
      icon: '🚀'
    },
    {
      id: 'client-meeting',
      name: 'Client Meeting',
      description: 'Meet with client to discuss project requirements',
      category: 'work',
      priority: 'high',
      estimatedHours: 1.5,
      tags: ['meeting', 'client', 'requirements'],
      subtasks: [
        { title: 'Prepare meeting agenda' },
        { title: 'Review project status' },
        { title: 'Discuss requirements and changes' },
        { title: 'Document action items' }
      ],
      icon: '🤝'
    },
    {
      id: 'monthly-review',
      name: 'Monthly Review',
      description: 'Review monthly goals and progress',
      category: 'personal',
      priority: 'medium',
      estimatedHours: 2,
      tags: ['review', 'goals', 'reflection'],
      subtasks: [
        { title: 'Analyze completed tasks' },
        { title: 'Review goal achievement' },
        { title: 'Identify areas for improvement' },
        { title: 'Set goals for next month' }
      ],
      isRecurring: true,
      recurringPattern: 'monthly',
      icon: '📊'
    }
  ];

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.saveTemplates(this.defaultTemplates);
      }
    }
  }

  private saveTemplates(templates: TaskTemplate[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    }
  }

  getTemplates(): TaskTemplate[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.defaultTemplates;
    }
    return this.defaultTemplates;
  }

  getTemplateById(id: string): TaskTemplate | undefined {
    return this.getTemplates().find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): TaskTemplate[] {
    return this.getTemplates().filter(template => template.category === category);
  }

  getRecurringTemplates(): TaskTemplate[] {
    return this.getTemplates().filter(template => template.isRecurring);
  }

  createTaskFromTemplate(template: TaskTemplate, customTitle?: string): Omit<Task, 'id' | 'createdDate'> {
    const dueDate = new Date();
    
    // Set due date based on recurring pattern
    if (template.isRecurring) {
      switch (template.recurringPattern) {
        case 'daily':
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        default:
          dueDate.setDate(dueDate.getDate() + 1);
      }
    } else {
      dueDate.setDate(dueDate.getDate() + 3); // Default 3 days for non-recurring
    }

    return {
      title: customTitle || template.name,
      description: template.description,
      dueDate,
      priority: template.priority,
      status: 'pending',
      category: template.category,
      tags: [...template.tags],
      estimatedHours: template.estimatedHours,
      subtasks: template.subtasks?.map((subtask, index) => ({
        id: index + 1,
        title: subtask.title,
        completed: false
      }))
    };
  }

  addCustomTemplate(template: Omit<TaskTemplate, 'id'>): TaskTemplate {
    const templates = this.getTemplates();
    const newTemplate: TaskTemplate = {
      ...template,
      id: this.generateTemplateId()
    };
    
    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<TaskTemplate>): boolean {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      this.saveTemplates(templates);
      return true;
    }
    return false;
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    
    if (filtered.length !== templates.length) {
      this.saveTemplates(filtered);
      return true;
    }
    return false;
  }

  private generateTemplateId(): string {
    return 'template-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Get suggestions based on user's task history
  getSuggestedTemplates(recentTasks: Task[]): TaskTemplate[] {
    const templates = this.getTemplates();
    const userCategories = [...new Set(recentTasks.map(t => t.category))];
    const userTags = [...new Set(recentTasks.flatMap(t => t.tags || []))];
    
    return templates.filter(template => {
      // Suggest templates that match user's common categories or tags
      const categoryMatch = userCategories.includes(template.category);
      const tagMatch = template.tags.some(tag => userTags.includes(tag));
      return categoryMatch || tagMatch;
    }).slice(0, 5); // Return top 5 suggestions
  }

  // Export templates for sharing
  exportTemplates(): string {
    const templates = this.getTemplates().filter(t => !this.defaultTemplates.find(dt => dt.id === t.id));
    return JSON.stringify({ templates, exportDate: new Date().toISOString() }, null, 2);
  }

  // Import templates from JSON
  importTemplates(jsonData: string): { success: boolean, count: number, error?: string } {
    try {
      const data = JSON.parse(jsonData);
      const templates = this.getTemplates();
      let importedCount = 0;

      if (data.templates && Array.isArray(data.templates)) {
        data.templates.forEach((template: any) => {
          if (this.isValidTemplate(template)) {
            const existingIndex = templates.findIndex(t => t.id === template.id);
            if (existingIndex === -1) {
              templates.push(template);
              importedCount++;
            }
          }
        });

        this.saveTemplates(templates);
        return { success: true, count: importedCount };
      }

      return { success: false, count: 0, error: 'Invalid template format' };
    } catch (error) {
      return { success: false, count: 0, error: 'Invalid JSON format' };
    }
  }

  private isValidTemplate(template: any): boolean {
    return template &&
           typeof template.id === 'string' &&
           typeof template.name === 'string' &&
           typeof template.description === 'string' &&
           ['work', 'personal', 'health', 'learning', 'other'].includes(template.category) &&
           ['low', 'medium', 'high', 'urgent'].includes(template.priority);
  }
}