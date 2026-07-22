<template>
  <main class="page-frame">
    <section class="page-hero">
      <p class="eyebrow">ARCHIVE</p>
      <h1>文章库</h1>
      <p>按时间线组织的技术笔记，支持关键词搜索和标签筛选。</p>
    </section>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文章标题或描述..."
        @input="debounceSearch"
      />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </div>
    <div class="card-grid">
      <ArticleCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
    <div v-if="filteredPosts.length === 0" class="text-center py-16">
      <p class="text-muted">没有找到匹配的文章</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PostMeta {
  _path: string
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

const appConfig = useAppConfig()
const searchQuery = ref('')

const { data } = await useAsyncData<PostMeta[]>('posts-all', () =>
  $fetch('/api/posts')
)

const posts = computed(() => data.value ?? [])

const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value
  const query = searchQuery.value.toLowerCase()
  return posts.value.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.description?.toLowerCase().includes(query) ||
    post.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debounceSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
  }, 300)
}

useHead({
  title: '文章库',
  meta: [
    { name: 'description', content: `文章库 — ${posts.value.length} 篇技术笔记` },
  ],
})
</script>