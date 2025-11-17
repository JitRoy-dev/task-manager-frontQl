import React from "react";
import { useTasks } from "../../hooks/useTasks";
import { useDarkMode } from "../../hooks/useDarkMode";
import { StatisticsCard } from "../StatisticsCard/StatisticsCard";
import { TaskForm } from "../TaskForm/TaskForm";
import { SearchAndFilters } from "../SearchAndFilters/SearchAndFilters";
import { TaskList } from "../TaskList/TaskList";
import "./TaskManager.css";

const TaskManager: React.FC = () => {
  const {
    tasks,
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
  } = useTasks();

  const { darkMode, toggleDarkMode } = useDarkMode();

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

  const emptyMessage =
    searchQuery || selectedCategory !== "all"
      ? "No tasks match your filters 🔍"
      : "No tasks yet. Add one to get started! 🎉";

  return (
    <div className="task-manager-wrapper">
      <div className="task-manager-container">
        <div className="header-section">
          <h2 className="task-manager-title">✨ Task Manager Pro</h2>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <StatisticsCard stats={stats} />

        <TaskForm onSubmit={handleAddTask} />

        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortType={sortType}
          onSortChange={setSortType}
        />

        <div className="task-section">
          <h3 className="section-title">📋 Tasks ({tasks.length})</h3>
          <TaskList
            tasks={tasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
