import React, { useState } from "react";
import type { Task } from "../../types/task.types";
import { getPriorityColor, getCategoryIcon, getCategoryLabel, getPriorityLabel, isOverdue, formatDateForDisplay } from "../../utils/taskHelpers";
import "./TaskItem.css";

interface TaskItemProps {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (taskId: number, data: { title: string; priority: string; category: string; dueDate: string }) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: task.title,
    priority: task.priority || "medium",
    category: task.category || "personal",
    dueDate: task.dueDate || "",
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      title: task.title,
      priority: task.priority || "medium",
      category: task.category || "personal",
      dueDate: task.dueDate || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(task.id, editFormData);
      setIsEditing(false);
    } catch (error) {
      // Error already handled in parent
    }
  };

  if (isEditing) {
    return (
      <div className={`task-item editing`}>
        <div className="task-main edit-mode">
          <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(editFormData.priority as any) }} />
          <div className="task-edit-form">
            <input
              type="text"
              className="edit-title-input"
              value={editFormData.title}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
            <div className="edit-metadata-row">
              <select
                className="edit-select"
                value={editFormData.priority}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              <select
                className="edit-select"
                value={editFormData.category}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="personal">👤 Personal</option>
                <option value="work">💼 Work</option>
                <option value="shopping">🛒 Shopping</option>
                <option value="health">💪 Health</option>
                <option value="other">📌 Other</option>
              </select>
              <input
                type="date"
                className="edit-date-input"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="task-actions">
          <button className="task-button save-button" onClick={handleSaveEdit} title="Save changes">
            💾 Save
          </button>
          <button className="task-button cancel-button" onClick={handleCancelEdit} title="Cancel editing">
            ✖️ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`task-item ${task.completed ? "completed-task" : ""} ${
        isOverdue(task.dueDate) && !task.completed ? "overdue-task" : ""
      }`}
    >
      <div className="task-main">
        <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(task.priority) }} />
        <div className="task-details">
          <div className="task-header-row">
            <span className={`task-content ${task.completed ? "completed" : ""}`}>{task.title}</span>
            <span className="category-badge">
              {getCategoryIcon(task.category)} {getCategoryLabel(task.category)}
            </span>
          </div>
          <div className="task-meta">
            <span className="priority-badge" style={{ color: getPriorityColor(task.priority) }}>
              {task.priority === "high" && "🔴"}
              {task.priority === "medium" && "🟡"}
              {task.priority === "low" && "🟢"}
              {!task.priority && "🟡"} {getPriorityLabel(task.priority)}
            </span>
            {task.dueDate && (
              <span className={`due-date ${isOverdue(task.dueDate) && !task.completed ? "overdue" : ""}`}>
                📅 {formatDateForDisplay(task.dueDate)}
                {isOverdue(task.dueDate) && !task.completed && " (Overdue!)"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="task-actions">
        {!task.completed && (
          <button className="task-button complete-button" onClick={() => onComplete(task.id)} title="Mark as complete">
            ✓
          </button>
        )}
        <button className="task-button update-button" onClick={handleEditClick} title="Edit task">
          ✏️
        </button>
        <button className="task-button delete-button" onClick={() => onDelete(task.id)} title="Delete task">
          🗑️
        </button>
      </div>
    </div>
  );
};
