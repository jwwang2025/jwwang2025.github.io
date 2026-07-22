<template>
  <nav class="site-nav" aria-label="主导航">
    <div class="nav-shell">
      <NuxtLink to="/" class="brand" aria-label="回到首页">
        <span class="brand-mark" aria-hidden="true">
          <img src="/logo.svg" alt="" width="42" height="42" />
        </span>
        <span class="brand-copy">
          <strong>{{ appConfig.title }}</strong>
          <em>{{ appConfig.authorEN }}</em>
        </span>
      </NuxtLink>

      <div class="nav-center" role="list">
        <NuxtLink
          v-for="item in appConfig.nav"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          role="listitem"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="nav-actions">
        <a
          :href="appConfig.github"
          target="_blank"
          rel="noopener noreferrer"
          class="icon-button optional-github"
          aria-label="GitHub"
        >
          GH
        </a>
        <div
          class="theme-toggle"
          role="group"
          aria-label="主题"
          :data-theme="isThemeReady ? themeMode : 'dark'"
          data-allow-mismatch="attribute"
        >
          <span class="theme-toggle-track">
            <span class="theme-toggle-glow" />
            <span class="theme-toggle-indicator" />
            <button
              class="theme-toggle-option"
              :class="{ active: themeMode === 'light' }"
              type="button"
              aria-label="纸感浅色"
              title="纸感浅色"
              :aria-pressed="themeMode === 'light'"
              @click="setTheme('light', $event)"
            >
              <span aria-hidden="true">☼</span>
            </button>
            <button
              class="theme-toggle-option"
              :class="{ active: themeMode === 'dark' }"
              type="button"
              aria-label="暖黑深色"
              title="暖黑深色"
              :aria-pressed="themeMode === 'dark'"
              @click="setTheme('dark', $event)"
            >
              <span aria-hidden="true">☾</span>
            </button>
            <button
              class="theme-toggle-option theme-toggle-terminal"
              :class="{ active: themeMode === 'cyber' }"
              type="button"
              aria-label="荧光终端"
              title="荧光终端"
              :aria-pressed="themeMode === 'cyber'"
              @click="setTheme('cyber', $event)"
            >
              <span aria-hidden="true">&gt;_</span>
            </button>
          </span>
          <span class="sr-only" data-allow-mismatch="text">{{ themeLabel }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()

const isThemeReady = inject<Ref<boolean>>('isThemeReady', ref(false))
const themeMode = inject<Ref<'dark' | 'light' | 'cyber'>>('themeMode', ref('dark'))
const setTheme = inject<(mode: 'dark' | 'light' | 'cyber', event?: MouseEvent) => void>('setTheme', () => {})

const themeLabel = computed(() => {
  if (themeMode.value === 'light') return '纸感浅色'
  if (themeMode.value === 'cyber') return '荧光终端'
  return '暖黑深色'
})
</script>