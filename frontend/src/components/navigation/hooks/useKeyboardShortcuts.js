/**
 * useKeyboardShortcuts - Custom hook for keyboard navigation
 * 
 * @returns {Object} Keyboard shortcut methods
 */
import { useEffect, useCallback } from 'react';

export default function useKeyboardShortcuts() {
  /**
   * Register a keyboard shortcut
   * @param {string} key - The key to listen for (e.g., 'k', 'Escape')
   * @param {Function} callback - Function to call when shortcut is triggered
   * @param {Object} options - Options for the shortcut
   * @param {boolean} options.ctrlKey - Whether Ctrl key is required
   * @param {boolean} options.metaKey - Whether Cmd key is required (Mac)
   * @param {boolean} options.altKey - Whether Alt key is required
   * @param {boolean} options.shiftKey - Whether Shift key is required
   * @param {boolean} options.preventDefault - Whether to prevent default behavior
   */
  const registerShortcut = useCallback((key, callback, options = {}) => {
    const {
      ctrlKey = false,
      metaKey = false,
      altKey = false,
      shiftKey = false,
      preventDefault = true
    } = options;

    const handleKeyDown = (event) => {
      // Check if the pressed key matches
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      
      // Check modifier keys
      if (ctrlKey && !event.ctrlKey) return;
      if (metaKey && !event.metaKey) return;
      if (altKey && !event.altKey) return;
      if (shiftKey && !event.shiftKey) return;
      
      // Check that only the required modifiers are pressed
      if (ctrlKey && event.metaKey) return; // Don't allow both Ctrl and Cmd
      if (metaKey && event.ctrlKey) return; // Don't allow both Cmd and Ctrl
      
      // Prevent default if specified
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Call the callback
      callback(event);
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Register Ctrl+K / Cmd+K shortcut for search
   * @param {Function} callback - Function to call when search shortcut is triggered
   * @returns {Function} Cleanup function to remove the shortcut
   */
  const registerSearchShortcut = useCallback((callback) => {
    return registerShortcut('k', callback, {
      ctrlKey: true,
      metaKey: true, // Cmd on Mac
      preventDefault: true
    });
  }, [registerShortcut]);

  /**
   * Register Escape key shortcut
   * @param {Function} callback - Function to call when Escape is pressed
   * @returns {Function} Cleanup function to remove the shortcut
   */
  const registerEscapeShortcut = useCallback((callback) => {
    return registerShortcut('Escape', callback, {
      preventDefault: true
    });
  }, [registerShortcut]);

  return {
    registerShortcut,
    registerSearchShortcut,
    registerEscapeShortcut,
  };
}