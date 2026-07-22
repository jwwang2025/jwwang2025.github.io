<template>
  <NuxtLink :to="`/tags/${encodeURIComponent(toTagSlug(tag))}`" class="topic-chip">
    {{ tag }}
    <span>{{ count }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { toTagSlug } from '~/utils/blog'

defineProps<{
  tag: string
  count: number
}>()
</script>