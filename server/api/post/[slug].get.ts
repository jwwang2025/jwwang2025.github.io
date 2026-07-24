import { readFileSync, readdirSync } from 'node:fs'
import { join, basename } from 'node:path'

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function parseFrontmatter(source: string): { data: Record<string, unknown>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { data: {}, body: source }
  const yaml = match[1]
  const body = source.slice(match[0].length)
  const data: Record<string, unknown> = {}

  for (const line of yaml.split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (!key || key.startsWith('-')) continue

    if (val === 'true') { data[key] = true; continue }
    if (val === 'false') { data[key] = false; continue }
    if (val === '' || val === null || val === 'null') { data[key] = null; continue }
    if (/^\d+$/.test(val)) { data[key] = parseInt(val, 10); continue }
    if (val === '') { data[key] = []; continue }
    data[key] = val.replace(/^['"]|['"]$/g, '')
  }

  const arrayInline = yaml.match(new RegExp(`(\\w+):\\s*\\[([^\\]]+)\\]`, 'g'))
  if (arrayInline) {
    for (const m of arrayInline) {
      const [, k, v] = m.match(/([\w-]+):\s*\[([^\]]+)\]/) ?? []
      if (k && v) data[k] = v.split(',').map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''))
    }
  }

  const mlArray = yaml.matchAll(/^(\w+):\s*\n((?:\s+-\s+.+\n?)*)/gm)
  for (const m of mlArray) {
    const [, k, block] = m
    data[k] = block.split('\n')
      .filter((l) => l.trim().startsWith('-'))
      .map((l) => l.trim().replace(/^-\s*/, '').replace(/^['"]|['"]$/g, ''))
  }

  return { data, body }
}

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const dir = join(process.cwd(), 'content', 'posts')
  const files = collectMarkdownFiles(dir)

  for (const filePath of files) {
    const fileSlug = basename(filePath, '.md')
    if (fileSlug === slug) {
      const source = readFileSync(filePath, 'utf-8')
      const { data, body } = parseFrontmatter(source)
      return {
        slug: fileSlug,
        path: `/posts/${fileSlug}`,
        title: String(data.title ?? slug),
        date: String(data.date ?? '2020-01-01'),
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        description: String(data.description ?? ''),
        categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
        series: data.series ? String(data.series) : undefined,
        seriesOrder: typeof data.seriesOrder === 'number' ? data.seriesOrder : undefined,
        readingTime: typeof data.readingTime === 'number' ? data.readingTime : undefined,
        body: body.trim(),
      }
    }
  }

  throw createError({ statusCode: 404, message: 'Post not found' })
})
