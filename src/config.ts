export const siteConfig = {
  title: "jwwang.log",
  subtitle: "AI Infra & Systems",
  description: "王静文的个人博客，记录 AI 基础设施、系统设计与技术思考",
  author: {
    name: "王静文",
    nameEn: "Jingwen Wang",
    role: "AI 应用开发工程师",
    avatar: "/avatar.png",
    focus: ["AI Infra", "系统设计", "模型优化", "推理部署"],
    links: {
      github: "https://github.com/jwwang2025",
      zhihu: "https://www.zhihu.com/people/jwwang2025",
      email: "jingwen.wang@bit.edu.cn",
    },
  },
  navLinks: [
    { label: "首页", href: "/" },
    { label: "文章库", href: "/posts" },
    { label: "标签", href: "/tags" },
    { label: "关于", href: "/about" },
    { label: "友链", href: "/friends" },
  ],
  knowledgeMap: [
    {
      id: "ai-infra",
      label: "AI Infrastructure",
      title: "AI 基础设施",
      description: "GPU 集群、分布式训练、K8s 部署与 MLOps 实践",
      link: "/posts?topic=ai-infra",
    },
    {
      id: "knowledge-graph",
      label: "Knowledge Graph",
      title: "知识图谱",
      description: "图神经网络、RAG 检索增强、知识表示学习",
      link: "/posts?topic=knowledge-graph",
    },
    {
      id: "rag",
      label: "RAG System",
      title: "检索增强生成",
      description: "向量数据库、检索策略、上下文管理与评估",
      link: "/posts?topic=rag",
    },
    {
      id: "system-design",
      label: "System Design",
      title: "系统设计",
      description: "高可用架构、性能优化、微服务与云原生",
      link: "/posts?topic=system-design",
    },
  ],
  topicDirectory: [
    { id: "all", label: "全部", desc: "所有文章" },
    { id: "interview", label: "求职与面试", desc: "面试题与职业成长" },
    { id: "llm-agent", label: "LLM 与 Agent", desc: "大模型与智能体" },
    { id: "model-principle", label: "模型原理", desc: "深度学习与模型架构" },
    { id: "training-inference", label: "训练与推理", desc: "训练策略与推理优化" },
    { id: "multimodal", label: "多模态", desc: "视觉、语音与多模态融合" },
    { id: "backend", label: "后端与系统", desc: "后端开发与系统工程" },
    { id: "quantization", label: "量化与低延迟", desc: "模型量化与性能优化" },
    { id: "algorithm", label: "算法与竞赛", desc: "算法题解与竞赛经验" },
    { id: "essay", label: "随笔与其他", desc: "杂谈与生活记录" },
  ],
  friends: [
    {
      name: "Example",
      avatar: null,
      desc: "示例友链",
      link: "#",
    },
  ],
}

export type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
  description?: string
  draft: boolean
  hidden: boolean
  published?: boolean
  legacy: boolean
  categories: string[]
  readingTime?: number
  series?: string
  seriesOrder?: number
}
