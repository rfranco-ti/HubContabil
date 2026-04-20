// Test environment setup
import { config } from 'dotenv';
config({ path: './.env.test' });

// Mock console.error in tests to reduce noise
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes('deprecated')) return;
  originalConsoleError(...args);
};

// Vitest global timeout
// Note: vitest.config.js already sets testTimeout
