import React from "react";
import type { FilterType, SortType, Category } from "../../types/task.types";
import "./SearchAndFilters.css";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  sortType,
  onSortChange,
}) => {
  return (
    <div className="controls-section">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-controls">
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value as FilterType)}
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category | "all")}
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
          onChange={(e) => onSortChange(e.target.value as SortType)}
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>
    </div>
  );
};
