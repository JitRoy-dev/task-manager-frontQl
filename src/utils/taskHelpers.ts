// Task utility functions

import type { Priority, Category } from "../types/task.types";

/**
 * Get color for priority level
 */
export function getPriorityColor(priority?: Priority): string {
  switch (priority) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
}

/**
 * Get icon for category
 */
export function getCategoryIcon(category?: Category): string {
  switch (category) {
    case "work":
      return "💼";
    case "personal":
      return "👤";
    case "shopping":
      return "🛒";
    case "health":
      return "💪";
    case "other":
      return "📌";
    default:
      return "📌";
  }
}

/**
 * Get label for category
 */
export function getCategoryLabel(category?: Category): string {
  switch (category) {
    case "work":
      return "Work";
    case "personal":
      return "Personal";
    case "shopping":
      return "Shopping";
    case "health":
      return "Health";
    case "other":
      return "Other";
    default:
      return "Personal";
  }
}

/**
 * Get label for priority
 */
export function getPriorityLabel(priority?: Priority): string {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "Medium Priority";
  }
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "";
  }
}
