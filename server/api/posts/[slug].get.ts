import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compile } from 'markdown-it'

export interface PostDetail {
  path: string
  slug: string
  title: string
  description?: string
  date: string
  tags: string[]
  readingTime?: number
  categories?: string[]
  body: string
}

function parseFrontmatter(source: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const yaml = match[1]
  const data: Record<string, unknown> = {}
  for (const line of yaml.split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (!key || key.startsWith('-')) continue
    if (val === 'true') { data[key] = true; continue }
    if (val === 'false') { data[key] = false; continue }
    if (val) data[key] = val.replace(/^['"]|['"]$/g, '')
  }
  const mlArray = yaml.matchAll(/^(\w+):\s*\n((?:\s+-\s+.+\n?)*)/gm)
  for (const m of mlArray) {
    const [, k, block] = m
    data[k] = block.split('\n')
      .filter((l) => l.trim().startsWith('-'))
      .map((l) => l.trim().replace(/^-\s*/, '').replace(/^['"]|['"]$/g, ''))
  }
  return data
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' })
  }
  
  try {
    const path = join(process.cwd(), 'content', 'posts', `${slug}.md`)
    const content = readFileSync(path, 'utf-8')
    const frontmatter = parseFrontmatter(content)
    
    if (frontmatter.draft === true || frontmatter.hidden === true || frontmatter.published === false) {
      throw createError({ statusCode: 404, message: 'Article not found' })
    }
    
    const markdownContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
    const md = compile({ html: true })
    const body = md(markdownContent)
    
    return {
      path: `/posts/${slug}`,
      slug,
      title: frontmatter.title as string || '',
      description: frontmatter.description as string || undefined,
      date: frontmatter.date as string || '',
      tags: (frontmatter.tags as string[]) || [],
      readingTime: (frontmatter.readingTime as number) || undefined,
      categories: (frontmatter.categories as string[]) || undefined,
      body,
    }
  } catch (e) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }
})
