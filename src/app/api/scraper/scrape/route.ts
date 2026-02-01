import { NextResponse } from 'next/server'
import { createClient, createUntypedClient } from '@/lib/supabase/server'
import {
  startProfileScrape,
  checkRunStatus,
  getDatasetItems,
  processScrapedPost,
  analyzePost,
} from '@/lib/api/apify'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profileId, profileUrl, maxPosts = 50 } = await request.json()

    if (!profileId || !profileUrl) {
      return NextResponse.json({ error: 'Missing profileId or profileUrl' }, { status: 400 })
    }

    const untypedSupabase = await createUntypedClient()

    // Update profile status to scraping
    await untypedSupabase
      .from('scraped_profiles')
      .update({ scrape_status: 'scraping' })
      .eq('id', profileId)

    // Start Apify run
    const runId = await startProfileScrape(profileUrl, maxPosts)

    if (!runId) {
      await untypedSupabase
        .from('scraped_profiles')
        .update({ scrape_status: 'failed' })
        .eq('id', profileId)
      return NextResponse.json({ error: 'Failed to start scrape' }, { status: 500 })
    }

    // Poll for completion (max 5 minutes)
    let status = 'RUNNING'
    let datasetId = ''
    const maxAttempts = 60
    let attempts = 0

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      const result = await checkRunStatus(runId)
      status = result.status
      datasetId = result.datasetId
      attempts++
    }

    if (status !== 'SUCCEEDED' || !datasetId) {
      await untypedSupabase
        .from('scraped_profiles')
        .update({ scrape_status: 'failed' })
        .eq('id', profileId)
      return NextResponse.json({ error: `Scrape failed with status: ${status}` }, { status: 500 })
    }

    // Get results
    const posts = await getDatasetItems(datasetId)

    // Process and store posts
    let storedCount = 0
    for (const post of posts) {
      const processed = processScrapedPost(post)
      const analysis = analyzePost(processed.content)

      // Insert post
      const { data: insertedPost, error: postError } = await untypedSupabase
        .from('scraped_posts')
        .insert({
          profile_id: profileId,
          linkedin_post_id: processed.linkedin_post_id,
          linkedin_url: processed.linkedin_url,
          content: processed.content,
          posted_at: processed.posted_at || null,
          likes: processed.likes,
          comments: processed.comments,
          reposts: processed.reposts,
          has_images: processed.has_images,
          num_images: processed.num_images,
        })
        .select()
        .single()

      if (postError) {
        console.error('Error inserting post:', postError)
        continue
      }

      // Insert analysis
      await untypedSupabase
        .from('post_analysis')
        .insert({
          scraped_post_id: insertedPost.id,
          hook: analysis.hook,
          word_count: analysis.word_count,
          has_list_format: analysis.has_list_format,
          topic_category: analysis.topic_category,
          companies_mentioned: analysis.companies_mentioned,
          cta: analysis.cta,
        })

      storedCount++
    }

    // Update profile status
    await untypedSupabase
      .from('scraped_profiles')
      .update({
        scrape_status: 'completed',
        last_scraped_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    return NextResponse.json({
      success: true,
      postsScraped: posts.length,
      postsStored: storedCount,
    })
  } catch (error) {
    console.error('Scraper error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape profile' },
      { status: 500 }
    )
  }
}

// Check scrape status endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')

    if (!profileId) {
      return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('scraped_profiles')
      .select('scrape_status, last_scraped_at')
      .eq('id', profileId)
      .single()

    const profileData = profile as { scrape_status: string; last_scraped_at: string | null } | null
    return NextResponse.json({ status: profileData?.scrape_status, lastScraped: profileData?.last_scraped_at })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
