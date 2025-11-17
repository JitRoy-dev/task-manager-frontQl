// Date formatting utilities for SQL compatibility

/**
 * Converts a date string to SQL DATE format (YYYY-MM-DD)
 * @param dateString - Date string from HTML date input or any valid date format
 * @returns SQL formatted date string (YYYY-MM-DD) or null if invalid
 */
export function formatDateForSQL(dateString: string | null | undefined): string | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
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

/**
 * Converts SQL DATE format to HTML date input format (YYYY-MM-DD)
 * @param sqlDate - Date from SQL database
 * @returns Date string in YYYY-MM-DD format for HTML date input
 */
export function formatSQLDateForInput(sqlDate: string | null | undefined): string {
  if (!sqlDate) {
    return '';
  }

  try {
    // SQL dates are already in YYYY-MM-DD format, but we need to handle different formats
    const date = new Date(sqlDate);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing SQL date:', error);
    return '';
  }
}

/**
 * Formats a date for display to the user
 * @param dateString - Date string in any format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dateString: string | null | undefined, locale: string = 'en-US'): string {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
}

/**
 * Checks if a date string is valid
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString || dateString.trim() === '') {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
