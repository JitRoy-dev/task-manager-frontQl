// Task-related TypeScript types

export type Priority = "high" | "medium" | "low";
export type Category = "work" | "personal" | "shopping" | "health" | "other";
export type FilterType = "all" | "active" | "completed";
export type SortType = "date" | "priority" | "title";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
}

export interface TaskFormData {
  title: string;
  priority: Priority;
  category: Category;
  dueDate: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  highPriority: number;
  overdue: number;
}
