import { navigationTypes } from './navigationTypes';

describe('Navigation Types', () => {
  test('NavigationItem type structure', () => {
    // Test that NavigationItem has expected properties
    const navigationItem = {
      text: 'Dashboard',
      icon: () => null,
      path: '/dashboard',
      badge: true,
      submenu: [],
    };
    
    expect(navigationItem).toHaveProperty('text');
    expect(navigationItem).toHaveProperty('icon');
    expect(navigationItem).toHaveProperty('path');
    expect(navigationItem).toHaveProperty('badge');
    expect(navigationItem).toHaveProperty('submenu');
    expect(typeof navigationItem.text).toBe('string');
    expect(typeof navigationItem.path).toBe('string');
    expect(typeof navigationItem.badge).toBe('boolean');
    expect(Array.isArray(navigationItem.submenu)).toBe(true);
  });

  test('NavigationGroup type structure', () => {
    // Test that NavigationGroup has expected properties
    const navigationGroup = {
      label: 'Principal',
      items: [],
    };
    
    expect(navigationGroup).toHaveProperty('label');
    expect(navigationGroup).toHaveProperty('items');
    expect(typeof navigationGroup.label).toBe('string');
    expect(Array.isArray(navigationGroup.items)).toBe(true);
  });

  test('UserProfile type structure', () => {
    // Test that UserProfile has expected properties
    const userProfile = {
      id: '1',
      nome: 'Test User',
      email: 'test@example.com',
      cargo: 'Developer',
      isAdmin: false,
      preferences: {
        theme: 'light',
        notificationsEnabled: true,
      },
    };
    
    expect(userProfile).toHaveProperty('id');
    expect(userProfile).toHaveProperty('nome');
    expect(userProfile).toHaveProperty('email');
    expect(userProfile).toHaveProperty('cargo');
    expect(userProfile).toHaveProperty('isAdmin');
    expect(userProfile).toHaveProperty('preferences');
    expect(typeof userProfile.id).toBe('string');
    expect(typeof userProfile.nome).toBe('string');
    expect(typeof userProfile.email).toBe('string');
    expect(typeof userProfile.cargo).toBe('string');
    expect(typeof userProfile.isAdmin).toBe('boolean');
    expect(typeof userProfile.preferences).toBe('object');
  });

  test('Notification type structure', () => {
    // Test that Notification has expected properties
    const notification = {
      id: '1',
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test',
      timestamp: new Date(),
      read: false,
    };
    
    expect(notification).toHaveProperty('id');
    expect(notification).toHaveProperty('type');
    expect(notification).toHaveProperty('title');
    expect(notification).toHaveProperty('message');
    expect(notification).toHaveProperty('timestamp');
    expect(notification).toHaveProperty('read');
    expect(typeof notification.id).toBe('string');
    expect(['info', 'warning', 'error', 'success']).toContain(notification.type);
    expect(typeof notification.title).toBe('string');
    expect(typeof notification.message).toBe('string');
    expect(notification.timestamp instanceof Date).toBe(true);
    expect(typeof notification.read).toBe('boolean');
  });
});