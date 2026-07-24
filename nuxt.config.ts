import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/content'],
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-dark-dimmed',
            light: 'github-light',
            cyber: 'houston',
          },
          langs: ['typescript', 'javascript', 'python', 'go', 'rust', 'bash', 'json', 'yaml', 'markdown', 'sql', 'cpp', 'java', 'vue', 'css', 'html'],
        },
        remarkPlugins: {
          'remark-math': {
            src: 'remark-math',
            options: { singleDollarTextMath: true },
          },
        },
        rehypePlugins: {
          'rehype-katex': {
            src: 'rehype-katex',
            options: { strict: false },
          },
        },
        toc: { depth: 3 }
      }
    }
  },
  nitro: {
    preset: 'github-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'theme-color', content: '#101214' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/favicon.svg?v=2' },
        { rel: 'shortcut icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
        { rel: 'apple-touch-icon', href: '/favicon.svg?v=2' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      script: [
        {
          innerHTML: `(function(){var t=localStorage.getItem('theme');var h=document.documentElement;t=t==='light'||t==='cyber'||t==='dark'?t:'dark';h.dataset.theme=t;h.classList.toggle('light',t==='light');h.classList.toggle('dark',t!=='light');h.classList.toggle('cyber',t==='cyber');var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='light'?'#f5f1e8':t==='cyber'?'#07110f':'#101214');})();`,
          type: 'text/javascript',
        },
      ],
    }
  }
})
