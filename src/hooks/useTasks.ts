// Custom hook for task management logic

import { useState, useEffect, useMemo } from "react";
import { addTask, fetchTasks, completeTask, deleteTask, updateTask } from "../api";
import type { Task, TaskFormData, TaskStats, FilterType, SortType, Category } from "../types/task.types";
import { isOverdue } from "../utils/taskHelpers";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("date");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    console.log("Fetching tasks...");
    try {
      const response = await fetchTasks();

      if (Array.isArray(response)) {
        const tasks = response.map((task) => ({
          ...task,
          priority: task.priority || "medium",
          category: task.category || "personal",
          dueDate: task.dueDate || "",
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

  const handleAddTask = async (data: TaskFormData) => {
    console.log("Task Submitted:", data);
    try {
      await addTask({
        title: data.title,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
      await fetchAllTasks();
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Something went wrong. Please try again later.");
      throw error;
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask(id);
      await fetchAllTasks();
    } catch (error) {
      console.error("Complete Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      await fetchAllTasks();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleUpdateTask = async (
    taskId: number,
    updateData: {
      title: string;
      priority: string;
      category: string;
      dueDate: string;
    }
  ) => {
    try {
      await updateTask(taskId, updateData);
      await fetchAllTasks();
    } catch (error) {
      console.error("Update Error:", error);
      alert("Something went wrong. Please try again later.");
      throw error;
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filterType === "active" && task.completed) return false;
      if (filterType === "completed" && !task.completed) return false;

      if (selectedCategory !== "all" && task.category !== selectedCategory) return false;

      return true;
    });

    filtered.sort((a, b) => {
      if (sortType === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      } else if (sortType === "title") {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, filterType, sortType, selectedCategory]);

  // Statistics
  const stats: TaskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter((t) => !t.completed && t.priority === "high").length;
    const overdue = tasks.filter((t) => {
      if (t.completed || !t.dueDate) return false;
      return isOverdue(t.dueDate);
    }).length;

    return { total, completed, active, highPriority, overdue };
  }, [tasks]);

  return {
    tasks: filteredAndSortedTasks,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortType,
    setSortType,
    selectedCategory,
    setSelectedCategory,
    handleAddTask,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTask,
  };
}
