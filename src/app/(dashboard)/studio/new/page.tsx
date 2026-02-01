'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import { systemVoiceGuides } from '@/lib/seed-data/voice-guides'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Sparkles,
  Save,
  Copy,
  Mic2,
  Building2,
  Loader2,
  Eye,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

interface VoiceGuide {
  id: string
  name: string
  voice_type: string
  description: string | null
  voice_identity: unknown
  core_rules: unknown[]
  hook_formulas: string[]
  closing_formulas: unknown[]
  forbidden_phrases: string[]
  formatting_rules: string[]
}

export default function CreatePostPage() {
  const router = useRouter()
  const [voiceGuides, setVoiceGuides] = useState<VoiceGuide[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [topic, setTopic] = useState('')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch voice guides
      const { data: vgData } = await supabase
        .from('voice_guides')
        .select('*')
        .eq('is_active', true)
        .order('voice_type', { ascending: false })

      if (vgData && vgData.length > 0) {
        setVoiceGuides(vgData as VoiceGuide[])
      } else {
        // Use system guides
        setVoiceGuides(systemVoiceGuides.map(guide => ({
          id: guide.name.toLowerCase().replace(/\s+/g, '-'),
          name: guide.name,
          voice_type: guide.voice_type,
          description: guide.description,
          voice_identity: guide.voice_identity,
          core_rules: guide.core_rules,
          hook_formulas: guide.hook_formulas,
          closing_formulas: guide.closing_formulas,
          forbidden_phrases: guide.forbidden_phrases,
          formatting_rules: guide.formatting_rules,
        })) as VoiceGuide[])
      }

      // Fetch companies
      const { data: compData } = await supabase
        .from('companies')
        .select('*')
        .order('name')

      setCompanies(compData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const selectedVoiceGuide = voiceGuides.find(v => v.id === selectedVoice)
  const selectedCompanyData = companies.find(c => c.id === selectedCompany)

  const handleGenerate = async () => {
    if (!selectedVoiceGuide || !topic) {
      alert('Please select a voice guide and enter a topic')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceGuide: selectedVoiceGuide,
          topic,
          length,
          companyContext: selectedCompanyData ? {
            name: selectedCompanyData.name,
            domain: selectedCompanyData.domain,
          } : undefined,
        }),
      })

      const result = await response.json()
      if (result.success && result.content) {
        setContent(result.content)
        if (!title) {
          setTitle(topic.substring(0, 50))
        }
      } else {
        alert('Failed to generate: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content')
    }

    setGenerating(false)
  }

  const handleSave = async () => {
    if (!content) {
      alert('Please generate or write content first')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please log in to save')
      setSaving(false)
      return
    }

    // Find actual voice guide ID if it's a system guide
    let voiceGuideId = selectedVoice
    if (selectedVoice && !selectedVoice.includes('-')) {
      // It's a UUID
      voiceGuideId = selectedVoice
    } else {
      // It's a generated ID from system guides
      voiceGuideId = null as unknown as string
    }

    const untypedClient = createUntypedClient()
    const { error } = await untypedClient.from('content_drafts').insert({
      user_id: user.id,
      voice_guide_id: voiceGuideId || null,
      company_id: selectedCompany || null,
      title: title || topic || 'Untitled',
      content,
      status: 'draft',
    })

    if (error) {
      console.error('Save error:', error)
      alert('Failed to save draft')
    } else {
      router.push('/studio')
    }

    setSaving(false)
  }

  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/studio')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
            <p className="text-gray-600">Use AI to generate LinkedIn content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(content)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleSave} disabled={saving || !content}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic2 className="h-5 w-5" />
                Voice & Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Guide</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice guide" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceGuides.map((guide) => (
                      <SelectItem key={guide.id} value={guide.id}>
                        <div className="flex items-center gap-2">
                          {guide.name}
                          <Badge variant="secondary" className="text-xs">
                            {guide.voice_type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVoiceGuide && (
                  <p className="text-sm text-gray-500">{selectedVoiceGuide.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Company Context (optional)</Label>
                <Select value={selectedCompany || "none"} onValueChange={(v) => setSelectedCompany(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No company</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Post Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as 'short' | 'medium' | 'long')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (100-150 words)</SelectItem>
                    <SelectItem value="medium">Medium (200-300 words)</SelectItem>
                    <SelectItem value="long">Long (400-500 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Topic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What do you want to write about?</Label>
                <Textarea
                  placeholder="E.g., How I helped a pre-seed company beat a $50M funded competitor in organic search..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !selectedVoice || !topic}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {selectedVoiceGuide && (
            <Card>
              <CardHeader>
                <CardTitle>Hook Ideas</CardTitle>
                <CardDescription>From {selectedVoiceGuide.name}&apos;s voice guide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedVoiceGuide.hook_formulas.slice(0, 5).map((hook, i) => (
                    <button
                      key={i}
                      className="w-full text-left p-2 text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setTopic(hook.replace(/\[.*?\]/g, '___'))}
                    >
                      {hook}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Editor & Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content</CardTitle>
                <span className="text-sm text-gray-500">{wordCount} words</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title (for your reference)</Label>
                <Input
                  placeholder="Post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Post Content</Label>
                <Textarea
                  placeholder="Your LinkedIn post content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                LinkedIn Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-semibold">Your Name</p>
                    <p className="text-sm text-gray-500">Your headline</p>
                    <p className="text-xs text-gray-400">Just now</p>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm">
                  {content ? (
                    content.length > 300 ? (
                      <>
                        {content.substring(0, 300)}
                        <span className="text-blue-600 cursor-pointer">...see more</span>
                      </>
                    ) : (
                      content
                    )
                  ) : (
                    <span className="text-gray-400">Your post content will appear here...</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t text-sm text-gray-500">
                  <span>Like</span>
                  <span>Comment</span>
                  <span>Repost</span>
                  <span>Send</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
