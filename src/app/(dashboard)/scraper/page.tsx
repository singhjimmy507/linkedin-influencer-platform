'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Plus,
  User,
  Calendar,
  ExternalLink,
  Loader2,
  FileText,
  ThumbsUp,
} from 'lucide-react'
import type { Database } from '@/types/database'

type ScrapedProfile = Database['public']['Tables']['scraped_profiles']['Row']

interface ProfileWithStats extends ScrapedProfile {
  postsCount?: number
  avgLikes?: number
  avgComments?: number
}

export default function ScraperPage() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProfile, setNewProfile] = useState({ linkedinUrl: '', fullName: '', headline: '' })
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  const fetchProfiles = async () => {
    const { data: profilesData, error } = await supabase
      .from('scraped_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
      setLoading(false)
      return
    }

    // Fetch post stats for each profile
    const profilesWithStats: ProfileWithStats[] = []
    const profilesList = (profilesData || []) as ScrapedProfile[]
    for (const profile of profilesList) {
      const { data: postsData } = await supabase
        .from('scraped_posts')
        .select('likes, comments')
        .eq('profile_id', profile.id)

      const posts = (postsData || []) as { likes: number; comments: number }[]
      const postsCount = posts.length
      const avgLikes = postsCount > 0
        ? Math.round(posts.reduce((sum, p) => sum + p.likes, 0) / postsCount)
        : 0
      const avgComments = postsCount > 0
        ? Math.round(posts.reduce((sum, p) => sum + p.comments, 0) / postsCount)
        : 0

      profilesWithStats.push({
        ...profile,
        postsCount,
        avgLikes,
        avgComments,
      })
    }

    setProfiles(profilesWithStats)
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAdding(false)
      return
    }

    // Clean URL
    const cleanUrl = newProfile.linkedinUrl.trim()

    const untypedClient = createUntypedClient()
    const { error } = await untypedClient.from('scraped_profiles').insert({
      user_id: user.id,
      linkedin_url: cleanUrl,
      full_name: newProfile.fullName || null,
      headline: newProfile.headline || null,
      scrape_status: 'pending',
    })

    if (error) {
      console.error('Error adding profile:', error)
      alert('Failed to add profile: ' + error.message)
    } else {
      setNewProfile({ linkedinUrl: '', fullName: '', headline: '' })
      setIsAddOpen(false)
      fetchProfiles()
    }

    setAdding(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'scraping':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Scraping</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Scraper</h1>
            <p className="text-gray-600">Analyze posts from top creators</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LinkedIn Scraper</h1>
          <p className="text-gray-600">Analyze posts from top creators</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add LinkedIn Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/username"
                  value={newProfile.linkedinUrl}
                  onChange={(e) => setNewProfile({ ...newProfile, linkedinUrl: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (optional)</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={newProfile.fullName}
                  onChange={(e) => setNewProfile({ ...newProfile, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (optional)</Label>
                <Input
                  id="headline"
                  placeholder="CEO at Company"
                  value={newProfile.headline}
                  onChange={(e) => setNewProfile({ ...newProfile, headline: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Profile'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {profiles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No profiles yet</h3>
            <p className="text-gray-600 mb-4">
              Add a LinkedIn profile to start analyzing their posts.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <Link key={profile.id} href={`/scraper/${profile.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {profile.full_name || 'Unknown'}
                      </CardTitle>
                      {profile.headline && (
                        <CardDescription className="line-clamp-1">
                          {profile.headline}
                        </CardDescription>
                      )}
                    </div>
                    {getStatusBadge(profile.scrape_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Posts</p>
                      <p className="font-semibold flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {profile.postsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Likes</p>
                      <p className="font-semibold flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {profile.avgLikes || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Comments</p>
                      <p className="font-semibold">{profile.avgComments || 0}</p>
                    </div>
                  </div>
                  {profile.last_scraped_at && (
                    <div className="flex items-center gap-1 mt-4 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Last scraped: {new Date(profile.last_scraped_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
