// SearchAPI Integration for indexed pages

const SEARCHAPI_KEY = process.env.SEARCHAPI_KEY || ''

export interface IndexedPagesResult {
  domain: string
  contentType: string
  indexedPages: number
}

export async function getIndexedPages(domain: string): Promise<number> {
  const url = new URL('https://www.searchapi.io/api/v1/search')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', `site:${domain}`)
  url.searchParams.set('api_key', SEARCHAPI_KEY)

  const response = await fetch(url.toString())
  const data = await response.json()

  return data?.search_information?.total_results || 0
}

export async function getSectionIndexedPages(domain: string, sectionPath: string): Promise<number> {
  const url = new URL('https://www.searchapi.io/api/v1/search')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', `site:${domain}/${sectionPath}`)
  url.searchParams.set('api_key', SEARCHAPI_KEY)

  const response = await fetch(url.toString())
  const data = await response.json()

  return data?.search_information?.total_results || 0
}

export async function pullAllIndexedPages(
  domain: string,
  sections: Record<string, string>,
  competitors: string[]
): Promise<IndexedPagesResult[]> {
  const results: IndexedPagesResult[] = []

  // Total site
  const total = await getIndexedPages(domain)
  results.push({
    domain,
    contentType: 'Total Site',
    indexedPages: total,
  })

  // Sections
  for (const [name, path] of Object.entries(sections)) {
    const count = await getSectionIndexedPages(domain, path)
    results.push({
      domain,
      contentType: name,
      indexedPages: count,
    })
  }

  // Competitors
  for (const competitor of competitors) {
    const count = await getIndexedPages(competitor)
    results.push({
      domain: competitor,
      contentType: 'Total Site',
      indexedPages: count,
    })
  }

  return results
}
