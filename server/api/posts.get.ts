import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export interface PostMeta {
  path: string
  slug: string
  title: string
  description?: string
  excerpt?: string
  date: string
  tags: string[]
  readingTime?: number
  categories?: string[]
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

export default defineEventHandler(() => {
  const posts: PostMeta[] = []
  try {
    const dir = join(process.cwd(), 'content', 'posts')
    const files = readdirSync(dir).filter(f => f.endsWith('.md'))
    
    for (const file of files) {
      const path = join(dir, file)
      const content = readFileSync(path, 'utf-8')
      const frontmatter = parseFrontmatter(content)
      
      if (frontmatter.draft === true || frontmatter.hidden === true || frontmatter.published === false) {
        continue
      }
      
      const slug = file.replace('.md', '')
      posts.push({
        path: `/posts/${slug}`,
        slug,
        title: frontmatter.title as string || '',
        description: frontmatter.description as string || undefined,
        excerpt: undefined,
        date: frontmatter.date as string || '',
        tags: (frontmatter.tags as string[]) || [],
        readingTime: (frontmatter.readingTime as number) || undefined,
        categories: (frontmatter.categories as string[]) || undefined,
      })
    }
  } catch {
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})