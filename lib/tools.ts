import { Category, Tool } from "@/lib/types";

export const categories: Category[] = [
  { name: "AI & Writing", slug: "ai-writing", description: "Write, research, and create faster with AI.", icon: "Sparkles", color: "#7c5cff", count: 38, keywords: ["write", "copy", "content", "ai", "research"] },
  { name: "Marketing", slug: "marketing", description: "Grow your audience and nurture every lead.", icon: "Megaphone", color: "#ff6b4a", count: 54, keywords: ["email", "campaign", "newsletter", "leads"] },
  { name: "CRM & Sales", slug: "crm-sales", description: "Turn relationships into repeatable growth.", icon: "Users", color: "#2675ff", count: 32, keywords: ["customers", "crm", "sales", "pipeline"] },
  { name: "Design", slug: "design", description: "Create delightful brand and product visuals.", icon: "Palette", color: "#ec4d9b", count: 47, keywords: ["design", "graphics", "ui", "prototype"] },
  { name: "Developer Tools", slug: "developer-tools", description: "Build, ship, and monitor better software.", icon: "Code2", color: "#13a675", count: 61, keywords: ["code", "api", "deploy", "database"] },
  { name: "Productivity", slug: "productivity", description: "Make focused work feel less like work.", icon: "Zap", color: "#f4a51c", count: 72, keywords: ["tasks", "notes", "project", "team"] },
  { name: "Website & CMS", slug: "website-cms", description: "Publish beautiful sites without the friction.", icon: "LayoutTemplate", color: "#8a52d1", count: 43, keywords: ["website", "cms", "wordpress", "hosting"] },
  { name: "Analytics & SEO", slug: "analytics-seo", description: "Understand traffic and earn more attention.", icon: "ChartNoAxesCombined", color: "#00a3a3", count: 36, keywords: ["seo", "traffic", "analytics", "keywords"] }
];

