import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Explicit cleanup: we don't enable vitest globals, so RTL's auto-cleanup
// (which hooks into a global afterEach) doesn't run on its own.
afterEach(() => {
  cleanup();
});
