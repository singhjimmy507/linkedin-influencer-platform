import { NextResponse } from 'next/server'
import { createClient, createUntypedClient } from '@/lib/supabase/server'
import {
  getDomainOverview,
  getRankedKeywords,
  analyzeContentSections,
  checkSerpRanking,
} from '@/lib/api/dataforseo'
import { getIndexedPages } from '@/lib/api/searchapi'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, domain, pullType } = await request.json()

    if (!companyId || !domain) {
      return NextResponse.json({ error: 'Missing companyId or domain' }, { status: 400 })
    }

    const results: Record<string, unknown> = {}
    const pullDate = new Date().toISOString().split('T')[0]
    const untypedSupabase = await createUntypedClient()

    // Pull domain overview
    if (!pullType || pullType === 'overview') {
      try {
        const overview = await getDomainOverview(domain)
        results.overview = overview

        // Cache to database
        await untypedSupabase.from('company_data_pulls').upsert({
          company_id: companyId,
          data_type: 'domain_overview',
          api_source: 'DataForSEO',
          raw_data: overview,
          pull_date: pullDate,
        }, { onConflict: 'company_id,data_type,pull_date' })
      } catch (error) {
        console.error('Error fetching domain overview:', error)
        results.overviewError = String(error)
      }
    }

    // Pull indexed pages
    if (!pullType || pullType === 'indexed') {
      try {
        const indexedPages = await getIndexedPages(domain)
        results.indexedPages = indexedPages

        await untypedSupabase.from('company_data_pulls').upsert({
          company_id: companyId,
          data_type: 'indexed_pages',
          api_source: 'SearchAPI',
          raw_data: { totalIndexed: indexedPages },
          pull_date: pullDate,
        }, { onConflict: 'company_id,data_type,pull_date' })
      } catch (error) {
        console.error('Error fetching indexed pages:', error)
        results.indexedError = String(error)
      }
    }

    // Pull top keywords
    if (!pullType || pullType === 'keywords') {
      try {
        const keywords = await getRankedKeywords(domain, 1000)
        results.keywordsCount = keywords.length

        // Analyze content sections
        const sections = analyzeContentSections(keywords)
        results.contentSections = sections

        await untypedSupabase.from('company_data_pulls').upsert({
          company_id: companyId,
          data_type: 'top_keywords',
          api_source: 'DataForSEO',
          raw_data: { keywords, sections },
          pull_date: pullDate,
        }, { onConflict: 'company_id,data_type,pull_date' })
      } catch (error) {
        console.error('Error fetching keywords:', error)
        results.keywordsError = String(error)
      }
    }

    // Pull SERP rankings for commercial keywords
    if (pullType === 'serp') {
      const targetKeywords = [
        'international money transfer',
        'send money abroad',
        'money transfer app',
        'currency exchange',
      ]

      const serpResults = []
      for (const keyword of targetKeywords) {
        try {
          const ranking = await checkSerpRanking(keyword, domain)
          serpResults.push(ranking)
        } catch (error) {
          console.error(`Error checking SERP for "${keyword}":`, error)
        }
      }

      results.serpRankings = serpResults

      await untypedSupabase.from('company_data_pulls').upsert({
        company_id: companyId,
        data_type: 'serp_rankings',
        api_source: 'DataForSEO',
        raw_data: serpResults,
        pull_date: pullDate,
      }, { onConflict: 'company_id,data_type,pull_date' })
    }

    return NextResponse.json({
      success: true,
      pullDate,
      results,
    })
  } catch (error) {
    console.error('Research pull error:', error)
    return NextResponse.json(
      { error: 'Failed to pull research data' },
      { status: 500 }
    )
  }
}
