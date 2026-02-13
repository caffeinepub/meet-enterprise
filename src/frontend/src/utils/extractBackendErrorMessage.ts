/**
 * Attempts to extract a meaningful error message from various error shapes
 * returned by the Internet Computer backend (traps, rejects, etc.)
 * 
 * @param error - The error object caught from a backend call
 * @returns The extracted error message, or empty string if none found
 */
export function extractBackendErrorMessage(error: unknown): string {
  if (!error) return '';

  // Direct string error
  if (typeof error === 'string') {
    return error;
  }

  // Error object with message property
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Object with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Check common error message fields
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Check for nested error structures
    if (errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }
    
    // Try stringifying and extracting meaningful parts
    try {
      const stringified = JSON.stringify(error);
      // Look for common patterns in IC error responses
      const messageMatch = stringified.match(/"message":"([^"]+)"/);
      if (messageMatch && messageMatch[1]) {
        return messageMatch[1];
      }
    } catch {
      // Ignore JSON stringify errors
    }
  }

  return '';
}
