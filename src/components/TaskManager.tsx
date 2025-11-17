import React from "react";
import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import { addTask, fetchTasks, completeTask, deleteTask, updateTask } from "../api";
import "./TaskManager.css";

type Priority = "high" | "medium" | "low";
type Category = "work" | "personal" | "shopping" | "health" | "other";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
};

type FormData = {
  title: string;
  priority: Priority;
  category: Category;
  dueDate: string;
};

type FilterType = "all" | "active" | "completed";
type SortType = "date" | "priority" | "title";

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("date");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [darkMode, setDarkMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    priority: Priority;
    category: Category;
    dueDate: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      priority: "medium",
      category: "personal",
    }
  });

  useEffect(() => {
    fetchAllTasks();
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);



  const fetchAllTasks = async () => {
    console.log("Fetching tasks...");
    try {
      const response = await fetchTasks();

      if (Array.isArray(response)) {
        // Data now comes from backend with proper formatting
        const tasks = response.map(task => ({
          ...task,
          priority: task.priority || "medium",
          category: task.category || "personal",
          dueDate: task.dueDate || "", // Already formatted by API
        }));

        console.log("Tasks from backend:", tasks);
        setTasks(tasks);
      } else {
        console.warn("API did not return an array:", response);
        setTasks([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setTasks([]);
      alert("Something went wrong while fetching tasks. Please try again later.");
      setLoading(false);
    }
  };


  const onSubmit = async (data: FormData) => {
    console.log("Task Submitted:", data);
    try {
      // Send all data to backend including metadata
      const response = await addTask({
        title: data.title,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
      });
      console.log("Add Task Response:", response);

      reset({
        title: "",
        priority: "medium",
        category: "personal",
        dueDate: "",
      });

      // Small delay to ensure backend has processed the task
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch all tasks to refresh the list
      await fetchAllTasks();
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask(id);
      fetchAllTasks();
    } catch (error) {
      console.error("Complete Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);

      // Clean up metadata from localStorage
      const savedMetadata = localStorage.getItem("tasksMetadata");
      if (savedMetadata) {
        const metadata = JSON.parse(savedMetadata);
        const updatedMetadata = metadata.filter((m: Task) => m.id !== id);
        localStorage.setItem("tasksMetadata", JSON.stringify(updatedMetadata));
      }

      fetchAllTasks();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFormData({
      title: task.title,
      priority: task.priority || "medium",
      category: task.category || "personal",
      dueDate: task.dueDate || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editFormData) return;

    try {
      // Update title in backend if changed
      const task = tasks.find(t => t.id === taskId);
      if (task && editFormData.title !== task.title) {
        await updateTask(taskId, editFormData.title);
      }

      // Send all data to backend
      await updateTask(taskId, {
        title: editFormData.title,
        priority: editFormData.priority,
        category: editFormData.category,
        dueDate: editFormData.dueDate,
      });

      console.log("Task updated successfully");

      // Refresh tasks from backend
      await fetchAllTasks();

      setEditingTaskId(null);
      setEditFormData(null);
    } catch (error) {
      console.error("Update Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.body.classList.toggle("dark-mode");
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterType === "active" && task.completed) return false;
      if (filterType === "completed" && !task.completed) return false;

      // Category filter
      if (selectedCategory !== "all" && task.category !== selectedCategory) return false;

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortType === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      } else if (sortType === "title") {
        return a.title.localeCompare(b.title);
      } else {
        // Sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterType, sortType, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter(t => !t.completed && t.priority === "high").length;
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, completed, active, highPriority, overdue };
  }, [tasks]);

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="task-manager-wrapper">
        <div className="task-manager-container">
          <h2 className="task-manager-title">Task Manager</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-manager-wrapper">
      <div className="task-manager-container">
        <div className="header-section">
          <h2 className="task-manager-title">✨ Task Manager Pro</h2>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Statistics Dashboard */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card stat-urgent">
            <div className="stat-value">{stats.highPriority}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="task-form">
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              className="form-input"
              {...register("title", { required: "Task title is required" })}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="error-message">⚠️ {errors.title.message}</p>
            )}
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
              <input
                type="date"
                className="form-input"
                {...register("dueDate")}
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "➕ Add Task"}
          </button>
        </form>

        {/* Search and Filters */}
        <div className="controls-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | "all")}
            >
              <option value="all">All Categories</option>
              <option value="personal">👤 Personal</option>
              <option value="work">💼 Work</option>
              <option value="shopping">🛒 Shopping</option>
              <option value="health">💪 Health</option>
              <option value="other">📌 Other</option>
            </select>

            <select
              className="filter-select"
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="task-section">
          <h3 className="section-title">
            📋 Tasks ({filteredAndSortedTasks.length})
          </h3>
          <div>
            {filteredAndSortedTasks.length === 0 ? (
              <p className="empty-state">
                {searchQuery || selectedCategory !== "all"
                  ? "No tasks match your filters 🔍"
                  : "No tasks yet. Add one to get started! 🎉"}
              </p>
            ) : (
              filteredAndSortedTasks.map(task => {
                const isEditing = editingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`task-item ${task.completed ? 'completed-task' : ''} ${isOverdue(task.dueDate) && !task.completed ? 'overdue-task' : ''} ${isEditing ? 'editing' : ''}`}
                  >
                    {isEditing ? (
                      // Edit Mode
                      <>
                        <div className="task-main edit-mode">
                          <div
                            className="priority-indicator"
                            style={{ backgroundColor: getPriorityColor(editFormData?.priority) }}
                          />
                          <div className="task-edit-form">
                            <input
                              type="text"
                              className="edit-title-input"
                              value={editFormData?.title || ""}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, title: e.target.value } : null)}
                              placeholder="Task title"
                            />
                            <div className="edit-metadata-row">
                              <select
                                className="edit-select"
                                value={editFormData?.priority || "medium"}
                                onChange={(e) => setEditFormData(prev => prev ? { ...prev, priority: e.target.value as Priority } : null)}
                              >
                                <option value="low">🟢 Low Priority</option>
                                <option value="medium">🟡 Medium Priority</option>
                                <option value="high">🔴 High Priority</option>
                              </select>
                              <select
                                className="edit-select"
                                value={editFormData?.category || "personal"}
                                onChange={(e) => setEditFormData(prev => prev ? { ...prev, category: e.target.value as Category } : null)}
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
                                value={editFormData?.dueDate || ""}
                                onChange={(e) => setEditFormData(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="task-actions">
                          <button
                            className="task-button save-button"
                            onClick={() => handleSaveEdit(task.id)}
                            title="Save changes"
                          >
                            💾 Save
                          </button>
                          <button
                            className="task-button cancel-button"
                            onClick={handleCancelEdit}
                            title="Cancel editing"
                          >
                            ✖️ Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      // Display Mode
                      <>
                        <div className="task-main">
                          <div
                            className="priority-indicator"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          />
                          <div className="task-details">
                            <div className="task-header-row">
                              <span className={`task-content ${task.completed ? 'completed' : ''}`}>
                                {task.title}
                              </span>
                              <span className="category-badge">
                                {task.category === "work" && "💼 Work"}
                                {task.category === "personal" && "👤 Personal"}
                                {task.category === "shopping" && "🛒 Shopping"}
                                {task.category === "health" && "💪 Health"}
                                {task.category === "other" && "📌 Other"}
                                {!task.category && "👤 Personal"}
                              </span>
                            </div>
                            <div className="task-meta">
                              <span className="priority-badge" style={{ color: getPriorityColor(task.priority) }}>
                                {task.priority === "high" && "🔴 High Priority"}
                                {task.priority === "medium" && "🟡 Medium Priority"}
                                {task.priority === "low" && "🟢 Low Priority"}
                                {!task.priority && "🟡 Medium Priority"}
                              </span>
                              {task.dueDate && (
                                <span className={`due-date ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}>
                                  📅 {new Date(task.dueDate).toLocaleDateString()}
                                  {isOverdue(task.dueDate) && !task.completed && " (Overdue!)"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="task-actions">
                          {!task.completed && (
                            <button
                              className="task-button complete-button"
                              onClick={() => handleCompleteTask(task.id)}
                              title="Mark as complete"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className="task-button update-button"
                            onClick={() => handleEditClick(task)}
                            title="Edit task"
                          >
                            ✏️
                          </button>
                          <button
                            className="task-button delete-button"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
