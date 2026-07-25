import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://jwwang2025.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      ['remark-math', { singleDollarTextMath: true }],
    ],
    rehypePlugins: [
      ['rehype-katex', { strict: false }],
    ],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      langs: ['typescript', 'javascript', 'python', 'go', 'rust', 'bash', 'json', 'yaml', 'markdown', 'sql', 'cpp', 'java', 'vue', 'css', 'html'],
    },
    syntaxHighlight: 'shiki',
  },
})
