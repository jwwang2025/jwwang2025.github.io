<template>
  <div id="app-root">
    <div class="effect-stage">
      <div class="cursor-aura"></div>
      <div class="ambient-sweep ambient-sweep-a"></div>
      <div class="ambient-sweep ambient-sweep-b"></div>
      <div class="grain-layer"></div>
    </div>
    <SiteNav />
    <NuxtPage />
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <strong>{{ config?.title || 'Blog' }}</strong>
          </div>
          <div class="footer-links">
            <NuxtLink to="/">首页</NuxtLink>
            <NuxtLink to="/posts">文章</NuxtLink>
            <NuxtLink to="/tags">标签</NuxtLink>
            <NuxtLink to="/about">关于</NuxtLink>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ config?.authorCN || '' }} · {{ config?.authorEN || '' }}</span>
          <span>{{ new Date().getFullYear() }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useAppConfig()

useHead({
  htmlAttrs: {
    lang: 'zh-CN',
  },
})
</script>
