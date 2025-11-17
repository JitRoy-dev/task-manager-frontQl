import React from "react";
import { useForm } from "react-hook-form";
import type { TaskFormData } from "../../types/task.types";
import "./TaskForm.css";

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    defaultValues: {
      priority: "medium",
      category: "personal",
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
    reset({
      title: "",
      priority: "medium",
      category: "personal",
      dueDate: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="task-form">
      <div className="form-group">
        <label className="form-label">Task Title</label>
        <input
          className="form-input"
          {...register("title", { required: "Task title is required" })}
          placeholder="What needs to be done?"
        />
        {errors.title && <p className="error-message">⚠️ {errors.title.message}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" {...register("priority")}>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" {...register("category")}>
            <option value="personal">👤 Personal</option>
            <option value="work">💼 Work</option>
            <option value="shopping">🛒 Shopping</option>
            <option value="health">💪 Health</option>
            <option value="other">📌 Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-input" {...register("dueDate")} />
        </div>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "➕ Add Task"}
      </button>
    </form>
  );
};
