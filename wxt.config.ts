import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  runner: {
    disabled: true,
  },
  manifest: {
    name: 'Google Search Console - Bulk Index Cleaner',
    description: 'A tool to bulk remove URLs from Google Search Console',
    action: {
      default_title: 'Show Bulk Index Cleaner',
      default_icon: {
        '16': 'icon/16.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png',
      },
    },
    permissions: ['activeTab'],
  },
})
