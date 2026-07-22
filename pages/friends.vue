<template>
  <main class="page-frame">
    <section class="page-hero">
      <p class="eyebrow">FRIENDS</p>
      <h1>友链</h1>
      <p>优秀的技术博客和开发者朋友。</p>
    </section>
    <div v-if="appConfig.friends.length === 0" class="text-center py-16">
      <p class="text-muted">暂无友链</p>
    </div>
    <div v-else class="card-grid">
      <a
        v-for="friend in appConfig.friends"
        :key="friend.name"
        :href="friend.url"
        target="_blank"
        rel="noopener noreferrer"
        class="article-card"
      >
        <div class="flex items-center gap-3 mb-2">
          <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" width="32" height="32" class="rounded-full" />
          <span v-else class="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-accent font-mono font-bold">
            {{ friend.name[0] }}
          </span>
          <span class="font-semibold">{{ friend.name }}</span>
        </div>
        <p class="text-muted text-sm">{{ friend.desc }}</p>
      </a>
    </div>
  </main>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
  title: '友链',
  meta: [
    { name: 'description', content: '友链 — 优秀的技术博客和开发者朋友' },
  ],
})
</script>