import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Google Search Console - Bulk Index Cleaner',
  description:
    'Google Search Console - Bulk Index Cleaner is a free Chrome extension designed for website administrators and SEO professionals. It helps you quickly and efficiently delete expired indexes in bulk from Google Search Console, greatly simplifying the process of website index management.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Privacy Policy',
        link: '/privacy',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 rxliuli',
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/rxliuli/google-search-console-bulk-index-cleaner',
      },
    ],
  },
})
