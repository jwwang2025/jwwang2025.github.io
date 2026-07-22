<template>
  <main class="page-frame">
    <section class="page-hero">
      <p class="eyebrow">TOPICS</p>
      <h1>主题索引</h1>
      <p>按主题浏览文章，快速找到感兴趣的技术方向。</p>
    </section>
    <div class="tags-page">
      <aside class="tags-sidebar">
        <h2>热门标签</h2>
        <div class="tags-list">
          <a
            v-for="[tag, count] in topicCounts"
            :key="tag"
            :href="`/tags/${encodeURIComponent(toTagSlug(tag))}`"
          >
            {{ tag }}
            <span>{{ count }}</span>
          </a>
        </div>
      </aside>
      <div>
        <div class="topic-cloud">
          <TopicChip v-for="[tag, count] in topicCounts" :key="tag" :tag="tag" :count="count" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { toTagSlug } from '~/utils/blog'

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

const { data } = await useAsyncData<PostMeta[]>('tags-posts', () =>
  $fetch('/api/posts')
)

const posts = computed(() => data.value ?? [])

const topicCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const post of posts.value) {
    for (const tag of post.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

useHead({
  title: '主题索引',
  meta: [
    { name: 'description', content: `主题索引 — ${topicCounts.value.length} 个技术主题` },
  ],
})
</script>