import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/*',
  {
    // add "extends" to merge two configs together
    extends: './vite.config.ts',
    test: {
      include: ['test/unit/**/*.{test,spec}.{ts,js,tsx}'],
      // it is recommended to define a name when using inline configs
      name: 'jsdom',
      environment: 'jsdom'
    }
  }
])
