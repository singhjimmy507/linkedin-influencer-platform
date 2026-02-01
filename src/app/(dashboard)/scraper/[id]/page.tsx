'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  RefreshCw,
  User,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Image,
  List,
  Loader2,
  ExternalLink,
  TrendingUp,
  FileText,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { Database } from '@/types/database'

type ScrapedProfile = Database['public']['Tables']['scraped_profiles']['Row']
type ScrapedPost = Database['public']['Tables']['scraped_posts']['Row']
type PostAnalysis = Database['public']['Tables']['post_analysis']['Row']

interface PostWithAnalysis extends ScrapedPost {
  analysis?: PostAnalysis | null
}

const TOPIC_COLORS: Record<string, string> = {
  company_breakdown: '#3b82f6',
  announcement: '#10b981',
  insight: '#f59e0b',
  case_study: '#ef4444',
  tips: '#8b5cf6',
  personal: '#ec4899',
  general: '#6b7280',
  unknown: '#9ca3af',
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string
  const [profile, setProfile] = useState<ScrapedProfile | null>(null)
  const [posts, setPosts] = useState<PostWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const supabase = createClient()

  const fetchData = async () => {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('scraped_profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError)
      setLoading(false)
      return
    }

    setProfile(profileData as ScrapedProfile)

    // Fetch posts with analysis
    const { data: postsData } = await supabase
      .from('scraped_posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('posted_at', { ascending: false })

    const postsWithAnalysis: PostWithAnalysis[] = []
    const postsList = (postsData || []) as ScrapedPost[]
    for (const post of postsList) {
      const { data: analysisData } = await supabase
        .from('post_analysis')
        .select('*')
        .eq('scraped_post_id', post.id)
        .single()

      postsWithAnalysis.push({
        ...post,
        analysis: analysisData as PostAnalysis | null,
      })
    }

    setPosts(postsWithAnalysis)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [profileId])

  const handleScrape = async () => {
    if (!profile) return
    setScraping(true)

    try {
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          profileUrl: profile.linkedin_url,
          maxPosts: 50,
        }),
      })

      const result = await response.json()
      if (result.success) {
        fetchData()
      } else {
        alert('Failed to scrape: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error scraping:', error)
      alert('Failed to scrape profile')
    }

    setScraping(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
        <Button variant="link" onClick={() => router.push('/scraper')}>
          Back to Scraper
        </Button>
      </div>
    )
  }

  // Calculate stats
  const totalPosts = posts.length
  const avgLikes = totalPosts > 0
    ? Math.round(posts.reduce((sum, p) => sum + p.likes, 0) / totalPosts)
    : 0
  const avgComments = totalPosts > 0
    ? Math.round(posts.reduce((sum, p) => sum + p.comments, 0) / totalPosts)
    : 0
  const avgWordCount = totalPosts > 0
    ? Math.round(posts.reduce((sum, p) => sum + (p.analysis?.word_count || 0), 0) / totalPosts)
    : 0

  // Topic distribution
  const topicCounts = posts.reduce((acc, post) => {
    const topic = post.analysis?.topic_category || 'unknown'
    acc[topic] = (acc[topic] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topicData = Object.entries(topicCounts).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    color: TOPIC_COLORS[name] || '#6b7280',
  }))

  // Posts with images vs without
  const withImages = posts.filter(p => p.has_images).length
  const withLists = posts.filter(p => p.analysis?.has_list_format).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/scraper')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6" />
              {profile.full_name || 'Unknown'}
            </h1>
            {profile.headline && (
              <p className="text-gray-600">{profile.headline}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </a>
          </Button>
          <Button onClick={handleScrape} disabled={scraping}>
            {scraping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scrape Posts
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Total Posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              Avg Likes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgLikes.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Avg Comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgComments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Avg Words
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgWordCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Image className="h-4 w-4" />
              With Images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalPosts > 0 ? Math.round((withImages / totalPosts) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Analysis */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="hooks">Top Hooks</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.slice(0, 20).map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.posted_at && (
                          <span className="text-sm text-gray-500">
                            {new Date(post.posted_at).toLocaleDateString()}
                          </span>
                        )}
                        {post.analysis?.topic_category && (
                          <Badge
                            style={{
                              backgroundColor: TOPIC_COLORS[post.analysis.topic_category] || '#6b7280',
                            }}
                          >
                            {post.analysis.topic_category.replace('_', ' ')}
                          </Badge>
                        )}
                        {post.has_images && (
                          <Badge variant="outline">
                            <Image className="h-3 w-3 mr-1" />
                            {post.num_images}
                          </Badge>
                        )}
                        {post.analysis?.has_list_format && (
                          <Badge variant="outline">
                            <List className="h-3 w-3 mr-1" />
                            List
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" />
                          {post.reposts}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.analysis?.hook && (
                      <p className="font-medium text-blue-600 mb-2">
                        {post.analysis.hook}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{post.analysis?.word_count || 0} words</span>
                      {post.linkedin_url && (
                        <a
                          href={post.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Post <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-600">No posts scraped yet.</p>
                <Button onClick={handleScrape} className="mt-4">
                  Scrape Posts Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Topic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {topicData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {topicData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center">No data</p>
                )}
              </CardContent>
            </Card>

            {/* Format Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Post Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Posts with Images</span>
                      <span>{withImages} / {totalPosts}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${totalPosts > 0 ? (withImages / totalPosts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Posts with Lists</span>
                      <span>{withLists} / {totalPosts}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${totalPosts > 0 ? (withLists / totalPosts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hooks">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Hooks</CardTitle>
              <CardDescription>Hooks from posts with the highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts
                  .filter(p => p.analysis?.hook)
                  .sort((a, b) => (b.likes + b.comments * 5) - (a.likes + a.comments * 5))
                  .slice(0, 10)
                  .map((post, i) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{post.analysis?.hook}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{post.likes.toLocaleString()} likes</span>
                          <span>{post.comments} comments</span>
                          <Badge variant="outline" className="text-xs">
                            {post.analysis?.topic_category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
