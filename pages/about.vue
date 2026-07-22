<template>
  <main class="page-frame">
    <section class="about-hero">
      <div class="about-profile">
        <img src="/avatar.jpg" :alt="appConfig.authorCN" width="148" height="148" />
        <div class="about-identity">
          <p class="eyebrow">{{ appConfig.role }}</p>
          <h1>{{ appConfig.authorCN }}</h1>
          <p class="about-en">{{ appConfig.authorEN }}</p>
          <p class="about-summary">{{ appConfig.bio }}</p>
          <div class="about-actions">
            <a :href="appConfig.github" target="_blank" rel="noopener noreferrer" class="primary-action">GitHub</a>
            <NuxtLink to="/posts" class="secondary-action">文章库</NuxtLink>
            <NuxtLink to="/tags" class="secondary-action">主题索引</NuxtLink>
          </div>
        </div>
      </div>
      <aside class="about-snapshot" aria-label="个人站点概览">
        <p class="snapshot-label">PROFILE SNAPSHOT</p>
        <div class="snapshot-grid">
          <div>
            <span>{{ posts.length }}</span>
            <em>公开文章</em>
          </div>
          <div>
            <span>{{ topicCount }}</span>
            <em>主题方向</em>
          </div>
          <div>
            <span>{{ latestYear }}</span>
            <em>最近更新</em>
          </div>
        </div>
        <p class="snapshot-note">关注 AI 应用开发、Agent 架构、RAG 系统和知识图谱技术。</p>
      </aside>
    </section>
    <div class="about-layout">
      <div>
        <SiteBlock eyebrow="Focus" title="关注方向" description="把个人介绍拆成更具体的工程兴趣，方便快速判断内容边界。">
          <div class="focus-grid">
            <article v-for="(item, index) in focusAreas" :key="item.key" class="focus-card">
              <small>0{{ index + 1 }}</small>
              <span>{{ item.key }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </SiteBlock>
        <SiteBlock eyebrow="Stack" title="技术栈" description="偏工程落地的全栈组合：AI 应用、后端服务、前端框架和基础设施。">
          <div class="stack-panel">
            <span v-for="tech in appConfig.techStack" :key="tech.name" class="skill-chip">{{ tech.name }}</span>
          </div>
        </SiteBlock>
        <SiteBlock eyebrow="Experience" title="经历">
          <div class="timeline">
            <article v-for="exp in appConfig.experience" :key="exp.company" class="timeline-card">
              <div class="timeline-logo">
                <span>{{ exp.company[0] }}</span>
              </div>
              <div>
                <time>{{ exp.period }}</time>
                <h3>
                  {{ exp.company }}
                  <span v-if="exp.companyEN">{{ exp.companyEN }}</span>
                </h3>
                <p class="timeline-role">{{ exp.role }}</p>
                <p v-if="exp.desc" class="timeline-desc">{{ exp.desc }}</p>
              </div>
            </article>
          </div>
        </SiteBlock>
      </div>
      <aside>
        <SiteBlock eyebrow="Now" title="当前状态" tone="panel">
          <div class="now-card">
            <p>持续整理 AI 应用开发、Agent 架构和 RAG 系统相关的学习笔记，也会把项目拆解、源码阅读和技术实践沉淀成可检索的资料库。</p>
          </div>
        </SiteBlock>
        <SiteBlock eyebrow="Recent" title="近期文章" tone="panel">
          <ArticleStream :posts="recentPosts" />
        </SiteBlock>
      </aside>
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

const appConfig = useAppConfig()

const { data } = await useAsyncData<PostMeta[]>('about-posts', () =>
  $fetch('/api/posts')
)

const recentPosts = computed(() => (data.value ?? []).slice(0, 6))
const posts = computed(() => data.value ?? [])
const topicCount = computed(() => {
  const topics = new Set<string>()
  for (const post of posts.value) {
    for (const tag of post.tags ?? []) topics.add(tag)
  }
  return topics.size
})
const latestYear = computed(() => {
  const firstPost = posts.value[0]
  return firstPost ? new Date(firstPost.date).getFullYear() : new Date().getFullYear()
})

const focusAreas = [
  {
    key: 'AI',
    title: 'AI Infra / Agent',
    desc: 'RAG、上下文工程、记忆系统、推理优化和 Agent 产品化。',
  },
  {
    key: 'KG',
    title: 'Knowledge Graph',
    desc: '知识图谱构建、实体识别、关系抽取与图数据库应用。',
  },
  {
    key: 'RAG',
    title: 'Retrieval-Augmented Generation',
    desc: '向量检索、多模态检索、重排序与 RAG 系统优化。',
  },
  {
    key: 'SYS',
    title: 'System Design',
    desc: '分布式系统、缓存策略、消息队列与高并发架构设计。',
  },
]

useHead({
  title: '关于',
  meta: [
    { name: 'description', content: `关于 ${appConfig.authorCN} — ${appConfig.role}` },
  ],
})
</script>