export const tools: Tool[] = [
  {
    id: "t1", name: "Notion", slug: "notion", logo: "N", logoColor: "#111111",
    category: "Productivity", subcategory: "Workspace", shortDescription: "One connected workspace for docs, projects, knowledge, and AI.",
    fullDescription: "Notion brings notes, documents, project tracking, wikis, and lightweight databases into one flexible workspace. Teams can start from a blank page or use templates to build a system that fits the way they work.",
    pricingType: "Freemium", startingPrice: "$10/user/mo", freeTrial: true, rating: 4.8, ratingCount: 1248,
    platforms: ["Web", "Windows", "macOS", "Android", "iOS"], tags: ["Notes", "Wiki", "Projects", "AI"],
    useCases: ["Organize team knowledge", "Manage projects", "Write documents", "Build a company wiki"], bestFor: "Flexible teams and personal knowledge management",
    features: ["Connected docs and databases", "AI writing and search", "Project timelines", "Large template library"],
    pros: ["Extremely flexible", "Excellent collaboration", "Strong free plan"], cons: ["Can feel slow at scale", "Requires thoughtful setup"],
    alternatives: ["ClickUp", "Coda", "Slite"], websiteUrl: "https://notion.so", affiliateUrl: "https://notion.so", featured: true, verified: true,
    views: 28420, saves: 4310, clicks: 9134, updatedAt: "2026-06-18"
  },
  {
    id: "t2", name: "Beehiiv", slug: "beehiiv", logo: "b", logoColor: "#f2ff5e",
    category: "Marketing", subcategory: "Email Marketing", shortDescription: "The newsletter platform built for growth, monetization, and scale.",
    fullDescription: "Beehiiv gives newsletter publishers an all-in-one system for writing, sending, growing, and monetizing email audiences. It combines clean publishing tools with referral programs, ad networks, and detailed audience analytics.",
    pricingType: "Freemium", startingPrice: "$39/mo", freeTrial: true, rating: 4.7, ratingCount: 684,
    platforms: ["Web", "API"], tags: ["Newsletter", "Email", "Monetization", "Creator"],
    useCases: ["Send bulk emails", "Grow a newsletter", "Monetize an audience", "Run referral programs"], bestFor: "Newsletter creators and media businesses",
    features: ["Visual email editor", "Referral program", "Ad network", "Audience segmentation"],
    pros: ["Built-in growth tools", "Strong deliverability", "Modern editor"], cons: ["Advanced features get pricey", "Limited design control"],
    alternatives: ["ConvertKit", "Substack", "MailerLite"], websiteUrl: "https://beehiiv.com", couponCode: "VOLT20", discount: "20% off your first 3 months", featured: true, sponsored: true, verified: true,
    views: 19310, saves: 2670, clicks: 7450, updatedAt: "2026-06-16"
  },
  {
    id: "t3", name: "Linear", slug: "linear", logo: "L", logoColor: "#5e6ad2",
    category: "Developer Tools", subcategory: "Project Management", shortDescription: "Purpose-built issue tracking for high-performance product teams.",
    fullDescription: "Linear streamlines software planning with fast issue tracking, roadmaps, cycles, and product insights. Its keyboard-first design and thoughtful automation help engineering teams stay in flow.",
    pricingType: "Freemium", startingPrice: "$10/user/mo", freeTrial: true, rating: 4.9, ratingCount: 932,
    platforms: ["Web", "Windows", "macOS", "Android", "iOS", "API"], tags: ["Issues", "Projects", "Agile", "Roadmap"],
    useCases: ["Track software bugs", "Plan product roadmaps", "Run engineering sprints"], bestFor: "Fast-moving software product teams",
    features: ["Issue tracking", "Cycles and roadmaps", "Git integrations", "Product intelligence"],
    pros: ["Exceptionally fast", "Beautiful UX", "Focused workflows"], cons: ["Less flexible outside software", "Reporting can be limited"],
    alternatives: ["Jira", "Shortcut", "Plane"], websiteUrl: "https://linear.app", featured: true, verified: true,
    views: 22560, saves: 3890, clicks: 8120, updatedAt: "2026-06-20"
  },
  {
    id: "t4", name: "Framer", slug: "framer", logo: "F", logoColor: "#0055ff",
    category: "Website & CMS", subcategory: "Website Builder", shortDescription: "Design and publish responsive websites in one visual canvas.",
    fullDescription: "Framer combines a freeform design canvas with a production-ready site builder. Designers can create responsive layouts, animations, CMS collections, and publish globally without a handoff.",
    pricingType: "Freemium", startingPrice: "$10/mo", freeTrial: true, rating: 4.8, ratingCount: 765,
    platforms: ["Web"], tags: ["No-code", "Website", "CMS", "Design"],
    useCases: ["Build a website", "Create a landing page", "Publish a portfolio", "Manage web content"], bestFor: "Design-led startups and creative teams",
    features: ["Visual responsive canvas", "Built-in CMS", "Animations", "Global hosting"],
    pros: ["Design freedom", "Fast publishing", "Polished interactions"], cons: ["Learning curve for newcomers", "Large sites can get expensive"],
    alternatives: ["Webflow", "WordPress", "Squarespace"], websiteUrl: "https://framer.com", featured: true, verified: true,
    views: 24680, saves: 4120, clicks: 10420, updatedAt: "2026-06-19"
  },
  {
    id: "t5", name: "HubSpot", slug: "hubspot", logo: "H", logoColor: "#ff5c35",
    category: "CRM & Sales", subcategory: "CRM", shortDescription: "A connected customer platform for marketing, sales, and service.",
    fullDescription: "HubSpot provides a free CRM at the center of a broad customer platform. Teams can manage contacts, sales pipelines, email campaigns, support, content, and reporting in one connected system.",
    pricingType: "Freemium", startingPrice: "$20/mo", freeTrial: true, rating: 4.6, ratingCount: 1835,
    platforms: ["Web", "Android", "iOS", "API"], tags: ["CRM", "Sales", "Marketing", "Support"],
    useCases: ["Manage customers", "Track sales leads", "Automate marketing", "Run customer support"], bestFor: "Growing businesses wanting one customer platform",
    features: ["Contact management", "Sales pipelines", "Marketing automation", "Service desk"],
    pros: ["Excellent free CRM", "Broad feature set", "Huge integration ecosystem"], cons: ["Costs rise quickly", "Complex pricing"],
    alternatives: ["Pipedrive", "Salesforce", "Zoho CRM"], websiteUrl: "https://hubspot.com", verified: true,
    views: 31870, saves: 3650, clicks: 11230, updatedAt: "2026-06-12"
  },
  {
    id: "t6", name: "Canva", slug: "canva", logo: "C", logoColor: "#7d2ae8",
    category: "Design", subcategory: "Graphic Design", shortDescription: "Create social graphics, presentations, video, and brand content.",
    fullDescription: "Canva makes everyday visual communication accessible with drag-and-drop design, thousands of templates, collaborative workflows, brand kits, video editing, and AI-assisted creation.",
    pricingType: "Freemium", startingPrice: "$15/mo", freeTrial: true, rating: 4.8, ratingCount: 2492,
    platforms: ["Web", "Windows", "macOS", "Android", "iOS"], tags: ["Graphics", "Templates", "Social", "Video"],
    useCases: ["Design social posts", "Create presentations", "Make marketing graphics"], bestFor: "Non-designers, marketers, and small teams",
    features: ["Template library", "Brand kits", "AI design tools", "Video editor"],
    pros: ["Very approachable", "Huge asset library", "Excellent collaboration"], cons: ["Less precise than pro tools", "Popular templates can feel generic"],
    alternatives: ["Adobe Express", "Figma", "VistaCreate"], websiteUrl: "https://canva.com", verified: true,
    views: 36540, saves: 4820, clicks: 12740, updatedAt: "2026-06-10"
  },
  {
    id: "t7", name: "Ahrefs", slug: "ahrefs", logo: "a", logoColor: "#ff6947",
    category: "Analytics & SEO", subcategory: "SEO", shortDescription: "A complete SEO toolkit for traffic, rankings, and competitor research.",
    fullDescription: "Ahrefs helps marketers understand search demand, audit websites, monitor rankings, research backlinks, and discover content opportunities with one of the industry's largest web indexes.",
    pricingType: "Paid", startingPrice: "$129/mo", freeTrial: false, rating: 4.7, ratingCount: 1094,
    platforms: ["Web", "API"], tags: ["SEO", "Keywords", "Backlinks", "Content"],
    useCases: ["Improve Google rankings", "Research keywords", "Audit a website", "Analyze competitors"], bestFor: "Serious SEO teams and content marketers",
    features: ["Site explorer", "Keyword explorer", "Rank tracker", "Technical site audit"],
    pros: ["Exceptional data quality", "Excellent competitor research", "Strong learning resources"], cons: ["Expensive", "No free trial"],
    alternatives: ["Semrush", "Moz Pro", "SE Ranking"], websiteUrl: "https://ahrefs.com", verified: true,
    views: 21870, saves: 2410, clicks: 6810, updatedAt: "2026-06-08"
  },
  {
    id: "t8", name: "Claude", slug: "claude", logo: "AI", logoColor: "#d97757",
    category: "AI & Writing", subcategory: "AI Assistant", shortDescription: "A thoughtful AI assistant for writing, analysis, coding, and research.",
    fullDescription: "Claude is an AI assistant designed for substantial knowledge work. It can reason across long documents, draft and edit writing, analyze data, build software, and collaborate through a conversational interface.",
    pricingType: "Freemium", startingPrice: "$20/mo", freeTrial: true, rating: 4.8, ratingCount: 1420,
    platforms: ["Web", "Windows", "macOS", "Android", "iOS", "API"], tags: ["AI", "Writing", "Coding", "Research"],
    useCases: ["Write content", "Analyze documents", "Build software", "Research a topic"], bestFor: "Knowledge workers, writers, and developers",
    features: ["Long-context analysis", "Artifacts workspace", "Code generation", "File analysis"],
    pros: ["Nuanced writing", "Strong reasoning", "Handles long documents"], cons: ["Usage limits", "Can still make mistakes"],
    alternatives: ["ChatGPT", "Gemini", "Perplexity"], websiteUrl: "https://claude.ai", isNew: true, verified: true,
    views: 30190, saves: 5210, clicks: 13890, updatedAt: "2026-06-20"
  },
  {
    id: "t9", name: "Vercel", slug: "vercel", logo: "▲", logoColor: "#000000",
    category: "Developer Tools", subcategory: "Hosting", shortDescription: "The frontend cloud for building and shipping modern web experiences.",
    fullDescription: "Vercel provides continuous deployment, global hosting, serverless functions, observability, and a first-class workflow for modern web frameworks such as Next.js.",
    pricingType: "Freemium", startingPrice: "$20/user/mo", freeTrial: true, rating: 4.7, ratingCount: 891,
    platforms: ["Web", "API"], tags: ["Hosting", "Deployment", "Next.js", "Serverless"],
    useCases: ["Host a website", "Deploy a web app", "Preview pull requests"], bestFor: "Frontend teams and Next.js applications",
    features: ["Git deployments", "Preview environments", "Edge network", "Web analytics"],
    pros: ["Superb developer experience", "Very fast setup", "Global infrastructure"], cons: ["Costs can be unpredictable", "Platform lock-in concerns"],
    alternatives: ["Netlify", "Cloudflare Pages", "Render"], websiteUrl: "https://vercel.com", verified: true,
    views: 27880, saves: 3760, clicks: 9940, updatedAt: "2026-06-17"
  },
  {
    id: "t10", name: "Zapier", slug: "zapier", logo: "Z", logoColor: "#ff4f00",
    category: "Productivity", subcategory: "Automation", shortDescription: "Automate repetitive work across thousands of business apps.",
    fullDescription: "Zapier connects apps through no-code workflows called Zaps. Teams can move data, trigger notifications, enrich leads, and orchestrate multi-step processes without maintaining custom integrations.",
    pricingType: "Freemium", startingPrice: "$19.99/mo", freeTrial: true, rating: 4.6, ratingCount: 1327,
    platforms: ["Web", "API"], tags: ["Automation", "Integrations", "No-code", "Workflow"],
    useCases: ["Automate repetitive tasks", "Connect business apps", "Move data between tools"], bestFor: "Operations, marketing, and small business automation",
    features: ["7,000+ app integrations", "Multi-step workflows", "AI automation", "Tables and forms"],
    pros: ["Huge integration catalog", "Easy to learn", "Reliable"], cons: ["Task pricing adds up", "Complex workflows are hard to debug"],
    alternatives: ["Make", "n8n", "Pipedream"], websiteUrl: "https://zapier.com", couponCode: "STARTSMART", discount: "Save 15% on annual plans",
    views: 29450, saves: 3980, clicks: 10320, updatedAt: "2026-06-11"
  },
  {
    id: "t11", name: "Figma", slug: "figma", logo: "F", logoColor: "#a259ff",
    category: "Design", subcategory: "UI Design", shortDescription: "The collaborative interface design tool for teams that build products.",
    fullDescription: "Figma brings interface design, prototyping, developer handoff, and visual collaboration into a shared browser-based canvas.",
    pricingType: "Freemium", startingPrice: "$16/user/mo", freeTrial: true, rating: 4.9, ratingCount: 2160,
    platforms: ["Web", "Windows", "macOS"], tags: ["UI", "Prototype", "Collaboration", "Design System"],
    useCases: ["Design an app", "Create prototypes", "Build a design system"], bestFor: "Product designers and cross-functional teams",
    features: ["Multiplayer design", "Interactive prototypes", "Dev Mode", "Component libraries"],
    pros: ["Best-in-class collaboration", "Powerful components", "Works anywhere"], cons: ["Offline support is limited", "Can be resource intensive"],
    alternatives: ["Sketch", "Penpot", "Framer"], websiteUrl: "https://figma.com", verified: true,
    views: 34420, saves: 5460, clicks: 12140, updatedAt: "2026-06-14"
  },
  {
    id: "t12", name: "Plausible", slug: "plausible", logo: "P", logoColor: "#5850ec",
    category: "Analytics & SEO", subcategory: "Web Analytics", shortDescription: "Simple, privacy-friendly web analytics without cookie banners.",
    fullDescription: "Plausible offers a lightweight alternative to complex analytics suites with a clean dashboard, privacy-first measurement, goals, funnels, and easy sharing.",
    pricingType: "Paid", startingPrice: "$9/mo", freeTrial: true, rating: 4.8, ratingCount: 472,
    platforms: ["Web", "API"], tags: ["Analytics", "Privacy", "Open Source", "Web"],
    useCases: ["Measure website traffic", "Track conversions", "Avoid cookie banners"], bestFor: "Privacy-conscious sites and small teams",
    features: ["Simple dashboard", "Goal tracking", "Funnels", "Email reports"],
    pros: ["Easy to understand", "Privacy-friendly", "Lightweight script"], cons: ["Less granular than GA", "No free plan"],
    alternatives: ["Fathom", "Umami", "Google Analytics"], websiteUrl: "https://plausible.io", verified: true,
    views: 12820, saves: 1940, clicks: 4710, updatedAt: "2026-06-04"
  },
  {
    id: "t13", name: "Webflow", slug: "webflow", logo: "W", logoColor: "#4353ff",
    category: "Website & CMS", subcategory: "Website Builder", shortDescription: "A visual development platform for custom, production-grade websites.",
    fullDescription: "Webflow combines visual HTML and CSS design with CMS, ecommerce, localization, and managed hosting for teams that want control without maintaining a traditional codebase.",
    pricingType: "Freemium", startingPrice: "$14/mo", freeTrial: true, rating: 4.7, ratingCount: 886,
    platforms: ["Web"], tags: ["Website", "CMS", "No-code", "Hosting"],
    useCases: ["Build a website", "Manage a marketing site", "Create a CMS"], bestFor: "Web designers and marketing teams",
    features: ["Visual development", "Flexible CMS", "Interactions", "Managed hosting"],
    pros: ["Deep design control", "Production-ready output", "Strong CMS"], cons: ["Steep learning curve", "Pricing is complex"],
    alternatives: ["Framer", "WordPress", "Wix Studio"], websiteUrl: "https://webflow.com",
    views: 23510, saves: 3120, clicks: 8160, updatedAt: "2026-05-29"
  },
  {
    id: "t14", name: "Mailerlite", slug: "mailerlite", logo: "M", logoColor: "#54c589",
    category: "Marketing", subcategory: "Email Marketing", shortDescription: "Straightforward email marketing for creators and small businesses.",
    fullDescription: "MailerLite combines newsletters, automations, landing pages, forms, and digital product sales in a friendly platform with a generous free plan.",
    pricingType: "Freemium", startingPrice: "$10/mo", freeTrial: true, rating: 4.6, ratingCount: 718,
    platforms: ["Web", "API"], tags: ["Email", "Automation", "Newsletter", "Landing Pages"],
    useCases: ["Send bulk emails", "Build email automations", "Create signup forms"], bestFor: "Small businesses and independent creators",
    features: ["Email campaigns", "Visual automations", "Landing pages", "Digital products"],
    pros: ["Excellent value", "Easy editor", "Good free plan"], cons: ["Approval process can be strict", "Reporting is basic"],
    alternatives: ["Beehiiv", "Brevo", "ConvertKit"], websiteUrl: "https://mailerlite.com", discount: "30-day premium trial",
    views: 14980, saves: 2140, clicks: 5360, updatedAt: "2026-05-30"
  },
  {
    id: "t15", name: "Supabase", slug: "supabase", logo: "S", logoColor: "#3ecf8e",
    category: "Developer Tools", subcategory: "Backend", shortDescription: "An open-source Postgres platform with auth, APIs, storage, and realtime.",
    fullDescription: "Supabase turns Postgres into a complete application backend with generated APIs, authentication, file storage, edge functions, realtime subscriptions, and vector support.",
    pricingType: "Freemium", startingPrice: "$25/mo", freeTrial: true, rating: 4.8, ratingCount: 793,
    platforms: ["Web", "API"], tags: ["Database", "Postgres", "Auth", "Backend"],
    useCases: ["Build an app backend", "Add authentication", "Host a Postgres database"], bestFor: "Startups and developers who prefer open source",
    features: ["Managed Postgres", "Authentication", "File storage", "Edge functions"],
    pros: ["Open source", "Excellent developer experience", "Portable Postgres foundation"], cons: ["Costs scale with usage", "Some features are still maturing"],
    alternatives: ["Firebase", "Neon", "Appwrite"], websiteUrl: "https://supabase.com", isNew: true, verified: true,
    views: 26840, saves: 4290, clicks: 10850, updatedAt: "2026-06-18"
  },
  {
    id: "t16", name: "Buffer", slug: "buffer", logo: "B", logoColor: "#2c4bff",
    category: "Marketing", subcategory: "Social Media", shortDescription: "Plan, publish, and analyze social content from one calm workspace.",
    fullDescription: "Buffer helps small teams schedule content, collaborate on drafts, respond to comments, and understand social performance across major platforms.",
    pricingType: "Freemium", startingPrice: "$6/channel/mo", freeTrial: true, rating: 4.5, ratingCount: 652,
    platforms: ["Web", "Android", "iOS"], tags: ["Social", "Scheduling", "Analytics", "Content"],
    useCases: ["Schedule social posts", "Plan content", "Analyze social performance"], bestFor: "Creators and small marketing teams",
    features: ["Post scheduling", "Content calendar", "Engagement inbox", "Analytics"],
    pros: ["Clean and focused", "Affordable entry plan", "Great for small teams"], cons: ["Limited enterprise features", "Analytics vary by network"],
    alternatives: ["Hootsuite", "Later", "Metricool"], websiteUrl: "https://buffer.com",
    views: 13340, saves: 1870, clicks: 4620, updatedAt: "2026-05-27"
  },
  {
    id: "t17", name: "Tally", slug: "tally", logo: "T", logoColor: "#191919",
    category: "Productivity", subcategory: "Forms", shortDescription: "Beautiful forms that feel as simple and flexible as a document.",
    fullDescription: "Tally is a fast no-code form builder with generous free features, conditional logic, payments, file uploads, and integrations.",
    pricingType: "Freemium", startingPrice: "$29/mo", freeTrial: true, rating: 4.8, ratingCount: 516,
    platforms: ["Web"], tags: ["Forms", "No-code", "Survey", "Data"],
    useCases: ["Build a form", "Collect customer feedback", "Take payments"], bestFor: "Startups, creators, and product teams",
    features: ["Unlimited forms", "Conditional logic", "Payments", "Custom domains"],
    pros: ["Generous free plan", "Delightful editor", "Fast to publish"], cons: ["Reporting is lightweight", "Fewer templates than incumbents"],
    alternatives: ["Typeform", "Fillout", "Google Forms"], websiteUrl: "https://tally.so", isNew: true,
    views: 10680, saves: 2010, clicks: 4910, updatedAt: "2026-06-15"
  },
  {
    id: "t18", name: "n8n", slug: "n8n", logo: "n8n", logoColor: "#ea4b71",
    category: "Developer Tools", subcategory: "Automation", shortDescription: "Fair-code workflow automation with the flexibility developers need.",
    fullDescription: "n8n is a source-available automation platform for connecting APIs, transforming data, and building AI workflows. It can run in the cloud or on your own infrastructure.",
    pricingType: "Open Source", startingPrice: "$24/mo", freeTrial: true, rating: 4.7, ratingCount: 604,
    platforms: ["Web", "Linux", "API"], tags: ["Automation", "Open Source", "Workflow", "AI"],
    useCases: ["Automate workflows", "Connect APIs", "Build AI agents", "Self-host automation"], bestFor: "Technical teams needing flexible automation",
    features: ["Visual workflow builder", "Code steps", "Self-hosting", "AI nodes"],
    pros: ["Highly flexible", "Self-hostable", "Developer friendly"], cons: ["More technical than Zapier", "Cloud plan can get costly"],
    alternatives: ["Zapier", "Make", "Pipedream"], websiteUrl: "https://n8n.io", verified: true,
    views: 17430, saves: 3340, clicks: 7820, updatedAt: "2026-06-19"
  },
  {
    id: "t19", name: "Pipedrive", slug: "pipedrive", logo: "P", logoColor: "#1b1b1b",
    category: "CRM & Sales", subcategory: "CRM", shortDescription: "A visual, activity-based CRM that keeps sales teams moving.",
    fullDescription: "Pipedrive centers sales work around a visual pipeline, helping teams manage leads, automate follow-up, forecast revenue, and focus on the next best activity.",
    pricingType: "Paid", startingPrice: "$14/user/mo", freeTrial: true, rating: 4.6, ratingCount: 972,
    platforms: ["Web", "Android", "iOS", "API"], tags: ["CRM", "Pipeline", "Sales", "Leads"],
    useCases: ["Manage customers", "Track a sales pipeline", "Forecast revenue"], bestFor: "Small and mid-sized sales teams",
    features: ["Visual pipelines", "Lead management", "Email sync", "Sales automation"],
    pros: ["Easy to adopt", "Clear pipeline UX", "Good value"], cons: ["Marketing features are limited", "Reporting depth costs extra"],
    alternatives: ["HubSpot", "Close", "Zoho CRM"], websiteUrl: "https://pipedrive.com", couponCode: "GROW25", discount: "25% off the first year",
    views: 16370, saves: 1880, clicks: 5720, updatedAt: "2026-06-06"
  },
  {
    id: "t20", name: "Perplexity", slug: "perplexity", logo: "P", logoColor: "#20b2aa",
    category: "AI & Writing", subcategory: "AI Search", shortDescription: "An AI answer engine that researches the web and cites its sources.",
    fullDescription: "Perplexity combines conversational AI with live web research, producing concise answers with source citations and follow-up exploration.",
    pricingType: "Freemium", startingPrice: "$20/mo", freeTrial: true, rating: 4.7, ratingCount: 1105,
    platforms: ["Web", "Android", "iOS", "API"], tags: ["AI", "Search", "Research", "Answers"],
    useCases: ["Research a topic", "Find cited answers", "Compare products"], bestFor: "Fast, source-backed web research",
    features: ["Cited answers", "Deep research", "File analysis", "Model choice"],
    pros: ["Fast research workflow", "Useful citations", "Clean experience"], cons: ["Sources still need verification", "Pro limits apply"],
    alternatives: ["ChatGPT", "Claude", "Google Gemini"], websiteUrl: "https://perplexity.ai", isNew: true,
    views: 25420, saves: 4410, clicks: 11920, updatedAt: "2026-06-20"
  }
];

export const intentExpansions: Record<string, string[]> = {
  "send bulk emails": ["email", "newsletter", "marketing", "campaign", "beehiiv", "mailerlite"],
  "manage customers": ["crm", "sales", "pipeline", "hubspot", "pipedrive"],
  "build website": ["website", "cms", "hosting", "framer", "webflow", "vercel"],
  "write content": ["ai", "writing", "content", "claude", "perplexity"],
  "automate work": ["automation", "workflow", "zapier", "n8n"],
  "design an app": ["design", "ui", "prototype", "figma", "framer"],
  "track traffic": ["analytics", "seo", "traffic", "plausible", "ahrefs"]
};

export function searchTools(query: string, source = tools) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return source;

  const extraTerms = Object.entries(intentExpansions)
    .filter(([intent]) => normalized.includes(intent) || intent.includes(normalized))
    .flatMap(([, terms]) => terms);
  const terms = [...normalized.split(/\s+/), ...extraTerms];

  return source
    .map((tool) => {
      const haystack = [
        tool.name, tool.category, tool.subcategory, tool.shortDescription,
        ...tool.tags, ...tool.useCases, tool.bestFor
      ].join(" ").toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { tool, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
    .map(({ tool }) => tool);
}

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
