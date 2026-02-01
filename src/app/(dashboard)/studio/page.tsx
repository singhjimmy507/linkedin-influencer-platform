'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PenTool,
  Plus,
  FileText,
  Calendar,
  Mic2,
  Building2,
  Loader2,
} from 'lucide-react'
import type { Database } from '@/types/database'

type ContentDraft = Database['public']['Tables']['content_drafts']['Row']

interface DraftWithRelations extends ContentDraft {
  voice_guide_name?: string
  company_name?: string
}

export default function StudioPage() {
  const [drafts, setDrafts] = useState<DraftWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data: draftsData, error } = await supabase
        .from('content_drafts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching drafts:', error)
        setLoading(false)
        return
      }

      // Fetch related data
      const draftsWithRelations: DraftWithRelations[] = []
      const draftsList = (draftsData || []) as ContentDraft[]
      for (const draft of draftsList) {
        let voiceGuideName = ''
        let companyName = ''

        if (draft.voice_guide_id) {
          const { data: vg } = await supabase
            .from('voice_guides')
            .select('name')
            .eq('id', draft.voice_guide_id)
            .single()
          const vgData = vg as { name: string } | null
          voiceGuideName = vgData?.name || ''
        }

        if (draft.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', draft.company_id)
            .single()
          const companyData = company as { name: string } | null
          companyName = companyData?.name || ''
        }

        draftsWithRelations.push({
          ...draft,
          voice_guide_name: voiceGuideName,
          company_name: companyName,
        })
      }

      setDrafts(draftsWithRelations)
      setLoading(false)
    }

    fetchDrafts()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>
      case 'posted':
        return <Badge variant="secondary">Posted</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
            <p className="text-gray-600">Create and manage your LinkedIn posts</p>
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
          <p className="text-gray-600">Create and manage your LinkedIn posts</p>
        </div>
        <Button asChild>
          <Link href="/studio/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Link>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No drafts yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first LinkedIn post with AI assistance.
            </p>
            <Button asChild>
              <Link href="/studio/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">
                    {draft.title || 'Untitled Draft'}
                  </CardTitle>
                  {getStatusBadge(draft.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {draft.content.substring(0, 100)}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {draft.voice_guide_name && (
                    <Badge variant="outline" className="text-xs">
                      <Mic2 className="h-3 w-3 mr-1" />
                      {draft.voice_guide_name}
                    </Badge>
                  )}
                  {draft.company_name && (
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {draft.company_name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(draft.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
