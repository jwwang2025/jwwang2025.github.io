<template>
  <div>
    <section class="hero-frame">
      <div class="hero-main">
        <p class="hero-kicker">
          <span>{{ appConfig.authorEN }}</span>
          <span>{{ posts.length }} published notes</span>
        </p>
        <h1>{{ appConfig.authorCN }}</h1>
        <p class="hero-display-title">AI 应用开发笔记</p>
        <p class="hero-summary">{{ appConfig.description }}</p>
        <div class="hero-actions">
          <NuxtLink to="/posts" class="primary-action">
            进入文章库
            <span aria-hidden="true">→</span>
          </NuxtLink>
          <NuxtLink to="/tags" class="secondary-action">
            按主题浏览
            <span aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
      </div>
      <aside class="hero-dossier" aria-label="站点概览">
        <NuxtLink to="/about" class="hero-identity">
          <span class="hero-avatar-ring" aria-hidden="true">
            <img src="/avatar.jpg" alt="" width="48" height="48" />
          </span>
          <span>
            <strong>{{ appConfig.authorEN }}</strong>
            <small>{{ appConfig.role }}</small>
          </span>
          <span class="hero-identity-arrow" aria-hidden="true">↗</span>
        </NuxtLink>
        <dl>
          <div>
            <dt>Posts</dt>
            <dd>{{ posts.length }}</dd>
          </div>
          <div>
            <dt>Topics</dt>
            <dd>{{ topicCounts.length }}</dd>
          </div>
          <div>
            <dt>Latest</dt>
            <dd>{{ latestYear }}</dd>
          </div>
        </dl>
      </aside>
      <a class="hero-next" href="#home-content" aria-label="查看知识地图" title="查看知识地图">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 4v15" />
          <path d="m6.5 13.5 5.5 5.5 5.5-5.5" />
        </svg>
      </a>
    </section>
    <main id="home-content" class="site-main">
      <SiteBlock
        eyebrow="Map"
        title="知识地图"
        description="把文章按学习路径组织起来，而不是只按发布时间堆叠。"
      >
        <KnowledgeMap :items="knowledgeMap" />
      </SiteBlock>
      <SiteBlock
        v-if="featured"
        eyebrow="Latest"
        title="最近更新"
        description="最新文章放在首页核心位置，其他文章进入连续阅读流。"
        action-to="/posts"
        action-label="查看全部"
      >
        <div class="home-latest">
          <ArticleCard :post="featured" large />
          <ArticleStream :posts="recentPosts" />
        </div>
      </SiteBlock>
      <SiteBlock
        v-if="selectedPosts.length"
        eyebrow="Selected"
        title="精选入口"
        description="适合作为新读者进入站点的文章。"
      >
        <div class="card-grid">
          <ArticleCard v-for="post in selectedPosts" :key="post.path" :post="post" />
        </div>
      </SiteBlock>
      <SiteBlock
        v-if="topicCounts.length"
        eyebrow="Topics"
        title="热门主题"
        description="从主题进入，比从时间线翻找更快。"
        action-to="/tags"
        action-label="完整标签云"
      >
        <div class="topic-cloud">
          <TopicChip v-for="[tag, count] in topicCounts.slice(0, 16)" :key="tag" :tag="tag" :count="count" />
        </div>
      </SiteBlock>
    </main>
  </div>
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

const appConfig = useAppConfig()

const { data } = await useAsyncData<PostMeta[]>('home-posts', () =>
  $fetch('/api/posts')
)

const posts = computed(() => data.value ?? [])
const featured = computed(() => posts.value[0] ?? null)
const selectedSlugs = [
  'agent-multi-agent-framework',
  'rag-knowledge-graph',
  'llm-inference-optimization',
]
const selectedPosts = computed(() =>
  selectedSlugs
    .map(slug => posts.value.find(post => post.slug === slug))
    .filter((post): post is PostMeta => Boolean(post))
)
const recentPosts = computed(() => {
  const excluded = new Set([featured.value?.slug, ...selectedSlugs])
  return posts.value.filter(post => !excluded.has(post.slug)).slice(0, 6)
})
const latestYear = computed(() => featured.value ? new Date(featured.value.date).getFullYear() : new Date().getFullYear())
const topicCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const post of posts.value) {
    for (const tag of post.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

const knowledgeMap = [
  {
    key: 'AI',
    title: 'AI Infra / Agent',
    desc: '从模型基础到 RAG、上下文工程、推理服务和 Agent 平台。',
    label: '看 AI Infra',
    to: '/tags/ai-infra',
  },
  {
    key: 'KG',
    title: 'Knowledge Graph',
    desc: '知识图谱构建、实体抽取、关系推理与图数据库应用。',
    label: '看知识图谱',
    to: '/tags/知识图谱',
  },
  {
    key: 'RAG',
    title: 'Retrieval-Augmented Generation',
    desc: '向量检索、多模态检索、重排序与 RAG 系统优化。',
    label: '看 RAG',
    to: '/tags/rag',
  },
  {
    key: 'SYS',
    title: 'System Design',
    desc: '分布式系统、缓存策略、消息队列与高并发架构。',
    label: '看系统设计',
    to: '/tags/系统设计',
  },
]

useHead({
  title: appConfig.title,
  titleTemplate: () => appConfig.title,
  meta: [
    { name: 'description', content: appConfig.description },
    { property: 'og:title', content: appConfig.title },
    { property: 'og:description', content: appConfig.description },
    { property: 'og:url', content: appConfig.url },
  ],
})
</script>