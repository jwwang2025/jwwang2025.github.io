import { getCollection } from 'astro:content'
import type { Post } from '@/config'

export async function getAllPosts(): Promise<Post[]> {
  const entries = await getCollection('posts')
  
  return entries
    .filter((entry) => {
      if (entry.data.draft) return false
      if (entry.data.hidden) return false
      if (entry.data.published === false) return false
      return true
    })
    .map((entry) => ({
      slug: entry.slug.replace(/^posts\//, ''),
      title: entry.data.title,
      date: entry.data.date.toISOString().split('T')[0],
      tags: entry.data.tags || [],
      description: entry.data.description,
      draft: entry.data.draft || false,
      hidden: entry.data.hidden || false,
      published: entry.data.published,
      legacy: entry.data.legacy || false,
      categories: entry.data.categories || [],
      readingTime: entry.data.readingTime,
      series: entry.data.series,
      seriesOrder: entry.data.seriesOrder,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts()
  return posts.find((post) => post.slug === slug)
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.tags.includes(tag))
}

export async function getPostsBySeries(series: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts
    .filter((post) => post.series === series)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
}

export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const posts = await getAllPosts()
  const tagMap = new Map<string, number>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPostsGroupedByYear(): Promise<{ year: string; posts: Post[] }[]> {
  const posts = await getAllPosts()
  const yearMap = new Map<string, Post[]>()

  posts.forEach((post) => {
    const year = post.date.substring(0, 4)
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  return Array.from(yearMap.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 300
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function getPrevNextPosts(posts: Post[], currentSlug: string): { prev: Post | null; next: Post | null } {
  const index = posts.findIndex((p) => p.slug === currentSlug)
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  }
}

export function generateToc(html: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-3])[^>]*id="([^"]+)"[^>]*>(.+?)<\/h[2-3]>/gi
  const toc: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    toc.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, '').trim(),
    })
  }

  return toc
}
