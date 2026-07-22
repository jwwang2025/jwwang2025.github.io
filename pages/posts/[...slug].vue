<template>
  <main class="post-full">
    <article>
      <header class="post-header">
        <div class="post-meta">
          <span>{{ formatDate(post.date) }}</span>
          <span>{{ post.readingTime ?? 8 }} min read</span>
        </div>
        <h1>{{ post.title }}</h1>
        <p class="post-desc">{{ post.description }}</p>
        <div class="post-tags">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tags/${encodeURIComponent(toTagSlug(tag))}`"
            class="mini-tag"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </header>
      <div class="post-content" v-html="post.body"></div>
      <footer class="post-footer">
        <div class="post-tags">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tags/${encodeURIComponent(toTagSlug(tag))}`"
            class="mini-tag"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </footer>
    </article>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { formatDate, toTagSlug } from '~/utils/blog'

const route = useRoute()
const slug = route.params.slug

const { data: post } = await useAsyncData(`post-${slug}`, () =>
  $fetch(`/api/posts/${slug}`)
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    message: '文章不存在',
  })
}

useHead({
  title: post.value.title,
  meta: [
    { name: 'description', content: post.value.description },
    { property: 'og:title', content: post.value.title },
    { property: 'og:description', content: post.value.description },
  ],
})
</script>