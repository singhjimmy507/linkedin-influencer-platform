'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  FileText,
  MessageSquare,
  Target,
  Calendar,
  Loader2,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import type { Database } from '@/types/database'

type EngagementLog = Database['public']['Tables']['engagement_logs']['Row']
type EngagementTarget = Database['public']['Tables']['engagement_targets']['Row']

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDrafts: 0,
    totalCompanies: 0,
    totalProfiles: 0,
    totalEngagements: 0,
    engagementsByDay: [] as { date: string; count: number }[],
    engagementsByType: [] as { name: string; value: number }[],
    engagementsByTier: [] as { name: string; value: number }[],
    topTargets: [] as { name: string; count: number }[],
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch counts
      const [draftsRes, companiesRes, profilesRes, engagementsRes] = await Promise.all([
        supabase.from('content_drafts').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('scraped_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('engagement_logs').select('*'),
      ])

      const engagements: EngagementLog[] = engagementsRes.data || []

      // Engagements by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        return {
          date: format(date, 'MMM dd'),
          dateStr: format(date, 'yyyy-MM-dd'),
          count: 0,
        }
      })

      engagements.forEach(eng => {
        if (eng.engaged_at) {
          const engDate = format(new Date(eng.engaged_at), 'yyyy-MM-dd')
          const dayEntry = last7Days.find(d => d.dateStr === engDate)
          if (dayEntry) {
            dayEntry.count++
          }
        }
      })

      // Engagements by type
      const typeCount: Record<string, number> = {}
      engagements.forEach(eng => {
        const type = eng.engagement_type || 'other'
        typeCount[type] = (typeCount[type] || 0) + 1
      })

      const engagementsByType = Object.entries(typeCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))

      // Fetch targets for tier breakdown
      const { data: targetsData } = await supabase
        .from('engagement_targets')
        .select('id, name, tier')

      const targets: Pick<EngagementTarget, 'id' | 'name' | 'tier'>[] = targetsData || []
      const targetMap = new Map(targets.map(t => [t.id, t]))

      // Engagements by tier
      const tierCount: Record<string, number> = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 }
      const targetCount: Record<string, number> = {}

      engagements.forEach(eng => {
        const target = eng.target_id ? targetMap.get(eng.target_id) : null
        if (target) {
          const tierName = `Tier ${target.tier}`
          tierCount[tierName] = (tierCount[tierName] || 0) + 1
          targetCount[target.name] = (targetCount[target.name] || 0) + 1
        }
      })

      const engagementsByTier = Object.entries(tierCount)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))

      // Top engaged targets
      const topTargets = Object.entries(targetCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      setStats({
        totalDrafts: draftsRes.count || 0,
        totalCompanies: companiesRes.count || 0,
        totalProfiles: profilesRes.count || 0,
        totalEngagements: engagements.length,
        engagementsByDay: last7Days.map(d => ({ date: d.date, count: d.count })),
        engagementsByType,
        engagementsByTier,
        topTargets,
      })

      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your LinkedIn influence growth</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your LinkedIn influence growth</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Content Drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalDrafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Companies Researched
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCompanies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Profiles Analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalProfiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Total Engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalEngagements}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagements Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Engagements (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.engagementsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Engagements" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {stats.engagementsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.engagementsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {stats.engagementsByType.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No engagement data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Tier</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {stats.engagementsByTier.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.engagementsByTier} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="Engagements" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No engagement data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Engaged Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Top Engaged Targets</CardTitle>
            <CardDescription>Your most frequently engaged accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topTargets.length > 0 ? (
              <div className="space-y-3">
                {stats.topTargets.map((target, i) => (
                  <div key={target.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{target.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {target.count} engagements
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No engagement data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
