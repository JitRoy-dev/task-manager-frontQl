import Api from "../services/Api";

/**
 * Formats a date string to SQL DATE format (YYYY-MM-DD)
 */
function formatDateForSQL(dateString) {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

// Add new task
export async function addTask(formData) {
  console.log("Adding task:", formData);

  // Prepare the data for database insertion
  const taskEntry = {
    title: formData.title,
    completed: false
  };

  // Add optional fields if they exist in the database
  if (formData.priority) {
    taskEntry.priority = formData.priority;
  }
  
  if (formData.category) {
    taskEntry.category = formData.category;
  }
  
  if (formData.dueDate) {
    // Format date to SQL format (YYYY-MM-DD)
    const sqlDate = formatDateForSQL(formData.dueDate);
    if (sqlDate) {
      taskEntry.due_date = sqlDate;
      console.log('Formatted due_date for SQL:', sqlDate);
    }
  }

  console.log('Task entry to be sent:', taskEntry);

  try {
    const response = await Api.post("/joynur_rahman_users", {
      body: taskEntry,
    });

    // Handle API response format
    if (response && response.err) {
      console.error("API Error:", response.result);
      throw new Error(response.result);
    }

    console.log("Task added successfully:", response);
    return response;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
}

/**
 * Formats SQL date to HTML date input format (YYYY-MM-DD)
 */
function formatSQLDateForInput(sqlDate) {
  if (!sqlDate) {
    return '';
  }

  try {
    // SQL dates are in YYYY-MM-DD format, but might have time component
    // Extract just the date part
    const dateStr = sqlDate.split('T')[0]; // Handle ISO format
    return dateStr;
  } catch (error) {
    console.error('Error parsing SQL date:', error);
    return '';
  }
}

// Fetch all tasks - FIXED VERSION
export async function fetchTasks() {
  console.log("Fetching tasks...");

  try {
    // FIXED: Use consistent endpoint naming
    const response = await Api.get("/joynur_rahman_users");

    console.log("Tasks fetched successfully:", response);
    
    // Handle the API response format
    if (response && response.err) {
      console.error("API Error:", response.result);
      throw new Error(response.result);
    }
    
    // FIXED: Extract the result array from the response
    // Based on previous conversation, API returns: {err: false, result: [...], count: 2, token: '...'}
    if (response && !response.err && Array.isArray(response.result)) {
      // Format dates from SQL to frontend format
      const tasks = response.result.map(task => ({
        ...task,
        dueDate: task.due_date ? formatSQLDateForInput(task.due_date) : '',
      }));
      return tasks;
    }
    
    // Fallback for direct array response
    if (Array.isArray(response)) {
      const tasks = response.map(task => ({
        ...task,
        dueDate: task.due_date ? formatSQLDateForInput(task.due_date) : '',
      }));
      return tasks;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

// Mark task as complete
export async function completeTask(taskId) {
  console.log("Completing task:", taskId);

  const updateData = {
    completed: true
  };

  try {
    const response = await Api.put(`/joynur_rahman_users/${taskId}`, {
      body: updateData,
    });

    // Handle API response format
    if (response && response.err) {
      console.error("API Error:", response.result);
      throw new Error(response.result);
    }

    console.log("Task completed successfully:", response);
    return response;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
}

// Delete task
export async function deleteTask(taskId) {
  console.log("Deleting task:", taskId);

  try {
    const response = await Api.delete(`/joynur_rahman_users/${taskId}`);

    // Handle API response format
    if (response && response.err) {
      console.error("API Error:", response.result);
      throw new Error(response.result);
    }

    console.log("Task deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Update task (can update title, priority, category, due_date)
export async function updateTask(taskId, updateData) {
  console.log("Updating task:", taskId, "with data:", updateData);

  // Handle both old format (just string) and new format (object)
  let dataToSend;
  
  if (typeof updateData === 'string') {
    // Old format: just the title
    dataToSend = { title: updateData };
  } else {
    // New format: object with multiple fields
    dataToSend = { ...updateData };
    
    // Format due_date if present
    if (dataToSend.dueDate) {
      const sqlDate = formatDateForSQL(dataToSend.dueDate);
      dataToSend.due_date = sqlDate;
      delete dataToSend.dueDate; // Remove camelCase version
      console.log('Formatted due_date for SQL:', sqlDate);
    }
  }

  console.log('Update data to be sent:', dataToSend);

  try {
    const response = await Api.put(`/joynur_rahman_users/${taskId}`, {
      body: dataToSend,
    });

    // Handle API response format
    if (response && response.err) {
      console.error("API Error:", response.result);
      throw new Error(response.result);
    }

    console.log("Task updated successfully:", response);
    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}
