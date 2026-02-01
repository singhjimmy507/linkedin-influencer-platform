'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { systemEngagementTargets } from '@/lib/seed-data/engagement-targets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  Plus,
  ExternalLink,
  Calendar,
  Target,
  Check,
  Loader2,
  Users,
  TrendingUp,
} from 'lucide-react'
import type { Database } from '@/types/database'

type EngagementTarget = Database['public']['Tables']['engagement_targets']['Row']
type EngagementTargetInsert = Database['public']['Tables']['engagement_targets']['Insert']
type EngagementLog = Database['public']['Tables']['engagement_logs']['Row']

interface TargetWithLog extends EngagementTarget {
  lastEngagement?: EngagementLog | null
  engagementsToday?: number
}

export default function EngagementPage() {
  const [targets, setTargets] = useState<TargetWithLog[]>([])
  const [logs, setLogs] = useState<EngagementLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<TargetWithLog | null>(null)
  const [logForm, setLogForm] = useState({
    engagementType: 'comment',
    postUrl: '',
    commentContent: '',
  })
  const [logging, setLogging] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0]

    // Fetch targets
    const { data: targetsData, error } = await supabase
      .from('engagement_targets')
      .select('*')
      .eq('is_active', true)
      .order('tier')
      .order('name')

    if (error) {
      console.error('Error fetching targets:', error)
    }

    // Fetch logs
    const { data: logsData } = await supabase
      .from('engagement_logs')
      .select('*')
      .order('engaged_at', { ascending: false })
      .limit(100)

    const logs: EngagementLog[] = logsData || []
    setLogs(logs)

    // Enrich targets with engagement data
    const enrichedTargets: TargetWithLog[] = []
    const targetsArr: EngagementTarget[] = targetsData || []
    for (const target of targetsArr) {
      const targetLogs = logs.filter(l => l.target_id === target.id)
      const todayLogs = targetLogs.filter(l =>
        l.engaged_at?.startsWith(today)
      )

      enrichedTargets.push({
        ...target,
        lastEngagement: targetLogs[0] || null,
        engagementsToday: todayLogs.length,
      })
    }

    setTargets(enrichedTargets)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSeedTargets = async () => {
    setSeeding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSeeding(false)
      return
    }

    for (const target of systemEngagementTargets) {
      const insertData: EngagementTargetInsert = {
        user_id: user.id,
        linkedin_url: target.linkedin_url,
        name: target.name,
        title: target.title,
        tier: target.tier,
        category: target.category,
        is_active: true,
      }
      // @ts-expect-error - Supabase types need to be regenerated from actual DB
      await supabase.from('engagement_targets').insert(insertData)
    }

    fetchData()
    setSeeding(false)
  }

  const handleLogEngagement = async () => {
    if (!selectedTarget) return
    setLogging(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLogging(false)
      return
    }

    // @ts-expect-error - Supabase types need to be regenerated from actual DB
    const { error } = await supabase.from('engagement_logs').insert({
      user_id: user.id,
      target_id: selectedTarget.id,
      engagement_type: logForm.engagementType,
      post_url: logForm.postUrl || null,
      comment_content: logForm.commentContent || null,
    })

    if (error) {
      console.error('Error logging engagement:', error)
      alert('Failed to log engagement')
    } else {
      setLogForm({ engagementType: 'comment', postUrl: '', commentContent: '' })
      setIsLogOpen(false)
      setSelectedTarget(null)
      fetchData()
    }

    setLogging(false)
  }

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return { label: 'Daily', color: 'bg-green-500' }
      case 2: return { label: '3x/week', color: 'bg-yellow-500' }
      case 3: return { label: 'Weekly', color: 'bg-blue-500' }
      default: return { label: 'Other', color: 'bg-gray-500' }
    }
  }

  const tier1 = targets.filter(t => t.tier === 1)
  const tier2 = targets.filter(t => t.tier === 2)
  const tier3 = targets.filter(t => t.tier === 3)

  const todayEngagements = logs.filter(l =>
    l.engaged_at?.startsWith(new Date().toISOString().split('T')[0])
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagement Tracker</h1>
          <p className="text-gray-600">Track your daily LinkedIn engagement</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engagement Tracker</h1>
          <p className="text-gray-600">Track your daily LinkedIn engagement</p>
        </div>
        {targets.length === 0 && (
          <Button onClick={handleSeedTargets} disabled={seeding}>
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Targets...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Load 50 Target Accounts
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today&apos;s Engagements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{todayEngagements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tier 1 Targets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tier1.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tier 2 Targets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tier2.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tier 3 Targets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tier3.length}</p>
          </CardContent>
        </Card>
      </div>

      {targets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No engagement targets</h3>
            <p className="text-gray-600 mb-4">
              Load the pre-configured 50 target accounts to get started.
            </p>
            <Button onClick={handleSeedTargets} disabled={seeding}>
              Load Target Accounts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="tier1" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tier1">
              Tier 1 - Daily ({tier1.length})
            </TabsTrigger>
            <TabsTrigger value="tier2">
              Tier 2 - 3x/week ({tier2.length})
            </TabsTrigger>
            <TabsTrigger value="tier3">
              Tier 3 - Weekly ({tier3.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>

          {[
            { value: 'tier1', data: tier1 },
            { value: 'tier2', data: tier2 },
            { value: 'tier3', data: tier3 },
          ].map(({ value, data }) => (
            <TabsContent key={value} value={value}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((target) => {
                  const tier = getTierLabel(target.tier)
                  const engagedToday = (target.engagementsToday || 0) > 0

                  return (
                    <Card key={target.id} className={engagedToday ? 'border-green-200 bg-green-50' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {engagedToday && <Check className="h-4 w-4 text-green-600" />}
                              {target.name}
                            </CardTitle>
                            {target.title && (
                              <CardDescription className="text-xs line-clamp-1">
                                {target.title}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {target.category && (
                              <Badge variant="outline" className="text-xs">
                                {target.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <a
                              href={target.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              Profile <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant={engagedToday ? 'outline' : 'default'}
                            onClick={() => {
                              setSelectedTarget(target)
                              setIsLogOpen(true)
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Log
                          </Button>
                        </div>
                        {target.lastEngagement && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last: {new Date(target.lastEngagement.engaged_at).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.slice(0, 20).map((log) => {
                    const target = targets.find(t => t.id === log.target_id)
                    return (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{target?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{log.engagement_type}</Badge>
                            {log.post_url && (
                              <a
                                href={log.post_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                View Post <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.engaged_at).toLocaleDateString()}
                        </span>
                      </div>
                    )
                  })}
                  {logs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No engagement history yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Log Engagement Dialog */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Engagement with {selectedTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Engagement Type</Label>
              <Select
                value={logForm.engagementType}
                onValueChange={(v) => setLogForm({ ...logForm, engagementType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="repost">Repost</SelectItem>
                  <SelectItem value="dm">DM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Post URL (optional)</Label>
              <Input
                placeholder="https://linkedin.com/posts/..."
                value={logForm.postUrl}
                onChange={(e) => setLogForm({ ...logForm, postUrl: e.target.value })}
              />
            </div>

            {logForm.engagementType === 'comment' && (
              <div className="space-y-2">
                <Label>Comment Content (optional)</Label>
                <Textarea
                  placeholder="What did you comment?"
                  value={logForm.commentContent}
                  onChange={(e) => setLogForm({ ...logForm, commentContent: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            <Button onClick={handleLogEngagement} className="w-full" disabled={logging}>
              {logging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Engagement'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
