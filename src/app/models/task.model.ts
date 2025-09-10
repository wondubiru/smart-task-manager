export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: Date;
    createdDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    tags: string[];
    estimatedHours?: number;
    actualHours?: number;
    category: 'work' | 'personal' | 'health' | 'learning' | 'other';
    subtasks?: Subtask[];
  }

  export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
  }