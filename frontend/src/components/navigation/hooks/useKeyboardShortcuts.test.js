import { renderHook, act } from '@testing-library/react';
import useKeyboardShortcuts from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let eventListeners = {};
  let originalAddEventListener;
  let originalRemoveEventListener;

  beforeEach(() => {
    eventListeners = {};
    
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;
    
    window.addEventListener = jest.fn((event, callback) => {
      eventListeners[event] = callback;
    });
    
    window.removeEventListener = jest.fn((event, callback) => {
      if (eventListeners[event] === callback) {
        delete eventListeners[event];
      }
    });
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  test('registers and unregisters shortcuts', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useKeyboardShortcuts());
    
    // Register a shortcut
    const cleanup = result.current.registerShortcut('k', callback, { ctrlKey: true });
    
    // Trigger the shortcut
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Cleanup
    cleanup();
    
    // Should no longer trigger
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    
    unmount();
  });

  test('registerSearchShortcut registers Ctrl+K/Cmd+K shortcut', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register search shortcut
    result.current.registerSearchShortcut(callback);
    
    // Test Ctrl+K (Windows/Linux)
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: false });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Test Cmd+K (Mac) - should also work
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: false, metaKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('registerEscapeShortcut registers Escape key', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register escape shortcut
    result.current.registerEscapeShortcut(callback);
    
    // Test Escape key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('shortcut only triggers with correct modifier keys', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register shortcut requiring Ctrl+Shift+K
    result.current.registerShortcut('k', callback, { ctrlKey: true, shiftKey: true });
    
    // Test with only Ctrl (no Shift) - should not trigger
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: false });
      eventListeners.keydown(event);
    });
    
    expect(callback).not.toHaveBeenCalled();
    
    // Test with Ctrl+Shift - should trigger
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('shortcut is case insensitive', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register shortcut for 'k'
    result.current.registerShortcut('k', callback, { ctrlKey: true });
    
    // Test with uppercase 'K' - should still trigger
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'K', ctrlKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('prevents default behavior when preventDefault is true', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register shortcut with preventDefault
    result.current.registerShortcut('k', callback, { ctrlKey: true, preventDefault: true });
    
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
    
    act(() => {
      eventListeners.keydown(event);
    });
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(event);
  });

  test('does not prevent default behavior when preventDefault is false', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register shortcut without preventDefault
    result.current.registerShortcut('k', callback, { ctrlKey: true, preventDefault: false });
    
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    act(() => {
      eventListeners.keydown(event);
    });
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(event);
  });

  test('does not trigger when wrong key is pressed', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    // Register shortcut for 'k'
    result.current.registerShortcut('k', callback, { ctrlKey: true });
    
    // Test with 'j' key - should not trigger
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'j', ctrlKey: true });
      eventListeners.keydown(event);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });

  test('cleanup function is returned from registerShortcut', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    const cleanup = result.current.registerShortcut('k', callback, { ctrlKey: true });
    
    expect(typeof cleanup).toBe('function');
    
    // Call cleanup
    cleanup();
    
    // Verify removeEventListener was called
    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});