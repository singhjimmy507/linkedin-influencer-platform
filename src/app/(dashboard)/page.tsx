'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Users,
  PenTool,
  Mic2,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  FileText,
  Target,
} from 'lucide-react'

interface DashboardStats {
  companies: number
  profiles: number
  drafts: number
  voiceGuides: number
  engagementTargets: number
  engagementsToday: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    profiles: 0,
    drafts: 0,
    voiceGuides: 0,
    engagementTargets: 0,
    engagementsToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        companiesResult,
        profilesResult,
        draftsResult,
        voiceGuidesResult,
        targetsResult,
        engagementsResult,
      ] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('scraped_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content_drafts').select('id', { count: 'exact', head: true }),
        supabase.from('voice_guides').select('id', { count: 'exact', head: true }),
        supabase.from('engagement_targets').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('engagement_logs').select('id', { count: 'exact', head: true })
          .gte('engaged_at', new Date().toISOString().split('T')[0]),
      ])

      setStats({
        companies: companiesResult.count || 0,
        profiles: profilesResult.count || 0,
        drafts: draftsResult.count || 0,
        voiceGuides: voiceGuidesResult.count || 0,
        engagementTargets: targetsResult.count || 0,
        engagementsToday: engagementsResult.count || 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  const quickActions = [
    {
      title: 'Research Company',
      description: 'Pull SEO data for a new company',
      href: '/research',
      icon: Search,
      color: 'bg-blue-500',
    },
    {
      title: 'Create Post',
      description: 'Draft a new LinkedIn post',
      href: '/studio/new',
      icon: PenTool,
      color: 'bg-green-500',
    },
    {
      title: 'Scrape Profile',
      description: 'Analyze a LinkedIn profile',
      href: '/scraper',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Log Engagement',
      description: 'Track your daily engagements',
      href: '/engagement',
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ]

  const statCards = [
    {
      title: 'Companies Researched',
      value: stats.companies,
      icon: Search,
      href: '/research',
    },
    {
      title: 'Profiles Analyzed',
      value: stats.profiles,
      icon: Users,
      href: '/scraper',
    },
    {
      title: 'Content Drafts',
      value: stats.drafts,
      icon: FileText,
      href: '/studio',
    },
    {
      title: 'Voice Guides',
      value: stats.voiceGuides,
      icon: Mic2,
      href: '/voice-guides',
    },
    {
      title: 'Engagement Targets',
      value: stats.engagementTargets,
      icon: Target,
      href: '/engagement',
    },
    {
      title: 'Engagements Today',
      value: stats.engagementsToday,
      icon: TrendingUp,
      href: '/engagement',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your LinkedIn Influencer command center
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {loading ? '-' : stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to maximize your LinkedIn influence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={stats.voiceGuides > 0 ? 'default' : 'secondary'}>1</Badge>
              <div className="flex-1">
                <p className="font-medium">Set up your voice guides</p>
                <p className="text-sm text-gray-500">
                  Choose from system guides or create your own writing style
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/voice-guides">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stats.companies > 0 ? 'default' : 'secondary'}>2</Badge>
              <div className="flex-1">
                <p className="font-medium">Research companies</p>
                <p className="text-sm text-gray-500">
                  Pull SEO data to create data-driven content
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/research">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stats.profiles > 0 ? 'default' : 'secondary'}>3</Badge>
              <div className="flex-1">
                <p className="font-medium">Analyze top creators</p>
                <p className="text-sm text-gray-500">
                  Scrape and study posts from successful LinkedIn creators
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scraper">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stats.drafts > 0 ? 'default' : 'secondary'}>4</Badge>
              <div className="flex-1">
                <p className="font-medium">Create content</p>
                <p className="text-sm text-gray-500">
                  Use AI to draft posts in your chosen voice
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/studio/new">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stats.engagementsToday > 0 ? 'default' : 'secondary'}>5</Badge>
              <div className="flex-1">
                <p className="font-medium">Engage consistently</p>
                <p className="text-sm text-gray-500">
                  Track your daily engagement with target accounts
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/engagement">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
