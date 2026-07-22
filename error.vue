<template>
  <main class="page-frame">
    <section class="page-hero">
      <p class="eyebrow">ERROR</p>
      <h1>{{ error.statusCode || 500 }}</h1>
      <p>{{ error.message || '页面未找到' }}</p>
      <div class="hero-actions mt-6">
        <NuxtLink to="/" class="primary-action">返回首页</NuxtLink>
        <NuxtLink to="/posts" class="secondary-action">浏览文章</NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  error: {
    statusCode?: number
    message?: string
  }
}>()
</script>