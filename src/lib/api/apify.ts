// Apify API Integration for LinkedIn Post Scraping

const APIFY_TOKEN = process.env.APIFY_TOKEN || ''

export interface LinkedInPost {
  id: string
  content: string
  linkedinUrl: string
  postedAt: { date: string }
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  postImages: Array<{ url: string }>
  contentAttributes: Array<{
    type: string
    company?: { name: string }
    member?: { firstName: string; lastName: string }
  }>
}

export interface ScrapedPost {
  linkedin_post_id: string
  linkedin_url: string
  content: string
  posted_at: string
  likes: number
  comments: number
  reposts: number
  has_images: boolean
  num_images: number
}

export interface PostAnalysis {
  hook: string
  word_count: number
  has_list_format: boolean
  topic_category: string
  companies_mentioned: string[]
  cta: string
}

// Start Apify scraper run
export async function startProfileScrape(profileUrl: string, maxPosts = 50) {
  const response = await fetch(
    'https://api.apify.com/v2/acts/harvestapi~linkedin-profile-posts/runs',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileUrls: [profileUrl],
        maxPosts,
        includeReposts: false,
      }),
    }
  )

  const data = await response.json()
  return data.data?.id // Run ID
}

// Check run status
export async function checkRunStatus(runId: string) {
  const response = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}`,
    {
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`,
      },
    }
  )

  const data = await response.json()
  return {
    status: data.data?.status,
    finishedAt: data.data?.finishedAt,
    datasetId: data.data?.defaultDatasetId,
  }
}

// Get results from dataset
export async function getDatasetItems(datasetId: string): Promise<LinkedInPost[]> {
  const response = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    {
      headers: {
        'Authorization': `Bearer ${APIFY_TOKEN}`,
      },
    }
  )

  return response.json()
}

// Process scraped posts
export function processScrapedPost(post: LinkedInPost): ScrapedPost {
  const engagement = post.engagement || {}
  const postImages = post.postImages || []

  // Parse date
  const postedAtData = post.postedAt || {}
  const dateStr = typeof postedAtData === 'object' ? postedAtData.date : ''

  return {
    linkedin_post_id: post.id || '',
    linkedin_url: post.linkedinUrl || '',
    content: post.content || '',
    posted_at: dateStr,
    likes: engagement.likes || 0,
    comments: engagement.comments || 0,
    reposts: engagement.shares || 0,
    has_images: postImages.length > 0,
    num_images: postImages.length,
  }
}

// Analyze post content
export function analyzePost(content: string): PostAnalysis {
  return {
    hook: extractHook(content),
    word_count: content ? content.split(/\s+/).length : 0,
    has_list_format: hasListFormat(content),
    topic_category: categorizeTopic(content),
    companies_mentioned: [], // Would need to extract from contentAttributes
    cta: extractCTA(content),
  }
}

function extractHook(content: string): string {
  if (!content) return ''
  const firstLine = content.split('\n')[0].trim()
  return firstLine.length > 200 ? firstLine.substring(0, 200) + '...' : firstLine
}

function hasListFormat(content: string): boolean {
  if (!content) return false
  // Check for numbered lists
  const numbered = /\n\d+[\.\)]\s/.test(content)
  // Check for bullet points
  const bulleted = /\n[-•→✓✅⚡🔥]\s/.test(content)
  return numbered || bulleted
}

function extractCTA(content: string): string {
  if (!content) return ''
  const lines = content.trim().split('\n')
  const lastLines = lines.slice(-3)

  const ctaPatterns = [
    'follow', 'comment', 'share', 'check out', 'link in',
    'dm me', 'reach out', 'subscribe', 'join', 'learn more',
    'what do you think', 'agree?', 'thoughts?',
  ]

  for (const line of lastLines) {
    for (const pattern of ctaPatterns) {
      if (line.toLowerCase().includes(pattern)) {
        return line.trim()
      }
    }
  }
  return ''
}

function categorizeTopic(content: string): string {
  if (!content) return 'unknown'
  const lower = content.toLowerCase()

  const topics: Record<string, string[]> = {
    company_breakdown: ["here's what stands out", 'breakdown', 'what they do', 'playbook'],
    announcement: ['congrats', 'announcing', 'excited to', 'launched', 'raised', 'funding'],
    insight: ["here's why", 'the truth', 'hot take', 'unpopular opinion', 'most people'],
    case_study: ['case study', 'results', 'how they', 'what happened'],
    tips: ['tips', 'how to', 'ways to', 'steps to', 'mistakes'],
    personal: ['i learned', 'my experience', 'when i', 'my journey'],
  }

  for (const [topic, keywords] of Object.entries(topics)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return topic
      }
    }
  }
  return 'general'
}
