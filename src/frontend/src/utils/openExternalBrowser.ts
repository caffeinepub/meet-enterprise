/**
 * Attempts to open the current URL in an external browser
 * Returns true if the attempt was made, false otherwise
 */
export function openInExternalBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const currentUrl = window.location.href;

  try {
    // Try to open in a new window/tab
    // This may trigger the OS to show "Open in Chrome/Safari" options
    const newWindow = window.open(currentUrl, '_blank');
    
    // If popup was blocked or failed, return false
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to open external browser:', error);
    return false;
  }
}
