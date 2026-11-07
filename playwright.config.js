import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1365, height: 900 } },
  reporter: 'list'
});
