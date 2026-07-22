<template>
  <main class="page-frame">
    <section class="tag-page-header">
      <h1>{{ decodeURIComponent($route.params.tag).replace(/-/g, ' ') }}</h1>
      <p>{{ filteredPosts.length }} 篇相关文章</p>
    </section>
    <div class="card-grid">
      <ArticleCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
    <div v-if="filteredPosts.length === 0" class="text-center py-16">
      <p class="text-muted">该标签下暂无文章</p>
    </div>
  </main>
</template>

<script setup lang="ts">
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

const { data } = await useAsyncData<PostMeta[]>('tag-posts', () =>
  $fetch('/api/posts')
)

const tag = computed(() => decodeURIComponent($route.params.tag as string))

const filteredPosts = computed(() => {
  const posts = data.value ?? []
  const tagSlug = tag.value.toLowerCase().replace(/\s+/g, '-')
  return posts.filter(post =>
    post.tags?.some(t => t.toLowerCase().replace(/\s+/g, '-') === tagSlug)
  )
})

useHead({
  title: `${tag.value} — 文章`,
  meta: [
    { name: 'description', content: `${tag.value} 相关文章` },
  ],
})
</script>