import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  manifest: {
    name: 'Google Search Console Bulk Index Cleaner',
    description: 'A tool to bulk remove URLs from Google Search Console',
  },
})
