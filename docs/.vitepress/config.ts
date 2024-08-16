import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Google Search Console - Bulk Index Cleaner',
  description:
    'A free Chrome extension for efficient bulk removal of expired indexes from Google Search Console.',
  themeConfig: {
    logo: '/logo.png',
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
  head: [
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:site', content: '@rxliuli' }],
    ['meta', { name: 'twitter:creator', content: '@rxliuli' }],
    ['meta', { name: 'og:type', content: 'website' }],
    [
      'meta',
      {
        name: 'og:site_name',
        content: 'Google Search Console - Bulk Index Cleaner',
      },
    ],
    [
      'meta',
      {
        name: 'og:title',
        content: 'Google Search Console - Bulk Index Cleaner',
      },
    ],
    [
      'meta',
      {
        name: 'og:description',
        content:
          'A free Chrome extension for efficient bulk removal of expired indexes from Google Search Console.',
      },
    ],
    ['meta', { name: 'og:image', content: '/logo.png' }],
    [
      'meta',
      {
        name: 'og:url',
        content: 'https://google-search-console-bulk-index-cleaner.rxliuli.com',
      },
    ],
    ['link', { rel: 'icon', type: 'image/png', href: '/icon/16.png' }],
  ],
})
