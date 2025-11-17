import React from "react";
import type { Task } from "../../types/task.types";
import { TaskItem } from "../TaskItem/TaskItem";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (taskId: number, data: { title: string; priority: string; category: string; dueDate: string }) => Promise<void>;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete, onUpdate, emptyMessage }) => {
  if (tasks.length === 0) {
    return <p className="empty-state">{emptyMessage || "No tasks yet. Add one to get started! 🎉"}</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
};
