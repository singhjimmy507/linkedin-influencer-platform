// DataForSEO API Integration

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || ''
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || ''

function getAuth() {
  const creds = `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
  return Buffer.from(creds).toString('base64')
}

async function dataforseoRequest(endpoint: string, data: unknown[]) {
  const url = `https://api.dataforseo.com/v3/${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getAuth()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return response.json()
}

export interface DomainOverview {
  domain: string
  totalKeywords: number
  top10Keywords: number
  top3Keywords: number
  position1Keywords: number
  efficiencyRate: number
}

export async function getDomainOverview(domain: string): Promise<DomainOverview> {
  const data = [{
    target: domain,
    location_code: 2840, // United States
    language_code: 'en',
  }]

  const result = await dataforseoRequest('dataforseo_labs/google/domain_rank_overview/live', data)

  if (result?.tasks?.[0]?.result?.[0]) {
    const metrics = result.tasks[0].result[0].metrics?.organic || {}

    const totalKw = metrics.count || 0
    const pos1 = metrics.pos_1 || 0
    const pos2_3 = metrics.pos_2_3 || 0
    const pos4_10 = metrics.pos_4_10 || 0
    const top10Kw = pos1 + pos2_3 + pos4_10
    const top3Kw = pos1 + pos2_3
    const efficiency = totalKw > 0 ? Math.round((top10Kw / totalKw) * 1000) / 10 : 0

    return {
      domain,
      totalKeywords: totalKw,
      top10Keywords: top10Kw,
      top3Keywords: top3Kw,
      position1Keywords: pos1,
      efficiencyRate: efficiency,
    }
  }

  throw new Error(`No data found for domain: ${domain}`)
}

export interface RankedKeyword {
  keyword: string
  searchVolume: number
  position: number
  url: string
  trafficEstimate: number
}

export async function getRankedKeywords(domain: string, limit = 1000): Promise<RankedKeyword[]> {
  const data = [{
    target: domain,
    location_code: 2840,
    language_code: 'en',
    limit,
    order_by: ['keyword_data.keyword_info.search_volume,desc'],
  }]

  const result = await dataforseoRequest('dataforseo_labs/google/ranked_keywords/live', data)

  if (result?.tasks?.[0]?.result?.[0]?.items) {
    return result.tasks[0].result[0].items.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword_data as Record<string, unknown>)?.keyword || '',
      searchVolume: ((item.keyword_data as Record<string, unknown>)?.keyword_info as Record<string, unknown>)?.search_volume || 0,
      position: ((item.ranked_serp_element as Record<string, unknown>)?.serp_item as Record<string, unknown>)?.rank_absolute || 0,
      url: ((item.ranked_serp_element as Record<string, unknown>)?.serp_item as Record<string, unknown>)?.url || '',
      trafficEstimate: ((item.ranked_serp_element as Record<string, unknown>)?.serp_item as Record<string, unknown>)?.etv || 0,
    }))
  }

  return []
}

export interface SerpRanking {
  keyword: string
  searchVolume: number
  rank: number | null
  url: string | null
}

export async function checkSerpRanking(keyword: string, targetDomain: string): Promise<SerpRanking> {
  const data = [{
    keyword,
    location_code: 2840,
    language_code: 'en',
  }]

  const result = await dataforseoRequest('dataforseo_labs/google/serp/live', data)

  if (result?.tasks?.[0]?.result?.[0]) {
    const items = result.tasks[0].result[0].items || []
    const searchVolume = result.tasks[0].result[0].search_volume || 0

    for (const item of items.slice(0, 20)) {
      if ((item.url as string)?.includes(targetDomain)) {
        return {
          keyword,
          searchVolume,
          rank: item.rank_absolute,
          url: item.url,
        }
      }
    }

    return {
      keyword,
      searchVolume,
      rank: null,
      url: null,
    }
  }

  throw new Error(`No SERP data found for keyword: ${keyword}`)
}

export function analyzeContentSections(keywords: RankedKeyword[]) {
  const sections: Record<string, {
    keywords: number
    volume: number
    top3: number
    top10: number
    pos1: number
  }> = {}

  for (const kw of keywords) {
    const url = kw.url

    let section = 'Other'
    if (url.includes('/currency-converter')) section = 'Currency Converter'
    else if (url.includes('/send-money')) section = 'Send Money'
    else if (url.includes('/blog')) section = 'Blog'
    else if (url.includes('/help')) section = 'Help'
    else if (url.includes('/compare')) section = 'Compare'
    else if (url.includes('/business')) section = 'Business'

    if (!sections[section]) {
      sections[section] = { keywords: 0, volume: 0, top3: 0, top10: 0, pos1: 0 }
    }

    sections[section].keywords += 1
    sections[section].volume += kw.searchVolume

    if (kw.position === 1) sections[section].pos1 += 1
    if (kw.position <= 3) sections[section].top3 += 1
    if (kw.position <= 10) sections[section].top10 += 1
  }

  return Object.entries(sections).map(([section, data]) => ({
    section,
    keywords: data.keywords,
    volume: data.volume,
    top3: data.top3,
    top10: data.top10,
    pos1: data.pos1,
    top10Rate: data.keywords > 0 ? Math.round((data.top10 / data.keywords) * 1000) / 10 : 0,
  }))
}
