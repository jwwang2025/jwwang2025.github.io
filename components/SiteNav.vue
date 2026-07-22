<template>
  <nav class="site-nav" :class="{ 'is-scrolled': isScrolled }">
    <div class="nav-shell">
      <NuxtLink to="/" class="brand">
        <div class="brand-mark">
          <img src="/favicon.svg" alt="Logo" />
        </div>
        <div class="brand-copy">
          <strong>{{ config?.title || 'Blog' }}</strong>
          <em>{{ config?.role || '' }}</em>
        </div>
      </NuxtLink>
      <div class="nav-center">
        <NuxtLink
          v-for="item in (config?.nav || [])"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'nav-link-active': isCurrentPath(item.path) }"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
      <div class="nav-actions">
        <a v-if="config?.github" :href="config.github" target="_blank" rel="noopener noreferrer" class="icon-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <button class="theme-toggle" :data-theme="currentTheme" @click="cycleTheme">
          <div class="theme-toggle-track">
            <button class="theme-toggle-option" :class="{ active: currentTheme === 'light' }" aria-label="浅色主题">
              <span class="theme-toggle-terminal">L</span>
            </button>
            <button class="theme-toggle-option" :class="{ active: currentTheme === 'dark' }" aria-label="深色主题">
              <span class="theme-toggle-terminal">D</span>
            </button>
            <button class="theme-toggle-option" :class="{ active: currentTheme === 'cyber' }" aria-label="赛博主题">
              <span class="theme-toggle-terminal">C</span>
            </button>
          </div>
          <div class="theme-toggle-indicator"></div>
          <div class="theme-toggle-glow"></div>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const config = useAppConfig()
const route = useRoute()

const isScrolled = ref(false)
const currentTheme = ref('dark')

const themes = ['light', 'dark', 'cyber']

function isCurrentPath(path: string): boolean {
  const current = route.path
  if (path === '/') return current === '/'
  return current.startsWith(path)
}

function updateScroll() {
  isScrolled.value = window.scrollY > 40
}

function cycleTheme() {
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  setTheme(themes[nextIndex])
}

function setTheme(theme: string) {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.classList.toggle('dark', theme !== 'light')
  document.documentElement.classList.toggle('cyber', theme === 'cyber')
  const meta = document.querySelector('meta[name=theme-color]')
  if (meta) {
    const colors: Record<string, string> = {
      light: '#f5f1e8',
      dark: '#101214',
      cyber: '#07110f',
    }
    meta.setAttribute('content', colors[theme])
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll, { passive: true })
  const saved = localStorage.getItem('theme')
  if (saved && themes.includes(saved)) {
    setTheme(saved)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
})
</script>